import sys
sys.path.insert(0, '/app')
import asyncio
from sqlalchemy import select
from app.database.session import async_session_maker
from app.database.models import Article, Category, Source

async def main():
    async with async_session_maker() as session:
        stmt = select(Article).where(Article.title.like('%??????????? ???????%'))
        res = await session.execute(stmt)
        arts = res.scalars().all()
        for a in arts:
            cat_stmt = select(Category).where(Category.id == a.category_id)
            c = (await session.execute(cat_stmt)).scalar()
            src_stmt = select(Source).where(Source.id == a.source_id)
            s = (await session.execute(src_stmt)).scalar()
            print(f"ID={a.id} | Status={a.status} | Cat_id={a.category_id} | Cat_name={c.name if c else None} | Src={s.name if s else None} | Score={a.importance_score} | Title={a.title}")

if __name__ == '__main__':
    asyncio.run(main())
