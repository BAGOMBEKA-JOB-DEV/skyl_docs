---
title: Hook
description: Observes attempts. Runs synchronously on the calling goroutine.
---

<Intro>

`Hook` is the function type [`WithHook`](/reference/skyl/with-hook) registers.
It fires after every attempt against a provider — including retried ones, and
including streams the caller abandoned.

</Intro>

## Reference

<Signature>type Hook func(ctx context.Context, ev HookEvent)</Signature>

<Parameters>

- **`ctx`** — the context the operation was started with. For `stream_end` it is
  **frequently already cancelled**.
- **`ev`** — the [`HookEvent`](/reference/skyl/hook-event) describing the attempt.

</Parameters>

<Caveats>

- **Hooks run synchronously on the calling goroutine.** A slow hook slows the
  request. Do metrics and logging; do not do I/O without a timeout.
- **`ev.Request` carries the prompt.** Logging it verbatim ships conversation
  content wherever your logs go.
- Hooks accumulate — registering two runs both, in order.
- For `stream_end`, the hook fires from whichever of the terminal event or
  `Close` comes first, so on the `Close` path it runs inside the caller's
  `defer` and its latency lands there.
- Treat `ev.Request` as **read-only**; skyl reuses it across retries.

</Caveats>

## Usage

<Recipe title="Metrics">

```go verify
var hook skyl.Hook = func(_ context.Context, ev skyl.HookEvent) {
	metrics.Record(ev.Provider, ev.ResponseModel, ev.Duration, ev.Err)
}

client := skyl.New(p, skyl.WithHook(hook))
```

</Recipe>

<Recipe title="Composing several">

```go verify
func chain(hooks ...skyl.Hook) skyl.Hook {
	return func(ctx context.Context, ev skyl.HookEvent) {
		for _, h := range hooks {
			h(ctx, ev)
		}
	}
}
```

Equivalent to registering them individually, but useful when a package wants to
export one hook value assembled from several concerns.

</Recipe>

<Recipe title="Doing work off the request path">

```go
events := make(chan skyl.HookEvent, 1024)

var hook skyl.Hook = func(_ context.Context, ev skyl.HookEvent) {
	select {
	case events <- ev:
	default:
		// Drop rather than block a model call on a full buffer.
		metrics.Inc("skyl.hook.dropped")
	}
}
```

Use a **background** context in the consumer: the hook's own context is often
cancelled by the time it fires.

</Recipe>

## Troubleshooting

<Trouble problem="Every request got slower">

Your hook is doing I/O on the request path. Buffer it with a non-blocking send.

</Trouble>

<Trouble problem="My hook's context was already cancelled">

Expected on the `stream_end` path — a client hanging up is the ordinary reason a
stream ends early. Use a background context for work that must complete.

</Trouble>

<Trouble problem="My logs contain user prompts">

You logged `ev.Request`. Log the shape instead: provider, model, attempt,
`len(ev.Request.Messages)`, duration, usage.

</Trouble>
