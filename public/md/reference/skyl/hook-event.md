---
title: HookEvent
description: Describes one completed attempt against a provider.
---

<Intro>

`HookEvent` is what a [`Hook`](/reference/skyl/hook) receives. It carries enough
to build metrics, logs and cost accounting — and one field that carries the
user's prompt.

</Intro>

## Reference

<Signature>type HookEvent struct{ /* see below */ }</Signature>

<Fields of="hookEvent" />

## The four operations

<DataTable
  headers={['Constant', 'Value', 'When it fires', 'Usage?']}
  rows={[
    [<code key="a">OpComplete</code>, 'complete', 'Once per attempt of a non-streaming request', 'Yes, on success'],
    [<code key="b">OpStream</code>, 'stream', 'The streaming handshake, before any token exists', 'No'],
    [<code key="c">OpStreamEnd</code>, 'stream_end', 'Once when a stream finishes or is closed', 'Yes, if completed'],
    [<code key="d">OpModels</code>, 'models', 'Once per attempt of a model listing', 'No'],
  ]}
/>

<Caveats>

- **`Model` is what you asked for; `ResponseModel` is what answered.** Group
  metrics by the second, or two snapshots behind one alias merge into one line.
- **`stream_end` fires even for an abandoned stream**, with `Completed: false` —
  those tokens were generated and billed, so reporting nothing would make the
  spend invisible.
- **`Request` carries the prompt.** It is supplied so a hook can report sampling
  parameters without this struct growing a field per parameter — but anything you
  do with it is a decision about user data.
- `Attempt` is **zero-based**, so `Attempt > 0` means "this was a retry".
- `Duration` for `OpStream` is the handshake alone; for `OpStreamEnd` it is the
  whole stream, handshake included.

</Caveats>

## Usage

<Recipe title="Cost accounting across both call styles">

```go verify
skyl.WithHook(func(_ context.Context, ev skyl.HookEvent) {
	// Only these two carry usage; `stream` fires before generation.
	if ev.Operation != skyl.OpComplete && ev.Operation != skyl.OpStreamEnd {
		return
	}
	key := ev.ResponseModel
	if key == "" {
		key = ev.Model // the provider did not report it
	}
	costs.Add(key, ev.Usage)
})
```

</Recipe>

<Recipe title="Detecting alias movement">

```go verify
if ev.ResponseModel != "" && ev.ResponseModel != ev.Model {
	log.Printf("substitution: asked %q, served %q (response %s)",
		ev.Model, ev.ResponseModel, ev.ResponseID)
}
```

Log at info, not warning — alias resolution is constant and would drown your
logs.

</Recipe>

<Recipe title="Measuring the retry rate">

```go verify
skyl.WithHook(func(_ context.Context, ev skyl.HookEvent) {
	if ev.Operation != skyl.OpComplete {
		return
	}
	attempts.Add(1)
	if ev.Attempt > 0 {
		retries.Add(1)
	}
})
```

A retry rate creeping from 0.5% to 5% is the earliest warning that a provider is
degrading — usually before it shows up as user-visible latency, because backoff
is absorbing it.

</Recipe>

<Recipe title="Reporting sampling parameters without leaking the prompt">

```go verify
skyl.WithHook(func(_ context.Context, ev skyl.HookEvent) {
	span.SetAttributes(
		attribute.Int("gen_ai.request.max_tokens", ev.Request.MaxTokens),
		attribute.Int("gen_ai.request.messages", len(ev.Request.Messages)),
	)
	// Deliberately NOT ev.Request.Messages — a span is a durable record
	// shipped to a third-party backend.
})
```

</Recipe>

## Troubleshooting

<Trouble problem="stream_end reports zero usage">

If `Completed` is false, the caller abandoned the stream and little arrived —
expected. If it is true, the provider did not report usage: on OpenAI-family
hosts that means `stream_options.include_usage` was not honoured.

</Trouble>

<Trouble problem="ResponseModel is empty">

Best-effort. A provider that does not report the serving model leaves it empty.
Fall back to `Model`.

</Trouble>

<Trouble problem="I see more events than requests">

Correct — one per **attempt**. A request retried three times produces four
`complete` events. A stream produces one `stream` plus one `stream_end`.

</Trouble>
