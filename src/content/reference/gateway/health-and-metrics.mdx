---
title: Health and metrics
description: Liveness, readiness, and Prometheus — all unauthenticated.
---

<Intro>

Three endpoints sit outside the auth boundary, because the things that call them
— a kubelet, a load balancer, a scrape job — cannot reasonably hold a bearer
token.

</Intro>

## The endpoints

<DataTable
  headers={['Path', 'Purpose', 'Auth']}
  rows={[
    [<code key="a">GET /healthz</code>, 'Liveness. 200 while the process is running.', 'None'],
    [<code key="b">GET /readyz</code>, 'Readiness. Reports whether the server is accepting traffic.', 'None'],
    [<code key="c">GET /metrics</code>, 'Prometheus metrics. Served only when SKYL_METRICS is on.', 'None'],
  ]}
/>

## Liveness versus readiness

<Pitfall>

These are **not** the same check, and conflating them breaks graceful shutdown.

**`/healthz`** answers "is this process alive?" — restart it if not.

**`/readyz`** answers "should traffic come here?" On `SIGTERM` the server starts
**failing readiness while still serving in-flight requests**, so a load balancer
pulls the instance before it stops accepting work.

If your load balancer probes `/healthz` instead, it keeps sending traffic to a
draining instance right up until the process exits — and every request in flight
at that moment is a paid generation you have already been charged for.

</Pitfall>

## Metrics

Set `SKYL_METRICS=true`. That does two things: it serves `/metrics` in
Prometheus format, and it installs the telemetry hook on **every** provider
client — so the metrics cover all providers rather than whichever one happened
to be wired first.

The instrumentation follows the OpenTelemetry **GenAI semantic conventions**, so
model traffic appears in your observability stack the same way any other
dependency does, and **looks the same whichever provider served it** — which is
the point of the library.

<DataTable
  headers={['Metric', 'Meaning']}
  rows={[
    [<code key="a">gen_ai.client.token.usage</code>, <span key="b">Tokens consumed, split by <code>gen_ai.token.type</code> (input/output)</span>],
    [<code key="c">gen_ai.client.operation.duration</code>, 'How long an operation took'],
  ]}
/>

Attributes include `gen_ai.provider.name`, `gen_ai.request.model`,
`gen_ai.response.model`, `gen_ai.operation.name` and `error.type`.

<Note>

**Prompt content is never recorded.** Only the shape of the request: model,
sampling parameters, token counts. A metric or span is a durable record shipped
to a third-party backend, and putting user conversations there by default is not
a decision a library should make silently.

</Note>

## Usage

<Recipe title="Kubernetes probes">

```yaml
livenessProbe:
  httpGet: { path: /healthz, port: 8080 }
  periodSeconds: 10

readinessProbe:
  # Distinct from liveness, so SIGTERM drains cleanly instead of dropping
  # in-flight paid requests.
  httpGet: { path: /readyz, port: 8080 }
  periodSeconds: 5
```

</Recipe>

<Recipe title="Prometheus scrape">

```yaml
scrape_configs:
  - job_name: skyl-gateway
    static_configs:
      - targets: ['skyl-gateway:8080']
    metrics_path: /metrics
```

</Recipe>

<Recipe title="A cost alert">

```promql
# Tokens per minute, by the model that actually answered — not the one asked
# for, so two snapshots behind an alias are not merged.
sum by (gen_ai_response_model) (
  rate(gen_ai_client_token_usage_sum[5m])
) * 60
```

</Recipe>

<Recipe title="An error-rate alert">

```promql
sum by (gen_ai_provider_name, error_type) (
  rate(gen_ai_client_operation_duration_count{error_type!=""}[5m])
)
```

</Recipe>

## Troubleshooting

<Trouble problem="/metrics returns 404">

`SKYL_METRICS` is not set to a true value. It is off by default.

</Trouble>

<Trouble problem="Requests were dropped during a rolling deploy">

Your load balancer is probing `/healthz` rather than `/readyz`. Only the latter
reports draining.

</Trouble>

<Trouble problem="Should I put /metrics behind auth?">

It is unauthenticated so a scrape job does not need a token. It exposes no
prompt content and no credentials — only counts and durations. Restrict it at
the network level if your threat model requires it; do not expose the gateway to
the internet regardless.

</Trouble>

<Trouble problem="Token metrics are missing for streaming calls">

Streaming usage is reported on the `stream_end` event, and requires the upstream
host to report it. On OpenAI-family hosts that means
`stream_options.include_usage` must be honoured.

</Trouble>
