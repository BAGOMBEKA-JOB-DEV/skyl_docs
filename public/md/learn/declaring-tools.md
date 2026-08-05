---
title: Declaring Tools
description: Three fields, and why the description matters more than you think.
---

<Intro>

A `skyl.Tool` is three fields. Two are obvious and one is the single biggest
lever on whether the model calls your tool at the right time.

</Intro>

<YouWillLearn>

- The three fields and what each is for
- Why the description should state *when* to call, not only what it does
- What `Validate` checks
- How many tools is too many

</YouWillLearn>

## The type

```go
type Tool struct {
	Name        string
	Description string
	Parameters  map[string]any   // a JSON Schema object
}
```

## Name

The identifier the model uses. `Validate` rejects an empty one with
`ErrBadRequest`; everything else is passed through.

Keep it stable — it appears in `ToolCall.Name` and, on Gemini, in
`ToolCall.ID` as well, since Gemini issues no call IDs.

## Description: state the trigger

This is where most tool-calling problems actually live.

```go
// Weak: describes the tool.
Description: "Gets weather data."

// Strong: describes when to reach for it.
Description: "Get the current weather for a city. Call this whenever the user asks about weather, temperature, rain, or conditions in a named place. Do not call it for historical weather or forecasts beyond today."
```

<DeepDive title="Why trigger conditions measurably improve selection">

The model is choosing between your tools and answering directly, on every turn.
A description that says only *what* the tool does gives it nothing to
discriminate on — so it guesses, and the failure modes are both directions: a
tool that never fires, and a tool that fires on every vaguely related question.

Stating the trigger — and, just as usefully, the *anti*-trigger — turns that
guess into a match. "Do not call it for forecasts" removes a whole class of
wrong calls that no amount of describing the tool would have prevented.

This is prompt engineering, and skyl does not do it for you. But it is the field
where effort pays best.

</DeepDive>

## Parameters: a JSON Schema

```go
Parameters: map[string]any{
	"type": "object",
	"properties": map[string]any{
		"city": map[string]any{
			"type":        "string",
			"description": "The city name, e.g. \"Kampala\".",
		},
		"units": map[string]any{
			"type": "string",
			"enum": []string{"celsius", "fahrenheit"},
		},
	},
	"required": []string{"city"},
}
```

Per-property `description` fields matter as much as the tool's own — they are
how the model knows what format `city` expects.

<Pitfall>

Keep `required` a plain `[]string`. On Anthropic, non-string entries are
silently dropped, so a schema loaded from JSON — where it decodes as `[]any` —
loses its required-argument constraints on that provider and keeps them
everywhere else.

If your schemas come from a file, convert them:

```go verify
func toStrings(v any) []string {
	raw, ok := v.([]any)
	if !ok {
		return nil
	}
	out := make([]string, 0, len(raw))
	for _, item := range raw {
		if s, ok := item.(string); ok {
			out = append(out, s)
		}
	}
	return out
}
```

</Pitfall>

A tool with no parameters is legal — `Parameters` may be nil — and all four
adapters handle it. On Anthropic that required a specific fix, because the SDK's
schema struct drops itself when every field is zero and the API rejects a tool
without a schema.

## What Validate checks

Only that every tool has a name. skyl does **not** validate the schema itself:

<DeepDive title="Why not validate the JSON Schema?">

Because JSON Schema is large, versioned, and providers accept different subsets
of it. A validator strict enough to be useful would reject schemas that a
provider happily accepts — the same failure mode as a curated model list.

Instead, an invalid schema comes back as that provider's own 400, which is more
specific than anything skyl could say. The cost is a round trip.

</DeepDive>

## How many tools

There is no skyl limit. Providers have their own, and more importantly the model
gets worse at choosing as the list grows — every tool is tokens in every
request, and every tool is another option to discriminate between.

If you have more than a dozen, consider a router: one call that picks a
*category*, then a second with only that category's tools.

<Recap>

- Three fields: `Name`, `Description`, `Parameters`.
- The description should state **when** to call and when not to — it is the biggest lever.
- Per-property descriptions matter as much as the tool's own.
- Keep `required` a plain `[]string`; Anthropic drops non-string entries silently.
- Tools with no parameters are legal on all four adapters.
- `Validate` checks only that a name is present; schema errors cost a round trip.

</Recap>

<Challenges>

<Challenge title="Build a schema from a Go struct">

Writing `map[string]any` by hand is tedious and drifts from the struct you
unmarshal into. Generate it.

<Hint>

Reflection over struct tags is enough for the common case. The important part is
that the schema and the target type cannot disagree.

</Hint>

<Solution>

```go verify
// Minimal, but the point stands: one source of truth for the shape.
func schemaFor(v any) map[string]any {
	t := reflect.TypeOf(v)
	props := map[string]any{}
	var required []string

	for i := 0; i < t.NumField(); i++ {
		f := t.Field(i)
		name, _, _ := strings.Cut(f.Tag.Get("json"), ",")
		if name == "" || name == "-" {
			continue
		}
		prop := map[string]any{"type": jsonType(f.Type)}
		if d := f.Tag.Get("desc"); d != "" {
			prop["description"] = d
		}
		props[name] = prop
		if !strings.Contains(f.Tag.Get("json"), "omitempty") {
			required = append(required, name)  // []string, as Anthropic needs
		}
	}
	return map[string]any{"type": "object", "properties": props, "required": required}
}
```

Now `schemaFor(WeatherArgs{})` and `json.Unmarshal(call.Arguments, &args)` can
never disagree — which removes the most common tool bug, where the schema says
`city` and the struct expects `location`.

</Solution>

</Challenge>

</Challenges>
