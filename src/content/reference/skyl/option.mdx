---
title: Option
description: Configures a Client. Applied in order.
---

<Intro>

`Option` is skyl's functional-option type. Every option is a function that
mutates a `*Client` during construction, and they are applied in the order you
pass them.

</Intro>

## Reference

<Signature>type Option func(*Client)</Signature>

<Caveats>

- Options are applied **in order**, so a later one overrides an earlier one of
  the same kind.
- **Invalid values are ignored, not rejected.** A negative retry count or a
  non-positive delay leaves the default in place — there is no error return.
- Options configure the `Client`, never the transport. HTTP concerns are
  **provider** options.

</Caveats>

## The options

<DataTable
  headers={['Option', 'Default', 'Bounds']}
  rows={[
    [<a key="a" href="/reference/skyl/with-max-retries">WithMaxRetries(n)</a>, '3', 'How many times a retryable failure is retried'],
    [<a key="b" href="/reference/skyl/with-retry-delay">WithRetryDelay(base, max)</a>, '500ms / 30s', "skyl's computed backoff"],
    [<a key="c" href="/reference/skyl/with-retry-after-cap">WithRetryAfterCap(d)</a>, '5m', "A provider's own Retry-After hint"],
    [<a key="d" href="/reference/skyl/with-timeout">WithTimeout(d)</a>, '10m', 'A single attempt'],
    [<a key="e" href="/reference/skyl/with-hook">WithHook(h)</a>, 'none', 'Nothing — it registers an observer'],
  ]}
/>

## Usage

<Recipe title="A production configuration">

```go verify
client := skyl.New(p,
	skyl.WithMaxRetries(5),
	skyl.WithRetryDelay(time.Second, time.Minute),
	skyl.WithRetryAfterCap(2*time.Minute),
	skyl.WithTimeout(90*time.Second),
	skyl.WithHook(telemetry.Hook),
)
```

</Recipe>

<Recipe title="Reusable option sets">

```go
// Options are values, so a policy is just a slice.
func policy(env string) []skyl.Option {
	switch env {
	case "test":
		// Same retry count, negligible wall-clock.
		return []skyl.Option{
			skyl.WithMaxRetries(3),
			skyl.WithRetryDelay(time.Millisecond, 10*time.Millisecond),
			skyl.WithRetryAfterCap(50 * time.Millisecond),
		}
	default:
		return []skyl.Option{
			skyl.WithMaxRetries(4),
			skyl.WithTimeout(2 * time.Minute),
		}
	}
}

client := skyl.New(p, policy(os.Getenv("APP_ENV"))...)
```

</Recipe>

<Recipe title="Writing your own option">

```go verify
// Option is an exported func type, so you can compose your own from the
// built-in ones — useful for encoding a house style once.
func WithHouseDefaults() skyl.Option {
	return func(c *skyl.Client) {
		skyl.WithMaxRetries(4)(c)
		skyl.WithTimeout(90 * time.Second)(c)
	}
}
```

</Recipe>

## Troubleshooting

<Trouble problem="My option had no effect">

Either the value was invalid and silently ignored — check for a negative or zero
argument — or a later option of the same kind overrode it.

</Trouble>

<Trouble problem="There is no WithHTTPClient">

Correct: the HTTP client is a **provider** option, because the adapter performs
the request. Use `openai.WithHTTPClient(hc)`, `gemini.WithHTTPClient(hc)`, and
so on.

</Trouble>

<Trouble problem="There is no WithBaseURL either">

Same reason. A base URL identifies one vendor's host, so it belongs to the
adapter: `openai.WithBaseURL(...)`.

</Trouble>
