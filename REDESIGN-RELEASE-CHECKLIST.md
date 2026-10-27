# 777XSZ premium cinematic v2 — release verification

Checked 27 October 2026. Source branch: `premium-cinematic-site-v2`.

- 106 primary pages use the shared premium system, including RU/KK/EN routes, services, library categories, books, lessons and courses. Independent demo sites and historical AR Works files are preserved.
- `python3 scripts/check-site.py`: all 106 pages passed. One H1/title/canonical per page; local resources, internal anchors and sitemap targets exist.
- `node scripts/browser-qa.cjs`: 530 page/viewport checks passed at 320, 375, 390, 768 and 1440 CSS pixels. No horizontal overflow, clipped primary headings/buttons, uncaught JS errors or missing local resources.
- Browser interactions passed: mobile menu and Escape, catalog filters, contact preview/edit, WhatsApp recipient and message construction, all eight course chapter controls and bookmarks after reload, library book bookmark, translated shortlist open/close, course content without JavaScript.
- Desktop and mobile screenshots reviewed for the main templates. Mobile testing is Chromium emulation, not a physical iPhone or Android device.
- Lighthouse mobile lab checks run against a local server. These are lab results, not field Core Web Vitals or production network guarantees.
- Self-hosted Manrope covers Latin, Cyrillic and extended Cyrillic; font license is included.
- Hero is a static cinematic illustration. No GPU-intensive WebGL runtime or external image dependency.
- Existing course content, canonical/hreflang URLs, sitemap and search verification files preserved. Print/download buttons removed from reading pages; browser-level copying/printing is not represented as preventable.
- Contact form generates a preview and a WhatsApp link. QA did not send messages. Payment processing, paid downloads and AI backend availability are outside this design release and are not represented as newly implemented.

## Reproduce

Install Playwright and its Chromium browser, then run:

```sh
python3 scripts/check-site.py
node scripts/browser-qa.cjs
```

Set `QA_OUTPUT` for screenshots/report location and optionally `CHROME_EXECUTABLE` for an existing Chromium binary. GitHub Actions runs both checks on the release branch and pull requests.

## Deployment and rollback

Publish only the checked commit through a pull request into `main`. Confirm GitHub Pages build completion and live assets after merge. Previous production commit: `ad0be084e6d4f36b9c4fdcd9acf536077f472a1c`. To roll back, revert the release merge commit (preserving later unrelated work) and let Pages deploy the revert.
