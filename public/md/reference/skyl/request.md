---
title: Request
description: A provider-agnostic model call. The same Request works on any provider.
---

<Intro>

`Request` is the one shape every adapter accepts. Fields a provider does not
support are ignored rather than rejected — except where ignoring them would
silently lose data, in which case you get
[`ErrUnsupported`](/reference/skyl/errors/sentinels).

</Intro>

## Reference

<Signature>type Request struct{ /* see below */ }</Signature>

<Fields of="request" />

### Methods

- [`Validate() error`](/reference/skyl/request-validate) — reports whether the
  request is well-formed. `Client` calls it before dispatching.

<Caveats>

- **`Model` is never validated** against a list. A typo reaches the provider and
  returns `ErrNotFound` after a round trip. See
  [Model IDs](/learn/model-ids).
- **`Temperature` and `TopP` are always sent when non-nil**, even to models that
  reject them. Silently dropping a field you set would be worse than the
  provider's error.
- **`MaxTokens` zero means the provider's default** — except on Anthropic, whose
  API requires the field, so that adapter supplies **4096**.
- **`Thinking` nil ≠ `&Thinking{}`.** Nil is "provider default"; the zero value
  is "explicitly off".
- **`ProviderOptions` is a shallow top-level merge** on `openai`, `openaicompat`
  and `gemini` — a nested object you set **replaces the whole object**. Anthropic
  applies options by JSON path instead.
- `Client` **reuses `req` across retries**. Do not mutate it concurrently.

</Caveats>

## Usage

<Recipe title="A minimal request">

```go verify
req := &skyl.Request{
	Model:     "gpt-5.6",
	MaxTokens: 1024,
	Messages:  []skyl.Message{skyl.UserText("Explain Go channels.")},
}
```

</Recipe>

<Recipe title="With a system prompt and history">

```go verify
req := &skyl.Request{
	Model:  "claude-opus-5",
	System: "You are a terse Go expert. Answer in one sentence.",
	Messages: []skyl.Message{
		skyl.UserText("What is a nil map?"),
		skyl.AssistantText("A map that is declared but not allocated."),
		skyl.UserText("Can I read from one?"),
	},
	MaxTokens: 256,
}
```

</Recipe>

<Recipe title="Deterministic sampling">

```go
func f(v float64) *float64 { return &v }

req.Temperature = f(0) // explicitly deterministic, NOT "unset"
```

</Recipe>

<Recipe title="With tools">

```go verify
req.Tools = []skyl.Tool{{
	Name:        "get_weather",
	Description: "Get the current weather for a city. Call this whenever the user asks about weather in a named place.",
	Parameters: map[string]any{
		"type":       "object",
		"properties": map[string]any{"city": map[string]any{"type": "string"}},
		"required":   []string{"city"},
	},
}}
req.ToolChoice = &skyl.ToolChoice{Mode: skyl.ToolChoiceAuto}
```

</Recipe>

<Recipe title="Reaching a field skyl does not model">

```go verify
req.ProviderOptions = map[string]any{"top_k": 40}
```

</Recipe>

## Troubleshooting

<Trouble problem="ErrBadRequest before any network call">

That is `Validate`. The message names the problem exactly — a missing model, an
empty message list, an image with no media type, a tool with no name.

</Trouble>

<Trouble problem="Temperature caused a 400 on a reasoning model">

Several current reasoning models reject sampling parameters. skyl sends a
non-nil value deliberately rather than dropping it silently. Leave
`Temperature` nil unless you mean it.

</Trouble>

<Trouble problem="My generationConfig override lost maxOutputTokens">

The merge is shallow on Gemini — setting `generationConfig` replaces the whole
object. Restate every sibling key. See
[Provider Options](/learn/provider-options).

</Trouble>

<Trouble problem="&Thinking{Enabled: false} did nothing on OpenAI">

The OpenAI-format adapters ignore `Thinking` unless both `Enabled` **and**
`Effort` are set, so an explicit "off" has no wire representation there. Send
`reasoning_effort` through `ProviderOptions` instead.

</Trouble>
