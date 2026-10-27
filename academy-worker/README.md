# 777XSZ Academy — Cloudflare deployment

Status: **prototype only**. Not deployed, not production security reviewed. The old PHP proof-of-concept in `academy-private/` is superseded by this Worker implementation.

## Architecture
- Main site remains on GitHub Pages.
- Worker handles student registration, sessions, owner approval, and per-request authorization.
- D1 stores user records, salted PBKDF2 hashes, sessions, and login attempts.
- R2 stores **private** HTML courses. Do not enable public R2 bucket access.
- Every request to `/read/<slug>` checks the user's current approval in D1.
- All credentials and secrets must be created privately, not committed.

## Deployment prerequisites
1. Cloudflare account, Workers enabled, D1 and R2 available on your account. Confirm current free-tier terms, payment-method requirements, and limits before provisioning.
2. A custom academy subdomain, ideally `academy.777xsz.shop`, routed to Worker after successful staging tests.
3. Create D1 database and private R2 bucket. Fill their identifiers in `wrangler.toml`.
4. Apply `schema.sql` to D1 using Wrangler. Do not apply it to an existing production database without a backup.
5. Set `CSRF_SECRET` and `RATE_SECRET` via Wrangler secrets, each a separate strong random value.
6. Create the initial admin account **through a trusted local bootstrap utility**. This bootstrap tool is not yet implemented; never expose a public admin-registration endpoint.
7. Upload 25 course HTML files to private R2 keys `courses/<slug>/index.html`, not to a public bucket.
8. Update course links and assets so the protected reader never navigates to public `/courses/<slug>/` pages.
9. Remove all public copies of protected lessons from GitHub Pages, branches served by Pages, CDN caches, sitemap and any publicly accessible mirrors before claiming content is private.
10. Run security and browser tests: account approval/revocation, expired session, rate limiting, CSRF, direct object access, session invalidation, mobile layout, asset loading, and admin-only actions.

## Known blockers
- Worker code is a **prototype** and requires tests, security review and deployment configuration.
- Initial admin bootstrap utility and password recovery are not implemented.
- Email ownership verification is not implemented; approval alone is not proof of email ownership.
- Existing HTML contains absolute site paths and must be rewritten for the protected reader.
- Content stored in the public Git repository is not confidential; private access is only meaningful after moving content to private storage and removing publicly served copies. Historical public commits may still be retrievable.
- Need per-account login throttling, session cleanup, monitoring, backup/recovery and an abuse policy.
- Worker routes currently return raw lesson HTML, which references public assets and may contain links to public course pages.
- Validate the cookie/CSRF flow in a real Worker environment before any public release.
- Do not commit or deploy secrets or user data.

## Publication gate
Never merge to `main`, route the production subdomain, or advertise a closed academy until all blockers are resolved and verified.
