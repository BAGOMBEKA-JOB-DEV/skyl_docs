---
title: Writing an Adapter
description: Four methods, and you inherit retry, hooks and the gateway for free.
---

<Intro>

Nothing in skyl privileges the in-tree adapters. An adapter in your own
repository is a first-class citizen: pass it to `skyl.New` and it inherits
validation, retry, timeouts, hooks and the gateway with no changes to skyl.

</Intro>

## First, check you need one

<Pitfall>

If your target speaks OpenAI's wire format — and a surprising proportion do —
[`openaicompat`](/reference/provider/openaicompat) already reaches it with one
constructor and no code:

```go verify
p := openaicompat.New(
	openaicompat.WithBaseURL("https://api.example.com/v1"),
	openaicompat.WithName("example"),
)
```

Write your own when the API is genuinely a different shape: a bespoke internal
model service, a vendor with its own protocol, or one whose features you need at
full fidelity.

</Pitfall>

## The interface

```go
type Provider interface {
	Name() string
	Complete(ctx context.Context, req *Request) (*Response, error)
	Stream(ctx context.Context, req *Request) (Stream, error)
	Models(ctx context.Context) ([]ModelInfo, error)
}
```

Implementations must be **safe for concurrent use**.

## The contract

<DataTable
  headers={['Rule', 'Why']}
  rows={[
    ['Honour ctx', 'Cancellation and deadlines must propagate, or Client cannot bound anything.'],
    [<span key="a">Always populate <code>Response.Raw</code></span>, "It is the caller's escape hatch; an empty Raw breaks the guarantee."],
    [<span key="b">Read <code>Model</code> from the response</span>, 'Providers substitute. Echoing the request hides it.'],
    [<span key="c">Honour <code>ProviderOptions</code></span>, 'Asserted by the shared contract suite.'],
    [<span key="d">Return <code>ErrUnsupported</code> rather than dropping data</span>, 'Silent data loss is the worst failure mode this library has.'],
    ['Classify errors onto skyl sentinels', "Client's retry loop branches on classification, not status codes."],
    ['Bind the stream to ctx; never leak a goroutine', 'A leaked goroutine per request is a 3am bug.'],
    ['Report truncation rather than a clean end', 'A stream cut short must not look like a complete short answer.'],
    ['No panics', 'Except documented programmer error, as with a nil Provider.'],
  ]}
/>

## Helpers you should use

These are exported precisely so an out-of-tree adapter produces errors
indistinguishable from an in-tree one:

<DataTable
  headers={['Helper', 'Use']}
  rows={[
    [<a key="a" href="/reference/skyl/errors/new-error">NewError</a>, 'Build a classified failure with provider, status, message and body.'],
    [<a key="b" href="/reference/skyl/errors/classify-status">ClassifyStatus</a>, 'Map an HTTP status onto a sentinel.'],
    [<a key="c" href="/reference/skyl/errors/parse-retry-after">ParseRetryAfter</a>, 'Parse either Retry-After wire form.'],
    [<a key="d" href="/reference/skyl/errors/unsupportedf">Unsupportedf</a>, 'Name exactly what could not be represented.'],
    [<code key="e">(*Error).WithCause</code>, 'Preserve the underlying error so errors.Is reaches it.'],
  ]}
/>

## A skeleton

```go title="myprovider/provider.go" verify
func (p *Provider) Complete(ctx context.Context, req *skyl.Request) (*skyl.Response, error) {
	payload, err := p.encode(req)
	if err != nil {
		return nil, err
	}

	// ProviderOptions must override anything we set. The shared suite asserts it.
	for k, v := range req.ProviderOptions {
		payload[k] = v
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, p.baseURL+"/chat", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	httpReq.Header.Set("Authorization", "Bearer "+p.apiKey)

	res, err := p.hc.Do(httpReq)
	if err != nil {
		// Preserve the cause so errors.Is(err, context.DeadlineExceeded) works.
		return nil, (&skyl.Error{Provider: p.Name()}).WithCause(err)
	}
	defer res.Body.Close()

	raw, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}

	if res.StatusCode >= 400 {
		e := skyl.NewError(p.Name(), res.StatusCode,
			skyl.ClassifyStatus(res.StatusCode), extractMessage(raw), raw)
		e.RetryAfter = skyl.ParseRetryAfter(res.Header.Get("Retry-After"))
		return nil, e
	}

	return p.decode(raw) // must set Provider, Model and Raw
}
```

## Refusing rather than dropping

```go verify
if img.URL != "" {
	// Name the constraint, so the caller knows what to change.
	return nil, skyl.Unsupportedf(p.Name(),
		"myprovider requires inline image data, not a URL")
}
```

## Models, honestly

```go verify
func (p *Provider) Models(context.Context) ([]skyl.ModelInfo, error) {
	// Not an empty slice (which claims "no models"), and not a hardcoded list
	// (which rots). Client recognises this and does not retry it.
	return nil, skyl.Unsupportedf(p.Name(), "this service exposes no model-listing endpoint")
}
```

## Testing it

Wrap your provider in a **real** `skyl.New(...)` so your tests exercise the
actual validation and retry code rather than a mock of it.

```go
func TestHonoursProviderOptions(t *testing.T) {
	var got map[string]any
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewDecoder(r.Body).Decode(&got)
		_, _ = w.Write([]byte(`{"text":"ok"}`))
	}))
	defer srv.Close()

	_, _ = skyl.New(New("k", WithBaseURL(srv.URL))).Complete(context.Background(), &skyl.Request{
		Model:           "m",
		MaxTokens:       16,
		Messages:        []skyl.Message{skyl.UserText("hi")},
		ProviderOptions: map[string]any{"top_k": 40},
	})

	if got["top_k"] != float64(40) {
		t.Fatalf("ProviderOptions did not reach the wire: %v", got)
	}
}
```

Also assert: no goroutine leaks on early `Close()`, a truncated stream reports an
error, and every sentinel is produced by the status that should produce it. The
[sandbox fault models](/reference/sandbox/forcing-failures) make the last two
one-liners.

## Contributing it back

If you build one worth sharing, open an issue. In-tree adapters must run the
shared contract suite in `internal/providertest`, which is the same set of
expectations described above — so if your adapter passes those tests locally, it
is most of the way there.

Either way it works: a first-class citizen in your repository is the point of
keeping the interface to four methods.
