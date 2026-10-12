import sys
sys.path.insert(0, '/app')
import asyncio
from sqlalchemy import select
from app.database.session import async_session_maker
from app.database.models import Article, Category, Source

TECH_KEYWORDS = [
    "смартфон", "телефон", "складн", "айфон", "iphone", "ipad", "macbook",
    "huawei", "xiaomi", "samsung", "honor", "vivo", "oppo", "realme", "oneplus", "pixel",
    "гаджет", "девайс", "планшет", "умные часы", "смарт-час", "смарт-очк", "наушник",
    "ноутбук", "процессор", "видеокарт", "чип", "geforce", "radeon", "rtx", "gtx",
    "intel", "amd", "nvidia", "qualcomm", "snapdragon", "exynos", "mediatek", "dimensity",
    "материнск", "монитор", "дисплей", "oled", "amoled", "экран", "ссд", "ssd", "памят",
    "железо", "кулер", "пк", "аккумулятор", "батаре", "зарядк", "робот", "робототехник",
    "boston dynamics", "figure 0", "tesla bot", "optimus", "playstation", "xbox", "nintendo",
    "рынок смартфонов", "рынок пк", "флагманск", "камера"
]

async def main():
    async with async_session_maker() as session:
        # Category 27 is Технологии
        cat_stmt = select(Category).where(Category.id == 27)
        cat_tech = (await session.execute(cat_stmt)).scalar()
        if not cat_tech:
            cat_tech = (await session.execute(select(Category).where(Category.name == 'Технологии'))).scalar()

        print(f"Tech category ID: {cat_tech.id} ({cat_tech.name})")

        # Select articles currently in Category 21 (Мир)
        stmt = select(Article).where(Article.category_id == 21)
        res = await session.execute(stmt)
        articles = res.scalars().all()

        moved = 0
        for art in articles:
            t_lower = (art.title or "").lower()
            c_lower = (art.cleaned_content or art.raw_content or "").lower()
            text_check = t_lower + " " + c_lower

            if any(k in text_check for k in TECH_KEYWORDS):
                art.category_id = cat_tech.id
                moved += 1
                print(f"Moved ID {art.id} -> 'Технологии': {art.title[:60]}")

        await session.commit()
        print(f"Total articles moved to 'Технологии': {moved}")

if __name__ == '__main__':
    asyncio.run(main())
