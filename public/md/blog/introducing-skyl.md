---
title: Introducing skyl
description: One Go interface for every AI model — the problem, the design, and what is not yet proven.
date: '2026-08-05'
author: skyl maintainers
---

<Intro>

Every Go team that adds an AI feature writes the same code. Not similar code —
the *same* code. skyl is an attempt to write it once, properly, so that changing
model is changing a string.

</Intro>

## The problem

Adding a model to a Go service means writing roughly 400–600 lines before you
reach any product logic: request mapping, SSE frame parsing, exponential backoff
that respects `Retry-After`, distinguishing a rate limit from a bad API key from
a model that no longer exists, token accounting for the finance dashboard, and
context cancellation that does not leak the goroutine reading the stream.

Then one of four things happens.

**A better model ships** and you want to try it — but the old model ID is baked
into three files and a config struct. **You want to compare vendors**, Claude
for reasoning and something cheap for classification, so now you maintain two
integrations that drift apart. **Pricing changes** and you want to move 80% of
traffic elsewhere, but your request-building code is coupled to one vendor's
JSON shape. **You need to run locally** — Ollama on a laptop, a hosted frontier
model in production — so you have two code paths, one of which is under-tested.

Each of those is a rewrite, and each rewrite reintroduces the same bugs.

## The shape of the answer

```go
client := skyl.New(anthropic.New(os.Getenv("ANTHROPIC_API_KEY")))

resp, err := client.Complete(ctx, &skyl.Request{
	Model:    "claude-opus-5",
	Messages: []skyl.Message{skyl.UserText("Explain Go channels in two sentences.")},
})
```

Swapping to GPT is one line:

```go
client := skyl.New(openai.New(os.Getenv("OPENAI_API_KEY")))
```

Everything below the seam is identical, because the seam is
[four methods](/reference/skyl/provider) — `Name`, `Complete`, `Stream`,
`Models`. Everything cross-cutting lives in [`Client`](/reference/skyl/client),
which wraps a provider and adds validation, retry with full jitter, per-attempt
timeouts and hooks. That behaviour is written and tested once rather than once
per vendor, and a new adapter — including one in your own repository — inherits
it for free.

## Four modules, so the core costs nothing

<ModuleTable />

The core library has **zero external dependencies**. Not few; none. `go.mod` has
no `require` block for anything outside the standard library, and `go get` on it
adds one line to your dependency tree instead of forty.

That is why `provider/anthropic`, `gateway` and `otel` are separate modules:
each brings a real dependency graph, and every dependency in a library is
imposed on everyone who imports it, forever — including their security scanners
and their upgrade schedule.

Prove it yourself:

```bash
go list -m all | grep -v '^github.com/BAGOMBEKA-JOB-DEV/skyl'
```

## Two decisions worth arguing about

**Model IDs are opaque strings.** skyl ships no model constants and validates
nothing against a list. A curated enum guarantees that sooner or later the
library rejects a model you are entitled to use and already pay for, because it
shipped last Tuesday. The price is that a typo costs a round trip instead of a
compile error — a slow rejection instead of a wrong one.

**The abstraction is always escapable.** `Request.ProviderOptions` sends fields
skyl does not model; `Response.Raw` is the provider's untouched body and is
*always* populated. You should never have to fork skyl to reach a vendor
feature.

## What is not proven

<ValidationSnapshot />

This is worth stating plainly rather than burying. Everything is implemented,
unit-tested, contract-tested, exercised end to end over real sockets, and
CI-green. But every fake in the test suite was written from the same provider
documentation as the adapter it tests — so if a field name is wrong, the fake is
wrong in the same way and both stay green.

Three test suites exist, and the gap between the second and third is the whole
story:

<TestSuiteTable />

Only the third settles it, and it needs credentials the project does not have.
If you have a key, running
`go test -tags=integration -v -run TestLive ./provider/` — or recording a
cassette — is the single most useful contribution available today. It is
**8 checks per provider** and costs roughly **$0.05–0.50**; the full procedure
is in [Validating against real providers](/reference/sandbox/validating).

## Try it without a key

You do not need a credential to evaluate any of this. The sandbox speaks all
four providers' wire protocols locally:

<TerminalBlock>go run ./cmd/skyl-sandbox</TerminalBlock>

Point any adapter at it and every example in this documentation runs, for free.
Start with the [Quick Start](/learn).
