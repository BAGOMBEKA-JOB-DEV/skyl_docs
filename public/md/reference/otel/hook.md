---
title: otel.Hook
description: Returns a skyl.Option registering OpenTelemetry instrumentation.
---

<Intro>

One line wires skyl into OpenTelemetry. `Hook` returns a
[`skyl.Option`](/reference/skyl/option), so it composes with every other option.

</Intro>

## Reference

<Signature>func Hook(opts ...Option) skyl.Option</Signature>

<Parameters>

- **`opts`** — `WithTracerProvider`, `WithMeterProvider`, `WithoutSpans`.

</Parameters>

<Returns>

A `skyl.Option` you pass to [`skyl.New`](/reference/skyl/new).

</Returns>

<Caveats>

- **Prompt content is never recorded.** Only model, sampling parameters and
  token counts.
- Like every skyl hook, it runs **synchronously on the calling goroutine**.
  Span creation is cheap; a slow exporter is not — configure batching in your
  SDK setup, not here.
- **`WithoutSpans()` gives you metrics only.** On a high-volume gateway, spans
  are the expensive half.
- With no provider options it uses the **global** tracer and meter providers, so
  it does nothing until you have configured an SDK.
- It observes streams too, via the `stream_end` event — including abandoned
  ones, whose tokens were still billed.

</Caveats>

## Usage

<Recipe title="The whole integration">

```go verify
client := skyl.New(openai.New(key), otel.Hook())
```

</Recipe>

<Recipe title="With trace propagation to the provider">

```go verify
client := skyl.New(
	// HTTPClient puts the trace context on the outbound request, so the
	// provider call appears as a child span.
	openai.New(key, openai.WithHTTPClient(otel.HTTPClient(nil))),
	otel.Hook(),
)
```

</Recipe>

<Recipe title="Metrics only, for a high-volume service">

```go verify
client := skyl.New(p, otel.Hook(otel.WithoutSpans()))
```

</Recipe>

<Recipe title="Explicit providers, rather than the globals">

```go verify
client := skyl.New(p, otel.Hook(
	otel.WithTracerProvider(tp),
	otel.WithMeterProvider(mp),
))
```

</Recipe>

<Recipe title="Alongside your own hook">

```go verify
// Hooks accumulate, so both run — in the order registered.
client := skyl.New(p,
	otel.Hook(),
	skyl.WithHook(func(_ context.Context, ev skyl.HookEvent) {
		if ev.Err != nil {
			log.Printf("%s failed: %v", ev.Provider, ev.Err)
		}
	}),
)
```

</Recipe>

## Troubleshooting

<Trouble problem="No telemetry appears">

With no options it uses the **global** providers. If you have not called
`otel.SetTracerProvider` / `SetMeterProvider`, the global ones are no-ops. Either
configure them or pass providers explicitly.

</Trouble>

<Trouble problem="Latency rose after enabling it">

Span creation is cheap; exporting is not. Use a batching span processor, and
consider `WithoutSpans()` if you only need the metrics.

</Trouble>

<Trouble problem="I want prompts in my traces">

This package will not put them there. Write your own hook if you have decided
that is appropriate for your data — and note that `HookEvent.Request` carries
the whole conversation.

</Trouble>
