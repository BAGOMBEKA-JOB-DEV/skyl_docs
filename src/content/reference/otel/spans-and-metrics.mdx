---
title: Spans and metrics
description: The GenAI semantic convention names skyl emits.
---

<Intro>

The instrumentation implements the OpenTelemetry **GenAI semantic
conventions**, so model traffic looks the same whichever provider served it —
which is the point of the library, extended to your observability stack.

</Intro>

## Metrics

<DataTable
  headers={['Name', 'Meaning']}
  rows={[
    [<code key="a">gen_ai.client.token.usage</code>, <span key="b">Tokens consumed, split by <code>gen_ai.token.type</code> (input / output)</span>],
    [<code key="c">gen_ai.client.operation.duration</code>, 'How long an operation took'],
  ]}
/>

## Attributes

<DataTable
  headers={['Attribute', 'Value']}
  rows={[
    [<code key="a">gen_ai.operation.name</code>, 'complete, stream, stream_end, or models'],
    [<code key="b">gen_ai.provider.name</code>, 'The adapter that was called'],
    [<code key="c">gen_ai.request.model</code>, 'The model that was asked for'],
    [<code key="d">gen_ai.response.model</code>, <strong key="e">The model that actually answered</strong>],
    [<code key="f">gen_ai.response.id</code>, "The provider's response identifier"],
    [<code key="g">gen_ai.response.finish_reasons</code>, 'Why generation ended'],
    [<code key="h">gen_ai.usage.input_tokens</code>, 'Input tokens, cache included'],
    [<code key="i">gen_ai.usage.output_tokens</code>, 'Output tokens'],
    [<code key="j">gen_ai.request.temperature</code>, 'When set'],
    [<code key="k">gen_ai.request.top_p</code>, 'When set'],
    [<code key="l">gen_ai.request.max_tokens</code>, 'When set'],
    [<code key="m">gen_ai.token.type</code>, 'input or output, on the usage metric'],
    [<code key="n">error.type</code>, 'On a failed operation'],
  ]}
/>

<Caveats>

- **Group by `gen_ai.response.model`, not `gen_ai.request.model`.** Aliases
  resolve to dated snapshots, so grouping by the request merges two models with
  different pricing into one line.
- **No prompt or completion content is recorded**, deliberately.
- Names are spelled out in the package rather than taken from a `semconv`
  module: the GenAI conventions are still in development, and pinning a semconv
  module would tie skyl's release cadence to theirs.
- `ScopeName` is `github.com/BAGOMBEKA-JOB-DEV/skyl/otel`.

</Caveats>

## Usage

<Recipe title="Token spend by model">

```promql
sum by (gen_ai_response_model, gen_ai_token_type) (
  rate(gen_ai_client_token_usage_sum[5m])
) * 60
```

</Recipe>

<Recipe title="Error rate by provider">

```promql
sum by (gen_ai_provider_name, error_type) (
  rate(gen_ai_client_operation_duration_count{error_type!=""}[5m])
)
```

</Recipe>

<Recipe title="Latency percentiles">

```promql
histogram_quantile(0.95,
  sum by (le, gen_ai_provider_name) (
    rate(gen_ai_client_operation_duration_bucket{gen_ai_operation_name="complete"}[5m])
  )
)
```

Filtering to `complete` matters: `stream` measures only the handshake, so mixing
them makes the percentile meaningless.

</Recipe>

<Recipe title="Detecting abandoned streams">

```promql
# stream_end operations that carry no output tokens — a client hung up.
sum by (gen_ai_provider_name) (
  rate(gen_ai_client_operation_duration_count{gen_ai_operation_name="stream_end"}[5m])
)
```

</Recipe>

## Troubleshooting

<Trouble problem="gen_ai.response.model is missing">

Best-effort — a provider that does not report the serving model leaves it empty.
Fall back to `gen_ai.request.model` in your query.

</Trouble>

<Trouble problem="Token metrics are absent for streaming">

They arrive on `stream_end`, and require the upstream host to report usage. On
OpenAI-family hosts that means `stream_options.include_usage` must be honoured.

</Trouble>

<Trouble problem="The attribute names changed under me">

The GenAI conventions are still in development. skyl spells the keys out rather
than pinning a semconv module, precisely so a convention change is a small,
visible correction here rather than a forced dependency bump.

</Trouble>
