---
title: Tool Schemas
description: Three adapters pass your schema through verbatim. One rebuilds it.
---

<Intro>

`Tool.Parameters` is a JSON Schema object. Whether it arrives at the provider
intact depends on which adapter you are using — and the differences are small
but sharp.

</Intro>

<YouWillLearn>

- Which adapters pass schemas through verbatim
- The two things Anthropic's reconstruction drops
- Why `$ref` and `$defs` survive today but did not always
- How to keep one schema working on all four

</YouWillLearn>

## Verbatim: openai, openaicompat, gemini

Your `Parameters` map is serialised and sent as-is. `$defs`, `$ref`, `oneOf`,
`allOf`, `additionalProperties`, custom keywords — everything survives.

## Reconstructed: anthropic

The Anthropic adapter builds a **typed SDK params struct**, so the schema is
read into `properties` and `required` and every other key is re-attached
afterwards. `$defs`, `$ref`, `oneOf` and the rest do survive.

Two things do not:

<Pitfall>

**The top-level `type` is dropped and forced to `"object"`.** A schema whose root
type is anything else is silently coerced. In practice tool parameters are
essentially always objects, so this rarely bites — but if it does, it bites
silently.

**Non-string entries in `required` are dropped.** A schema loaded from JSON
decodes `required` as `[]any`, and those entries are discarded. The same
`skyl.Tool` then means two different things depending on the provider: full
constraints on OpenAI, none on Anthropic.

</Pitfall>

## A history worth knowing

<DeepDive title="What the Anthropic adapter used to do">

It kept only `properties` and `required`, and dropped everything else. `$defs`,
`$ref`, `oneOf` and `additionalProperties` were all lost — so a schema generated
from a Go struct or an OpenAPI document reached Anthropic with **dangling
references** while reaching OpenAI intact.

That is a particularly nasty class of bug, because the schema is still valid
JSON and the request still succeeds. You just get a model that cannot see half
the constraints, on one provider, and the symptom is "the model keeps passing
the wrong shape" rather than an error.

It was found and fixed before the first release. The two remaining gaps above
are what is left, and they are documented rather than hidden — which is the
difference between a known limitation and a trap.

</DeepDive>

## Writing a portable schema

Four rules cover every difference:

**1. Make the root an object.** It is what every provider expects anyway.

```go
"type": "object"
```

**2. Keep `required` a `[]string`.**

```go
"required": []string{"city"},   // not []any
```

**3. Prefer inline definitions to `$ref` where practical.** They survive
everywhere, and they are easier to read in a request log when something goes
wrong.

**4. Describe every property.** The model reads those descriptions; they are
part of the interface, not documentation.

```go
Parameters: map[string]any{
	"type": "object",
	"properties": map[string]any{
		"city": map[string]any{
			"type":        "string",
			"description": "The city name, e.g. \"Kampala\". Do not include the country.",
		},
		"units": map[string]any{
			"type":        "string",
			"enum":        []string{"celsius", "fahrenheit"},
			"description": "Defaults to celsius when omitted.",
		},
	},
	"required":             []string{"city"},
	"additionalProperties": false,
}
```

## Loading from a file

If your schemas live on disk, normalise `required` on the way in:

```go verify
func loadSchema(path string) (map[string]any, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var schema map[string]any
	if err := json.Unmarshal(data, &schema); err != nil {
		return nil, err
	}

	// json.Unmarshal produces []any, which Anthropic silently discards.
	// Convert it here so one schema behaves identically on all four adapters.
	if raw, ok := schema["required"].([]any); ok {
		req := make([]string, 0, len(raw))
		for _, v := range raw {
			if s, ok := v.(string); ok {
				req = append(req, s)
			}
		}
		schema["required"] = req
	}
	return schema, nil
}
```

## Validation happens at the provider

skyl does not validate your schema. An invalid one comes back as that provider's
own 400, classified as `ErrBadRequest` — which is more specific than anything
skyl could say, at the cost of a round trip. Test your schemas against the
sandbox, which will accept them, and then once against the real provider.

<Recap>

- `openai`, `openaicompat` and `gemini` send your schema **verbatim**.
- `anthropic` reconstructs it; `$defs`, `$ref` and `oneOf` survive, two things do not.
- Anthropic forces the root `type` to `"object"` and drops non-string `required` entries.
- Normalise `required` to `[]string` when loading a schema from JSON.
- Describe every property — the model reads those descriptions.
- skyl validates nothing; an invalid schema is the provider's 400.

</Recap>

<Challenges>

<Challenge title="Find the portability bug">

This schema works on OpenAI and loses a constraint on Anthropic. Which one, and
why?

```go
var schema map[string]any
json.Unmarshal([]byte(`{
  "type": "object",
  "properties": {"city": {"type": "string"}, "units": {"type": "string"}},
  "required": ["city", "units"]
}`), &schema)
```

<Hint>

Think about what `encoding/json` produces for a JSON array of strings decoded
into `any`.

</Hint>

<Solution>

`json.Unmarshal` into `map[string]any` decodes `["city", "units"]` as `[]any`,
not `[]string`. The Anthropic adapter reads `required` as a list of strings and
**discards non-string entries** — and every entry here is an `any` holding a
string, not a `string`.

So on Anthropic both arguments become optional, and the model will happily omit
`city`. On OpenAI they stay required. Same `skyl.Tool`, two behaviours.

Fix it at the boundary, as in `loadSchema` above. Or, better, do not round-trip
schemas through `any` at all — build them in Go where the types are what you
wrote.

</Solution>

</Challenge>

</Challenges>
