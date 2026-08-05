---
title: WithRetryDelay
description: The backoff bounds. Defaults 500ms and 30s, with full jitter.
---

<Intro>

`WithRetryDelay` sets the bounds on skyl's computed backoff. The delay before
attempt *n* is sampled uniformly from `[0, min(base × 2ⁿ, max)]` — full jitter,
not a fixed exponential.

</Intro>

## Reference

<Signature>func WithRetryDelay(base, max time.Duration) Option</Signature>

<Parameters>

- **`base`** — the starting point of the exponential. Default `500ms`.
- **`max`** — the ceiling on the computed delay. Default `30s`.

</Parameters>

<Caveats>

- **Non-positive values are ignored**, independently. `WithRetryDelay(0, time.Minute)`
  changes only the max.
- This caps **skyl's own computed backoff**. A provider's `Retry-After` has a
  separate bound — see
  [`WithRetryAfterCap`](/reference/skyl/with-retry-after-cap).
- The delay is a **uniform random draw**, so an individual retry may fire almost
  immediately. That is what makes the distribution flat.
- There is no way to disable jitter, deliberately.

</Caveats>

## Why full jitter

<DeepDive title="Fixed backoff synchronises a fleet rather than spreading it">

Suppose a provider has a five-second blip and a hundred of your instances are
mid-request. Without jitter, all hundred fail together and retry after exactly
the same computed delay — so a provider that is already struggling receives a
hundred simultaneous requests, fails again, and the fleet reconverges harder on
the next attempt.

Full jitter spreads those retries uniformly across the window, so the provider
sees a smooth trickle instead of a wall.

skyl offers no no-jitter mode, because a fleet retrying on a fixed schedule is a
denial-of-service tool pointed at your own provider.

</DeepDive>

## Usage

<Recipe title="Tuning for a batch job">

```go verify
// Nobody is waiting; be patient and gentle with the provider.
client := skyl.New(p,
	skyl.WithMaxRetries(8),
	skyl.WithRetryDelay(time.Second, 2*time.Minute),
)
```

</Recipe>

<Recipe title="Making retry tests fast">

```go verify
// Same retry logic, negligible wall-clock. Without this a retry test takes 30s.
client := skyl.New(p,
	skyl.WithMaxRetries(3),
	skyl.WithRetryDelay(time.Millisecond, 10*time.Millisecond),
	skyl.WithRetryAfterCap(50*time.Millisecond), // the sandbox sends a real Retry-After
)
```

</Recipe>

<Recipe title="Fitting a latency budget">

```go verify
// 30s handler budget: two attempts of 12s leaves ~6s for one backoff.
client := skyl.New(p,
	skyl.WithMaxRetries(1),
	skyl.WithTimeout(12*time.Second),
	skyl.WithRetryDelay(200*time.Millisecond, 2*time.Second),
)
```

</Recipe>

## Troubleshooting

<Trouble problem="A retry fired almost instantly">

That is full jitter working. The delay is drawn uniformly from zero up to the
ceiling, so some draws are near zero. Across a fleet the distribution is flat,
which is the point.

</Trouble>

<Trouble problem="Retries wait far longer than my max">

The provider sent a `Retry-After` header, which takes priority and is bounded by
`WithRetryAfterCap` (5 minutes by default) rather than by this max.

</Trouble>

<Trouble problem="My retry test takes 30 seconds">

You are using the production defaults. Shrink both this and
`WithRetryAfterCap` in tests, as in the recipe above.

</Trouble>
