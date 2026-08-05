---
title: The fourteen things skyl silently ignores
description: Every place the library accepts something and then does not do it — with the workaround for each.
date: '2026-08-05'
author: skyl maintainers
---

<Intro>

A library that rejects your input costs you a minute. A library that *accepts*
your input and then quietly does not act on it costs you an afternoon — because
the request succeeds, and the only symptom is a model behaving oddly. skyl has
fourteen of those. Here they are.

</Intro>

## Why publish this at all

The obvious move is to fix them and say nothing. Most of them *have* been fixed:
`provider/anthropic` once ignored `ProviderOptions` entirely, leaving
`cache_control`, `top_k` and every beta feature unreachable with no workaround.
It once rebuilt tool schemas lossily enough to produce dangling `$ref`s on one
provider while the same `skyl.Tool` arrived intact on another.

What remains is genuinely hard to fix — mostly because a provider's wire format
has no field for the thing.

So the choice is between a matrix that lists only the green cells, and one with
a column for this. skyl's own design principles reject the first:

> Publishing the gaps is the point. It is better to say "we don't support this"
> than to ship something that looks supported and quietly does the wrong thing.

A gap you know about costs you minutes. A gap you do not costs you a day.

## The list

<SilentlyIgnoredList />

## The three that will actually bite you

**`ToolResult.IsError` on Gemini.** The flag never reaches the wire, so a failed
tool is indistinguishable from a successful one that happened to return that
text. A model that thinks a tool succeeded will confidently build an answer on
nothing. The fix is to put the failure in the *content*, where every provider
carries it faithfully:

```go
skyl.ToolErrorMessage(call.ID,
	"ERROR: get_weather is unavailable (HTTP 503). Do not call it again in this "+
		"conversation. Tell the user live weather data is unavailable.")
```

That text does three things the boolean cannot: names the tool, says what to do
next, and works everywhere.

**`&Thinking{Enabled: false}` on OpenAI.** It does nothing. If you are turning
reasoning off to control cost, it will not work there — the adapter ignores
`Thinking` unless both `Enabled` and `Effort` are set, and an explicit "off" has
no wire representation. Send `reasoning_effort` through `ProviderOptions`
instead.

**The shallow `ProviderOptions` merge.** On `openai`, `openaicompat` and
`gemini`, setting a nested object replaces the *whole object*:

```go
// This destroys maxOutputTokens, temperature, topP, stopSequences AND
// thinkingConfig, because it replaces the entire generationConfig.
ProviderOptions: map[string]any{
	"generationConfig": map[string]any{"seed": 7},
}
```

You have to restate every sibling key skyl would have set. Anthropic is the
exception: it applies options by JSON path, so `"thinking.budget_tokens": 4096`
sets one nested field without disturbing its neighbours.

## How to defend against them

The general shape is to make the ambiguous value **unconstructable at your own
boundary**. `Image` takes exactly one of `Data` or `URL`, and setting both
silently drops one — so do not expose a struct literal:

```go
func imageFromData(mediaType string, data []byte) skyl.Part {
	return skyl.Image{MediaType: mediaType, Data: data}
}
func imageFromURL(url string) skyl.Part { return skyl.Image{URL: url} }
```

Neither function can produce the ambiguous case, so it cannot arise in your
codebase.

## One that looks like a bug and is not

Unparseable SSE frames are **skipped rather than treated as fatal**. Providers
interleave keep-alives and vendor-specific records, and failing an entire stream
over one unrecognised line would make skyl brittle against every provider's next
feature.

That is a design decision, and the one place skyl chooses tolerance over
strictness.

## Keeping this honest

The [feature matrix](/reference/provider/feature-matrix) was written by reading
the adapters, and it is accurate as of the commit that added it. **If you find a
cell that no longer matches the code, that is a bug — please report it.** Making
drift somebody's problem is the only way it gets fixed.
