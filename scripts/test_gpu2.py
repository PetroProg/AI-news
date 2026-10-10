import asyncio
import sys
sys.path.insert(0, '/app')
from app.bot.utils import check_gpu_load

async def test():
    res = await check_gpu_load()
    print("GPU load:", res)

asyncio.run(test())
