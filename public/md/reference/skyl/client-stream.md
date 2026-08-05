---
title: Client.Stream
description: Returns events as the model produces them. Only the handshake is retried.
---

<Intro>

`Stream` runs a request and delivers incremental events. It returns as soon as
the provider accepts the request — before any token exists — and the returned
[`Stream`](/reference/skyl/stream) is consumed afterwards.

</Intro>

## Reference

<Signature>func (c *Client) Stream(ctx context.Context, req *Request) (Stream, error)</Signature>

<Parameters>

- **`ctx`** — bounds the **entire stream**, not just the handshake. The reader is
  bound to it, so cancelling terminates the stream.
- **`req`** — the request. Validated before anything is sent.

</Parameters>

<Returns>

A [`Stream`](/reference/skyl/stream) and a nil error once the provider has
accepted the request. On failure, a nil stream and a classified error.

**The caller must close the returned stream.**

</Returns>

<Caveats>

- **Only the handshake is retried.** Once bytes are flowing, a mid-stream
  failure surfaces through [`Stream.Err`](/reference/skyl/stream) rather than
  being retried — replaying a partially consumed response would duplicate output
  the caller has already seen.
- **[`WithTimeout`](/reference/skyl/with-timeout) is not applied.** The stream
  outlives the call, so a per-attempt deadline would kill a working stream. `ctx`
  is the only bound.
- The `stream` hook event fires at the handshake and carries **no usage**,
  because no token exists yet. Usage arrives on `stream_end`.
- A `Stream` is **not** safe for concurrent use.

</Caveats>

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

// Next returning false means the stream finished OR failed. Only Err says which.
return stream.Err()
```

</Recipe>

<Recipe title="Handling every event type">

```go
var text strings.Builder
var calls []skyl.ToolCall
var usage skyl.Usage

for stream.Next() {
	switch ev := stream.Event(); ev.Type {
	case skyl.EventTextDelta:
		text.WriteString(ev.Text)
	case skyl.EventThinkingDelta:
		// Only provider/anthropic ever emits this.
	case skyl.EventToolCall:
		if ev.ToolCall != nil {
			calls = append(calls, *ev.ToolCall)
		}
	case skyl.EventDone:
		if ev.Usage != nil {
			usage = *ev.Usage
		}
	}
}
if err := stream.Err(); err != nil {
	return err
}
```

</Recipe>

<Recipe title="Bounding a stream's lifetime">

```go verify
// WithTimeout does not apply here, so set a deadline yourself if you want one.
ctx, cancel := context.WithTimeout(ctx, 5*time.Minute)
defer cancel()

stream, err := client.Stream(ctx, req)
```

</Recipe>

<Recipe title="In an HTTP handler">

```go verify
func (h *Handler) Chat(w http.ResponseWriter, r *http.Request) {
	// r.Context() is cancelled on client disconnect, which propagates upstream —
	// a client hanging up must not leave a paid request running.
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

</Recipe>

## Troubleshooting

<Trouble problem="Answers are occasionally cut short and I see no error">

You are not checking `stream.Err()`. A connection dropped mid-generation reaches
EOF with no reader error, so without the check a truncated response is
indistinguishable from a complete one.

Reproduce it deliberately with the sandbox model `sandbox-stream-truncate`.

</Trouble>

<Trouble problem="My stream dies after exactly 30 seconds">

You set `http.Client.Timeout` on a custom HTTP client. That bounds the entire
request **including reading the body**, which for a stream is the whole
generation.

Remove it and bound the transport phases instead — `DialContext`,
`TLSHandshakeTimeout`, `ResponseHeaderTimeout`.

</Trouble>

<Trouble problem="Streaming reports zero tokens but Complete reports them fine">

On OpenAI and openaicompat, streaming usage requires the host to honour
`stream_options.include_usage`. Many compatible hosts do not, and report zero
silently.

</Trouble>

<Trouble problem="I want to retry a stream that failed halfway">

skyl will not, because output may already have been shown. Retry at your own
level, where you know whether anything was displayed — safe in a batch job that
buffers, wrong in a UI.

</Trouble>
