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
