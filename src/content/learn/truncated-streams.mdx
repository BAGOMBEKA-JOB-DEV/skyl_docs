---
title: Truncated Streams
description: The failure that used to look exactly like success.
---

<Intro>

A connection dropped mid-generation reaches EOF with no reader error. Without an
explicit check, that is indistinguishable from a stream that finished — so a
partial answer arrives looking complete. skyl detects it. You still have to
check for it.

</Intro>

<YouWillLearn>

- Why a truncated stream is invisible by default
- How skyl detects it, and what it reports
- How to reproduce one on demand
- The difference between truncation and `StopMaxTokens`

</YouWillLearn>

## The failure

Every streaming protocol ends with a terminal signal — `message_stop` on
Anthropic, `[DONE]` on the OpenAI family, the final chunk on Gemini. If the
connection drops before it arrives, the reader simply sees end-of-input.

<Pitfall>

At the Go level, that is `io.EOF`, which is not an error. So a naive
implementation emits a clean terminal event over a half-finished answer, and the
caller gets a short response with no indication that anything went wrong.

All three adapters used to do exactly this. It is fixed — but only the
`stream.Err()` check surfaces it to you.

</Pitfall>

## What skyl does

Each adapter tracks whether it saw its terminal signal. If the stream ends
without one, `Err()` returns an error saying so:

<ConsoleBlock>stream ended without a terminal event; the response is truncated</ConsoleBlock>

Crucially, **the text read so far is still delivered**. You get the partial
answer *and* the knowledge that it is partial, rather than one or the other.

```go verify
var got strings.Builder
for stream.Next() {
	if ev := stream.Event(); ev.Type == skyl.EventTextDelta {
		got.WriteString(ev.Text)
	}
}

if err := stream.Err(); err != nil {
	// We have partial text in got.String(). Decide what to do with it —
	// but do NOT present it as a complete answer.
	return got.String(), fmt.Errorf("incomplete: %w", err)
}
return got.String(), nil
```

## Reproducing it

The sandbox makes this a one-line test:

```go verify
stream, err := client.Stream(ctx, &skyl.Request{
	Model:     "sandbox-stream-truncate",
	MaxTokens: 64,
	Messages:  []skyl.Message{skyl.UserText("count to ten")},
})
```

There is a second fault model, `sandbox-stream-error`, which emits an error
frame *after* the stream has started. Both exist because
`sandbox-status-NNN` structurally cannot model them — once the SSE header is
written, the status is fixed.

## Truncation is not StopMaxTokens

These are different failures and want different handling:

<DataTable
  headers={['', 'What happened', 'How you see it', 'What to do']}
  rows={[
    [<strong key="a">Truncation</strong>, 'The connection died mid-generation', <code key="b">stream.Err() != nil</code>, 'Retry is safe — nothing was completed'],
    [<strong key="c">StopMaxTokens</strong>, 'The model hit your token cap', <code key="d">EventDone with StopMaxTokens</code>, 'Raise MaxTokens; retrying unchanged gives the same result'],
  ]}
/>

`StopMaxTokens` arrives on a perfectly healthy terminal event — the stream
succeeded, the answer is just capped.

```go verify
var stop skyl.StopReason
for stream.Next() {
	if ev := stream.Event(); ev.Type == skyl.EventDone {
		stop = ev.StopReason
	}
}
if err := stream.Err(); err != nil {
	return fmt.Errorf("connection failed mid-stream: %w", err)
}
if stop == skyl.StopMaxTokens {
	return fmt.Errorf("hit the %d-token cap", req.MaxTokens)
}
```

## Mid-stream errors are not retried

<DeepDive title="Why skyl will not retry a stream that died halfway">

Because you may already have printed output. Replaying would duplicate text the
user has seen — an answer that restarts mid-sentence.

Only the handshake is retried. Everything after the first byte is handed to you,
because only you know whether output has been shown. In a batch pipeline that
buffers, retrying is trivially safe and you should do it. In a UI streaming to a
browser, it is not.

```go verify
// Safe in a batch job: nothing has been displayed.
for attempt := 0; attempt < 3; attempt++ {
	text, err := collect(ctx, client, req)
	if err == nil {
		return text, nil
	}
	if !errors.Is(err, errTruncated) {
		return "", err
	}
}
```

</DeepDive>

<Recap>

- A dropped connection reaches EOF with no error — truncation is invisible by default.
- skyl detects a missing terminal signal and reports it through `Err()`.
- The partial text is still delivered; you get the answer *and* the warning.
- `sandbox-stream-truncate` and `sandbox-stream-error` reproduce both cases on demand.
- Truncation ≠ `StopMaxTokens`: one is a dead connection, the other a healthy cap.
- Mid-stream failures are never retried by skyl, because output may already be shown.

</Recap>

<Challenges>

<Challenge title="Make truncation impossible to ignore">

Wrap streaming in a helper that cannot return a truncated answer as though it
were complete.

<Hint>

Return a type that forces the caller to acknowledge completeness.

</Hint>

<Solution>

```go verify
type Answer struct {
	Text     string
	Complete bool
}

func collect(ctx context.Context, c *skyl.Client, req *skyl.Request) (Answer, error) {
	stream, err := c.Stream(ctx, req)
	if err != nil {
		return Answer{}, err
	}
	defer stream.Close()

	var b strings.Builder
	var stop skyl.StopReason
	for stream.Next() {
		switch ev := stream.Event(); ev.Type {
		case skyl.EventTextDelta:
			b.WriteString(ev.Text)
		case skyl.EventDone:
			stop = ev.StopReason
		}
	}
	if err := stream.Err(); err != nil {
		// Partial text is still worth returning — but flagged.
		return Answer{Text: b.String(), Complete: false}, err
	}
	return Answer{Text: b.String(), Complete: stop != skyl.StopMaxTokens}, nil
}
```

Now a caller writing `answer.Text` without looking at `answer.Complete` is
making a visible choice rather than an invisible mistake — and `Complete` covers
both failure modes, truncation and the token cap.

</Solution>

</Challenge>

</Challenges>
