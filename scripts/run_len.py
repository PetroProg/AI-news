
import asyncpg, asyncio
async def m():
    c = await asyncpg.connect("postgresql://news_user:news_password@news_ai_postgres/news_db")
    r = await c.fetch("SELECT a.title, a.cleaned_content, a.raw_content FROM articles a JOIN categories c ON a.category_id = c.id WHERE c.name = '???????' AND a.status IN ('summarized', 'reported', 'processed') LIMIT 20;")
    for row in r:
        t = row['title'] or ''
        cl = (row['cleaned_content'] or row['raw_content'] or '').lower()
        print(f"[{len(cl)}]: {t[:40]}")
    await c.close()
asyncio.run(m())
