---
title: Timeouts and Cancellation
description: WithTimeout bounds an attempt. Your context bounds the call.
---

<Intro>

There are two deadlines in play on every skyl request, and confusing them is the
most common configuration mistake. One is per attempt and belongs to the client;
one is per call and belongs to you.

</Intro>

<YouWillLearn>

- The difference between `WithTimeout` and your own context
- Why the default is ten minutes
- Why streams have no per-attempt timeout
- How to recognise each kind of expiry

</YouWillLearn>

## Two deadlines

**`skyl.WithTimeout(d)`** bounds a **single attempt**. Default: 10 minutes.

**Your context** bounds the **whole call**, including every retry and every
backoff delay in between.

```go verify
client := skyl.New(p, skyl.WithTimeout(90*time.Second)) // per attempt

ctx, cancel := context.WithTimeout(ctx, 5*time.Minute)  // per call
defer cancel()

resp, err := client.Complete(ctx, req)
```

With those numbers: each attempt gets 90 seconds, and the whole sequence —
attempts plus backoff — gets five minutes.

<DeepDive title="Why per attempt rather than per call?">

If `WithTimeout` bounded the whole sequence, a request that failed twice would
have less time left for its third attempt than its first. The attempt most
likely to be starved would be the one you most want to succeed — and the
starvation would grow with the number of retries, which is exactly backwards.

Bounding each attempt separately keeps them comparable. The sequence bound is a
different decision — "how long is this whole operation allowed to take" — and it
belongs to the caller, who knows whether this is a request handler with a
user waiting or a batch job that can take an hour.

</DeepDive>

## Ten minutes is deliberate

The default looks enormous for an HTTP request, and it is right for this one.
Reasoning models legitimately take minutes on hard problems, and a default that
cut them off would make skyl unusable for exactly the workloads people reach for
frontier models to do.

Lower it if you know your workload is fast:

```go verify
// A classifier that should answer in under two seconds.
fast := skyl.New(p, skyl.WithTimeout(10*time.Second))
```

A non-positive value **disables** the per-attempt timeout entirely, leaving only
your context:

```go verify
client := skyl.New(p, skyl.WithTimeout(0)) // only ctx bounds anything
```

## Streams have no per-attempt timeout

<Pitfall>

`WithTimeout` is **not applied** to `Client.Stream`.

The stream outlives the call: `Stream` returns as soon as the provider accepts
the request, before any token exists, and the stream is consumed afterwards —
possibly for minutes. Cancelling its context on a per-attempt timer would kill a
stream that is working perfectly.

So the caller's context is the only bound on a stream's lifetime. Set one if you
want one.

</Pitfall>

```go verify
ctx, cancel := context.WithTimeout(ctx, 5*time.Minute)
defer cancel()

stream, err := client.Stream(ctx, req)
if err != nil {
	return err
}
defer stream.Close()
```

## Recognising each expiry

Both surface as `context.DeadlineExceeded`, and `errors.Is` reaches it through
`*skyl.Error` because that type wraps its cause as well as its sentinel:

```go verify
if errors.Is(err, context.DeadlineExceeded) {
	// Either an attempt timed out, or your whole deadline expired.
}
if errors.Is(err, context.Canceled) {
	// The caller went away — usually a client disconnect.
}
```

To tell them apart, check whether your own context is done:

```go verify
switch {
case ctx.Err() != nil:
	// Your call-level deadline expired.
case errors.Is(err, context.DeadlineExceeded):
	// One attempt timed out; skyl may have retried and then given up.
}
```

## Backoff is cancellable

Waiting for a retry delay respects your context. A cancellation landing
mid-backoff returns promptly rather than sleeping out the remaining delay:

<ConsoleBlock>skyl: waiting to retry: context deadline exceeded</ConsoleBlock>

That message is how you tell "we gave up during a backoff" from "an attempt
timed out", which is a genuinely useful distinction when tuning.

## In a request handler

Pass the request's context straight through. It is cancelled when the client
disconnects, which propagates to the upstream provider automatically:

```go
func (h *Handler) Chat(w http.ResponseWriter, r *http.Request) {
	resp, err := h.client.Complete(r.Context(), req)
	// A client hanging up must not leave a paid request running.
}
```

<Recap>

- `WithTimeout` bounds **one attempt**; your context bounds the **whole call**.
- Per attempt is right, because a per-call bound starves later retries.
- The 10-minute default exists because reasoning models genuinely take minutes.
- `WithTimeout` does **not** apply to streams — set a context deadline instead.
- `errors.Is(err, context.DeadlineExceeded)` works through `*skyl.Error`.
- Backoff waits are cancellable, and say so in the error message.

</Recap>

<Challenges>

<Challenge title="Budget a request end to end">

A handler has 30 seconds before its own caller gives up. Configure skyl so it
never overruns, and still gets two attempts.

<Hint>

Work backwards from the budget. Attempts plus backoff must fit inside it.

</Hint>

<Solution>

```go verify
// 30s budget: two attempts of 12s, leaving ~6s for one backoff and slack.
client := skyl.New(p,
	skyl.WithMaxRetries(1),
	skyl.WithTimeout(12*time.Second),
	skyl.WithRetryDelay(200*time.Millisecond, 2*time.Second),
	skyl.WithRetryAfterCap(3*time.Second), // do not honour a long provider hint here
)

ctx, cancel := context.WithTimeout(r.Context(), 30*time.Second)
defer cancel()
```

The `WithRetryAfterCap` line is the one people miss: without it, a provider
sending `Retry-After: 60` would be honoured up to the 5-minute default, and your
30-second budget would blow regardless of the other settings.

</Solution>

</Challenge>

</Challenges>
