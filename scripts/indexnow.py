"""Submit canonical, changed URLs to IndexNow after checking the live site."""
import json, os, subprocess, time, urllib.request, urllib.error, xml.etree.ElementTree as ET
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SITE='https://777xsz.shop'
KEY='777xszcde9364cf0b5b979753025461d'
NS='{http://www.sitemaps.org/schemas/sitemap/0.9}'
def fetch(url):
    with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'777xsz-indexnow/1.0','Cache-Control':'no-cache'}),timeout=15) as response:
        return response.read()
def urls(data):
    return [x.text for x in ET.fromstring(data).iter(NS+'loc')]
local=urls((ROOT/'sitemap.xml').read_bytes())
for i in range(25):
    try:
        if fetch(SITE+'/'+KEY+'.txt').decode().strip()==KEY and urls(fetch(SITE+'/sitemap.xml'))==local:
            break
    except Exception as e:
        print('Publication check:',type(e).__name__)
    time.sleep(12)
else:
    raise SystemExit('Live site not verified; IndexNow submission skipped.')
before=os.environ.get('BEFORE','')
if os.environ.get('ALL_URLS')=='true' or not before or set(before)=={'0'}:
    selected=local
else:
    result=subprocess.run(['git','diff','--name-only',before,'HEAD'],cwd=ROOT,capture_output=True,text=True)
    if result.returncode:
        raise SystemExit('Cannot determine changed URLs; skipping submission.')
    changed=set(result.stdout.splitlines())
    if 'sitemap.xml' in changed:
        selected=local
    else:
        selected=[u for u in local if (u[len(SITE)+1:]+'index.html' if u.endswith('/') else u[len(SITE)+1:]) in changed]
if not selected:
    print('No changed indexable URLs.')
    raise SystemExit(0)
payload={'host':'777xsz.shop','key':KEY,'keyLocation':SITE+'/'+KEY+'.txt','urlList':selected}
req=urllib.request.Request('https://api.indexnow.org/indexnow',data=json.dumps(payload).encode(),headers={'Content-Type':'application/json; charset=utf-8'},method='POST')
with urllib.request.urlopen(req,timeout=30) as response:
    print('IndexNow HTTP',response.status,'URLs:',len(selected))
    assert response.status in (200,202)
