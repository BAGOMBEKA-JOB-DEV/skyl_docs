---
title: ModelInfo
description: Describes a model a provider offers. Fields beyond ID are best-effort.
---

<Intro>

`ModelInfo` is what [`Client.Models`](/reference/skyl/client-models) returns.
Only three of its fields are populated by every adapter; the rest depend on what
each provider's endpoint discloses.

</Intro>

## Reference

<Signature>{`type ModelInfo struct {
	ID              string
	Provider        string
	DisplayName     string
	ContextWindow   int
	MaxOutputTokens int
	Raw             json.RawMessage
}`}</Signature>

<Parameters>

- **`ID`** — the identifier to put in [`Request.Model`](/reference/skyl/request).
- **`Provider`** — the adapter that offers it.
- **`DisplayName`** — a human-readable name, when supplied.
- **`ContextWindow`** — maximum input size in tokens.
- **`MaxOutputTokens`** — maximum response size in tokens.
- **`Raw`** — the provider's untouched entry for this model.

</Parameters>

<Caveats>

- **Only `ID`, `Provider` and `Raw` are populated by every adapter.** Zero means
  "not reported", not "zero".
- **OpenAI supplies almost nothing** — its models endpoint has no display name,
  context window or output cap. The gap is upstream.
- On openaicompat, everything beyond `ID` is host-dependent. OpenRouter supplies
  display name and context window; most others do not.
- The list is scoped to your account: models you lack access to do not appear.

</Caveats>

## What each adapter reports

<DataTable
  headers={['Field', 'anthropic', 'openai', 'openaicompat', 'gemini']}
  rows={[
    ['ID, Provider, Raw', 'yes', 'yes', 'yes', 'yes'],
    ['DisplayName', 'yes', <strong key="a">empty</strong>, 'host-dependent', 'yes'],
    ['ContextWindow', 'yes', <strong key="b">empty</strong>, 'host-dependent', 'yes'],
    ['MaxOutputTokens', 'yes', <strong key="c">never set</strong>, <strong key="d">never set</strong>, 'yes'],
  ]}
/>

## Usage

<Recipe title="Listing what is available">

```go verify
models, err := client.Models(ctx)
if err != nil {
	return err
}
for _, m := range models {
	fmt.Printf("%s (%s) context=%d\n", m.ID, m.DisplayName, m.ContextWindow)
}
```

</Recipe>

<Recipe title="Reading metadata skyl does not model">

```go
for _, m := range models {
	var raw struct {
		Pricing struct {
			Prompt string `json:"prompt"`
		} `json:"pricing"`
	}
	// OpenRouter publishes pricing; skyl does not model it. Raw has it.
	if err := json.Unmarshal(m.Raw, &raw); err == nil && raw.Pricing.Prompt != "" {
		fmt.Printf("%s costs %s per prompt token\n", m.ID, raw.Pricing.Prompt)
	}
}
```

</Recipe>

## Troubleshooting

<Trouble problem="ContextWindow is zero on OpenAI">

Not reported by their endpoint. `Raw` holds everything they do send. skyl's plan
for metadata OpenAI does not publish is a **generated** registry refreshed from
live endpoints by CI, rather than a hand-typed table that rots.

</Trouble>

<Trouble problem="A model is missing from the list on Gemini">

Beyond 1000 models the adapter ignores `nextPageToken` and truncates silently.
In practice Gemini offers far fewer, but query the endpoint directly if you need
completeness.

</Trouble>
