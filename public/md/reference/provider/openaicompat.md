---
title: provider/openaicompat
description: One adapter, configured per host, reaching ~18 OpenAI-shaped endpoints.
---

<Intro>

A large part of the industry serves OpenAI's wire format. One adapter reaches
all of it — including local runtimes that need no credential at all.

</Intro>

## Reference

<Signature>func New(opts ...Option) *Provider</Signature>

There is **no positional API key**. Everything is an option, because a
compatible host may need no credential.

<ProviderOptionTable provider="openaicompat" />

<Caveats>

- **`New` panics without `WithBaseURL`.** There is no sensible default for "some
  OpenAI-shaped endpoint", and a panic at construction beats a confusing failure
  on the first request. It is the only adapter constructor that can fail.
- **Set `WithName`.** It defaults to `openai-compatible`, so without it every
  host in your fleet reports the same label in `Response.Provider`, in errors and
  in hook events — and your metrics cannot tell Groq from DeepSeek.
- **Omit `WithAPIKey` for local runtimes.** Ollama, LM Studio and llama.cpp
  authenticate nothing; passing an empty string still sends a header.
- **These hosts implement OpenAI's *format*, not necessarily its *features*.**
  Tool calling, streaming and multimodal support vary by host and by model.
- It shares one implementation with `provider/openai`, so every caveat there
  applies here too.

</Caveats>

## openai versus openaicompat

They share one implementation. The complete list of differences:

<OpenAIVsCompatTable />

Everything else — request mapping, response parsing, streaming, error
classification — is byte-identical.

## Verified endpoints

<CompatEndpointTable />

<Note>

**OpenRouter alone brokers 300+ models**, so this single adapter puts the
realistic reachable total in the hundreds — without skyl shipping per-vendor
code, and without a release when any of them adds a model.

</Note>

## Usage

<Recipe title="A hosted provider">

```go verify
p := openaicompat.New(
	openaicompat.WithBaseURL("https://api.groq.com/openai/v1"),
	openaicompat.WithAPIKey(os.Getenv("GROQ_API_KEY")),
	openaicompat.WithName("groq"),
)
```

</Recipe>

<Recipe title="A local runtime, with no credential">

```go verify
p := openaicompat.New(
	openaicompat.WithBaseURL("http://localhost:11434/v1"),
	openaicompat.WithName("ollama"),
	// no WithAPIKey — no Authorization header is sent at all
)
```

</Recipe>

<Recipe title="A helper that cannot forget WithName">

```go verify
func compat(name, baseURL, key string) skyl.Provider {
	opts := []openaicompat.Option{
		openaicompat.WithBaseURL(baseURL),
		openaicompat.WithName(name), // positional in our signature, so unforgettable
	}
	if key != "" {
		opts = append(opts, openaicompat.WithAPIKey(key))
	}
	return openaicompat.New(opts...)
}
```

</Recipe>

<Recipe title="OpenRouter's attribution headers">

```go verify
p := openaicompat.New(
	openaicompat.WithBaseURL("https://openrouter.ai/api/v1"),
	openaicompat.WithAPIKey(key),
	openaicompat.WithName("openrouter"),
	openaicompat.WithHeader("HTTP-Referer", "https://example.com"),
	openaicompat.WithHeader("X-Title", "My App"),
)
```

</Recipe>

## Troubleshooting

<Trouble problem="A panic at startup">

`WithBaseURL` is required. This is the only adapter that panics on construction.

</Trouble>

<Trouble problem="All my hosts report the same provider name">

You did not set `WithName`. It defaults to `openai-compatible`.

</Trouble>

<Trouble problem="Assistant text is empty on vLLM">

Some builds return content as an **array of blocks** rather than a bare string.
The adapter handles both — if you still see empty text, check `Response.Raw` for
a block type other than `text`, which is discarded.

</Trouble>

<Trouble problem="Tool calling does not work on this host">

The host implements OpenAI's format without implementing tool calling, or the
model does not support it. skyl surfaces the host's own error rather than
inventing one.

</Trouble>

<ValidationSnapshot />
