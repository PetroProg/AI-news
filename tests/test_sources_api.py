"""Unit tests for /api/stats, /api/sources CRUD, URL validation, and modular web assets."""

import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

from fastapi.testclient import TestClient

from app.api import app
from app.database.session import get_db_session


class _FakeResult:
    def __init__(self, rows=None):
        self._rows = rows or []

    def all(self):
        return self._rows


class TestSourcesAndStatsApi(unittest.TestCase):
    def tearDown(self):
        app.dependency_overrides.clear()

    def test_get_stats_includes_ai_info_and_excludes_secrets(self):
        session = AsyncMock()
        session.scalar = AsyncMock(side_effect=[12, 10, 500, 420])

        async def _override_db():
            yield session

        app.dependency_overrides[get_db_session] = _override_db
        client = TestClient(app)

        resp = client.get("/api/stats")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["sources_count"], 12)
        self.assertEqual(data["active_sources_count"], 10)
        self.assertEqual(data["articles_count"], 500)
        self.assertEqual(data["summarized_count"], 420)
        self.assertIn("ai_provider", data)
        self.assertIn("gemini_model", data)
        self.assertIn("ollama_model", data)

        serialized = str(data).lower()
        for forbidden in ("api_key", "password", "token", "secret"):
            self.assertNotIn(forbidden, serialized)

    def test_list_sources(self):
        src = SimpleNamespace(
            id=1,
            name="Habr Python",
            source_type="rss",
            url="https://habr.com/ru/rss/hubs/python/",
            description="Python articles",
            is_active=True,
            fetch_interval_minutes=60,
            last_fetched_at=None,
        )
        session = AsyncMock()
        session.execute = AsyncMock(return_value=_FakeResult([(src, 42)]))

        async def _override_db():
            yield session

        app.dependency_overrides[get_db_session] = _override_db
        client = TestClient(app)

        resp = client.get("/api/sources")
        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        self.assertEqual(len(body["sources"]), 1)
        self.assertEqual(body["sources"][0]["name"], "Habr Python")
        self.assertEqual(body["sources"][0]["articles_count"], 42)

    def test_create_source_normalizes_telegram_and_rejects_bad_scheme(self):
        session = AsyncMock()
        session.scalar = AsyncMock(return_value=None)
        session.add = MagicMock()

        def _fake_refresh(obj):
            obj.id = 99
            obj.last_fetched_at = None

        session.refresh = AsyncMock(side_effect=_fake_refresh)

        async def _override_db():
            yield session

        app.dependency_overrides[get_db_session] = _override_db
        client = TestClient(app)

        bad_resp = client.post(
            "/api/sources",
            json={"name": "Bad", "source_type": "rss", "url": "javascript:alert(1)"},
        )
        self.assertEqual(bad_resp.status_code, 400)

        ok_resp = client.post(
            "/api/sources",
            json={
                "name": "Novyna UKR",
                "source_type": "telegram",
                "url": "@NovynaUKR",
                "fetch_interval_minutes": 30,
            },
        )
        self.assertEqual(ok_resp.status_code, 201)
        src = ok_resp.json()["source"]
        self.assertEqual(src["url"], "https://t.me/NovynaUKR")
        self.assertEqual(src["fetch_interval_minutes"], 30)

    def test_create_source_duplicate_returns_409(self):
        existing = SimpleNamespace(id=5, url="https://example.com/rss")
        session = AsyncMock()
        session.scalar = AsyncMock(return_value=existing)

        async def _override_db():
            yield session

        app.dependency_overrides[get_db_session] = _override_db
        client = TestClient(app)

        resp = client.post(
            "/api/sources",
            json={"name": "Dup", "source_type": "rss", "url": "https://example.com/rss"},
        )
        self.assertEqual(resp.status_code, 409)

    def test_patch_and_delete_source(self):
        src = SimpleNamespace(
            id=7,
            name="Test Feed",
            source_type="rss",
            url="https://example.com/feed.xml",
            description=None,
            is_active=True,
            fetch_interval_minutes=60,
            last_fetched_at=None,
        )
        session = AsyncMock()
        session.scalar = AsyncMock(side_effect=[src, 15, src, None])

        async def _override_db():
            yield session

        app.dependency_overrides[get_db_session] = _override_db
        client = TestClient(app)

        patch_resp = client.patch(
            "/api/sources/7",
            json={"is_active": False, "fetch_interval_minutes": 120},
        )
        self.assertEqual(patch_resp.status_code, 200)
        self.assertFalse(patch_resp.json()["source"]["is_active"])
        self.assertEqual(patch_resp.json()["source"]["fetch_interval_minutes"], 120)

        del_resp = client.delete("/api/sources/7")
        self.assertEqual(del_resp.status_code, 200)
        self.assertEqual(del_resp.json()["deleted_id"], 7)

        not_found = client.delete("/api/sources/999")
        self.assertEqual(not_found.status_code, 404)

    def test_serves_modular_frontend_assets(self):
        client = TestClient(app)
        for path in ("/", "/js/main.js", "/js/pages/portal-view.js", "/js/pages/category-view.js", "/js/pages/settings-view.js"):
            resp = client.get(path)
            self.assertEqual(resp.status_code, 200, f"Failed to serve {path}")


if __name__ == "__main__":
    unittest.main()
