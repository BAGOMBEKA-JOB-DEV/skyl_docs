---
title: CollectStream
description: Drains a stream into a single Response. Always closes it.
---

<Intro>

`CollectStream` is for callers who want streaming's early-first-byte behaviour
without handling events — a progress spinner, or a timeout guard on a long
generation.

</Intro>

## Reference

<Signature>func CollectStream(s Stream, provider, model string) (*Response, error)</Signature>

<Parameters>

- **`s`** — the stream to drain. **Always closed**, including on the error path.
- **`provider`**, **`model`** — stamped onto the assembled response. The events
  themselves do not carry them.

</Parameters>

<Returns>

A `*Response` assembled from the events, or the stream's error.

</Returns>

<Caveats>

- **The returned `Response` has no `Raw`** — it is assembled from events, not
  from one provider body.
- **It blocks until the stream is finished.** If you want to display tokens as
  they arrive, this is the wrong tool; write the loop.
- It infers `StopToolUse` when calls were seen but no stop reason arrived.
- It always closes the stream, so you cannot leak one by forgetting.

</Caveats>

## What it assembles

- Every `EventTextDelta` concatenated into one `Text` part.
- Every `EventToolCall` appended as a `ToolCall` part, in order.
- `Usage` and `StopReason` from the terminal `EventDone`.

## Usage

<Recipe title="Draining a stream">

```go verify
stream, err := client.Stream(ctx, req)
if err != nil {
	return err
}

// No defer needed: CollectStream always closes it.
resp, err := skyl.CollectStream(stream, "openai", "gpt-5.6")
if err != nil {
	return err
}
fmt.Println(resp.Text(), resp.StopReason, resp.Usage.TotalTokens())
```

</Recipe>

<Recipe title="Uniform code paths">

```go verify
// Return one *Response whether or not this call streamed.
func ask(ctx context.Context, c *skyl.Client, req *skyl.Request, stream bool) (*skyl.Response, error) {
	if !stream {
		return c.Complete(ctx, req)
	}
	s, err := c.Stream(ctx, req)
	if err != nil {
		return nil, err
	}
	return skyl.CollectStream(s, c.Provider().Name(), req.Model)
}
```

</Recipe>

## Troubleshooting

<Trouble problem="resp.Raw is nil">

Expected. There is no single provider body behind an assembled response. If you
need `Raw` and streaming both, accumulate `StreamEvent.Raw` yourself — noting
that its coverage varies by adapter.

</Trouble>

<Trouble problem="Nothing printed until the end">

`CollectStream` returns only when the stream is finished. For live output, write
the event loop.

</Trouble>

<Trouble problem="Why must I pass provider and model?">

A `Stream` does not carry them — the events are deltas with no envelope. Adding
accessors to the interface would make every third-party adapter implement two
more methods to satisfy one convenience function, which is a bad trade for a
four-method seam.

</Trouble>
