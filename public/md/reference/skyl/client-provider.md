---
title: Client.Provider
description: Returns the underlying provider, bypassing everything Client adds.
---

<Intro>

`Provider` hands back the value the client wraps. Everything `Client` adds —
validation, retry, per-attempt timeouts, hooks — is skipped when you call it
directly.

</Intro>

## Reference

<Signature>func (c *Client) Provider() Provider</Signature>

<Returns>

The [`Provider`](/reference/skyl/provider) passed to
[`New`](/reference/skyl/new). Never nil, because `New` panics on a nil provider.

</Returns>

<Caveats>

- A call made through the returned provider gets **no validation, no retry, no
  timeout, and no hooks**.
- The hooks omission is the one people forget: a bypassed call is **invisible to
  your observability**, so the tokens it spends do not appear in your cost
  report.
- To disable retries only, use
  [`WithMaxRetries(0)`](/reference/skyl/with-max-retries) instead — it keeps
  everything else.

</Caveats>

## Usage

<Recipe title="Testing an adapter's classification directly">

```go verify
// No retry in between, so the assertion is about the adapter alone.
raw := client.Provider()
_, err := raw.Complete(ctx, &skyl.Request{
	Model:     "sandbox-status-429",
	MaxTokens: 16,
	Messages:  []skyl.Message{skyl.UserText("hi")},
})
if !errors.Is(err, skyl.ErrRateLimit) {
	t.Fatalf("adapter misclassified: %v", err)
}
```

</Recipe>

<Recipe title="Identifying which provider is wired in">

```go verify
log.Printf("using provider %s", client.Provider().Name())
```

</Recipe>

<Recipe title="Decorating below the seam">

```go
// Embedding gives you Name, Stream and Models unchanged; override only what
// you care about, and keep Client's behaviour by wrapping the result.
type caching struct {
	skyl.Provider
	cache *lru.Cache
}

func (c caching) Complete(ctx context.Context, req *skyl.Request) (*skyl.Response, error) {
	if hit, ok := c.cache.Get(key(req)); ok {
		return hit.(*skyl.Response), nil
	}
	resp, err := c.Provider.Complete(ctx, req)
	if err == nil {
		c.cache.Add(key(req), resp)
	}
	return resp, err
}

client := skyl.New(caching{Provider: openai.New(key), cache: c})
```

</Recipe>

## Troubleshooting

<Trouble problem="My bypassed calls do not appear in metrics">

They will not. Hooks are a `Client` behaviour, and bypassing skips them. If you
want metrics without retries, use `WithMaxRetries(0)` rather than the raw
provider.

</Trouble>

<Trouble problem="A bypassed call failed on a 429 that used to succeed">

`Client` was retrying it for you. Rate limits are transient by nature — without
the retry loop, a single 429 is a hard failure.

</Trouble>

<Trouble problem="I want to add behaviour to every call">

Decorate the **provider**, not the client, and pass the decorated value to
`skyl.New`. That way your behaviour composes *underneath* retry and hooks rather
than replacing them.

</Trouble>
