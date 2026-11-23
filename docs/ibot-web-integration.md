# iBot Web · staged integration
Updated 2026-11-23. Branch: feature/ibot-web-app.

## Status
This branch contains a responsive interface, not a connected iBot service. The main branch and existing 777xsz.shop are unchanged. Do not merge until secure backend, identity verification and end-to-end core communication pass.

Only the branch root index.html is replaced. New styles and chat client are at assets/ibot-app.css and assets/ibot-app.js. Old marketing pages and CNAME are retained. The new page does not load the old analytics script, Yandex Webvisor, the legacy chat or external AI endpoints.

## Target architecture
Browser => HTTPS 777xsz.shop => same-origin identity and authorization gateway => authenticated outbound relay => iBot core on PIXEL => results returned to authorized session.

GitHub Pages is a static host. It cannot execute /api/health or /api/chat. Route /api/* through an authenticated gateway, such as a properly configured Cloudflare Worker and secure outbound Tunnel, only after confirming domain DNS and access. Do not expose model, database, local Windows, tools or internal network ports to the internet. The gateway must enforce role and tenant isolation, rate limits, quotas, audit and trusted-origin validation.

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

Response:
{"reply": "reply returned from actual iBot runtime"}

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
1. Confirm DNS, hosting and ability to route same-origin /api traffic. Verify TLS and authenticated relay to PIXEL.
2. Keep the current live main commit as a rollback point and do not run build_site.py (old AR Works generator).
3. Test 320/375/390/430 px mobile and desktop, keyboard, offline, login expiration, invalid JSON, timeouts, rate limits, CSRF, concurrent work and prompt injection.
4. Confirm the new page has no Webvisor or other recording of private prompts, files, tokens or conversations.
5. Add private history, file and voice endpoints only after server-side authorization tests.
6. Update sitemap, robots and redirects on final migration, without breaking CNAME or DNS records. The staged page has noindex until release readiness.
7. Merge only when real calls to PIXEL and client isolation are tested.

Status today: staged UI and integration contract, NOT a published or connected AI application.