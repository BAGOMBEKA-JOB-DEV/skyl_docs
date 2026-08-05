---
title: provider/openai
description: GPT, native. Ships inside the core module.
---

<Intro>

The OpenAI adapter reaches the GPT family. It ships inside the core module, so
it costs you no dependencies — it is written against `net/http` and
`encoding/json`.

</Intro>

## Reference

<Signature>func New(apiKey string, opts ...Option) *Provider</Signature>

<Parameters>

- **`apiKey`** — sent as `Authorization: Bearer`.
- **`opts`** — functional options, applied in order.

</Parameters>

<ProviderOptionTable provider="openai" />

<Caveats>

- **It shares one implementation with `openaicompat`** (`internal/oai`), so
  request mapping, response parsing, streaming and error classification are
  byte-identical. See the
  [comparison](/reference/provider/openaicompat#openai-versus-openaicompat).
- **`Thinking` is ignored unless both `Enabled` and `Effort` are set.** So
  `&Thinking{Enabled: false}` does nothing — an explicit "off" has no wire
  representation here.
- **`Effort: max` is sent literally**, and OpenAI does not define that value.
  Expect a 400.
- **`ProviderOptions` is a shallow top-level merge.** Setting a nested object
  replaces it wholesale.
- **`ToolResult.IsError` is lossy**: it prefixes `"error: "` to the content and
  **drops the flag entirely when the content is empty**.
- **Model listing reports almost nothing** — no display name, context window or
  output cap. The gap is upstream.
- **`StopStopSequence` is never produced.** A stop-sequence hit arrives as plain
  `stop`, so it becomes `StopEndTurn`.

</Caveats>

## Usage

<Recipe title="Constructing">

```go verify
client := skyl.New(openai.New(os.Getenv("OPENAI_API_KEY")))
```

</Recipe>

<Recipe title="An organisation and project">

```go verify
p := openai.New(key,
	openai.WithOrganization(os.Getenv("OPENAI_ORG")),
	openai.WithProject(os.Getenv("OPENAI_PROJECT")),
)
```

</Recipe>

<Recipe title="Azure or a host that has not renamed max_tokens">

```go verify
// OpenAI renamed max_tokens to max_completion_tokens; a host that has not
// followed needs the old name.
p := openai.New(key,
	openai.WithBaseURL("https://my-resource.openai.azure.com/openai/v1"),
	openai.WithMaxTokensField("max_tokens"),
)
```

</Recipe>

<Recipe title="Turning reasoning off, which Thinking cannot do here">

```go verify
req.ProviderOptions = map[string]any{"reasoning_effort": "minimal"}
```

</Recipe>

<Recipe title="Against the sandbox">

```go verify
p := openai.New("sandbox-key",
	openai.WithBaseURL("http://127.0.0.1:8099/openai/v1"))
```

</Recipe>

## Troubleshooting

<Trouble problem="Turning reasoning off did not reduce cost">

`&Thinking{Enabled: false}` is ignored by this adapter. Send `reasoning_effort`
through `ProviderOptions`.

</Trouble>

<Trouble problem="A 400 mentioning max_tokens">

The host expects the older field name. Use
`WithMaxTokensField("max_tokens")`.

</Trouble>

<Trouble problem="My generationConfig-style override lost other fields">

The merge is shallow: a nested object you set replaces the whole object. Restate
every sibling key skyl would have set — including `messages` and `tools`, which
are the dangerous ones.

</Trouble>

<Trouble problem="Streaming reports zero usage">

The host must honour `stream_options.include_usage`. OpenAI itself does; many
compatible hosts do not.

</Trouble>

<Unvalidated />
