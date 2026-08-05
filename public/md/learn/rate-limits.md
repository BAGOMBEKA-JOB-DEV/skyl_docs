---
title: Rate Limits and Retry-After
description: Why the provider's hint has its own cap, separate from the backoff ceiling.
---

<Intro>

A `429` is the most common failure you will see in production, and skyl already
handles it — by the time `ErrRateLimit` reaches you, it has been retried with
backoff and kept failing. This page is about what to do at that point, and how
to tune what happens before it.

</Intro>

<YouWillLearn>

- What `ErrRateLimit` actually means when you receive it
- How `Retry-After` is parsed and why it takes priority
- Why it has a separate cap from the backoff ceiling
- How to shed load at the caller instead of retrying harder

</YouWillLearn>

## What it means when you see it

```go verify
if errors.Is(err, skyl.ErrRateLimit) {
	// skyl already retried this — with backoff, honouring Retry-After —
	// and it kept failing. Retrying again here will not help.
}
```

This is worth internalising. `ErrRateLimit` is not "you have been rate limited",
it is "you have been rate limited **persistently**, across four attempts spread
over several seconds". The correct response is to shed load, not to try again.

## Retry-After takes priority

When the provider sends a `Retry-After` header, skyl honours it in preference to
its own computed backoff. The provider knows when its window resets; skyl is
guessing.

`ParseRetryAfter` handles both wire forms:

<DataTable
  headers={['Header', 'Parsed as']}
  rows={[
    [<code key="a">Retry-After: 60</code>, '60 seconds'],
    [<code key="b">Retry-After: Wed, 04 Aug 2026 21:00:00 GMT</code>, 'The remaining duration until that time'],
    [<code key="c">Retry-After: garbage</code>, 'Zero — falls back to computed backoff'],
    [<code key="d">(absent)</code>, 'Zero'],
  ]}
/>

It never returns a negative duration, so a date already in the past falls back
to backoff rather than producing a nonsensical wait.

You can read the hint yourself:

```go verify
var e *skyl.Error
if errors.As(err, &e) && e.RetryAfter > 0 {
	log.Printf("%s asked for %s", e.Provider, e.RetryAfter)
}
```

## Two caps, on purpose

<Pitfall>

`WithRetryDelay(base, max)` caps **skyl's computed backoff**.
`WithRetryAfterCap(d)` caps **the provider's hint**. They are separate, and
conflating them is a real configuration error.

</Pitfall>

<DeepDive title="Why the separation matters">

A provider asking for 60 seconds is a normal rate-limit window. Clamping that to
a 30-second backoff ceiling means retrying *before* the window resets — which
fails again, and burns an attempt for nothing.

But a provider asking for an hour should not silently wedge your caller for an
hour. Something has gone wrong upstream, and a request handler holding a
connection open that long is worse than an error.

So `Retry-After` gets its own bound, defaulting to **5 minutes**: generous
enough to honour a real window, bounded enough that a pathological hint cannot
hang you. Before this separation existed, `Retry-After` was clamped to the
backoff ceiling and skyl systematically retried too early on exactly the
failures it was designed to handle.

</DeepDive>

Tune it to your latency budget:

```go verify
// A request handler with 30 seconds to work with should not honour a
// 60-second hint at all — better to fail fast and shed load.
client := skyl.New(p,
	skyl.WithTimeout(12*time.Second),
	skyl.WithRetryAfterCap(3*time.Second),
)
```

## Shedding load

When `ErrRateLimit` reaches you, the useful responses are all forms of doing
less:

**Queue it.** Push the work onto a queue and return a 202 to your caller.

**Degrade.** Fall back to a cheaper model, a cached answer, or a non-AI path.

**Reject.** Return a 429 of your own, with your own `Retry-After`, so *your*
callers back off too.

```go
if errors.Is(err, skyl.ErrRateLimit) {
	var e *skyl.Error
	errors.As(err, &e)

	// Pass the upstream hint through, so our callers back off in step with
	// the actual window rather than guessing.
	if e != nil && e.RetryAfter > 0 {
		w.Header().Set("Retry-After", strconv.Itoa(int(e.RetryAfter.Seconds())))
	}
	http.Error(w, "upstream capacity exhausted", http.StatusTooManyRequests)
	return
}
```

## Preventing them

Rate limits are usually a concurrency problem rather than a request-rate problem.
Bound in-flight requests before they reach the provider:

```go
// A semaphore in front of the client costs one line and prevents a traffic
// spike from converting into a rate-limit incident.
sem := make(chan struct{}, 16)

func complete(ctx context.Context, req *skyl.Request) (*skyl.Response, error) {
	select {
	case sem <- struct{}{}:
		defer func() { <-sem }()
	case <-ctx.Done():
		return nil, ctx.Err()
	}
	return client.Complete(ctx, req)
}
```

The gateway offers this as `SKYL_MAX_CONCURRENT` for exactly this reason.

## Watching for it

The earliest signal is the retry rate, well before failures become user-visible:

```go verify
skyl.WithHook(func(_ context.Context, ev skyl.HookEvent) {
	if errors.Is(ev.Err, skyl.ErrRateLimit) {
		metrics.Inc("skyl.rate_limited", "provider", ev.Provider, "attempt", ev.Attempt)
	}
})
```

<Recap>

- `ErrRateLimit` means skyl **already retried** and it kept failing.
- `Retry-After` takes priority over computed backoff; both wire forms are parsed.
- `WithRetryAfterCap` (5m) bounds the provider's hint; `WithRetryDelay`'s max bounds skyl's own.
- Lower the cap to fit a request-handler latency budget.
- Respond by shedding load — queue, degrade, or reject with your own `Retry-After`.
- Bound concurrency to prevent rate limits rather than reacting to them.

</Recap>

<Challenges>

<Challenge title="Fall back to a cheaper model on rate limit">

Degrade gracefully rather than failing, but only for capacity problems.

<Hint>

Only `ErrRateLimit` and `ErrServer` are the provider's problem. Everything else
would fail identically on the second provider.

</Hint>

<Solution>

```go verify
func completeDegrading(ctx context.Context, primary, fallback *skyl.Client, req *skyl.Request) (*skyl.Response, error) {
	resp, err := primary.Complete(ctx, req)
	if err == nil {
		return resp, nil
	}
	// Only fail over on capacity. A bad request or a refusal will fail the
	// same way on the second provider, so trying costs money for nothing.
	if !errors.Is(err, skyl.ErrRateLimit) && !errors.Is(err, skyl.ErrServer) {
		return nil, err
	}
	metrics.Inc("skyl.degraded")
	return fallback.Complete(ctx, req)
}
```

The metric matters as much as the fallback. Silent degradation means you find
out your primary has been rate limited for a week when someone notices the
answers got worse.

</Solution>

</Challenge>

</Challenges>
