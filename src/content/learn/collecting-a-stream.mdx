---
title: Collecting a Stream
description: When you want streaming's first byte without handling events.
---

<Intro>

`CollectStream` drains a stream into a single `*Response`. It exists for callers
who want streaming's early-first-byte behaviour without writing an event loop —
a progress spinner, or a timeout guard on a long generation.

</Intro>

<YouWillLearn>

- What `CollectStream` assembles, and from what
- When it is the right tool and when it is the wrong one
- The one field it cannot populate

</YouWillLearn>

## Using it

```go verify
stream, err := client.Stream(ctx, req)
if err != nil {
	return err
}

// CollectStream always closes the stream, so no defer is needed here.
resp, err := skyl.CollectStream(stream, "openai", "gpt-5.6")
if err != nil {
	return err
}

fmt.Println(resp.Text())
fmt.Println(resp.StopReason)
fmt.Println(resp.Usage.TotalTokens())
```

The `provider` and `model` arguments are what it stamps onto the assembled
response — the events themselves do not carry them.

## What it assembles

- Every `EventTextDelta` concatenated into one `Text` part.
- Every `EventToolCall` appended as a `ToolCall` part, in order.
- `Usage` and `StopReason` from the terminal `EventDone`.
- `StopToolUse` inferred when calls were seen but no stop reason arrived.

It **always closes the stream**, including on the error path, so you cannot leak
one by forgetting.

## When it is right

**A timeout guard on a long generation.** Streaming gives you a first byte in
milliseconds even when the full answer takes a minute, so you can distinguish "a
slow model" from "a dead connection" without waiting for the whole thing.

**A progress indicator that does not need the text.** Show a spinner while the
stream runs, then render the assembled response.

**Uniform code paths.** A function that sometimes streams and sometimes does not
can return one `*Response` either way.

## When it is wrong

<Pitfall>

If you want to display tokens as they arrive, `CollectStream` is the wrong tool
— it returns only when the stream is finished, so you get streaming's cost and
none of its benefit.

Write the event loop instead. It is six lines.

</Pitfall>

## The missing field

<Pitfall>

The returned `Response` has **no `Raw`**. It is assembled from events, not from
one provider body, so there is no untouched payload to expose.

That matters if you rely on `Raw` to read a field skyl does not model — those
two requirements are in tension. Accumulate `StreamEvent.Raw` yourself if you
need both, remembering that its coverage varies by adapter and that the terminal
event never carries it.

</Pitfall>

## Cost accounting still works

`Usage` comes from the terminal event, so it is as accurate here as in the
event loop — subject to the same caveat that OpenAI-family hosts must honour
`stream_options.include_usage` or report zero.

<DeepDive title="Why CollectStream takes provider and model as arguments">

Because a `Stream` does not carry them. The events are deltas; there is no
envelope. The adapter knows its own name and the model that answered, but the
`Stream` interface deliberately has only four methods and none of them is
`Provider()`.

Adding two accessors to the interface would have made every third-party adapter
implement two more methods to satisfy one convenience function — a bad trade for
a four-method seam. Passing them in keeps the interface small at the cost of two
arguments you already know.

</DeepDive>

<Recap>

- `CollectStream(stream, provider, model)` drains a stream into one `*Response`.
- It **always closes** the stream, including on error.
- Right for timeout guards, spinners, and uniform code paths.
- Wrong if you want to display tokens as they arrive — write the loop.
- The assembled response has **no `Raw`**.
- `Usage` and `StopReason` come from the terminal event, so accounting still works.

</Recap>

<Challenges>

<Challenge title="Guard a slow generation without losing the answer">

Use streaming to fail fast when a model produces nothing, while still allowing a
genuinely slow answer to complete.

<Hint>

`CollectStream` blocks until the end. The guard has to be on the context, driven
by whether anything has arrived.

</Hint>

<Solution>

This is exactly the case where `CollectStream` is *not* enough — you need to
observe the first event, which means the loop. But you can keep the assembly:

```go
stream, err := client.Stream(ctx, req)
if err != nil {
	return nil, err
}
defer stream.Close()

// Wrap the stream so we can notice the first event, then hand it to
// CollectStream for the assembly we do not want to rewrite.
guarded := &firstEventNotifier{Stream: stream, seen: make(chan struct{})}

go func() {
	select {
	case <-guarded.seen:
	case <-time.After(5 * time.Second):
		cancel() // nothing at all arrived; this is a dead connection
	case <-ctx.Done():
	}
}()

return skyl.CollectStream(guarded, "openai", req.Model)
```

Because `Stream` is an interface, wrapping it is trivial — which is the payoff
of keeping it to four methods.

</Solution>

</Challenge>

</Challenges>
