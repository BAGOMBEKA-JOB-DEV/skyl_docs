---
title: Silently ignored
description: Every case where skyl accepts something and does not do it.
---

<Intro>

These are the failures that cost you an afternoon: skyl accepts a field, the
request succeeds, and the thing you asked for simply did not happen. All
fourteen are listed here with a workaround, because a gap you know about costs
minutes and a gap you do not costs a day.

</Intro>

## Why this page exists

<DeepDive title="Publishing the gaps rather than the green cells">

skyl's third design principle is **honesty over coverage**: it is better to say
"we don't support this" than to ship something that looks supported and quietly
does the wrong thing.

A silent drop is the worst failure mode this library has, because it is
indistinguishable from a model behaving oddly. A dropped image looks like a
model that ignored your question. A dropped `IsError` flag looks like a model
that confidently built on bad data. You will suspect your prompt long before you
suspect the transport.

Most of these have been closed over time — `provider/anthropic` once ignored
`ProviderOptions` entirely, and once rebuilt tool schemas lossily enough to
produce dangling `$ref`s. What remains is listed here rather than hidden.

</DeepDive>

## The fourteen

<SilentlyIgnoredList />

## Defending against them

The general shape is to **make the ambiguous value unconstructable** at your own
boundary.

<Recipe title="Images: two constructors instead of one struct">

```go verify
func imageFromData(mediaType string, data []byte) skyl.Part {
	return skyl.Image{MediaType: mediaType, Data: data}
}
func imageFromURL(url string) skyl.Part { return skyl.Image{URL: url} }
```

Neither can produce the both-set case that gets dropped.

</Recipe>

<Recipe title="Tool schemas: normalise required on the way in">

```go verify
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

<Recipe title="Tool errors: put the failure in the text">

```go verify
// The prose reaches the model on all four adapters. The flag does not.
skyl.ToolErrorMessage(call.ID,
	fmt.Sprintf("ERROR: %s failed: %v. Do not retry.", call.Name, err))
```

</Recipe>

<Recipe title="ProviderOptions: restate every sibling key">

```go verify
gen := map[string]any{"seed": 7}
if req.MaxTokens > 0 {
	gen["maxOutputTokens"] = req.MaxTokens // or the shallow merge drops it
}
if req.Temperature != nil {
	gen["temperature"] = *req.Temperature
}
req.ProviderOptions = map[string]any{"generationConfig": gen}
```

</Recipe>

## Deliberately not silent

One behaviour looks like this list and is not: **unparseable SSE frames are
skipped rather than treated as fatal**. Providers interleave keep-alives and
vendor-specific records, and failing a whole stream over one unrecognised line
would make skyl brittle against every provider's next feature.

That is a design decision, not an oversight — and the one place skyl chooses
tolerance over strictness.

<Unvalidated />
