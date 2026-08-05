---
title: Retries and Backoff
description: Exponential backoff with full jitter, and why the jitter is not optional.
---

<Intro>

`Client` retries retryable failures with exponential backoff and full jitter,
honouring a provider's `Retry-After` when it sends one. You configure it with
three options and rarely need to think about it again.

</Intro>

<YouWillLearn>

- The exact delay formula
- Why full jitter matters at fleet scale
- The three options that tune it, and their defaults
- Why streams retry only the handshake

</YouWillLearn>

## The defaults

<DataTable
  headers={['Option', 'Default', 'What it controls']}
  rows={[
    [<code key="a">WithMaxRetries(n)</code>, '3', 'How many times a retryable failure is retried. Zero disables retries.'],
    [<code key="b">WithRetryDelay(base, max)</code>, '500ms / 30s', "The bounds on skyl's computed backoff."],
    [<code key="c">WithRetryAfterCap(d)</code>, '5m', "How long a provider's own Retry-After may delay a retry."],
  ]}
/>

Three retries means up to **four attempts** in total.

## The formula

The delay before attempt *n* is sampled uniformly from:

<ConsoleBlock>[0, min(base × 2ⁿ, max)]</ConsoleBlock>

With the defaults, the ceiling grows 500ms → 1s → 2s → 4s, and the actual delay
is a uniform random draw from zero up to that ceiling. That is **full jitter**,
not a fixed exponential.

```go verify
client := skyl.New(p,
	skyl.WithMaxRetries(5),
	skyl.WithRetryDelay(time.Second, time.Minute),
)
```

## Why full jitter

<DeepDive title="The thundering herd, concretely">

Suppose a provider has a five-second blip and a hundred of your instances are
mid-request. Without jitter, all hundred fail at once and all hundred retry
after exactly the same computed delay — so the provider, which is already
struggling, receives a hundred simultaneous requests. That fails too, and the
fleet reconverges even harder on the next attempt.

Fixed backoff does not spread load; it *synchronises* it. Full jitter spreads
those hundred retries uniformly across the window, so the provider sees a smooth
trickle instead of a wall.

The cost is that any individual retry may fire almost immediately, which feels
wrong until you notice that is exactly what makes the distribution flat. skyl
does not offer a no-jitter mode, because a fleet that retries on a fixed
schedule is a denial-of-service tool pointed at your own provider.

</DeepDive>

## Retry-After wins

If the provider sends a `Retry-After` header, skyl honours it in preference to
its own computed backoff — the provider knows when its window resets and skyl
does not.

`ParseRetryAfter` handles both wire forms: a delay in seconds, and an HTTP date.
It returns zero for anything absent or unparseable, and never a negative
duration.

<Pitfall>

`Retry-After` has its **own** cap, separate from `WithRetryDelay`'s max. That
separation exists because the two bound different things: a provider asking for
60 seconds is a normal rate-limit window and should be honoured, while a
provider asking for an hour should not silently wedge your caller.

`WithRetryDelay`'s max caps only skyl's *computed* backoff.
`WithRetryAfterCap` — 5 minutes by default — caps the provider's hint.

</Pitfall>

## Which failures are retried

<DataTable
  headers={['Retried', 'Never retried']}
  rows={[
    [<span key="a"><code>ErrRateLimit</code>, <code>ErrServer</code>, transport failures</span>, <span key="b"><code>ErrAuth</code>, <code>ErrBadRequest</code>, <code>ErrNotFound</code>, <code>ErrRefusal</code>, <code>ErrUnsupported</code></span>],
  ]}
/>

Retrying an auth failure or a malformed request burns quota to receive the same
answer. See [What Is Never Retried](/learn/never-retried).

Retrying also stops immediately if your context is cancelled — skyl checks
`ctx.Err()` after each attempt, and waiting for a backoff delay is itself
cancellable.

## Streams retry only the handshake

`Client.Stream` retries the initial call — a 429 on the handshake is retried
exactly like `Complete`. Once bytes are flowing, a mid-stream failure surfaces
through `Stream.Err()` rather than being retried, because replaying a partially
consumed response would duplicate output the caller has already seen.

## Observing retries

Every attempt fires a hook event, including retried ones:

```go verify
skyl.WithHook(func(_ context.Context, ev skyl.HookEvent) {
	if ev.Attempt > 0 {
		log.Printf("retry %d on %s after %s: %v",
			ev.Attempt, ev.Provider, ev.Duration, ev.Err)
	}
})
```

`Attempt` is zero-based, so `Attempt > 0` is exactly "this was a retry".

## Giving up

When retries are exhausted, the final error is wrapped:

<ConsoleBlock>skyl: giving up after 4 attempts: skyl: openai: rate limited (http 429)</ConsoleBlock>

The sentinel survives the wrapping, so `errors.Is(err, skyl.ErrRateLimit)` still
matches.

<Recap>

- Defaults: 3 retries, 500ms–30s backoff, 5-minute `Retry-After` cap.
- The delay is drawn uniformly from `[0, min(base × 2ⁿ, max)]` — **full jitter**.
- Jitter is not optional: fixed backoff synchronises a fleet rather than spreading it.
- A provider's `Retry-After` wins, bounded by its own separate cap.
- Only rate limits, server errors and transport failures are retried.
- Streams retry the handshake only; mid-stream failures reach you through `Err()`.

</Recap>

<Challenges>

<Challenge title="Make retry tests fast">

The production defaults make a retry test take 30 seconds. Fix that without
changing what is being tested.

<Hint>

The delays are options, and options are just functions.

</Hint>

<Solution>

```go verify
func testClient(p skyl.Provider) *skyl.Client {
	return skyl.New(p,
		skyl.WithMaxRetries(3),
		// Same retry *count*, negligible wall-clock. The backoff logic is
		// still exercised; only the durations shrink.
		skyl.WithRetryDelay(time.Millisecond, 10*time.Millisecond),
		skyl.WithRetryAfterCap(50*time.Millisecond),
	)
}
```

Shrinking `WithRetryAfterCap` too matters: the sandbox's `sandbox-status-429`
sends a real `Retry-After`, and without the cap your test would honour it.

</Solution>

</Challenge>

<Challenge title="Count what retries are costing you">

Retries are invisible in latency percentiles unless you measure them. Report the
retry rate per provider.

<Hint>

One hook, two counters.

</Hint>

<Solution>

```go verify
var attempts, retries atomic.Int64

skyl.WithHook(func(_ context.Context, ev skyl.HookEvent) {
	if ev.Operation != skyl.OpComplete {
		return
	}
	attempts.Add(1)
	if ev.Attempt > 0 {
		retries.Add(1)
	}
})

// Later:
rate := float64(retries.Load()) / float64(attempts.Load())
```

A retry rate creeping from 0.5% to 5% is the earliest warning you get that a
provider is degrading — usually well before it shows up as user-visible latency,
because backoff is absorbing it.

</Solution>

</Challenge>

</Challenges>
