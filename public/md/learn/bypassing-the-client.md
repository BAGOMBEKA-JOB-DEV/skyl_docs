---
title: Bypassing the Client
description: When you want the provider without validation or retry.
---

<Intro>

`Client.Provider()` returns the underlying provider. Everything `Client` adds —
validation, retry, per-attempt timeouts, hooks — is skipped. It is a small
escape hatch with a few genuinely good uses and one bad one.

</Intro>

<YouWillLearn>

- What you give up by bypassing
- The three cases where it is the right call
- Why "I want to handle retries myself" is usually not one of them

</YouWillLearn>

## Getting the provider

```go verify
raw := client.Provider()

resp, err := raw.Complete(ctx, req)   // no validation, no retry, no hooks
```

You can equally hold the provider yourself and never build a `Client`:

```go verify
p := openai.New(key)
resp, err := p.Complete(ctx, req)
```

`Client.Provider()` exists so a caller who was *given* a `*skyl.Client` can still
reach underneath it.

## What you lose

<DataTable
  headers={['Behaviour', 'Consequence of bypassing']}
  rows={[
    ['Validation', 'A malformed request costs a round trip instead of failing locally.'],
    ['Retry with backoff', 'A single 429 or 503 is a hard failure.'],
    ['Per-attempt timeout', 'Only your context bounds the call.'],
    ['Hooks', 'No metrics, no logging, no cost accounting for this call.'],
  ]}
/>

The hooks line is the one people forget. A bypassed call is **invisible to your
observability**, which means the tokens it spends do not appear in your cost
report.

## When it is right

**Testing an adapter.** Contract tests want to exercise the adapter alone,
without `Client` retrying and obscuring which attempt produced what.

```go verify
// Assert the adapter's own classification, with no retry in between.
_, err := p.Complete(ctx, &skyl.Request{Model: "sandbox-status-429", /* … */})
if !errors.Is(err, skyl.ErrRateLimit) {
	t.Fatalf("adapter misclassified: %v", err)
}
```

**Wrapping the provider yourself.** Because `Provider` is an interface, you can
decorate it — caching, request rewriting, a circuit breaker — and then hand the
decorated version to `skyl.New`:

```go
type caching struct {
	skyl.Provider
	cache *lru.Cache
}

func (c caching) Complete(ctx context.Context, req *skyl.Request) (*skyl.Response, error) {
	if hit, ok := c.cache.Get(key(req)); ok {
		return hit, nil
	}
	resp, err := c.Provider.Complete(ctx, req)
	if err == nil {
		c.cache.Add(key(req), resp)
	}
	return resp, err
}

// Still gets retry, validation and hooks — the decoration is below the seam.
client := skyl.New(caching{Provider: openai.New(key), cache: c})
```

Embedding `skyl.Provider` means you override only what you care about and
inherit `Name`, `Stream` and `Models` unchanged.

**Deliberately unretried calls.** A health check or a capability probe where a
single failure is the answer you want, immediately.

## When it is wrong

<Pitfall>

"I want to handle retries myself" is almost never a reason to bypass. Reach for
the options instead:

```go verify
// Retries off, everything else intact.
client := skyl.New(p, skyl.WithMaxRetries(0))
```

That keeps validation, timeouts and hooks — so your calls still appear in your
metrics, and a malformed request still fails without a round trip. Bypassing
throws away three things to change one.

</Pitfall>

<DeepDive title="Why Client is not the interface">

It is worth understanding why the seam sits where it does.

`Client` wraps a `Provider` rather than being one. That means retry, backoff,
validation and hooks are written and tested **once** — not once per vendor — and
a new adapter, including yours, inherits production-grade behaviour without
implementing any of it.

It also means the layers are separable in both directions. You can decorate the
provider (below the seam) and still get `Client`'s behaviour. Or you can take
the provider out (above the seam) and lose it deliberately. Neither requires
skyl to anticipate what you wanted.

If `Client` were the interface, adapters would have to implement retry, and
four adapters would have four subtly different retry bugs.

</DeepDive>

<Recap>

- `Client.Provider()` returns the raw provider; everything `Client` adds is skipped.
- You lose validation, retry, per-attempt timeouts, and — easy to forget — **hooks**.
- Right for adapter tests, deliberate single-shot probes, and decoration.
- Decorate by embedding `skyl.Provider` and passing the result to `skyl.New`.
- To disable retries only, use `WithMaxRetries(0)` rather than bypassing.

</Recap>

<Challenges>

<Challenge title="Add a circuit breaker below the seam">

Stop sending requests to a provider that is failing consistently, without losing
retry, validation or hooks.

<Hint>

Decorate the `Provider`, not the `Client`. Embedding gives you the other three
methods free.

</Hint>

<Solution>

```go
type breaker struct {
	skyl.Provider
	failures atomic.Int32
	openUntil atomic.Int64 // unix nanos
}

func (b *breaker) Complete(ctx context.Context, req *skyl.Request) (*skyl.Response, error) {
	if time.Now().UnixNano() < b.openUntil.Load() {
		// Fail fast rather than adding to a struggling provider's load.
		return nil, skyl.NewError(b.Name(), 0, skyl.ErrServer, "circuit open", nil)
	}

	resp, err := b.Provider.Complete(ctx, req)
	switch {
	case err == nil:
		b.failures.Store(0)
	case errors.Is(err, skyl.ErrServer), errors.Is(err, skyl.ErrRateLimit):
		if b.failures.Add(1) >= 5 {
			b.openUntil.Store(time.Now().Add(30 * time.Second).UnixNano())
			b.failures.Store(0)
		}
	}
	return resp, err
}

client := skyl.New(&breaker{Provider: openai.New(key)})
```

Two decisions worth noting. Only capacity failures trip the breaker — a run of
`ErrBadRequest` is your bug, not the provider's, and opening the circuit would
hide it. And returning `ErrServer` when open means `Client` treats it as
retryable, so a request that arrives just as the circuit closes still succeeds.

</Solution>

</Challenge>

</Challenges>
