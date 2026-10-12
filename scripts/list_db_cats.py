import sys
sys.path.insert(0, '/app')
import asyncio
from sqlalchemy import select
from app.database.session import async_session_maker
from app.database.models import Category

async def main():
    async with async_session_maker() as session:
        res = await session.execute(select(Category).order_by(Category.id))
        cats = res.scalars().all()
        for c in cats:
            print(f"ID={c.id} | Name={c.name}")

if __name__ == '__main__':
    asyncio.run(main())
