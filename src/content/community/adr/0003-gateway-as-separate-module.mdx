---
title: "ADR-0003: chi belongs to the gateway, not the library"
description: Why importing the library never pulls in a router.
---

<Intro>

**Status:** Accepted.

</Intro>

## Context

The gateway is genuinely useful: it lets non-Go services reach models, holds API
keys in one place, and gives an organisation a single audited egress point for
model traffic.

It is also an HTTP **server**, and needs a router. The obvious choice is
[go-chi](https://github.com/go-chi/chi), which brings its own dependency graph.

The core library, meanwhile, is an HTTP **client**. It routes nothing.

## Decision

**`gateway/` is a separate Go module** with its own `go.mod`, and it is the only
place chi appears.

```
github.com/BAGOMBEKA-JOB-DEV/skyl          ← core library, zero dependencies
github.com/BAGOMBEKA-JOB-DEV/skyl/gateway  ← this, own go.mod, uses chi
```

## Consequences

**Good.** `go get` on the core library pulls in **neither chi nor anything else
the server needs**. The gateway can adopt middleware, metrics libraries and
routing features freely, because its dependency choices affect only people who
run it.

Its Go floor can rise independently — it sits at 1.25, inherited from the
OpenTelemetry SDK by way of `skyl/otel`, while the library stays at 1.22. That
independence *is* the point of the split.

**Bad.** A second `go get` for anyone who wants the gateway, a second module in
the release process, and the ordering constraint that comes with it.

## Alternatives considered

**`net/http` in the core module**, avoiding chi entirely and keeping the gateway
inside. Possible — the routes are simple — but it would still impose a server on
every library user, and lose middleware that is genuinely worth having:
`RequestID`, `Recoverer`, `Throttle`.

**A build tag.** Does not work: `go.mod` requirements are not tag-conditional,
so chi would be inherited regardless.

**A separate repository.** Cleaner still, at the cost of cross-repository
changes whenever the gateway's wire format follows a library change — which is
often, since the gateway's `ChatRequest` mirrors `skyl.Request`.

## Related

The same reasoning produced
[ADR-0006](/community/adr/0006-anthropic-adapter-is-its-own-module) for the
Anthropic SDK and
[ADR-0007](/community/adr/0007-otel-is-its-own-module) for OpenTelemetry. The
rule it serves is [dependencies are a tax](/reference/rules/dependencies-are-a-tax).
