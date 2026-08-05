---
title: Cancellation and Cleanup
description: Why abandoning a stream is safe, and why Close still matters.
---

<Intro>

Every skyl stream is safe to abandon. The reader goroutine is tied to the
request context, so no stream can leak — and that is enforced by a
goroutine-leak test rather than by convention. This page is about the mechanics,
and about the one thing you still have to do.

</Intro>

<YouWillLearn>

- How a stream is bound to its context
- What `Close` does that cancellation does not
- Why an abandoned stream still reports its token usage
- How to handle a client hanging up mid-generation

</YouWillLearn>

## Two ways to stop

**Cancel the context.** The reader is bound to the context you opened the stream
with, so cancelling terminates it.

```go verify
ctx, cancel := context.WithCancel(ctx)
defer cancel()

stream, err := client.Stream(ctx, req)
```

**Call Close.** Releases the HTTP body immediately, and is safe to call more
than once and before the stream is exhausted.

```go verify
defer stream.Close()
```

Do both. Cancellation is the safety net; `Close` is the prompt release.

<DeepDive title="Why the per-attempt timeout does not apply to streams">

`WithTimeout` bounds a single attempt on `Complete` and `Models`. On `Stream` it
is deliberately not applied.

The reason is that the stream **outlives the call**. `Client.Stream` returns as
soon as the provider accepts the request — before any token exists — and the
stream is consumed afterwards, possibly for minutes. Attaching a per-attempt
timeout would cancel the context out from under a stream that is working
perfectly.

So the caller's context is the only bound on a stream's lifetime. If you want
one, set it yourself:

```go verify
ctx, cancel := context.WithTimeout(ctx, 5*time.Minute)
defer cancel()
stream, err := client.Stream(ctx, req)
```

</DeepDive>

## Recognising cancellation

```go verify
if err := stream.Err(); err != nil {
	if errors.Is(err, context.Canceled) {
		return nil // the caller went away; not an error worth reporting
	}
	return err
}
```

`errors.Is(err, context.Canceled)` works through `*skyl.Error` because it wraps
its underlying **cause** as well as its sentinel. The same is true of
`context.DeadlineExceeded` — a request that timed out is recognisable without
string matching.

## Abandoned streams still cost money

<Pitfall>

Tokens generated before you stopped reading were still generated, and still
billed. A stream you abandon is not free.

skyl makes this visible: the `stream_end` hook event fires **even for an
abandoned stream**, with `Completed: false`. Reporting nothing would make that
spend invisible.

</Pitfall>

```go verify
skyl.WithHook(func(_ context.Context, ev skyl.HookEvent) {
	if ev.Operation == skyl.OpStreamEnd && !ev.Completed {
		log.Printf("abandoned stream on %s after %s", ev.Provider, ev.Duration)
	}
})
```

Two things to know about that event. It fires from whichever of the terminal
event or `Close` comes first — so on the `Close` path the hook runs inside your
`defer`, and its latency lands there. And the context it receives is the one the
stream was opened with, which is frequently **already cancelled** by then. A
hook that needs to record the event must not depend on that context being live.

## A client hanging up

The common real case: an HTTP handler streaming to a browser, and the browser
closes the tab.

```go title="handler.go" verify
func (h *Handler) Chat(w http.ResponseWriter, r *http.Request) {
	// r.Context() is cancelled when the client disconnects, which propagates
	// straight through to the upstream request.
	stream, err := h.client.Stream(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadGateway)
		return
	}
	defer stream.Close()

	flusher, _ := w.(http.Flusher)
	for stream.Next() {
		if ev := stream.Event(); ev.Type == skyl.EventTextDelta {
			fmt.Fprintf(w, "data: %s\n\n", ev.Text)
			if flusher != nil {
				flusher.Flush()
			}
		}
	}
}
```

Passing `r.Context()` is the whole mechanism. A client hanging up must not leave
a paid request running, and this is how that happens — no polling, no explicit
disconnect handling.

## One stream, one goroutine

A `Stream` is **not** safe for concurrent use. Read it in one goroutine. If you
need to fan events out, publish onto a channel from the reading goroutine.

<Recap>

- A stream is bound to the context it was opened with; cancelling terminates it.
- `Close` makes the release prompt; do both, with `defer`.
- `WithTimeout` does **not** apply to streams — the stream outlives the call.
- `errors.Is(err, context.Canceled)` works, because `*Error` wraps its cause.
- Abandoned streams still billed you; `stream_end` fires with `Completed: false`.
- Pass `r.Context()` in a handler so a client hang-up cancels the upstream request.

</Recap>

<Challenges>

<Challenge title="Prove a stream does not leak">

Write a test that abandons a stream halfway and asserts no goroutine survives.

<Hint>

Compare `runtime.NumGoroutine()` before and after, with a settling delay — or
use `go.uber.org/goleak`, which is what skyl's own suite does.

</Hint>

<Solution>

```go verify
func TestAbandonedStreamDoesNotLeak(t *testing.T) {
	before := runtime.NumGoroutine()

	func() {
		ctx, cancel := context.WithCancel(context.Background())
		defer cancel()

		stream, err := client.Stream(ctx, req)
		if err != nil {
			t.Fatal(err)
		}
		stream.Next()          // consume exactly one event
		_ = stream.Close()     // then walk away
	}()

	// Give the reader a moment to unwind before asserting.
	time.Sleep(100 * time.Millisecond)

	if after := runtime.NumGoroutine(); after > before {
		t.Fatalf("leaked %d goroutines", after-before)
	}
}
```

`goleak` is more reliable than a count comparison, because it names the surviving
stacks rather than just telling you a number went up.

</Solution>

</Challenge>

</Challenges>
