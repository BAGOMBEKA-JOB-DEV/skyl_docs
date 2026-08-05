---
title: Writing Your Own Provider
description: Four methods, and you inherit retry, hooks and the gateway for free.
---

<Intro>

`Provider` is four methods, and nothing in skyl privileges the in-tree adapters.
An adapter in your own repository is a first-class citizen: pass it to
`skyl.New` and it gets validation, retry, timeouts, hooks and the gateway with
no changes to skyl.

</Intro>

<YouWillLearn>

- The four methods and what each must guarantee
- The contract every adapter is expected to honour
- How to test yours against skyl's own expectations
- When writing one is the right answer

</YouWillLearn>

## The interface

```go
type Provider interface {
	Name() string
	Complete(ctx context.Context, req *Request) (*Response, error)
	Stream(ctx context.Context, req *Request) (Stream, error)
	Models(ctx context.Context) ([]ModelInfo, error)
}
```

Implementations must be **safe for concurrent use** by multiple goroutines.

## The contract

Beyond the signatures, an adapter is expected to honour these:

<DataTable
  headers={['Rule', 'Why']}
  rows={[
    ['Honour ctx', 'Cancellation and deadlines must propagate, or Client cannot bound anything.'],
    [<span key="a">Always populate <code>Response.Raw</code></span>, "It is the caller's escape hatch; an empty Raw breaks the guarantee."],
    [<span key="b">Set <code>Provider</code> and <code>Model</code> from the actual response</span>, 'Model is read, not echoed — providers substitute.'],
    [<span key="c">Honour <code>Request.ProviderOptions</code></span>, 'The contract suite asserts this, so the rule cannot be met by some adapters and quietly missed by others.'],
    [<span key="d">Return <code>ErrUnsupported</code> rather than dropping data</span>, 'Silent data loss is the worst failure mode this library has.'],
    [<span key="e">Classify errors onto skyl sentinels</span>, "Client's retry loop branches on classification, not status codes."],
    ['Bind the stream to ctx and never leak a goroutine', 'A leaked goroutine per request is a 3am bug.'],
    [<span key="f">Report truncation rather than a clean end</span>, 'A stream cut short must not look like a complete short answer.'],
  ]}
/>

## A skeleton

```go title="myprovider/provider.go"
package myprovider

type Provider struct {
	apiKey  string
	baseURL string
	hc      *http.Client
}

func New(apiKey string, opts ...Option) *Provider {
	p := &Provider{apiKey: apiKey, baseURL: defaultBaseURL, hc: http.DefaultClient}
	for _, opt := range opts {
		opt(p)
	}
	return p
}

func (p *Provider) Name() string { return "myprovider" }

func (p *Provider) Complete(ctx context.Context, req *skyl.Request) (*skyl.Response, error) {
	payload, err := p.encode(req)
	if err != nil {
		return nil, err
	}

	// ProviderOptions must override anything we set. This is part of the
	// contract, and the shared suite asserts it.
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
	httpReq.Header.Set("Content-Type", "application/json")

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
		return nil, skyl.NewError(p.Name(), res.StatusCode,
			skyl.ClassifyStatus(res.StatusCode), extractMessage(raw), raw)
	}

	return p.decode(raw)   // must set Provider, Model, and Raw
}
```

`skyl.NewError`, `skyl.ClassifyStatus`, `skyl.ParseRetryAfter` and
`skyl.Unsupportedf` are exported precisely so that an out-of-tree adapter
produces errors indistinguishable from an in-tree one.

## Returning ErrUnsupported

```go verify
for _, m := range req.Messages {
	for _, part := range m.Parts {
		if img, ok := part.(skyl.Image); ok && img.URL != "" {
			// Name exactly what could not be represented.
			return nil, skyl.Unsupportedf(p.Name(),
				"myprovider requires inline image data, not a URL")
		}
	}
}
```

Never drop it silently. A quietly discarded image looks like a model that
ignored the question, and the caller will spend an afternoon on the prompt.

## Testing it

Wrap your provider in a real `skyl.New(...)` so your tests exercise the actual
validation and retry code rather than a mock of it. Then check the contract:

```go
func TestHonoursProviderOptions(t *testing.T) {
	var got map[string]any
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewDecoder(r.Body).Decode(&got)
		_, _ = w.Write([]byte(`{"text":"ok"}`))
	}))
	defer srv.Close()

	p := New("k", WithBaseURL(srv.URL))
	_, _ = skyl.New(p).Complete(context.Background(), &skyl.Request{
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

Also assert that streams do not leak, that a truncated stream reports an error,
and that each sentinel is produced by the status that should produce it.

## When to write one

<DeepDive title="Usually you want openaicompat instead">

If your target speaks OpenAI's wire format — and a surprising proportion do —
`openaicompat` already reaches it with one constructor and no code:

```go verify
p := openaicompat.New(
	openaicompat.WithBaseURL("https://api.example.com/v1"),
	openaicompat.WithName("example"),
)
```

Write your own adapter when the API is genuinely a different shape: a bespoke
internal model service, a vendor with its own protocol, or a provider whose
features you need at full fidelity rather than through the compatible subset.

If you build one worth sharing, the project welcomes it — see
[Contributing](/community/contributing). But it is a first-class citizen living
in your own repository too, which is the point of keeping the interface to four
methods.

</DeepDive>

<Recap>

- Four methods, and implementations must be concurrency-safe.
- Honour `ctx`, always populate `Raw`, and read `Model` from the response.
- **Honour `ProviderOptions`** — the shared contract suite asserts it.
- Return `ErrUnsupported` naming the part rather than dropping data.
- Use `NewError`, `ClassifyStatus` and `Unsupportedf` so your errors match in-tree ones.
- Prefer `openaicompat` unless the API is genuinely a different shape.

</Recap>

<Challenges>

<Challenge title="Implement Models honestly">

Your internal service has no model-listing endpoint. What should `Models`
return?

<Hint>

There is a sentinel for exactly this, and `Client` treats it specially.

</Hint>

<Solution>

```go verify
func (p *Provider) Models(context.Context) ([]skyl.ModelInfo, error) {
	return nil, skyl.Unsupportedf(p.Name(), "this service exposes no model-listing endpoint")
}
```

Return `ErrUnsupported`, not an empty slice and not a hardcoded list.

An empty slice says "this provider offers no models", which is false. A
hardcoded list is the curated-table failure mode that
[ADR-0004](/community/adr/0004-model-ids-are-pass-through) exists to avoid — it
rots silently.

`Client.Models` recognises `ErrUnsupported` and **does not retry** it, because a
provider that cannot list models will never be able to. Returning anything else
means burning four attempts on a capability that does not exist.

</Solution>

</Challenge>

</Challenges>
