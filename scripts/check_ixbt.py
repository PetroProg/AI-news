import sys
sys.path.insert(0, '/app')
import asyncio
from sqlalchemy import select
from app.database.session import async_session_maker
from app.database.models import Article, Category, Source

async def main():
    async with async_session_maker() as session:
        stmt = select(Article).join(Source).where(Source.name == 'iXBT').order_by(Article.id.desc()).limit(15)
        res = await session.execute(stmt)
        arts = res.scalars().all()
        for a in arts:
            cat_stmt = select(Category).where(Category.id == a.category_id)
            c = (await session.execute(cat_stmt)).scalar()
            print(f"ID={a.id} | Status={a.status} | Cat={c.name if c else None} | Title={a.title[:60]}")

if __name__ == '__main__':
    asyncio.run(main())
