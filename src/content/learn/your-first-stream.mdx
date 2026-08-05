---
title: Your First Stream
description: Four methods, and the two lines people forget.
---

<Intro>

A `Stream` has four methods. The loop is three lines. The two lines that are
easy to omit are the two that matter most.

</Intro>

<YouWillLearn>

- What each of the four methods does
- Why `defer stream.Close()` is required even though the reader is context-bound
- Why `stream.Err()` after the loop is not optional
- What is retried on a stream, and what is not

</YouWillLearn>

## The interface

```go
type Stream interface {
	Next() bool          // advance; false at end of stream AND on error
	Event() StreamEvent  // valid only after Next returned true
	Err() error          // the error that stopped it, or nil
	Close() error        // release resources; safe to call twice, and early
}
```

## The loop

```go title="stream.go" verify
stream, err := client.Stream(ctx, req)
if err != nil {
	return err
}
defer stream.Close()          // ← line one

for stream.Next() {
	ev := stream.Event()
	switch ev.Type {
	case skyl.EventTextDelta:
		fmt.Print(ev.Text)
	case skyl.EventDone:
		if ev.Usage != nil {
			log.Printf("%d tokens", ev.Usage.TotalTokens())
		}
	}
}

return stream.Err()           // ← line two
```

## Line one: defer Close

<Pitfall>

Abandoning a stream early is **safe** — the reader goroutine is tied to the
request context, so no stream can leak. But `Close()` is what makes the release
*prompt* rather than eventual.

Without it, the HTTP body stays open until the context is cancelled. In a
request handler where the context lives as long as the request, that can be
seconds — during which you are holding a connection from the pool for no reason.

</Pitfall>

`Close` is safe to call more than once, and safe to call before the stream is
exhausted, so `defer` is always correct.

## Line two: check Err

<Pitfall>

`Next()` returning `false` means the stream **either finished or failed**, and
only `Err()` distinguishes them.

Omit it and a connection dropped mid-generation is indistinguishable from a
complete short answer. You get a truncated response with no indication that
anything went wrong — the single most damaging bug you can write against a
streaming API, because it is invisible until someone reads the output carefully.

No linter catches this, because discarding a return value is legal Go. Make it a
review habit.

</Pitfall>

## What is retried

Only the **handshake**. Once bytes are flowing, a mid-stream failure surfaces
through `Err()` rather than being retried.

<DeepDive title="Why not retry a stream that fails halfway?">

Because you have already seen output. Replaying a partially consumed response
would duplicate the text the caller printed — a user watching tokens appear
would see the answer restart mid-sentence.

The alternative, buffering everything and only emitting once complete, defeats
the purpose of streaming.

So `Client.Stream` retries the initial call — a 429 or a 503 on the handshake is
retried with backoff, exactly like `Complete` — and hands everything after that
to you. If your use case can tolerate a restart, you can retry at your own
level, where you know whether output has been shown.

</DeepDive>

## A stream is not concurrency-safe

`Client` and every adapter are safe for concurrent use. A `Stream` is **not**.
One stream, one consuming goroutine. If you need to fan the events out, read
them in one goroutine and publish onto a channel yourself.

<Recap>

- Four methods: `Next`, `Event`, `Err`, `Close`.
- `defer stream.Close()` — abandoning is safe, but `Close` makes release prompt.
- **Always check `stream.Err()`** — `Next` returning false does not mean success.
- Only the handshake is retried; mid-stream failures surface through `Err`.
- One stream, one goroutine. `Client` is concurrency-safe; `Stream` is not.

</Recap>

<Challenges>

<Challenge title="Stream with a first-token deadline">

Give the model 5 seconds to produce its first token, then let it take as long as
it needs for the rest.

<Hint>

You cannot use one context for both. Cancel a timer when the first delta
arrives.

</Hint>

<Solution>

```go verify
ctx, cancel := context.WithCancel(ctx)
defer cancel()

stream, err := client.Stream(ctx, req)
if err != nil {
	return err
}
defer stream.Close()

// Cancel the whole stream if nothing arrives within the deadline.
firstToken := make(chan struct{})
go func() {
	select {
	case <-firstToken:
	case <-time.After(5 * time.Second):
		cancel()
	case <-ctx.Done():
	}
}()

var seen bool
for stream.Next() {
	if !seen {
		close(firstToken)
		seen = true
	}
	if ev := stream.Event(); ev.Type == skyl.EventTextDelta {
		fmt.Print(ev.Text)
	}
}
return stream.Err()
```

The `ctx.Done()` case in the select stops the goroutine leaking when the stream
ends normally — which matters, because this pattern runs once per request.

</Solution>

</Challenge>

</Challenges>
