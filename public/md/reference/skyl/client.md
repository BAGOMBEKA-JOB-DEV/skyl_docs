---
title: Client
description: Wraps a Provider with validation, retry, timeouts and hooks.
---

<Intro>

`Client` is what you call. It wraps a [`Provider`](/reference/skyl/provider) and
adds the cross-cutting behaviour every production caller needs — written and
tested once, rather than once per vendor.

</Intro>

## Reference

<Signature>type Client struct{ /* unexported fields */ }</Signature>

Construct one with [`New`](/reference/skyl/new). The zero value is not usable.

<ClientStackDiagram />

### Methods

<DataTable
  headers={['Method', 'Signature']}
  rows={[
    [<a key="a" href="/reference/skyl/client-complete">Complete</a>, <code key="b">Complete(ctx context.Context, req *Request) (*Response, error)</code>],
    [<a key="c" href="/reference/skyl/client-stream">Stream</a>, <code key="d">Stream(ctx context.Context, req *Request) (Stream, error)</code>],
    [<a key="e" href="/reference/skyl/client-models">Models</a>, <code key="f">Models(ctx context.Context) ([]ModelInfo, error)</code>],
    [<a key="g" href="/reference/skyl/client-provider">Provider</a>, <code key="h">Provider() Provider</code>],
  ]}
/>

<Caveats>

- **A `Client` is safe for concurrent use** by multiple goroutines. It holds no
  mutable per-request state; everything scoped to a call lives on the stack.
- The underlying `*http.Client` is shared, which is correct and intended — it is
  how connection pooling happens.
- A [`Stream`](/reference/skyl/stream), by contrast, is **not** concurrency-safe.
  One stream, one consuming goroutine.
- Hooks run **synchronously on the calling goroutine**, so a slow hook slows the
  request.

</Caveats>

## What Client adds

<DataTable
  headers={['Behaviour', 'Applies to']}
  rows={[
    ['Local request validation', 'Complete, Stream'],
    ['Retry with exponential backoff and full jitter', 'Complete, Models, and the Stream handshake only'],
    [<span key="a">Per-attempt timeout (<code>WithTimeout</code>)</span>, <span key="b">Complete, Models — <strong>not</strong> Stream</span>],
    ['Hook events, one per attempt', 'All four operations'],
  ]}
/>

`WithTimeout` is deliberately not applied to `Stream`: the stream outlives the
call, so a per-attempt deadline would kill one that is working perfectly.

## Usage

<Recipe title="One client per process">

```go verify
type Service struct{ ai *skyl.Client }

func New(key string) *Service {
	// Concurrency-safe and pooling-aware: build it once.
	return &Service{ai: skyl.New(openai.New(key))}
}

func (s *Service) Summarise(ctx context.Context, text string) (string, error) {
	resp, err := s.ai.Complete(ctx, &skyl.Request{
		Model:     "gpt-5.6",
		MaxTokens: 256,
		System:    "Summarise in one sentence.",
		Messages:  []skyl.Message{skyl.UserText(text)},
	})
	if err != nil {
		return "", err
	}
	return resp.Text(), nil
}
```

</Recipe>

<Recipe title="Several clients for several workloads">

```go verify
type Clients struct {
	Fast  *skyl.Client // high volume, low stakes
	Smart *skyl.Client // low volume, worth the money
}
```

Both build the same `Request` type, so the code that constructs a prompt does
not need to know which will serve it.

</Recipe>

## Troubleshooting

<Trouble problem="Latency is higher than the provider's, by a lot">

Check whether you are constructing a client per request. Each new client brings
a new `*http.Client`, so every call pays a fresh TLS handshake instead of
reusing a pooled connection.

Construct once and reuse.

</Trouble>

<Trouble problem="Requests hang far longer than my timeout">

`WithTimeout` bounds a **single attempt**. With three retries and backoff, the
worst case is roughly four attempts plus the delays between them.

Bound the whole call with your own context:

```go verify
ctx, cancel := context.WithTimeout(ctx, 2*time.Minute)
defer cancel()
```

</Trouble>

<Trouble problem="My hook slowed everything down">

Hooks run synchronously on the calling goroutine. Do metrics and logging; buffer
anything that does I/O, with a non-blocking send so a full buffer drops events
rather than blocking a model call.

</Trouble>
