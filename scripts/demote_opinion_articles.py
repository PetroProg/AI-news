import sys
sys.path.insert(0, '/app')
import asyncio
from sqlalchemy import select, update
from app.database.session import async_session_maker
from app.database.models import Article

OPINION_LISTICLE_PATTERNS = [
    "%победител%проиграв%",
    "%winners%losers%",
    "%power ranking%",
    "%для беттеров%",
    "%ставки на%",
    "%лучшие и худшие%",
    "%кто впечатлил%",
    "%кто разочаровал%",
    "%southwell%",
    "%hereford%",
    "%season ticket%"
]

async def main():
    async with async_session_maker() as session:
        demoted = 0
        for pat in OPINION_LISTICLE_PATTERNS:
            stmt = select(Article).where(Article.title.ilike(pat))
            res = await session.execute(stmt)
            arts = res.scalars().all()
            for a in arts:
                if (a.importance_score or 0) > 3.0:
                    a.importance_score = 3.0
                    demoted += 1
                    print(f"Demoted article ID {a.id}: '{a.title[:60]}' -> score 3.0")

        await session.commit()
        print(f"Total demoted articles in DB: {demoted}")

if __name__ == '__main__':
    asyncio.run(main())
