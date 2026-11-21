"""Verification tests for Glances removal and Beszel-only server health."""

import unittest
from unittest.mock import AsyncMock, patch

from app.services.container_monitor import get_project_metadata


class TestServerHealthNoGlances(unittest.IsolatedAsyncioTestCase):
    def test_container_monitor_has_no_glances_and_knows_server_monitor(self):
        title, _ = get_project_metadata("server-monitor", {"com.docker.compose.project": "server-monitor"})
        self.assertEqual(title, "Server Monitor")

        g_title, _ = get_project_metadata("glances", {})
        self.assertEqual(g_title, "Standalone Service")

    async def test_server_health_uses_beszel_and_excludes_glances(self):
        import app.api as api_mod

        mock_beszel = {
            "source": "beszel",
            "cpu": {"percent": 25.0, "temp_c": 45, "cores": 2, "sparkline": [20.0, 25.0]},
            "memory": {"percent": 60.0, "used_gb": 1.94, "total_gb": 3.23, "sparkline": [59.0, 60.0]},
            "disk": {"percent": 74.5, "used_gb": 72.9, "total_gb": 97.9, "sparkline": [74.5]},
            "load": {"min1": 0.8, "min5": 0.9, "min15": 1.0},
            "uptime": "10д 2ч",
        }

        with patch("app.services.beszel_client.get_server_beszel_metrics", new=AsyncMock(return_value=mock_beszel)), \
             patch("app.services.battery_monitor.get_server_battery", return_value=(98, "Not charging", True)):
            result = await api_mod.get_server_health()

        self.assertEqual(result["source"], "beszel")
        self.assertEqual(result["cpu"]["percent"], 25.0)
        self.assertEqual(result["memory"]["total_gb"], 3.23)
        service_ids = [s["id"] for s in result["services"]]
        self.assertNotIn("glances", service_ids)
        self.assertIn("beszel", service_ids)


if __name__ == "__main__":
    unittest.main()
