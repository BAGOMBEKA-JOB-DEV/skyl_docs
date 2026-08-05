---
title: Provider
description: The seam between skyl and a model vendor. Four methods.
---

<Intro>

`Provider` is the interface everything in skyl exists to serve. It is
deliberately four methods — small enough to implement in your own repository,
easy to fake in tests, and easy to wrap.

</Intro>

## Reference

<Signature>{`type Provider interface {
	Name() string
	Complete(ctx context.Context, req *Request) (*Response, error)
	Stream(ctx context.Context, req *Request) (Stream, error)
	Models(ctx context.Context) ([]ModelInfo, error)
}`}</Signature>

<Parameters>

- **`Name`** — the adapter's short identifier, e.g. `"anthropic"`. It appears in
  errors, responses and hook events.
- **`Complete`** — runs a request to completion. Must honour `ctx`, populate
  `Response.Raw`, and set `Provider` and `Model` from the actual response.
- **`Stream`** — runs a request delivering incremental events. The returned
  stream is bound to `ctx`; callers must close it.
- **`Models`** — lists what the provider currently offers, queried live.
  Providers with no such endpoint return `ErrUnsupported`.

</Parameters>

<Caveats>

- **Implementations must be safe for concurrent use** by multiple goroutines.
- An adapter in your own module is a **first-class citizen**: pass it to
  [`New`](/reference/skyl/new) and it inherits retry, hooks, validation and the
  gateway with no changes to skyl.
- Everything cross-cutting lives in [`Client`](/reference/skyl/client), not here.
  An adapter's whole job is translation.

</Caveats>

## The contract

Beyond the signatures, an adapter is expected to:

<DataTable
  headers={['Rule', 'Why']}
  rows={[
    ['Honour ctx', 'Cancellation and deadlines must propagate, or Client cannot bound anything.'],
    [<span key="a">Always populate <code>Response.Raw</code></span>, "It is the caller's escape hatch."],
    [<span key="b">Read <code>Model</code> from the response</span>, 'Providers substitute; echoing hides it.'],
    [<span key="c">Honour <code>ProviderOptions</code></span>, 'Asserted by the shared contract suite, so the rule cannot be met by some adapters and quietly missed by others.'],
    [<span key="d">Return <code>ErrUnsupported</code> rather than dropping data</span>, 'Silent data loss is the worst failure mode this library has.'],
    ['Classify errors onto skyl sentinels', "Client's retry loop branches on classification."],
    ['Bind the stream to ctx and never leak a goroutine', 'A leaked goroutine per request is a 3am bug.'],
    ['Report truncation rather than a clean end', 'A stream cut short must not look complete.'],
  ]}
/>

## Usage

<Recipe title="A fake for tests">

```go verify
type fakeProvider struct{ text string }

func (fakeProvider) Name() string { return "fake" }

func (p fakeProvider) Complete(context.Context, *skyl.Request) (*skyl.Response, error) {
	return &skyl.Response{
		Provider:   "fake",
		Model:      "fake-model",
		Message:    skyl.Message{Role: skyl.RoleAssistant, Parts: []skyl.Part{skyl.Text{Text: p.text}}},
		StopReason: skyl.StopEndTurn,
		Usage:      skyl.Usage{InputTokens: 8, OutputTokens: 3},
		Raw:        json.RawMessage(`{}`),
	}, nil
}

func (fakeProvider) Stream(context.Context, *skyl.Request) (skyl.Stream, error) {
	return nil, skyl.ErrUnsupported
}

func (fakeProvider) Models(context.Context) ([]skyl.ModelInfo, error) {
	return nil, skyl.ErrUnsupported
}
```

Wrap it in a real `skyl.New(...)` so your tests exercise the actual validation
and retry code rather than a mock of it.

</Recipe>

<Recipe title="Decorating an adapter">

```go
// Embedding gives you Name, Stream and Models unchanged.
type logging struct{ skyl.Provider }

func (l logging) Complete(ctx context.Context, req *skyl.Request) (*skyl.Response, error) {
	start := time.Now()
	resp, err := l.Provider.Complete(ctx, req)
	log.Printf("%s took %s", l.Name(), time.Since(start))
	return resp, err
}

client := skyl.New(logging{Provider: openai.New(key)})
```

</Recipe>

<Recipe title="Selecting one at runtime">

```go verify
func pick(name string) (skyl.Provider, error) {
	switch name {
	case "anthropic":
		return anthropic.New(os.Getenv("ANTHROPIC_API_KEY")), nil
	case "openai":
		return openai.New(os.Getenv("OPENAI_API_KEY")), nil
	default:
		return nil, fmt.Errorf("unknown provider %q", name)
	}
}
```

</Recipe>

## Troubleshooting

<Trouble problem="Why four methods and not two, or ten?">

Two would mean folding streaming into `Complete` with a flag, which makes the
return type dishonest. Ten would mean modelling embeddings, moderation and image
generation — each a genuinely different shape, several of which not every vendor
offers. An interface half its implementations return `ErrUnsupported` from is not
an interface.

Four is the set every text-model vendor actually implements. Recorded as
[ADR-0002](/community/adr/0002-provider-interface).

</Trouble>

<Trouble problem="My adapter's Models has no endpoint to call">

Return `ErrUnsupported`, not an empty slice and not a hardcoded list. `Client`
recognises it and does not retry, because a provider that cannot list models
never will.

</Trouble>
