"""Validate every primary 777XSZ page, asset and local navigation target."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote
import xml.etree.ElementTree as ET
import json
ROOT=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__();self.h1=0;self.title=0;self.links=[];self.ids=set();self.canonical=[];self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='h1':self.h1+=1
  if tag=='title':self.title+=1
  if a.get('id'):self.ids.add(a['id'])
  if a.get('rel')=='canonical':self.canonical.append(a.get('href'))
  for key in ('href','src'):
   if a.get(key):self.links.append((tag,a[key]))
parsed={}; errors=[]
for path in ROOT.rglob('*.html'):
 text=path.read_text()
 if 'premium-finish.css' not in text:continue
 page=Page(text);parsed[path]=page
 if page.h1!=1:errors.append(f'{path.relative_to(ROOT)}: {page.h1} H1s')
 if page.title!=1:errors.append(f'{path.relative_to(ROOT)}: title count {page.title}')
 if len(page.canonical)!=1:errors.append(f'{path.relative_to(ROOT)}: canonical count')
for path,page in parsed.items():
 for tag,link in page.links:
  url=urlparse(link)
  if url.scheme or url.netloc:continue
  target=(ROOT/unquote(url.path).lstrip('/')) if url.path.startswith('/') else path.parent/unquote(url.path)
  if not url.path:target=path
  if target.is_dir():target=target/'index.html'
  target=target.resolve()
  if not target.exists():errors.append(f'{path.relative_to(ROOT)}: missing {link}')
  elif url.fragment and target in parsed and unquote(url.fragment) not in parsed[target].ids:errors.append(f'{path.relative_to(ROOT)}: missing anchor {link}')
for loc in ET.parse(ROOT/'sitemap.xml').iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc'):
 path=ROOT/urlparse(loc.text).path.lstrip('/')
 if path.is_dir():path=path/'index.html'
 if not path.exists():errors.append('Sitemap missing '+loc.text)
print(json.dumps({'pages':len(parsed),'errors':errors},ensure_ascii=False,indent=2))
raise SystemExit(bool(errors))
