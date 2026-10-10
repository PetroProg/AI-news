import asyncio
import sys
import asyncssh
sys.path.insert(0, '/app')
from app.config import settings

async def test():
    async with asyncssh.connect(settings.WINDOWS_SSH_HOST, username=settings.WINDOWS_SSH_USER, client_keys=[settings.WINDOWS_SSH_KEY_PATH], known_hosts=None) as conn:
        res = await conn.run("nvidia-smi --query-gpu=utilization.gpu --format=csv,noheader,nounits", term_type="vt100")
        print("STDOUT:", repr(res.stdout))
        print("STDERR:", repr(res.stderr))

asyncio.run(test())
