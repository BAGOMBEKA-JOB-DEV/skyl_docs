---
title: Stream
description: Delivers a response incrementally. A pull iterator, not a channel.
---

<Intro>

`Stream` is four methods. It is a pull iterator rather than a channel, because
that composes with `defer` and context cancellation the way Go programmers
expect.

</Intro>

## Reference

<Signature>{`type Stream interface {
	Next() bool
	Event() StreamEvent
	Err() error
	Close() error
}`}</Signature>

<Parameters>

- **`Next`** — advances to the next event, reporting whether one is available.
  Returns `false` at end of stream **and on error**.
- **`Event`** — the event `Next` just advanced to. Valid only after `Next`
  returned `true`.
- **`Err`** — the error that stopped the stream, or nil if it ended normally.
- **`Close`** — releases resources. Safe to call more than once, and before the
  stream is exhausted.

</Parameters>

<Caveats>

- **Always check `Err()` after the loop.** `Next` returning `false` means the
  stream either finished or failed, and only `Err` distinguishes them — without
  the check, a truncated response is indistinguishable from a complete one.
- **Always `defer Close()`.** Abandoning is safe (the reader is bound to the
  request context, so no stream can leak) but `Close` makes the release *prompt*
  rather than eventual.
- **Not safe for concurrent use.** One stream, one consuming goroutine.
- [`WithTimeout`](/reference/skyl/with-timeout) does not apply; the caller's
  context is the only bound.
- Only the handshake is retried. Mid-stream failures surface through `Err`.

</Caveats>

## Why an iterator

<DeepDive title="Channels look idiomatic here and are not">

A channel needs a *second* channel for errors, and closing cleanly on an early
return is easy to get wrong — which is exactly how you leak a goroutine per
abandoned request.

With the iterator, `defer stream.Close()` is the whole story. The reader
goroutine is tied to the request context, so no stream can leak, and that is
enforced by a goroutine-leak test rather than by convention.

</DeepDive>

## Usage

<Recipe title="The standard loop">

```go verify
stream, err := client.Stream(ctx, req)
if err != nil {
	return err
}
defer stream.Close()

for stream.Next() {
	if ev := stream.Event(); ev.Type == skyl.EventTextDelta {
		fmt.Print(ev.Text)
	}
}
return stream.Err()
```

</Recipe>

<Recipe title="Abandoning early">

```go verify
for stream.Next() {
	if enough(stream.Event()) {
		break // Close in the defer releases the connection promptly.
	}
}
```

</Recipe>

<Recipe title="Wrapping a Stream">

```go verify
// Four methods makes decoration cheap. Embedding gives you the rest.
type counting struct {
	skyl.Stream
	events int
}

func (c *counting) Next() bool {
	if c.Stream.Next() {
		c.events++
		return true
	}
	return false
}
```

</Recipe>

## Troubleshooting

<Trouble problem="Answers are occasionally short and I see no error">

You are not checking `Err()`. Reproduce it with the sandbox model
`sandbox-stream-truncate`.

</Trouble>

<Trouble problem="Connections stay open longer than expected">

You are not calling `Close`. Without it the HTTP body stays open until the
context is cancelled — in a request handler, that can be seconds of a pooled
connection held for nothing.

</Trouble>

<Trouble problem="Reading from two goroutines produced garbage">

A `Stream` is not concurrency-safe. Read it in one goroutine and publish onto a
channel yourself if you need to fan out.

</Trouble>
