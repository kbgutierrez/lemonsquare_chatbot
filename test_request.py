import urllib.request, urllib.error, json
urls=[('HEALTH','http://127.0.0.1:8000/health'),
('SETTINGS','http://127.0.0.1:8000/api/settings'),
('ANALYTICS','http://127.0.0.1:8000/api/analytics/summary'),
('AUTH_VERIFY','http://127.0.0.1:8000/api/auth/verify?user_token=invalid'),
('KNOWLEDGE','http://127.0.0.1:8000/api/knowledge/explore?limit=1')]
for name,url in urls:
    print('---',name,'---')
    try:
        with urllib.request.urlopen(url, timeout=5) as r:
            print(r.read().decode())
    except urllib.error.HTTPError as e:
        print('HTTPError', e.code, e.reason)
    except Exception as e:
        print('ERROR', e)
