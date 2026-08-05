---
title: Hooks
description: Four operations, and the one field that will leak your users' prompts.
---

<Intro>

A hook observes every attempt against a provider — including retried ones, and
including streams the caller abandoned. It is how you get metrics, logging and
cost accounting without touching any call site.

</Intro>

<YouWillLearn>

- The four operations and when each fires
- Why `stream_end` fires even for an abandoned stream
- The field that carries the prompt, and what that means for your logs
- Why hooks must be cheap

</YouWillLearn>

## Registering one

```go verify
client := skyl.New(p,
	skyl.WithHook(func(ctx context.Context, ev skyl.HookEvent) {
		metrics.Record(ev.Provider, ev.ResponseModel, ev.Duration, ev.Err)
	}),
)
```

Hooks accumulate — calling `WithHook` twice registers both.

## The four operations

<DataTable
  headers={['Operation', 'When it fires', 'Carries usage?']}
  rows={[
    [<code key="a">complete</code>, 'Once per attempt of a non-streaming request', 'Yes, on success'],
    [<code key="b">stream</code>, "The streaming handshake — as soon as the provider accepts, before any token exists", 'No'],
    [<code key="c">stream_end</code>, 'Once when a stream finishes or is closed', 'Yes, if it completed'],
    [<code key="d">models</code>, 'Once per attempt of a model-listing request', 'No'],
  ]}
/>

`stream` carries no usage because it fires before generation starts. That is why
`stream_end` exists.

## stream_end fires for abandoned streams too

<Pitfall>

Tokens generated before you stopped reading were still generated, and still
billed. `stream_end` fires anyway, with `Completed: false`, because reporting
nothing would make that spend invisible.

</Pitfall>

```go verify
skyl.WithHook(func(_ context.Context, ev skyl.HookEvent) {
	if ev.Operation == skyl.OpStreamEnd && !ev.Completed {
		metrics.Inc("skyl.stream.abandoned", "provider", ev.Provider)
	}
})
```

Two mechanics worth knowing:

- It fires from **whichever of the terminal event or `Close` comes first**. On
  the `Close` path the hook runs inside the caller's `defer`, so its latency
  lands there.
- The `ctx` it receives is the one the stream was opened with, which is
  frequently **already cancelled** — a client hanging up is the ordinary reason
  a stream is abandoned. A hook that needs to record the event must not depend
  on that context being live.

## The event

<Fields of="hookEvent" />

Note `Model` versus `ResponseModel`: the first is what you asked for, the second
is what answered. Group metrics by the second, or you merge snapshots. See
[Which Model Actually Answered](/learn/which-model-answered).

## The prompt problem

<Pitfall>

**`HookEvent.Request` carries the prompt.** Logging it verbatim ships
conversation content wherever your logs go.

```go
// DON'T: every user's prompt, in your log aggregator, forever.
log.Printf("request: %+v", ev.Request)
```

Log the shape instead:

```go verify
log.Printf("%s %s attempt=%d msgs=%d dur=%s in=%d out=%d err=%v",
	ev.Provider, ev.Operation, ev.Attempt, len(ev.Request.Messages),
	ev.Duration, ev.Usage.InputTokens, ev.Usage.OutputTokens, ev.Err)
```

</Pitfall>

<DeepDive title="Why give hooks the prompt at all?">

Because the OpenTelemetry GenAI conventions ask for `temperature`, `top_p` and
`max_tokens` on every span, and there are only two ways to provide them: add a
field to `HookEvent` for every sampling parameter, forever, or hand the hook the
request.

Handing over the request keeps the struct stable as skyl grows, and lets a hook
report anything about the request's *shape*. The cost is that the prompt comes
with it — which is a real hazard, so it is documented on the field itself rather
than buried.

The `otel` module, which is the reference consumer of this, deliberately records
**no prompt content**: only model, sampling parameters and token counts. A span
is a durable record shipped to a third-party backend, and putting user
conversations there by default is not a decision a library should make silently.

Treat `Request` as read-only. skyl reuses it across retries.

</DeepDive>

## Hooks must be cheap

Hooks run **synchronously on the calling goroutine**, so a slow hook slows the
request. Do metrics and logging; do not do I/O without a timeout.

```go
// DON'T: this adds a network round trip to every model call.
skyl.WithHook(func(ctx context.Context, ev skyl.HookEvent) {
	db.Exec("INSERT INTO usage …")
})
```

If you need to persist, buffer:

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

The `default` branch is the point: a hook that blocks when your buffer fills
turns a persistence problem into a latency problem for every user.

<Recap>

- Four operations: `complete`, `stream`, `stream_end`, `models`.
- `stream` fires before any token exists, so it carries no usage.
- **`stream_end` fires even for abandoned streams**, with `Completed: false`.
- Its context is often already cancelled — do not depend on it being live.
- **`HookEvent.Request` carries the prompt.** Log shape, never content.
- Hooks run synchronously; buffer with a non-blocking send if you must persist.

</Recap>

<Challenges>

<Challenge title="Build a cost tracker">

Accumulate spend per model across a process, from streaming and non-streaming
calls alike.

<Hint>

Non-streaming usage arrives on `complete`; streaming usage arrives on
`stream_end`. Counting both without double-counting is the whole trick.

</Hint>

<Solution>

```go
type costs struct {
	mu sync.Mutex
	by map[string]skyl.Usage
}

func (c *costs) hook(_ context.Context, ev skyl.HookEvent) {
	// Only these two carry usage. `stream` fires before generation, and a
	// failed attempt has nothing to add.
	if ev.Operation != skyl.OpComplete && ev.Operation != skyl.OpStreamEnd {
		return
	}
	if ev.Err != nil && ev.Usage.TotalTokens() == 0 {
		return
	}

	key := ev.ResponseModel
	if key == "" {
		key = ev.Model // the provider did not report; fall back
	}

	c.mu.Lock()
	defer c.mu.Unlock()
	c.by[key] = c.by[key].Add(ev.Usage)
}
```

Two details that matter. Keying on `ResponseModel` means two snapshots behind
one alias are billed separately, which is what you want. And *not* returning
early on `ev.Err != nil` when usage is non-zero captures the abandoned-stream
case, where tokens were billed despite the failure.

</Solution>

</Challenge>

</Challenges>
