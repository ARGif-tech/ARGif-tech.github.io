from pathlib import Path
from html.parser import HTMLParser
import re
ROOT=Path(__file__).resolve().parents[1]
pages=[ROOT/'index.html',ROOT/'preview-777xsz/index.html',ROOT/'kk/index.html',ROOT/'en/index.html',ROOT/'courses/index.html',ROOT/'library/index.html',ROOT/'cases/index.html']
pages+=list(ROOT.glob('services/*/index.html'))+list(ROOT.glob('preview-777xsz/services/*/index.html'))+[p for p in ROOT.glob('cases/*/index.html') if 'public-site.css' in p.read_text()]
class Scan(HTMLParser):
 def __init__(self,h):
  super().__init__();self.styles=[];self.scripts=[];self.inline=0;self.ids=[];self.assets=[];self.feed(h)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if a.get('id'):self.ids.append(a['id'])
  if tag=='link' and a.get('rel')=='stylesheet':self.styles.append(a.get('href',''))
  if tag=='script':
   if a.get('src'):self.scripts.append(a['src'])
   elif a.get('type')!='application/ld+json':self.inline+=1
  if tag=='source' and a.get('srcset'):self.assets.append(a['srcset'])
  if tag=='img' and a.get('src'):self.assets.append(a['src'])
for p in pages:
 h=p.read_text();s=Scan(h);name=str(p.relative_to(ROOT))
 assert sum('public-site.css' in x for x in s.styles)==1,name
 assert sum('public-site.js' in x for x in s.scripts)==1,name
 assert all('public-site.css' in x or 'fonts/manrope.css' in x for x in s.styles),(name,s.styles)
 assert all('public-site.js' in x or 'pricing-777xsz.js' in x for x in s.scripts),(name,s.scripts)
 assert not s.inline,(name,'inline execution')
 assert len(s.ids)==len(set(s.ids)),(name,'duplicate ids')
 for asset in s.assets:
  if asset.startswith('/'):assert (ROOT/asset.split('?')[0].lstrip('/')).exists(),(name,asset)
for p in ['build_site.py','build_motion.py','build_cinematic.py']:
 assert 'raise SystemExit("Archived generator:' in (ROOT/p).read_text()[:250],p
print('Public asset contract passed:',len(pages),'pages')
