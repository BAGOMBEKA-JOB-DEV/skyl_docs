---
title: New
description: Returns a Client that dispatches to a provider.
---

<Intro>

`skyl.New` wraps a [`Provider`](/reference/skyl/provider) with the behaviour
every production caller needs: request validation, retry with jittered backoff,
per-attempt timeouts, and observability hooks.

</Intro>

## Reference

<Signature>func New(p Provider, opts ...Option) *Client</Signature>

<Parameters>

- **`p`** — the provider to dispatch to. Any value implementing the four-method
  [`Provider`](/reference/skyl/provider) interface, including one from your own
  repository.
- **`opts`** — optional [`Option`](/reference/skyl/option) values, **applied in
  order**. A later option overrides an earlier one of the same kind.

</Parameters>

<Returns>

A `*Client`, ready to use. It is **safe for concurrent use** by multiple
goroutines.

</Returns>

<Caveats>

- **It panics if `p` is nil.** A nil provider is a programmer error that would
  otherwise surface as a confusing nil dereference on the first request, far
  from the line that caused it.
- Options are applied in order, so `New(p, WithMaxRetries(5), WithMaxRetries(2))`
  gives you two retries.
- Options with invalid values are **ignored, not rejected**: a negative retry
  count, or a non-positive delay, leaves the default in place.
- `New` performs no I/O and never fails. A wrong credential is not detected here
  — it surfaces as [`ErrAuth`](/reference/skyl/errors/sentinels) on the first
  request.

</Caveats>

## Usage

<Recipe title="Wrapping a provider">

```go verify
client := skyl.New(openai.New(os.Getenv("OPENAI_API_KEY")))
```

</Recipe>

<Recipe title="Configuring for production">

```go verify
client := skyl.New(
	anthropic.New(os.Getenv("ANTHROPIC_API_KEY")),
	skyl.WithMaxRetries(5),
	skyl.WithRetryDelay(time.Second, time.Minute),
	skyl.WithTimeout(2*time.Minute),
	skyl.WithHook(func(_ context.Context, ev skyl.HookEvent) {
		metrics.Record(ev.Provider, ev.ResponseModel, ev.Duration, ev.Err)
	}),
)
```

</Recipe>

<Recipe title="Sharing options across several clients">

```go verify
// Build the options once so every client in the process behaves identically.
opts := []skyl.Option{
	skyl.WithMaxRetries(4),
	skyl.WithTimeout(90 * time.Second),
	skyl.WithHook(telemetry.Hook),
}

fast := skyl.New(gemini.New(geminiKey), opts...)
smart := skyl.New(anthropic.New(anthropicKey), opts...)
```

</Recipe>

<Recipe title="Construct once, reuse everywhere">

```go verify
// A Client holds no per-request state and is concurrency-safe, so one per
// process is correct. Building one per request throws away connection pooling.
type Service struct {
	ai *skyl.Client
}

func NewService(key string) *Service {
	return &Service{ai: skyl.New(openai.New(key))}
}
```

</Recipe>

## Troubleshooting

<Trouble problem="My program panics with “skyl: New called with a nil Provider”">

You passed a nil provider — most often from a constructor that returned an error
you did not check, or from a `switch` with a `default` branch returning nil.

```go
p, err := pick(name)
if err != nil {
	return err        // ← without this, p is nil and New panics
}
client := skyl.New(p)
```

</Trouble>

<Trouble problem="My option seems to have no effect">

Two likely causes.

**The value was invalid and was ignored.** `WithMaxRetries(-1)` and
`WithRetryDelay(0, 0)` leave the defaults in place rather than erroring.

**A later option overrode it.** Options apply in order; check for a duplicate
further down the list.

</Trouble>

<Trouble problem="I set WithHTTPClient on New and it did not compile">

The HTTP client is a **provider** option, not a client option — the adapter is
what performs the request:

```go verify
client := skyl.New(openai.New(key, openai.WithHTTPClient(hc)))
```

The general rule: behaviour that is the same for every vendor lives on `Client`;
behaviour about how one vendor is reached lives on the provider.

</Trouble>
