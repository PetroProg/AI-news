import sys
sys.path.insert(0, '/app')
import asyncio
from sqlalchemy import select, update
from app.database.session import async_session_maker
from app.database.models import Article, Category, Source

UKR_CORE_INDICATORS = [
    "украин", "україна", "киев", "київ", "днепр", "дніпро", "всу", "зеленск",
    "покровск", "харьков", "харків", "одесс", "одес", "запорож", "купянск", "курск",
    "шахед", "обстрел", "фронт", "оккупант", "прилет", "сырск", "залужн", "порошенк", "ермак", "генштаб",
    "дрон", "бпла", "пво", "тцк", "мобилизац", "погиб", "ранен", "сводк", "повітрян"
]

UKR_SOURCES = [
    "pravda.com.ua", "liga.net", "novynaukr", "украин", "украина", "україна"
]

async def main():
    async with async_session_maker() as session:
        # 1. Rename category 21 to 'Мир'
        cat_stmt = select(Category).where(Category.id == 21)
        cat_21 = (await session.execute(cat_stmt)).scalar()
        if cat_21:
            old_name = cat_21.name
            cat_21.name = "Мир"
            print(f"Renamed Category 21: '{old_name}' -> 'Мир'")
        else:
            new_cat = Category(name="Мир")
            session.add(new_cat)
            await session.flush()
            cat_21 = new_cat
            print("Created new category 'Мир'")

        # 2. Check articles in Ukraine category (ID 16)
        stmt = (
            select(Article)
            .join(Source, Article.source_id == Source.id, isouter=True)
            .where(Article.category_id == 16)
        )
        res = await session.execute(stmt)
        ukr_articles = res.scalars().all()

        reassigned = 0
        for art in ukr_articles:
            src_stmt = select(Source).where(Source.id == art.source_id)
            source = (await session.execute(src_stmt)).scalar()
            src_name = (source.name or "").lower() if source else ""
            src_url = (source.url or "").lower() if source else ""
            combined_src = src_name + " " + src_url

            is_ukr_src = any(k in combined_src for k in UKR_SOURCES)
            text_check = ((art.title or "") + " " + (art.cleaned_content or art.raw_content or "")).lower()
            has_ukr_core = any(k in text_check for k in UKR_CORE_INDICATORS)

            if not is_ukr_src and not has_ukr_core:
                art.category_id = cat_21.id
                reassigned += 1
                print(f"Reassigned article ID {art.id} ('{art.title[:50]}...') from source '{source.name if source else 'Unknown'}' -> 'Мир'")

        await session.commit()
        print(f"Total articles reassigned to 'Мир': {reassigned}")

if __name__ == '__main__':
    asyncio.run(main())
