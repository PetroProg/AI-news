import sys
sys.path.insert(0, '/app')

import asyncio
from app.services.orchestrator import PipelineOrchestrator
from app.bot.utils import send_wake_on_lan
from app.database.models import ReportType
import aiogram
from app.config import settings

async def main():
    print("Initializing bot...")
    bot = aiogram.Bot(token=settings.TELEGRAM_BOT_TOKEN)
    orchestrator = PipelineOrchestrator(bot=bot)
    
    print("Sending Wake-on-LAN...")
    try:
        send_wake_on_lan()
    except Exception as e:
        print("WOL error", e)
    
    print("Waiting 15s for PC...")
    await asyncio.sleep(15)
    
    print("Starting EVENING pipeline...")
    await orchestrator.run_full_pipeline(report_type=ReportType.EVENING)
    print("Done!")
    await bot.session.close()

if __name__ == '__main__':
    asyncio.run(main())
