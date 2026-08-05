---
title: The gateway
description: An optional HTTP service exposing skyl over the network.
---

<Intro>

`gateway/` is a **separate module** that exposes skyl over HTTP: one REST + SSE
surface that fans out to any configured provider. Use it when non-Go services
need model access, or when you want API keys held in exactly one place.

</Intro>

## It is a separate module

<TerminalBlock>go get github.com/BAGOMBEKA-JOB-DEV/skyl/gateway</TerminalBlock>

```
github.com/BAGOMBEKA-JOB-DEV/skyl          ← core library, zero dependencies
github.com/BAGOMBEKA-JOB-DEV/skyl/gateway  ← this, own go.mod, uses chi
```

`go get` on the core library **never** pulls in chi. That is the whole point of
the split, recorded in
[ADR-0003](/community/adr/0003-gateway-as-separate-module).

The core library is an HTTP *client*; chi routes inbound requests. They solve
opposite problems, so putting chi in the core module would tax every library
user with a router they never call. It requires **Go 1.25+**, inherited from the
OpenTelemetry SDK by way of `skyl/otel`.

## When you want it

- **Non-Go services need models.** A Python worker and a TypeScript frontend can
  both call one endpoint instead of each integrating four vendor SDKs.
- **Keys live in one place.** Application code holds a gateway token, not
  provider credentials. Rotation happens once.
- **One audited egress point.** Every model call in the estate flows through a
  single service you can log, meter and rate-limit.
- **Swap providers without redeploying callers.** Change gateway config; clients
  do not move.

If you are a Go service calling a model, skip the gateway and import the
library — an extra network hop buys you nothing.

## Endpoints

<GatewayEndpointTable />

<Pitfall>

**The wire format changed before 0.1.0.** `ChatMessage.content` was a string and
is now a list of typed parts, with a `text` shorthand for the common case:

```json
{"role": "user", "content": "hi"}    // OLD — now returns 400
{"role": "user", "text": "hi"}       // NEW
```

`DisallowUnknownFields` is on, so a *new* client against an *old* gateway gets a
400 rather than a silent ignore. **Upgrade gateways first.**

This is what makes a tool-calling loop possible at all: the old format could not
express an assistant turn containing tool calls, so a client received one in the
response and had no way to send it back.

</Pitfall>

## Security posture

The gateway proxies **paid** APIs, so the failure mode of a misconfiguration is
someone else spending your money.

- **Auth is mandatory.** No `SKYL_AUTH_TOKEN`, no start. There is no flag to
  disable it.
- Tokens are compared with `subtle.ConstantTimeCompare`.
- Provider keys are never logged and never returned in an error body.
- **Run it on a private network.** It is an internal service.

Full detail: [Security and deployment](/reference/gateway/security).

## Pages

<CardGrid>
<YouWillLearnCard title="Running it" path="/reference/gateway/running-it">Starting the server, in a shell and in a container.</YouWillLearnCard>
<YouWillLearnCard title="Configuration" path="/reference/gateway/configuration">Every SKYL_* variable, with defaults.</YouWillLearnCard>
<YouWillLearnCard title="POST /v1/chat" path="/reference/gateway/chat">The completion endpoint and its full wire format.</YouWillLearnCard>
<YouWillLearnCard title="POST /v1/chat/stream" path="/reference/gateway/chat-stream">SSE, keep-alives, and cancellation.</YouWillLearnCard>
<YouWillLearnCard title="Health and metrics" path="/reference/gateway/health-and-metrics">Liveness, readiness, and Prometheus.</YouWillLearnCard>
<YouWillLearnCard title="Security" path="/reference/gateway/security">Auth, CORS, concurrency, and deployment.</YouWillLearnCard>
</CardGrid>

<Unvalidated />
