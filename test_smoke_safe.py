import urllib.request, urllib.error, json

ENDPOINTS = [
    ("HEALTH", "GET", "http://127.0.0.1:8000/health", None),
    ("SETTINGS", "GET", "http://127.0.0.1:8000/api/settings", None),
    ("ANALYTICS", "GET", "http://127.0.0.1:8000/api/analytics/summary", None),
    ("AUTH_VERIFY", "GET", "http://127.0.0.1:8000/api/auth/verify?user_token=invalid", None),
    ("KNOWLEDGE", "GET", "http://127.0.0.1:8000/api/knowledge/explore?limit=1", None),
    ("DOCS_DEBUG", "POST", "http://127.0.0.1:8000/api/documents/debug/full-pipeline", {"query":"hello","limit":5}),
    ("ROUTING_SUGGEST", "POST", "http://127.0.0.1:8000/api/routing/suggest", {"summary":"Test routing summary","description":"This is a sample issue description for safe smoke testing."}),
    ("ADMIN_LOGIN", "POST", "http://127.0.0.1:8000/api/admin/login", {"username":"invalid_user","password":"invalid_pass"}),
]


def do_request(method, url, payload=None, timeout=30):
    try:
        if payload is not None:
            data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(url, data=data, method=method, headers={"Content-Type":"application/json"})
        else:
            req = urllib.request.Request(url, method=method)
        with urllib.request.urlopen(req, timeout=timeout) as r:
            body = r.read().decode()
            return r.status, body
    except urllib.error.HTTPError as e:
        try:
            body = e.read().decode()
        except Exception:
            body = ""
        return e.code, body
    except Exception as e:
        return None, str(e)


if __name__ == "__main__":
    print("Starting safe smoke collection...\n")
    for name, method, url, payload in ENDPOINTS:
        print(f"--- {name} ({method}) {url} ---")
        status, body = do_request(method, url, payload)
        print("Status:", status)
        print("Body:", body[:1000])
        print()
    print("Smoke collection complete.")
