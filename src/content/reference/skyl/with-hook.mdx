---
title: WithHook
description: Registers an observer for completed attempts. Hooks accumulate.
---

<Intro>

`WithHook` registers a function called after every attempt against a provider —
including retried ones, and including streams the caller abandoned. It is how
you get metrics, logging and cost accounting without touching any call site.

</Intro>

## Reference

<Signature>func WithHook(h Hook) Option</Signature>

<Signature>type Hook func(ctx context.Context, ev HookEvent)</Signature>

<Parameters>

- **`h`** — the observer. **A nil hook is ignored** rather than causing a panic
  later.

</Parameters>

<Caveats>

- **Hooks accumulate.** Calling `WithHook` twice registers both, in order.
- **They run synchronously on the calling goroutine**, so a slow hook slows the
  request. Do metrics and logging; do not do I/O without a timeout.
- **[`HookEvent.Request`](/reference/skyl/hook-event) carries the prompt.**
  Logging it verbatim ships conversation content wherever your logs go.
- For `stream_end`, the hook fires from whichever of the terminal event or
  `Close` comes first — so on the `Close` path it runs inside the caller's
  `defer`, and its latency lands there.
- That event's `ctx` is the one the stream was opened with, which is frequently
  **already cancelled**. A hook that must record it cannot depend on a live
  context.

</Caveats>

## Usage

<Recipe title="Metrics">

```go verify
skyl.WithHook(func(_ context.Context, ev skyl.HookEvent) {
	// Group by ResponseModel, not Model — two snapshots behind one alias
	// should not be merged into a single line.
	metrics.Record(ev.Provider, ev.ResponseModel, ev.Duration, ev.Err)
})
```

</Recipe>

<Recipe title="Logging shape, never content">

```go verify
skyl.WithHook(func(_ context.Context, ev skyl.HookEvent) {
	log.Printf("%s %s attempt=%d msgs=%d dur=%s in=%d out=%d err=%v",
		ev.Provider, ev.Operation, ev.Attempt, len(ev.Request.Messages),
		ev.Duration, ev.Usage.InputTokens, ev.Usage.OutputTokens, ev.Err)
})
```

Message *count* is usually enough to debug, and carries nothing private.

</Recipe>

<Recipe title="Cost accounting across both call styles">

```go verify
skyl.WithHook(func(_ context.Context, ev skyl.HookEvent) {
	// Only these two carry usage. `stream` fires before generation starts.
	if ev.Operation == skyl.OpComplete || ev.Operation == skyl.OpStreamEnd {
		costs.Add(ev.ResponseModel, ev.Usage)
	}
})
```

</Recipe>

<Recipe title="Buffering work that must not block a call">

```go verify
events := make(chan skyl.HookEvent, 1024)

skyl.WithHook(func(_ context.Context, ev skyl.HookEvent) {
	select {
	case events <- ev:
	default:
		// Drop rather than block a model call on a full buffer.
		metrics.Inc("skyl.hook.dropped")
	}
})
```

</Recipe>

<Recipe title="OpenTelemetry in one line">

```go verify
client := skyl.New(openai.New(key), otel.Hook())
```

The [`otel`](/reference/otel) module is the reference hook consumer, and records
**no prompt content** by design.

</Recipe>

## Troubleshooting

<Trouble problem="Every request got slower after I added a hook">

Hooks run synchronously. If yours writes to a database or makes an HTTP call, it
adds that latency to every model call. Buffer with a non-blocking send.

</Trouble>

<Trouble problem="My logs contain users' prompts">

You logged `ev.Request`. Log the shape — provider, model, attempt, message
count, duration, usage — and never the messages themselves.

</Trouble>

<Trouble problem="stream_end reports zero usage">

Two possibilities. If `ev.Completed` is false, the caller abandoned the stream
and little or no usage arrived — expected. If it is true, the provider did not
report usage: on OpenAI-family hosts that means `stream_options.include_usage`
was not honoured.

</Trouble>

<Trouble problem="My hook's context is already cancelled">

Expected on the `stream_end` path — a client hanging up is the ordinary reason a
stream ends early. Use a background context for any work that must complete.

</Trouble>
