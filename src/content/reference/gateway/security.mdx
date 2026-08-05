---
title: Security and deployment
description: The gateway proxies paid APIs. A misconfiguration spends your money.
---

<Intro>

The failure mode of a misconfigured gateway is someone else spending your money.
Its defaults are chosen accordingly — several things you might expect to be
optional are not.

</Intro>

## Authentication is mandatory

<Pitfall>

**No `SKYL_AUTH_TOKEN`, no start.** There is no flag to disable it, and there
will not be one: an accidental open relay to billed endpoints must not be one
environment variable away.

</Pitfall>

- Tokens are compared with `subtle.ConstantTimeCompare`, so a wrong token is
  indistinguishable from a missing one by timing.
- `SKYL_AUTH_TOKENS` adds labelled rotation tokens as `label:token,...`. The
  **label** appears in logs and metrics; **the token never does**. That is what
  makes rotation possible without downtime.
- `/healthz`, `/readyz` and `/metrics` sit outside the boundary, because the
  things that call them cannot hold a token.

## What is never logged or returned

- **Provider keys** are never logged and never appear in an error body.
- **Upstream error bodies are not forwarded verbatim** — they can echo request
  content back to a caller who should not see it. Errors are classified and
  re-emitted with a `kind`.
- **Request and response bodies are never logged.** Structured logging records
  method, path, status, duration, request ID and the caller *label* only.
- `SKYL_INCLUDE_RAW` defaults to **false**, unlike the library where
  `Response.Raw` is always populated — the same data, but here it crosses a
  trust boundary.

## The middleware stack

<GatewayMiddlewareList />

<Pitfall>

chi's `RealIP` is deliberately **not** in the stack. It rewrites `r.RemoteAddr`
from `X-Forwarded-For` / `True-Client-IP` / `X-Real-IP` regardless of whether
your infrastructure sets them — so any client can claim any address
(GHSA-3fxj-6jh8-hvhx).

The gateway needs no client IP, so `RemoteAddr` is left as the real peer
address. If you need the originating IP, read it from a header your own trusted
proxy is known to set.

</Pitfall>

## Denial of service

<Recipe title="Bound concurrency">

```bash
SKYL_MAX_CONCURRENT=64
```

An unbounded gateway converts a traffic spike into a provider rate-limit
incident — and then into a 429 for every caller, including the ones that would
have succeeded.

</Recipe>

<Recipe title="Bound request duration">

```bash
SKYL_REQUEST_TIMEOUT=120s
SKYL_ATTEMPT_TIMEOUT=60s
SKYL_MAX_RETRIES=3
```

Applied inside each handler rather than at the router, so a streaming response
is not severed mid-generation.

</Recipe>

## CORS

<Pitfall>

`SKYL_ALLOWED_ORIGINS` is unset by default, which **disables CORS entirely**.
Leave it that way unless a browser calls the gateway directly — and note that
doing so means shipping a bearer token to the browser, where any user can read
it.

The safer architecture is a backend-for-frontend: your server holds the gateway
token and the browser talks to your server.

</Pitfall>

## Deployment

**Run it on a private network.** It is an internal service. If it must face the
internet, put a reverse proxy with TLS and rate limiting in front.

The published image is `gcr.io/distroless/static:nonroot`: statically linked, no
shell, no package manager, configuration entirely from the environment, logs to
stdout.

<Recipe title="A hardened deployment">

```yaml
securityContext:
  runAsNonRoot: true
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
  capabilities: { drop: ["ALL"] }

env:
  - name: SKYL_AUTH_TOKEN
    valueFrom: { secretKeyRef: { name: skyl, key: auth-token } }
  - name: ANTHROPIC_API_KEY
    valueFrom: { secretKeyRef: { name: skyl, key: anthropic } }
  - name: SKYL_MAX_CONCURRENT
    value: "64"
  - name: SKYL_METRICS
    value: "true"
```

</Recipe>

## Graceful shutdown

On `SIGTERM` the server drains: `/readyz` starts failing so a load balancer
pulls the instance, in-flight requests finish, then the process exits. Probe
`/readyz` for readiness — probing `/healthz` instead means traffic keeps
arriving at a draining instance, and every request in flight is a paid
generation.

## What an authenticated caller can do

Worth stating plainly, because it defines your blast radius. A caller with a
valid token can:

- Send any prompt to any registered provider, at your expense.
- Choose any model string, including expensive ones.
- Read the list of registered providers and their models.

They **cannot** read your provider credentials, reach a provider you have not
registered, or see another caller's traffic.

So a gateway token is roughly as sensitive as a provider key with a spending
cap. Treat rotation as routine — which is what `SKYL_AUTH_TOKENS` is for.

## Troubleshooting

<Trouble problem="Can I disable auth for local development?">

No. Set `SKYL_AUTH_TOKEN=local-dev-token` instead — one line, and it keeps the
production and development paths identical.

</Trouble>

<Trouble problem="A caller is spending too much">

Give each caller its own labelled token via `SKYL_AUTH_TOKENS`, then attribute
usage by the label in your metrics. The gateway does not enforce per-caller
quotas; put that in a proxy in front if you need it.

</Trouble>

<Trouble problem="I need the client IP for rate limiting">

Read it from a header your own trusted proxy sets, and do the rate limiting
there. The gateway deliberately does not trust forwarding headers.

</Trouble>

<Unvalidated />
