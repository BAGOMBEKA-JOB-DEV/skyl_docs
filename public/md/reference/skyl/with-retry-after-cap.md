---
title: WithRetryAfterCap
description: Bounds how long a provider's Retry-After may delay a retry. Default 5m.
---

<Intro>

When a provider sends a `Retry-After` header, skyl honours it in preference to
its own computed backoff — the provider knows when its window resets. This option
bounds how far that trust extends.

</Intro>

## Reference

<Signature>func WithRetryAfterCap(d time.Duration) Option</Signature>

<Parameters>

- **`d`** — the maximum delay a provider's hint may impose. Default `5m`.

</Parameters>

<Caveats>

- **Non-positive values are ignored**, leaving the default in place.
- This is **separate from** [`WithRetryDelay`](/reference/skyl/with-retry-delay)'s
  max, which caps only skyl's own computed backoff.
- It applies only when the provider actually sent a parseable `Retry-After`.
- `ParseRetryAfter` handles both the seconds form and the HTTP-date form, and
  never returns a negative duration.

</Caveats>

## Why it is a separate bound

<DeepDive title="Two different things being bounded">

A provider asking for 60 seconds is a normal rate-limit window. Clamping that to
a 30-second backoff ceiling means retrying *before* the window resets — which
fails again, and burns an attempt for nothing.

But a provider asking for an hour should not silently wedge your caller for an
hour. Something has gone wrong upstream, and a request handler holding a
connection that long is worse than an error.

So the hint gets its own bound: generous enough to honour a real window,
bounded enough that a pathological value cannot hang you.

Before this separation existed, `Retry-After` was clamped to the backoff ceiling
and skyl systematically retried too early on exactly the failures it was
designed to handle.

</DeepDive>

## Usage

<Recipe title="Fitting a request-handler budget">

```go verify
// With 30 seconds total, honouring a 60-second hint is pointless — better to
// fail fast and shed load at the caller.
client := skyl.New(p,
	skyl.WithTimeout(12*time.Second),
	skyl.WithRetryAfterCap(3*time.Second),
)
```

</Recipe>

<Recipe title="Being patient in a batch job">

```go verify
client := skyl.New(p,
	skyl.WithMaxRetries(10),
	skyl.WithRetryAfterCap(15*time.Minute), // nobody is waiting
)
```

</Recipe>

<Recipe title="Reading the hint yourself">

```go verify
var e *skyl.Error
if errors.As(err, &e) && e.RetryAfter > 0 {
	// Pass it on, so your own callers back off in step with the real window.
	w.Header().Set("Retry-After", strconv.Itoa(int(e.RetryAfter.Seconds())))
}
```

</Recipe>

## Troubleshooting

<Trouble problem="A retry waited five minutes">

That is the default cap being reached — the provider asked for at least that
long. Lower the cap if your latency budget cannot absorb it, and expect to shed
load instead.

</Trouble>

<Trouble problem="My test hangs on sandbox-status-429">

The sandbox sends a real `Retry-After` with its 429, and the default cap is five
minutes. Set `WithRetryAfterCap(50 * time.Millisecond)` in tests alongside a
short `WithRetryDelay`.

</Trouble>

<Trouble problem="Should I set this and WithRetryDelay to the same value?">

Usually not. They bound different things: your patience with skyl's guess, and
your patience with the provider's knowledge. The provider's hint deserves more
latitude, which is why the default is 5m against 30s.

</Trouble>
