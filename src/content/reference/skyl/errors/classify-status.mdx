---
title: ClassifyStatus
description: Maps an HTTP status code onto a skyl sentinel.
---

<Intro>

The fallback classification adapters use when a provider's own error type is not
more precise. Exported so out-of-tree adapters classify identically.

</Intro>

## Reference

<Signature>func ClassifyStatus(status int) error</Signature>

<Returns>

<DataTable
  headers={['Status', 'Sentinel', 'Note']}
  rows={[
    ['401, 403, 407', <code key="a">ErrAuth</code>, 'Unauthorized, Forbidden, Proxy Authentication Required'],
    ['404', <code key="b">ErrNotFound</code>, ''],
    ['429', <code key="c">ErrRateLimit</code>, ''],
    ['408, 409', <code key="d">ErrServer</code>, <strong key="e">Transient conflicts and timeouts are worth another attempt</strong>],
    ['5xx', <code key="f">ErrServer</code>, ''],
    ['other 4xx', <code key="g">ErrBadRequest</code>, ''],
    ['2xx, 3xx', <code key="h">nil</code>, 'Not an error'],
  ]}
/>

</Returns>

<Caveats>

- **`408` and `409` map to `ErrServer`, not `ErrBadRequest`.** A request timeout
  and a transient conflict are both worth retrying, and classifying them as
  client errors would mean skyl gave up on a failure that would have succeeded.
- **A 2xx or 3xx returns nil**, so a caller must not assume a non-nil result.
- Adapters should **prefer a provider's own error type** where it is more
  precise, and fall back to this.

</Caveats>

## Usage

<Recipe title="The common case">

```go
return nil, skyl.NewError(p.Name(), res.StatusCode,
	skyl.ClassifyStatus(res.StatusCode), msg, raw)
```

</Recipe>

<Recipe title="Overriding for a more precise provider signal">

```go verify
kind := skyl.ClassifyStatus(res.StatusCode)

// A 400 that is really a content refusal, which the status alone cannot say.
if apiErr.Type == "content_filter" {
	kind = skyl.ErrRefusal
}
```

</Recipe>

## Troubleshooting

<Trouble problem="A 409 was retried and I did not expect it">

Deliberate. A conflict is usually transient — a concurrent modification, a
resource still settling — so retrying is the better default. If your provider
uses 409 for something permanent, override the classification in your adapter.

</Trouble>

<Trouble problem="It returned nil for a status I consider an error">

Only 4xx and 5xx are classified. A 3xx redirect the HTTP client did not follow
is not an error at this layer; handle it in your transport.

</Trouble>
