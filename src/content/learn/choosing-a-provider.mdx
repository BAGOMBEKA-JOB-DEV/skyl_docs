---
title: Choosing a Provider
description: When a native adapter earns its place, and when openaicompat is the better answer.
---

<Intro>

skyl ships four adapters. Three are native — written against a specific
vendor's API, with full fidelity. One is generic, and reaches roughly eighteen
hosts that speak OpenAI's wire format. This page is about picking correctly.

</Intro>

<YouWillLearn>

- The difference between a native adapter and `openaicompat`
- Which vendors each one reaches
- How to choose a provider at runtime, since `Provider` is just an interface
- When to run two providers side by side

</YouWillLearn>

## The four adapters

<ProviderTable />

## Native adapters

Use a native adapter when you want a vendor's deep features and its exact error
semantics.

<ProviderTabs only={['anthropic', 'openai', 'gemini']}>

```go
import "github.com/BAGOMBEKA-JOB-DEV/skyl/provider/anthropic"

p := anthropic.New(os.Getenv("ANTHROPIC_API_KEY"))
```

```go
import "github.com/BAGOMBEKA-JOB-DEV/skyl/provider/openai"

p := openai.New(os.Getenv("OPENAI_API_KEY"))
```

```go
import "github.com/BAGOMBEKA-JOB-DEV/skyl/provider/gemini"

p := gemini.New(os.Getenv("GEMINI_API_KEY"))
```

</ProviderTabs>

What "native" buys you concretely:

- **Anthropic** is the only adapter that emits `EventThinkingDelta`, the only
  one that reports `CacheWriteTokens`, and the only one where
  `ToolResult.IsError` reaches the model as a real boolean.
- **Gemini** is the only adapter where `Request.Thinking` maps completely,
  including an explicit zero budget.
- **OpenAI** maps `Thinking.Effort` onto `reasoning_effort`, which Anthropic
  cannot do.

Those differences are not marketing — they are rows in the
[feature matrix](/reference/provider/feature-matrix), and each one is a place
where picking the wrong adapter silently costs you a capability.

## The compatible adapter

A large part of the industry serves OpenAI's wire format. One adapter reaches
all of it:

```go
import "github.com/BAGOMBEKA-JOB-DEV/skyl/provider/openaicompat"

p := openaicompat.New(
	openaicompat.WithBaseURL("https://api.groq.com/openai/v1"),
	openaicompat.WithAPIKey(os.Getenv("GROQ_API_KEY")),
	openaicompat.WithName("groq"),
)
```

<CompatEndpointTable />

<Note>

**OpenRouter alone brokers 300+ models**, so this single adapter puts the
realistic reachable total in the hundreds — without skyl shipping per-vendor
code, and without a release when any of them adds a model.

</Note>

### Set `WithName`

It defaults to `openai-compatible`. If you run more than one compatible host,
leaving the default means every one of them reports the same label in
`Response.Provider`, in errors, and in hook events — so your metrics cannot tell
Groq from DeepSeek.

<Pitfall>

`openaicompat.New` **panics without `WithBaseURL`**. There is no sensible
default for "some OpenAI-shaped endpoint", and a panic at construction is far
better than a confusing failure on the first request. This is the one place
where an adapter constructor can fail.

</Pitfall>

### Fidelity caveat

These endpoints implement OpenAI's *format*, not necessarily its *features*.
Tool calling, streaming, and multimodal support vary by host and by model. skyl
surfaces what the endpoint returns; where a host rejects a feature you get that
host's error, classified, rather than a skyl-invented one.

## Local models

Three of the compatible hosts run on your own machine and need **no credential
at all**:

```go verify
// Ollama. Note there is no WithAPIKey — it authenticates nothing.
p := openaicompat.New(
	openaicompat.WithBaseURL("http://localhost:11434/v1"),
	openaicompat.WithName("ollama"),
)

resp, err := skyl.New(p).Complete(ctx, &skyl.Request{
	Model:    "llama3.3",
	Messages: []skyl.Message{skyl.UserText("Hello")},
})
```

This is the case that makes "develop locally, deploy against a frontier model"
a configuration change rather than two code paths.

## Choosing at runtime

`Provider` is an interface, so this is ordinary Go — no registry, no plugin
system, no reflection.

```go title="provider.go" verify
func pick(name string) (skyl.Provider, error) {
	switch name {
	case "anthropic":
		return anthropic.New(os.Getenv("ANTHROPIC_API_KEY")), nil
	case "openai":
		return openai.New(os.Getenv("OPENAI_API_KEY")), nil
	case "gemini":
		return gemini.New(os.Getenv("GEMINI_API_KEY")), nil
	case "ollama":
		return openaicompat.New(
			openaicompat.WithBaseURL("http://localhost:11434/v1"),
			openaicompat.WithName("ollama"),
		), nil
	default:
		return nil, fmt.Errorf("unknown provider %q", name)
	}
}
```

## Running two at once

There is nothing special about holding several clients. A common shape is a
cheap model for classification and an expensive one for reasoning:

```go verify
type Models struct {
	Fast  *skyl.Client // cheap, high volume
	Smart *skyl.Client // expensive, low volume
}

func New() Models {
	return Models{
		Fast:  skyl.New(gemini.New(os.Getenv("GEMINI_API_KEY"))),
		Smart: skyl.New(anthropic.New(os.Getenv("ANTHROPIC_API_KEY"))),
	}
}
```

Both clients are safe for concurrent use, and both build the same `Request`
type — so the code that *constructs* a prompt does not need to know which one
will serve it.

<DeepDive title="Should I add fallback between providers?">

skyl deliberately does not do this for you. `Client` retries the *same*
provider, because that is a well-defined operation with well-defined
idempotency. Failing over to a *different* vendor is a product decision: the
second model will answer differently, may cost differently, and may have
different data-residency implications.

If you want it, it is a short function you write and control:

```go verify
func completeWithFallback(ctx context.Context, primary, backup *skyl.Client, req *skyl.Request) (*skyl.Response, error) {
	resp, err := primary.Complete(ctx, req)
	if err == nil {
		return resp, nil
	}
	// Only fail over on the provider's problems, never on yours.
	if !errors.Is(err, skyl.ErrServer) && !errors.Is(err, skyl.ErrRateLimit) {
		return nil, err
	}
	return backup.Complete(ctx, req)
}
```

Note the classification check. Falling over on `ErrBadRequest` would just send a
malformed request to a second vendor and get a second rejection.

</DeepDive>

<Recap>

- Native adapters (`anthropic`, `openai`, `gemini`) give full vendor fidelity and deep features.
- `openaicompat` reaches ~18 hosts including Ollama, vLLM and LM Studio.
- `openaicompat.New` **panics without `WithBaseURL`**; always set `WithName` too.
- Compatible hosts implement OpenAI's format, not necessarily its features.
- Selecting a provider at runtime is a plain `switch` — `Provider` is just an interface.
- Cross-provider fallback is deliberately yours to write, because it is a product decision.

</Recap>

<Challenges>

<Challenge title="Name your compatible providers">

Write a helper that builds an `openaicompat` provider for any host, so nobody
can forget `WithName`.

<Hint>

Make the name a required parameter of your own function rather than an option.

</Hint>

<Solution>

```go verify
func compat(name, baseURL, key string) skyl.Provider {
	opts := []openaicompat.Option{
		openaicompat.WithBaseURL(baseURL),
		openaicompat.WithName(name),
	}
	// Local runtimes authenticate nothing; do not send an empty credential.
	if key != "" {
		opts = append(opts, openaicompat.WithAPIKey(key))
	}
	return openaicompat.New(opts...)
}
```

Because `name` is positional, the compiler enforces what an option cannot.

</Solution>

</Challenge>

<Challenge title="Pick the right adapter for a requirement">

You need `ToolResult.IsError` to reach the model faithfully, so it can recover
when a tool fails. Which adapters can do that?

<Hint>

Check the `ToolResult.IsError` row of the feature matrix.

</Hint>

<Solution>

Only **Anthropic**. It maps to a real `is_error` boolean.

The OpenAI-format adapters are lossy — they prefix `"error: "` to the content
and drop the flag entirely when the content is empty. Gemini drops it
completely; the signal never reaches the wire.

The practical workaround for the other three is to put the failure *in the
result text*, where the model will read it:

```go verify
skyl.ToolResultMessage(call.ID, "ERROR: the weather service returned 503. Do not retry.")
```

See [Reporting Tool Errors](/learn/reporting-tool-errors).

</Solution>

</Challenge>

</Challenges>
