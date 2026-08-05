---
title: Threat Model
description: Trust boundaries, blast radius, and what is out of scope.
---

<Intro>

skyl sits on the path between your users' prompts and a third-party vendor, and
the gateway proxies **paid** APIs. This page states the boundaries explicitly,
because "it depends" is not an answer a security review accepts.

</Intro>

## Trust boundaries

<DataTable
  headers={['Boundary', 'What crosses it', 'Who controls it']}
  rows={[
    ['Your process → provider', 'The entire Request, plus one credential header', 'You choose the provider and the host'],
    ['Gateway caller → gateway', 'A ChatRequest and a bearer token', 'You issue the tokens'],
    ['Gateway → provider', 'The provider credential', 'The operator holds it; callers never see it'],
    ['Model output → your code', <strong key="a">Untrusted input</strong>, 'Yours to validate'],
  ]}
/>

## Model output is untrusted input

<Pitfall>

**Treat everything the model produces as untrusted**, including the *shape* of
it, not only the content.

- **Tool arguments are attacker-influenced.** A prompt-injected model can call
  your tool with any arguments the schema allows. Validate them as you would an
  HTTP request body — a schema is a hint to the model, not an enforcement
  boundary.
- **The number of tool calls is chosen by the model.** A model that decides to
  look up twenty cities produces twenty concurrent goroutines unless you bound
  the fan-out.
- **Text is not safe to render as HTML** or to pass to a shell.

</Pitfall>

```go verify
var args struct {
	City string `json:"city"`
}
if err := json.Unmarshal(call.Arguments, &args); err != nil {
	return skyl.ToolErrorMessage(call.ID, "invalid arguments")
}
// The schema said "string". It did not say "a city you have heard of".
if !knownCity(args.City) {
	return skyl.ToolErrorMessage(call.ID, "unknown city")
}
```

## What an authenticated gateway caller can do

Worth stating plainly, because it defines your blast radius. With a valid token,
a caller **can**:

- Send any prompt to any registered provider, **at your expense**.
- Choose any model string, including expensive ones.
- List registered providers and their models.

They **cannot**:

- Read your provider credentials.
- Reach a provider you have not registered.
- See another caller's traffic.
- Cause the gateway to log or persist their prompts.

**A gateway token is roughly as sensitive as a provider key.** Issue one per
caller via `SKYL_AUTH_TOKENS` so you can attribute usage and revoke
individually.

## Denial of service

<DataTable
  headers={['Vector', 'Mitigation']}
  rows={[
    ['Unbounded concurrency', <span key="a">Set <code>SKYL_MAX_CONCURRENT</code>. Unset, a traffic spike becomes a provider rate-limit incident.</span>],
    ['Long-running requests', <span key="b"><code>SKYL_REQUEST_TIMEOUT</code>, applied per handler so streams are not severed.</span>],
    ['Retry amplification', <span key="c">Bounded by <code>SKYL_MAX_RETRIES</code>; backoff uses full jitter so a fleet does not synchronise.</span>],
    ['Idle stream connections', <span key="d">Keep-alive frames plus client-disconnect cancellation — a hang-up does not leave a paid request running.</span>],
    ['Large request bodies', <span key="e">Put a limit in a reverse proxy. The gateway does not impose one.</span>],
  ]}
/>

## Credential handling

- Provider keys are **never logged**, never in an error body, never forwarded.
- Gateway tokens are compared with `subtle.ConstantTimeCompare`.
- `SKYL_AUTH_TOKENS` labels appear in logs; **the tokens do not**.
- skyl reads **no environment variables** of its own — the library takes the key
  as an argument, so its lifetime and source are yours.

## Deliberate omissions

<Pitfall>

chi's `RealIP` is **not** in the gateway's middleware stack. It rewrites
`r.RemoteAddr` from `X-Forwarded-For` / `True-Client-IP` / `X-Real-IP`
regardless of whether your infrastructure sets them, so **any client can claim
any address** (GHSA-3fxj-6jh8-hvhx).

The gateway needs no client IP. If you need the originating one, read it from a
header your own trusted proxy is known to set.

</Pitfall>

Certificate failures are **never retried** — a rejected certificate is a
misconfiguration, possibly an interception attempt, and retrying delays the
error an operator needs to see.

## Out of scope

- **What the provider does with your prompt.** Retention, jurisdiction,
  sub-processors, training-data terms. Read their policies.
- **Prompt injection defence.** skyl transports; it does not sanitise. Nothing
  it could do would be correct for every application.
- **Model output safety.** Refusals are surfaced, not enforced.
- **Multi-tenant isolation inside the gateway.** Callers share one process and
  one provider credential. If tenants must not share a credential, run a gateway
  per tenant.
- **Exposing the sandbox.** It authenticates nothing meaningfully and binds to
  loopback for that reason.

## Reporting

See the [Security Policy](/community/security). Please do not open a public
issue for a vulnerability.
