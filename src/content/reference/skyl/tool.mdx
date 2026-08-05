---
title: Tool
description: Describes a function the model may ask to invoke.
---

<Intro>

A `Tool` tells the model what it may call and when. Three fields, of which the
description does most of the work.

</Intro>

## Reference

<Signature>{`type Tool struct {
	Name        string
	Description string
	Parameters  map[string]any
}`}</Signature>

<Parameters>

- **`Name`** — the identifier the model uses to call the tool. Required;
  `Validate` rejects an empty one.
- **`Description`** — tells the model *when* to use the tool. Be prescriptive
  about trigger conditions, not only about what it does.
- **`Parameters`** — a JSON Schema object describing the input. May be nil for a
  tool that takes none.

</Parameters>

<Caveats>

- **skyl does not validate the schema.** An invalid one comes back as the
  provider's own 400, which is more specific than skyl could be.
- **`openai`, `openaicompat` and `gemini` send the schema verbatim.**
  `anthropic` reconstructs it: `$defs`, `$ref` and `oneOf` survive, but the
  top-level `type` is forced to `"object"` and **non-string entries in
  `required` are dropped**.
- Keep `required` a plain `[]string`. A schema loaded from JSON decodes it as
  `[]any`, which Anthropic discards — so the same tool means two different
  things on two providers.
- A tool with nil `Parameters` is legal on all four adapters.

</Caveats>

## Usage

<Recipe title="A typical tool">

```go verify
tool := skyl.Tool{
	Name: "get_weather",
	// State the trigger, and the anti-trigger. This is the single biggest
	// lever on whether the model calls it at the right moment.
	Description: "Get the current weather for a city. Call this whenever the user asks about weather, temperature, or conditions in a named place. Do not call it for forecasts beyond today.",
	Parameters: map[string]any{
		"type": "object",
		"properties": map[string]any{
			"city": map[string]any{
				"type":        "string",
				"description": "The city name, e.g. \"Kampala\". Do not include the country.",
			},
		},
		"required":             []string{"city"},
		"additionalProperties": false,
	},
}
```

</Recipe>

<Recipe title="Normalising a schema loaded from disk">

```go verify
// json.Unmarshal yields []any for required, which Anthropic silently drops.
if raw, ok := schema["required"].([]any); ok {
	req := make([]string, 0, len(raw))
	for _, v := range raw {
		if s, ok := v.(string); ok {
			req = append(req, s)
		}
	}
	schema["required"] = req
}
```

</Recipe>

<Recipe title="A tool with no parameters">

```go
skyl.Tool{Name: "get_time", Description: "Return the current UTC time."}
```

</Recipe>

## Troubleshooting

<Trouble problem="The model never calls my tool">

Almost always the description. "Gets weather data" gives the model nothing to
discriminate on. State when to reach for it, and when not to.

</Trouble>

<Trouble problem="Required arguments are enforced on OpenAI but not Anthropic">

Your `required` is `[]any` rather than `[]string`. Convert it, as above.

</Trouble>

<Trouble problem="The model keeps passing the wrong shape">

Check per-property `description` fields — they are part of the interface, not
documentation. If your schema uses `$ref`, verify it against Anthropic too,
since that adapter reconstructs rather than forwards.

</Trouble>
