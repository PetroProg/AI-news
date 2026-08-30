FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN useradd -m -u 1000 appuser

COPY app/ /app/app/
RUN chown -R appuser:appuser /app

USER appuser

CMD ["python", "-m", "app.main"]