import pathlib, re, json, xml.etree.ElementTree as ET
root=pathlib.Path(__file__).resolve().parents[1]
site='https://777xsz.shop'
paths=['index.html','courses/index.html','library/index.html']+[str(p.relative_to(root)) for p in (root/'services').glob('*/index.html')]
for path in paths:
 h=(root/path).read_text()
 assert h.count('<title>')==1,path
 assert h.count('name="description"')==1,path
 assert h.count('rel="canonical"')==1,path
 assert 'name="robots" content="index,follow' in h,path
 g=json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>',h,re.S).group(1))
 assert any(x.get('@id')==site+'/#777xsz' for x in g['@graph']),path
 if path.startswith('services/'):
  assert any(x.get('@type')=='Service' and x.get('offers') for x in g['@graph']),path
s=ET.parse(root/'sitemap.xml')
for l in s.iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc'):
 p=root/l.text.removeprefix(site).lstrip('/')
 if p.is_dir():p=p/'index.html'
 assert p.exists(),str(p)
 h=p.read_text()
 assert not re.search(r'http-equiv=["\']refresh',h,re.I),str(p)
 assert not re.search(r'<meta[^>]+name=["\']robots["\'][^>]+content=["\'][^"\']*noindex',h,re.I),str(p)
ll=(root/'llms.txt').read_text()
assert 'AR App Universal' not in ll and 'iBot' not in ll
print('SEO checks passed:',len(paths),'primary pages')

# Check the complete commercial and portfolio crawl graph, not just individual files.
from html.parser import HTMLParser
from urllib.parse import urlparse
class CrawlPage(HTMLParser):
 def __init__(self, source):
  super().__init__(); self.links=[]; self.meta={}; self.canon=[]; self.h1=0; self.feed(source)
 def handle_starttag(self, tag, attrs):
  a=dict(attrs)
  if tag=='a' and a.get('href'): self.links.append(a['href'])
  if tag=='meta': self.meta[a.get('name') or a.get('property')]=a.get('content')
  if tag=='link' and a.get('rel')=='canonical': self.canon.append(a.get('href'))
  if tag=='h1': self.h1+=1
commercial=['index.html']+[str(p.relative_to(root)) for p in (root/'services').glob('*/index.html')]+['cases/index.html']+[str(p.relative_to(root)) for p in (root/'cases').glob('*/index.html') if 'noindex,follow' not in p.read_text()]
sitemap={el.text for el in s.iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')}
visited=set();queue=['index.html']
while queue:
 path=queue.pop()
 if path in visited:continue
 visited.add(path)
 for href in CrawlPage((root/path).read_text()).links:
  u=urlparse(href)
  if u.scheme or u.netloc or not u.path.startswith('/'):continue
  p=root/u.path.lstrip('/')
  if p.is_dir():p=p/'index.html'
  if p.exists() and p.suffix=='.html':
   key=str(p.relative_to(root))
   if key not in visited:queue.append(key)
for path in commercial:
 html=(root/path).read_text(); page=CrawlPage(html); url=site+'/'+path.removesuffix('index.html')
 assert page.h1==1,path
 assert page.canon==[url],(path,page.canon,url)
 assert url in sitemap,path+' missing sitemap'
 assert path in visited,path+' not internally linked'
 assert page.meta.get('og:image')==site+'/assets/social-777xsz.png',path+' missing social image'
 assert 'noindex' not in page.meta.get('robots',''),path
print('Commercial crawl graph passed:',len(commercial),'pages')
