---
title: Dependencies are a tax
description: Every dependency is imposed on everyone who imports you, forever.
---

<Intro>

Every dependency in a library is inherited by everyone who imports it —
including their security scanners, their upgrade schedule, and their
vulnerability triage rota. A logging framework chosen in 2024 becomes a CVE
someone else responds to in 2027.

</Intro>

## The rule

**The core module has zero external dependencies.** Not few. None.

```
github.com/BAGOMBEKA-JOB-DEV/skyl    →  net/http, encoding/json, and nothing else
```

No router, no logger, no config library, no HTTP helper. A well-written HTTP
client turns out not to need any.

## The module split proves it

<ModuleTable />

Everything that brings a dependency graph is a **separate module**:

- **`provider/anthropic`** wraps the official SDK, which brings ~12 transitive
  dependencies and raises the Go floor to 1.24
  ([ADR-0006](/community/adr/0006-anthropic-adapter-is-its-own-module)).
- **`gateway`** uses chi ([ADR-0003](/community/adr/0003-gateway-as-separate-module)).
- **`otel`** uses the OpenTelemetry SDK
  ([ADR-0007](/community/adr/0007-otel-is-its-own-module)).

Meanwhile `openai`, `gemini` and `openaicompat` ship **inside** the core module,
because they are written against the standard library.

## What it cost

A hand-written SSE reader, a hand-written HTTP layer, and a hand-written
backoff implementation — each of which had to be tested to the standard a
third-party library would have arrived with.

It also cost a fuzz suite for the SSE parser, and a benchmark that caught the
tool-argument accumulation being quadratic. That bug allocated **2.2 MB** to
assemble a few kilobytes; the fix brought it to 34 KB, and the benchmark stays as
the guard.

Writing it yourself means owning the bugs. The trade is that everyone importing
skyl owns none of them.

## Check it yourself

<Recipe title="Prove the claim">

```bash
go list -m all | grep -v '^github.com/BAGOMBEKA-JOB-DEV/skyl'
```

In a project whose only dependency is skyl, this prints your own module and
nothing else. Add `provider/anthropic` and run it again to see the difference —
that difference is exactly what the split protects you from.

</Recipe>

## The corollary for the gateway

The core library is an HTTP **client**; chi routes **inbound** requests. They
solve opposite problems, so putting chi in the core module would tax every
library user with a router they never call.

That is why `gateway/` is genuinely useful *and* lives in its own module — so
that people who want a library get a library.
