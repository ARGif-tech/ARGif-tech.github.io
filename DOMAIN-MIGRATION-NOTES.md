# 777xsz.shop: staged migration

This branch is prepared but not live. Preserve current GitHub Pages site until DNS is active. Set these records at the registrar's authoritative DNS provider:

- `@` A `185.199.108.153`
- `@` A `185.199.109.153`
- `@` A `185.199.110.153`
- `@` A `185.199.111.153`
- `www` CNAME `argif-tech.github.io.`

Keep any MX, SPF, DKIM, DMARC and unrelated TXT records. Don't change registrar name servers unless you intend to move DNS hosting. After DNS resolves, merge the staged `CNAME`, all 57 HTML pages, sitemap.xml and robots.txt into `main`, wait for GitHub Pages, and verify HTTPS and `www` redirect. After domain verification, register new website property in Search Console and submit https://777xsz.shop/sitemap.xml. Never claim DNS or HTTPS work until verified.
