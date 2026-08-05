---
title: skyl/otel
description: OpenTelemetry instrumentation, as a fourth module. One line to wire up.
---

<Intro>

`skyl/otel` turns skyl's hook events into spans and metrics following the
OpenTelemetry **GenAI semantic conventions** — so model traffic appears in your
observability stack the same way any other dependency does, and looks the same
whichever provider served it.

</Intro>

## Installing

<TerminalBlock>go get github.com/BAGOMBEKA-JOB-DEV/skyl/otel</TerminalBlock>

```go
import "github.com/BAGOMBEKA-JOB-DEV/skyl/otel"
```

Requires **Go 1.25+**, inherited from the OpenTelemetry SDK.

## The whole integration

```go verify
client := skyl.New(openai.New(key), otel.Hook())
```

That is traces and metrics. To get the trace context onto the outbound HTTP
request as well, wrap the transport too:

```go verify
client := skyl.New(
	openai.New(key, openai.WithHTTPClient(otel.HTTPClient(nil))),
	otel.Hook(),
)
```

## A separate module

It lives outside the core module because the OpenTelemetry SDK brings a
dependency graph, and skyl's engineering rules give the core **zero**
dependencies. Nobody who does not want OpenTelemetry pays for it — the same
reasoning as [ADR-0006](/community/adr/0006-anthropic-adapter-is-its-own-module)
applies to the Anthropic SDK. Recorded as
[ADR-0007](/community/adr/0007-otel-is-its-own-module).

## What is deliberately not recorded

<Pitfall>

**Prompt and completion content.** The conventions allow capturing messages, and
skyl gives this package the whole `skyl.Request` — but a span is a durable
record shipped to a third-party backend, and putting user conversations there by
default is a decision no library should make silently.

Only the *shape* of the request is recorded: model, sampling parameters, token
counts.

</Pitfall>

## The API

<DataTable
  headers={['Symbol', 'Purpose']}
  rows={[
    [<a key="a" href="/reference/otel/hook">Hook</a>, 'Returns a skyl.Option registering the instrumentation'],
    [<a key="b" href="/reference/otel/http-client">HTTPClient</a>, 'Wraps a transport so trace context reaches the provider'],
    [<a key="c" href="/reference/otel/spans-and-metrics">Spans and metrics</a>, 'The attribute and metric names emitted'],
  ]}
/>

`ScopeName` identifies this instrumentation in the telemetry it produces:
`github.com/BAGOMBEKA-JOB-DEV/skyl/otel`.

## Options

<DataTable
  headers={['Option', 'Effect']}
  rows={[
    [<code key="a">WithTracerProvider(tp)</code>, 'Use a specific tracer provider instead of the global one.'],
    [<code key="b">WithMeterProvider(mp)</code>, 'Use a specific meter provider instead of the global one.'],
    [<code key="c">WithoutSpans()</code>, 'Metrics only. Spans on a high-volume gateway are the expensive half.'],
  ]}
/>

<Unvalidated />
