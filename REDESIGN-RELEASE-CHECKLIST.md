# 777XSZ · Premium redesign release gate

## Verified in repository (2026-10-27)
- Seven principal HTML pages inspected: index, ar-app, about, contact, catalog, library, courses.
- All seven have a document title, viewport, canonical URL, exactly one H1, mobile nav, course link, and WhatsApp link.
- All eight existing course pages received a book-like visual style and chapter navigation.
- Static Astana skyline and entrepreneur illustration exist in `assets/`.
- Hidden WebGL animation is disabled at runtime.
- Main branch is untouched. The redesign is staged separately.

## Must pass before merging
- [ ] Upload `assets/777xsz-hero-entrepreneur-astana.webp` and confirm HTTP 200; do not enable photo-ready mode before load.
- [ ] Confirm final image has no embedded UI or text; verify acceptable crop on iPhone and desktop.
- [ ] Visually inspect home, AR App, about, contact, catalog, library and courses at 320, 375, 390, 768 and 1440 CSS pixels.
- [ ] Confirm navigation opens/closes, all links work and focus indicators are visible using keyboard.
- [ ] Confirm all eight course lessons load, chapter navigation works, and saved reading position persists after refresh.
- [ ] Test WhatsApp, contact links and forms; do not imply a payment gateway is active until verified.
- [ ] Check RU/KK/EN routes and translations; do not claim multilingual parity without testing.
- [ ] Verify sitemap.xml, robots.txt, canonical tags, existing search-engine verification, and previously indexed URLs.
- [ ] Confirm no fabricated performance claims or misleading product functionality statements.
- [ ] Run Lighthouse mobile performance/accessibility/SEO checks on a real preview.
- [ ] Review and merge only after the above checks pass; verify production and rollback path.

## Known limitation
The photorealistic WebP was prepared locally but has not been committed to GitHub. The live site continues to serve the previous design. No payment/download integration is verified.
