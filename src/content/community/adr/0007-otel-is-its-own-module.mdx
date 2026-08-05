---
title: "ADR-0007: OpenTelemetry instrumentation is its own module"
description: Why observability costs you nothing unless you want it.
---

<Intro>

**Status:** Accepted.

</Intro>

## Context

skyl needs to be observable. Model traffic is expensive, latency-variable and
failure-prone — exactly the kind of dependency an operator wants in their traces
and dashboards.

The obvious way to provide that is OpenTelemetry, which has a mature Go SDK and
a set of **GenAI semantic conventions** for precisely this.

The OpenTelemetry SDK also brings a substantial dependency graph and sets a Go
floor of 1.25 — against a core library that has **zero** dependencies and a 1.22
floor.

skyl already had a `Hook` mechanism, added for exactly this class of problem.

## Decision

**`skyl/otel` is a fourth Go module**, implementing the GenAI semantic
conventions on top of the existing hook interface.

```go verify
client := skyl.New(openai.New(key), otel.Hook())
```

That is the whole integration.

## Consequences

**Good.** The core module keeps zero dependencies and its 1.22 floor. Nobody who
does not want OpenTelemetry pays for it. Because it is built on the public
`Hook` interface, it demonstrates that the hook mechanism is sufficient — if it
had needed private access, that would have been evidence the interface was
wrong.

Model traffic appears in an observability stack the same way any other
dependency does, and **looks the same whichever provider served it** — which is
the library's whole premise, extended to telemetry.

**Bad.** Another module to release, and another Go floor to track. The gateway's
floor rose to 1.25 as a result, since it depends on this module.

## Prompt content is deliberately not recorded

<Pitfall>

The GenAI conventions **allow** capturing messages, and skyl hands this package
the whole `skyl.Request`.

It records **none of it**. Only the shape: model, sampling parameters, token
counts.

A span is a durable record shipped to a third-party backend, and putting user
conversations there **by default** is a decision no library should make
silently. A user who wants it can write four lines of their own hook — with
their eyes open.

</Pitfall>

## Semantic convention names are spelled out

The attribute and metric keys are written as constants in the package rather
than imported from a `semconv` module.

The GenAI conventions are still in development. Pinning a semconv module would
tie skyl's release cadence to theirs — a convention revision would become a
forced dependency bump. The keys are stable enough to write down and cheap to
correct.

## Alternatives considered

**Put it in the core module.** Rejected: it taxes every library user with the
OpenTelemetry SDK.

**Instrument nothing and document the hook interface.** Rejected: every user
would write the same integration, and most would get the GenAI conventions
subtly wrong — at which point their dashboards do not compare across services.

**A `slog` integration instead.** Cheaper, and would fit in the core module. But
metrics and traces are what an operator actually needs for a paid, high-latency
dependency, and `slog` gives neither. The hook interface remains available for
anyone who wants logging.

## Related

Same reasoning as
[ADR-0003](/community/adr/0003-gateway-as-separate-module) and
[ADR-0006](/community/adr/0006-anthropic-adapter-is-its-own-module).
