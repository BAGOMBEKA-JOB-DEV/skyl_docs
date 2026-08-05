---
title: WithMaxRetries
description: How many times a retryable failure is retried. Default 3.
---

<Intro>

`WithMaxRetries` sets the retry budget. Three retries means up to **four
attempts** in total, since the original call is not a retry.

</Intro>

## Reference

<Signature>func WithMaxRetries(n int) Option</Signature>

<Parameters>

- **`n`** — the number of retries. **Zero disables retries entirely.**

</Parameters>

<Caveats>

- **Negative values are ignored**, leaving the default of 3 in place. There is no
  error return.
- `n` counts *retries*, not attempts: `WithMaxRetries(3)` makes up to four calls.
- Only retryable failures consume the budget — rate limits, server errors and
  transport failures. See
  [What Is Never Retried](/learn/never-retried).
- On [`Stream`](/reference/skyl/client-stream), this applies to the **handshake
  only**.

</Caveats>

## Usage

<Recipe title="Disabling retries">

```go verify
// Still keeps validation, timeouts and hooks — unlike bypassing the client.
client := skyl.New(p, skyl.WithMaxRetries(0))
```

</Recipe>

<Recipe title="A larger budget for a batch job">

```go verify
// Nobody is waiting, so trading latency for success rate is the right call.
client := skyl.New(p,
	skyl.WithMaxRetries(8),
	skyl.WithRetryDelay(time.Second, 2*time.Minute),
)
```

</Recipe>

<Recipe title="Counting attempts">

```go verify
var attempts int
client := skyl.New(p,
	skyl.WithMaxRetries(3),
	skyl.WithHook(func(_ context.Context, ev skyl.HookEvent) {
		if ev.Operation == skyl.OpComplete {
			attempts++ // fires once per attempt, including retries
		}
	}),
)
```

</Recipe>

## Troubleshooting

<Trouble problem="Requests take much longer than expected under load">

Retries plus backoff compound. With the defaults, a persistently failing request
spends roughly 500ms + 1s + 2s in delays on top of four attempts.

Bound the whole call with a context deadline, and lower the budget for
latency-sensitive paths.

</Trouble>

<Trouble problem="Setting -1 did not disable retries">

Negative values are ignored. Pass `0`.

</Trouble>

<Trouble problem="A failure was not retried at all">

Check its classification. `ErrAuth`, `ErrBadRequest`, `ErrNotFound`,
`ErrRefusal` and `ErrUnsupported` are never retried regardless of the budget —
retrying them burns quota to receive the same answer.

</Trouble>
