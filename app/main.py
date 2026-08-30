import asyncio
import logging
import sys

from app.config import get_settings
from app.database.session import check_db_connection

settings = get_settings()

# Setup logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)

logger = logging.getLogger("news_ai")


async def main() -> None:
    """Application entry point with database health check."""
    logger.info("==========================================")
    logger.info("  Personal AI News Aggregator v0.1.0      ")
    logger.info("  Environment: %s", settings.APP_ENV)
    logger.info("==========================================")

    try:
        logger.info("Connecting to PostgreSQL at host: %s ...", settings.POSTGRES_HOST)
        db_version = await check_db_connection()
        logger.info(" Successfully connected to database: '%s'", settings.POSTGRES_DB)
        logger.info(" Database engine: %s", db_version.split(",")[0])
    except Exception as e:
        logger.error("❌ Failed to connect to database: %s", e)
        sys.exit(1)

    logger.info("Infrastructure & Database checks passed successfully.")


if __name__ == "__main__":
    asyncio.run(main())