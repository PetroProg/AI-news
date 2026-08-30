import logging
import sys

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)

logger = logging.getLogger("news_ai")


def main() -> None:
    logger.info("==========================================")
    logger.info("  Personal AI News Aggregator v0.1.0      ")
    logger.info("  Status: Core container online           ")
    logger.info("==========================================")
    logger.info("Hello from News AI! Infrastructure check passed.")


if __name__ == "__main__":
    main()