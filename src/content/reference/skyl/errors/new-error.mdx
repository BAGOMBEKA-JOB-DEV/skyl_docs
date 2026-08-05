---
title: NewError
description: Builds a classified provider error.
---

<Intro>

Adapters use `NewError` so that every provider failure reaches callers in the
same shape. It is exported so an adapter in **your** repository produces errors
indistinguishable from an in-tree one.

</Intro>

## Reference

<Signature>func NewError(provider string, status int, kind error, message string, body []byte) *Error</Signature>

<Parameters>

- **`provider`** — the adapter's name, as returned by `Provider.Name()`.
- **`status`** — the HTTP status, or `0` for a transport-level failure.
- **`kind`** — the [sentinel](/reference/skyl/errors/sentinels) this classifies
  as. May be nil when unclassifiable.
- **`message`** — the provider's explanation, when it gave one.
- **`body`** — the raw error payload. **Truncated at 2048 bytes**, with
  `"… (truncated)"` appended.

</Parameters>

<Caveats>

- **Never pass a credential in `message` or `body`.** An `Error` is documented
  never to contain one, and adapters are expected to honour that.
- `body` is truncated automatically; you do not need to trim it yourself.
- Use [`ClassifyStatus`](/reference/skyl/errors/classify-status) for `kind`
  unless the provider's own error type is more precise.
- For a transport failure, chain `WithCause` so `errors.Is` reaches the
  underlying error.

</Caveats>

## Usage

<Recipe title="In an adapter">

```go verify
if res.StatusCode >= 400 {
	return nil, skyl.NewError(p.Name(), res.StatusCode,
		skyl.ClassifyStatus(res.StatusCode), extractMessage(raw), raw)
}
```

</Recipe>

<Recipe title="Preferring the provider's own classification">

```go verify
// The provider distinguishes an overloaded model from a generic 500; skyl's
// status map cannot. Prefer the more precise signal where it exists.
kind := skyl.ClassifyStatus(res.StatusCode)
if apiErr.Type == "overloaded_error" {
	kind = skyl.ErrServer
}
return nil, skyl.NewError(p.Name(), res.StatusCode, kind, apiErr.Message, raw)
```

</Recipe>

<Recipe title="A transport failure with its cause preserved">

```go
res, err := p.hc.Do(httpReq)
if err != nil {
	// Status 0 and no kind: unclassified, and Retryable() will return true.
	// WithCause is what makes errors.Is(err, context.DeadlineExceeded) work.
	return nil, (&skyl.Error{Provider: p.Name()}).WithCause(err)
}
```

</Recipe>

<Recipe title="Attaching a Retry-After hint">

```go
e := skyl.NewError(p.Name(), res.StatusCode, skyl.ErrRateLimit, msg, raw)
e.RetryAfter = skyl.ParseRetryAfter(res.Header.Get("Retry-After"))
return nil, e
```

</Recipe>

## Troubleshooting

<Trouble problem="My adapter's errors do not match errors.Is">

You returned a bare `fmt.Errorf` rather than a `*skyl.Error` with a `Kind`.
Without a sentinel there is nothing for `errors.Is` to match, and `Client` will
treat it as unclassified.

</Trouble>

<Trouble problem="Client did not retry my adapter's 503">

Check that `kind` is `ErrServer`. `Retryable()` branches on the sentinel, not on
the status code.

</Trouble>
