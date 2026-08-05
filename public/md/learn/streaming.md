---
title: Streaming
description: A pull iterator that composes with defer, and cannot leak a goroutine.
---

<Intro>

`Client.Stream` delivers a response incrementally. skyl models it as a pull
iterator rather than a channel, and that single choice determines most of what
this chapter covers.

</Intro>

<YouWillLearn isChapter>

- The four-method `Stream` interface and the loop that goes with it
- Why `stream.Err()` after the loop is not optional
- The four event types, and which providers emit which
- How to drain a stream into one `Response` when you do not want events
- How cancellation works, and why no stream can leak
- Why a stream that dies halfway is reported rather than hidden

</YouWillLearn>

## The shape

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

<LearnMore path="/learn/your-first-stream">
Read **[Your First Stream](/learn/your-first-stream)** for what each method does and the two lines people forget.
</LearnMore>

## Events

<EventTypeTable />

<LearnMore path="/learn/stream-events">
Read **[Stream Events](/learn/stream-events)** for which adapters emit which, and why tool calls arrive whole.
</LearnMore>

## Collecting

```go verify
resp, err := skyl.CollectStream(stream, "openai", "gpt-5.6")
```

<LearnMore path="/learn/collecting-a-stream">
Read **[Collecting a Stream](/learn/collecting-a-stream)** for when this is the right tool and what it costs you.
</LearnMore>

## Cancellation

<LearnMore path="/learn/cancellation-and-cleanup">
Read **[Cancellation and Cleanup](/learn/cancellation-and-cleanup)** for why abandoning a stream is safe, and why `Close` still matters.
</LearnMore>

## Tool calls

<LearnMore path="/learn/streaming-tool-calls">
Read **[Streaming Tool Calls](/learn/streaming-tool-calls)** — skyl reassembles fragmented arguments so you never see half a call.
</LearnMore>

## Truncation

<LearnMore path="/learn/truncated-streams">
Read **[Truncated Streams](/learn/truncated-streams)** for the failure that used to look exactly like success.
</LearnMore>

<WhatsNext>

Start with [Your First Stream](/learn/your-first-stream). If you already stream
and are chasing a bug where answers are occasionally cut short, go straight to
[Truncated Streams](/learn/truncated-streams).

</WhatsNext>
