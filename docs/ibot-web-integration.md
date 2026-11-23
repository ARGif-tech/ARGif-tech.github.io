# iBot Web · staged integration
Updated 2026-11-23. Branch: feature/ibot-web-app.

## Status
This branch contains a responsive interface, not a connected iBot service. The main branch and existing 777xsz.shop are unchanged. Do not merge until secure backend, identity verification and end-to-end core communication pass.

Only the branch root index.html is replaced. New styles and chat client are at assets/ibot-app.css and assets/ibot-app.js. Old marketing pages and CNAME are retained. The new page does not load the old analytics script, Yandex Webvisor, the legacy chat or external AI endpoints.

## Target architecture
Browser => HTTPS 777xsz.shop (hosted on existing HostER/Plesk) => authenticated same-origin PHP gateway => hosting database/job queue => outbound HTTPS polling agent on PIXEL => local iBot runtime. Completed jobs return through the same authenticated Plesk gateway. The existing relay.777xsz.shop subdomain may be used for a private worker API after ownership, TLS and permissions are verified.

Current main website uses GitHub Pages (static only). The user requires exclusively iBot on the domain, hosted on their existing HostER/Plesk, with NO Cloudflare, new paid relay or SSH dependency. On cutover, deploy the frontend plus same-origin server-side PHP API on Plesk, then change root DNS at the registrar only after staging passes. Plesk supports remote Git deployment on eligible plans; test the actual subscription first. Validate PHP version, database storage, SSL, access to scheduled tasks, outbound HTTPS and rate limits. Historical configuration mentions relay.777xsz.shop and no SSH; neither actual availability nor current PHP/database entitlements are confirmed. If no long-running server or SSH is available, PIXEL MUST initiate outbound authenticated HTTPS polling to the broker; do not attempt inbound connections to the home PC. PHP may handle short requests and job queue persistence, but should not run a persistent model process. The gateway must enforce per-tenant permissions, rate limits, CSRF, authentication, job ownership, audit, nonce-based worker authentication and replay protection. Do not expose model runtime, databases, Windows, secrets or privileged tools to the internet.

## API contract expected by the browser

GET /api/health, returning HTTP 200 with application/json, Cache-Control: no-store:

{
 "service": "ibot",
 "ready": true,
 "authenticated": true,
 "csrfToken": "opaque-per-session-token",
 "capabilities": ["chat"]
}

Sending is disabled unless service == ibot, ready == true, authenticated == true, and there is a valid CSRF token and chat capability. Anonymous sessions must not receive session credentials or private data via health.

POST /api/chat, same origin, credentials in HttpOnly Secure SameSite session cookies, X-CSRF-Token header, application/json body:

{
 "conversation_id": "uuid",
 "message": "latest user message",
 "messages": [{"role": "user", "text": "untrusted client context"}]
}

Response (when reply is already available):
{"reply": "reply returned from actual iBot runtime"}

For longer operations with limited PHP request duration, return HTTP 202 with an opaque job identifier and create an authenticated GET /api/jobs/{id} endpoint for polling progress and final output. The current frontend implements only the immediate reply contract: adapt it to async jobs AFTER the real Plesk gateway has been verified. Do not return placeholder model text as an actual reply.

The server must derive identity, tenant and permissions ONLY from a validated session, check CSRF and Origin, ignore client-provided roles, cap payload sizes, validate conversation ownership and tool permissions, and rate limit actions. The supplied messages are untrusted hints, not authoritative history. Reject missing authorization with 401/403; do not substitute made-up replies if the runtime is offline. Side-effecting tools need idempotency, owner approvals and audit logs.

Current browser chats exist ONLY in in-memory JavaScript, not in localStorage, sessionStorage or analytics. They disappear after refresh. Cross-device history requires secure database-backed API endpoints.

## Future capabilities
1. Login, account recovery, sessions, roles owner/staff/client and per-tenant chat history.
2. Private file upload with antivirus checks, limits, access control and signed download links.
3. Voice via approved local ASR/TTS backend and user permission, not unannounced browser third-party speech processing.
4. Video/images/code operations through queued jobs with progress, cancellation and resource scheduling.
5. Per-client feature limits, owner-only tool permissions, logs, licensing and quota enforcement.

Never allow a website client to send shell commands, request arbitrary local files, change operating-system services or access another tenant.

## Before production
1. Confirm domain/DNS management (historically PS.kz) and real HostER/Plesk subscription capabilities, PHP, database, storage, TLS and available worker relaying. No Cloudflare. Verify the outbound polling agent from PIXEL to the Plesk broker. Do not alter the current live GitHub Pages site until this works.
2. Keep the current live main commit as a rollback point and do not run build_site.py (old AR Works generator).
3. Test 320/375/390/430 px mobile and desktop, keyboard, offline, login expiration, invalid JSON, timeouts, rate limits, CSRF, concurrent work and prompt injection.
4. Confirm the new page has no Webvisor or other recording of private prompts, files, tokens or conversations.
5. Add private history, file and voice endpoints only after server-side authorization tests.
6. Update sitemap, robots and redirects on final migration, without breaking CNAME or DNS records. The staged page has noindex until release readiness.
7. Merge only when real calls to PIXEL and client isolation are tested.

Status today: staged UI and Plesk-based integration design, NOT a published or connected AI application. No hosting admin login or PIXEL runtime access has been granted in this session.
## Existing HostER relay implementation (confirmed from user-provided Plesk index.php on 2026-11-23)

User supplied the current PHP source of relay.777xsz.shop. It ALREADY has /tunnel_pull (PC HMAC-signed long polling), /tunnel_push (PC signed response delivery), and a catch-all proxy for browser requests. It also handles social webhooks, file downloads and temporary media uploads. The broker uses a private config outside webroot and temporary filesystem queues. DO NOT replace or overwrite this existing index.php or its private config; other business integrations depend on it. The actual runtime status and PC worker connectivity have NOT yet been verified.

Existing routes in that source:
- GET /tunnel_pull: signed polling from PC; checks live heartbeat.
- POST /tunnel_push: signed response pushed from PC.
- ALL other paths: passed to PC through queue with a 120-second maximum waiting time, unless a special business route handles them first.

Risks requiring action before a public launch:
1. The catch-all handler itself does not authorize public browser requests. Authorization MUST be checked at the relay and at the local PIXEL app; anonymous visitors cannot acquire owner capabilities by sending paths or headers. Keep the owner's phone interface separate from the public client-facing chat API.
2. Frontend served at https://777xsz.shop and relay API served at https://relay.777xsz.shop are different ORIGINS even though they share the same base domain. The current frontend calls same-origin /api/health and /api/chat, which will not reach the relay on GitHub Pages. Implement a dedicated, authenticated public-client API at the relay and a narrowly-scoped CORS policy allowing only https://777xsz.shop; allow credentials only with an appropriate session-cookie and CSRF/Origin strategy, handle OPTIONS requests, and never allow wildcard origins with credentials. Alternative: use a tested same-origin reverse proxy, if available on the existing hosting, with no paid services.
3. A 120-second synchronous wait ties up PHP workers. For concurrent users use an asynchronous queue, 202 job IDs, status polling and per-user quotas. Keep existing signed phone routes operational.
4. The provided PHP router forwards arbitrary paths to the PC. Do not expose the local administrator UI or raw tool endpoints to anonymous website users. Explicit allowlist required for client-facing paths.
5. Verify current .htaccess rewrite rules, Plesk PHP settings, HTTPS, presence of private config (without revealing secrets), and the outbound PIXEL polling process before changing the published frontend.
6. The old default index.html may take precedence over index.php unless .htaccess specifies routing. Do not delete it until verified.

The user wants the main domain hosted by free GitHub Pages with only iBot; the existing HostER subscription is used ONLY for relay. No Cloudflare and no new paid hosting. Source supplied does not prove the remote local iBot API is compatible with /api/chat, nor that it is currently reachable.
