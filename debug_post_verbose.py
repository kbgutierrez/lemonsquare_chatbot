import json, urllib.request, urllib.error, time
print('SCRIPT START')
url='http://127.0.0.1:8000/api/documents/debug/full-pipeline'
payload={'query':'smoke test verbose attempt'}
req=urllib.request.Request(url,data=json.dumps(payload).encode('utf-8'),headers={'Content-Type':'application/json'})
try:
    print('SENDING')
    with urllib.request.urlopen(req, timeout=60) as r:
        print('STATUS', r.status)
        body=r.read().decode()
        print('BODY_LEN', len(body))
        print(body[:4000])
except urllib.error.HTTPError as e:
    print('HTTP_ERROR', e.code)
    try:
        print(e.read().decode())
    except Exception as ex:
        print('READ_ERR', ex)
except Exception as e:
    print('ERROR', repr(e))
print('SCRIPT END')
