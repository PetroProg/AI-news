import sys
sys.path.insert(0, '/app')
import asyncio
from sqlalchemy import select
from app.database.session import async_session_maker
from app.database.models import Article, Category

async def main():
    async with async_session_maker() as session:
        # Move back Trump/Dodik/Ukrainian politics to Mir or Ukraine
        for art_id, cat_id in [(15309, 21), (14895, 16), (8943, 21), (13201, 16)]:
            a = await session.get(Article, art_id)
            if a:
                a.category_id = cat_id
                print(f"Restored art {art_id} to category {cat_id}")
        await session.commit()

if __name__ == '__main__':
    asyncio.run(main())
