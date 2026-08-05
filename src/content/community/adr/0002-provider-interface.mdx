---
title: "ADR-0002: A four-method Provider interface"
description: Why the seam is exactly four methods.
---

<Intro>

**Status:** Accepted.

</Intro>

## Context

Everything in skyl exists to serve one interface. Its size determines how easy
skyl is to extend, to test, and to wrap — and how honest it can be about what a
provider actually does.

Too small, and the interface lies about what an operation returns. Too large,
and half the implementations return `ErrUnsupported` from methods that do not
apply to them — at which point it is not an interface, it is a suggestion.

## Decision

**Exactly four methods:**

```go
type Provider interface {
	Name() string
	Complete(ctx context.Context, req *Request) (*Response, error)
	Stream(ctx context.Context, req *Request) (Stream, error)
	Models(ctx context.Context) ([]ModelInfo, error)
}
```

Everything cross-cutting — retry, backoff, timeouts, validation, hooks — lives in
`Client`, which **wraps** a `Provider` rather than being one.

## Consequences

**Good.** Retry logic is written and tested **once**, not once per vendor. A new
adapter, including one in your own repository, inherits production-grade
behaviour for free. The interface is small enough to fake in a test without a
mocking framework, and small enough to decorate — caching, circuit breaking,
logging — by embedding.

Users who want raw access call `Client.Provider()`.

**Bad.** Four methods is the *set every text-model vendor implements*, which
means anything outside that set has nowhere to go. Embeddings, moderation and
image generation each have a genuinely different shape, so they are not
reachable through this interface at all — only through `ProviderOptions` against
a chat endpoint, or not at all.

Adding a fifth method later is a breaking change for every out-of-tree adapter.

## Alternatives considered

**Two methods**, folding streaming into `Complete` with a flag. Rejected: it
makes the return type dishonest, because a streaming call cannot return a
complete `*Response`.

**Ten methods**, covering embeddings, moderation, image generation and
fine-tuning. Rejected: several vendors offer only some of them, so most
implementations would return `ErrUnsupported` from most methods — and a caller
could not tell "this vendor cannot" from "this adapter has not bothered".

**Making `Client` the interface**, so adapters implement retry themselves.
Rejected: four adapters would grow four subtly different retry bugs, and a
third-party adapter would have to reimplement backoff correctly to be usable.

**Dropping `Models`.** It is the least-used method. Kept because
[ADR-0004](/community/adr/0004-model-ids-are-pass-through) makes model IDs
unvalidated, and live discovery is then the only honest way to answer "what can
I use?"
