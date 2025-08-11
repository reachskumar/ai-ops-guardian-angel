#!/usr/bin/env python3
import os
import sys
import time
import requests

"""
Simple SLO gate that queries Prometheus and fails if error ratio exceeds a threshold.
Env vars:
  PROMETHEUS_URL (required)
  PROMQL (optional) default: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))
  THRESHOLD (optional) default: 0.01 (1%)
  WINDOW_SECONDS (optional) default: 300
"""

def main():
    prom_url = os.getenv("PROMETHEUS_URL")
    if not prom_url:
        print("PROMETHEUS_URL not set; skipping gate")
        return 0
    promql = os.getenv(
        "PROMQL",
        'sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))',
    )
    threshold = float(os.getenv("THRESHOLD", "0.01"))

    try:
        resp = requests.get(f"{prom_url}/api/v1/query", params={"query": promql}, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        val = 0.0
        if data.get("status") == "success":
            result = data.get("data", {}).get("result", [])
            if result:
                val = float(result[0]["value"][1])
        print(f"SLO gate value={val}, threshold={threshold}")
        if val > threshold:
            print("SLO gate failed")
            return 2
        print("SLO gate passed")
        return 0
    except Exception as e:
        print(f"SLO gate error: {e}")
        # Be conservative: fail closed
        return 3


if __name__ == "__main__":
    sys.exit(main())


