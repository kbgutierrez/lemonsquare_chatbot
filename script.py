import json, urllib.request, urllib.error
url='http://127.0.0.1:8000/api/documents/debug/full-pipeline'
payload={'query':'smoke test query with longer timeout'}
req=urllib.request.Request(url,data=json.dumps(payload).encode('utf-8'),headers={'Content-Type':'application/json'})
try:
    with urllib.request.urlopen(req, timeout=30) as r:
        print('STATUS', r.status)
        print(r.read().decode())
except urllib.error.HTTPError as e:
    print('HTTP_ERROR', e.code)
    try:
        print(e.read().decode())
    except Exception:
        pass
except Exception as e:
    print('ERROR', e)
