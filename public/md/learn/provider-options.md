---
title: Provider Options
description: The merge is shallow on three of four adapters, and that will bite you.
---

<Intro>

`Request.ProviderOptions` sends arbitrary vendor-specific fields, overriding
anything skyl set. It reaches the wire on all four adapters — but by **two
different mechanisms**, and the difference is the single most important thing on
this page.

</Intro>

<YouWillLearn>

- How to send a field skyl does not model
- Why the shallow merge destroys sibling keys
- Why Anthropic works differently, and what that enables
- What `ProviderOptions` cannot do

</YouWillLearn>

## The simple case

```go verify
req.ProviderOptions = map[string]any{
	"top_k":            40,
	"presence_penalty": 0.4,
	"seed":             7,
}
```

Top-level keys, merged over the payload skyl built. skyl does not validate the
contents — that is the point.

## The shallow merge

<Pitfall>

On **openai**, **openaicompat** and **gemini**, `ProviderOptions` is a
**shallow top-level merge**. Setting a nested object replaces the *whole
object*.

```go
// DON'T: this destroys maxOutputTokens, temperature, topP, stopSequences
// AND thinkingConfig, because it replaces the entire generationConfig.
ProviderOptions: map[string]any{
	"generationConfig": map[string]any{"seed": 7},
}
```

You must restate every sibling key skyl would have set:

```go
ProviderOptions: map[string]any{
	"generationConfig": map[string]any{
		"seed":            7,
		"maxOutputTokens": req.MaxTokens,   // restate what skyl would have set
		"temperature":     *req.Temperature,
		"stopSequences":   req.Stop,
	},
}
```

The same trap applies to `messages`, `tools` and `stream_options` on OpenAI.

</Pitfall>

This is entry 14 in the
[silently ignored list](/reference/provider/silently-ignored), and it is the one
most likely to look like it worked — the request succeeds, it just quietly has
no token cap.

## Anthropic uses JSON paths

```go
// Anthropic only: sets one nested field without disturbing its siblings.
ProviderOptions: map[string]any{
	"thinking.budget_tokens": 4096,
	"system.0.cache_control": map[string]any{"type": "ephemeral"},
}
```

<DeepDive title="Why the two mechanisms differ">

It is a consequence of how each adapter is built rather than a design choice
anyone would make deliberately.

The OpenAI-format and Gemini adapters construct a `map[string]any` payload and
serialise it, so merging another map over it is natural — and shallow, because
that is what map assignment does.

The Anthropic adapter builds a **typed SDK params struct**. There is no map to
merge into. So options are applied to the *encoded body* by JSON path, which
turns out to be strictly more capable.

The cost of that capability is a sharp edge: on Anthropic, a top-level key that
happens to contain a `.` is interpreted as a path. That is the only place in
skyl where a key's spelling changes its meaning.

Before this was implemented, `provider/anthropic` **silently ignored
`ProviderOptions` entirely** — in violation of the rule that every adapter must
honour it — leaving `cache_control`, `top_k` and every beta feature unreachable
on Anthropic with no workaround at all. The shared contract suite now asserts
that every adapter honours it, so the rule cannot be met by one adapter and
quietly missed by another.

</DeepDive>

## What it cannot do

<Pitfall>

**`ProviderOptions` never sets HTTP headers**, on any adapter. Headers are fixed
at construction, through each adapter's `WithHeader`-style option:

```go verify
p := anthropic.New(key, anthropic.WithHeader("anthropic-beta", "some-feature-2026-01-01"))
```

If you are trying to enable a beta feature via a header, that is the option you
want, not `ProviderOptions`.

</Pitfall>

## Common uses

<DataTable
  headers={['Goal', 'Provider', 'Option']}
  rows={[
    ['Prompt caching', 'anthropic', <code key="a">{'"system.0.cache_control": {…}'}</code>],
    ['A thinking token budget', 'anthropic', <code key="b">&quot;thinking.budget_tokens&quot;: 4096</code>],
    ['Turn reasoning off', 'openai', <code key="c">&quot;reasoning_effort&quot;: &quot;minimal&quot;</code>],
    ['Native structured output', 'openai', <code key="d">{'"response_format": {…}'}</code>],
    ['Native structured output', 'gemini', <span key="e">the whole <code>generationConfig</code>, restated</span>],
    ['top_k', 'all', <code key="f">&quot;top_k&quot;: 40</code>],
  ]}
/>

## Keeping it safe

Because your keys override skyl's, a stray option can silently disable something
you rely on. Set them in one place:

```go verify
// Options are provider-specific by definition, so branch once, centrally,
// rather than sprinkling map literals through your call sites.
func withCaching(req *skyl.Request, provider string) {
	if provider != "anthropic" {
		return // no portable equivalent; do not pretend otherwise
	}
	if req.ProviderOptions == nil {
		req.ProviderOptions = map[string]any{}
	}
	req.ProviderOptions["system.0.cache_control"] = map[string]any{"type": "ephemeral"}
}
```

<Recap>

- `ProviderOptions` sends anything skyl does not model, overriding what skyl set.
- On **openai, openaicompat and gemini** the merge is **shallow** — nested objects are replaced wholesale.
- Restate every sibling key, or you silently lose `maxOutputTokens`, `temperature` and the rest.
- **Anthropic applies options by JSON path**, so nested fields can be set surgically.
- On Anthropic, a top-level key containing a `.` is treated as a path.
- It **never** sets headers — use the adapter's `WithHeader` option for those.

</Recap>

<Challenges>

<Challenge title="Set a Gemini seed without breaking the request">

Add `seed: 7` to a Gemini request that already sets `MaxTokens`, `Temperature`
and `Stop`, without losing any of them.

<Hint>

The shallow merge replaces `generationConfig` entirely. Rebuild it.

</Hint>

<Solution>

```go verify
gen := map[string]any{"seed": 7}

// Restate everything skyl would have put in generationConfig, or the merge
// silently drops it.
if req.MaxTokens > 0 {
	gen["maxOutputTokens"] = req.MaxTokens
}
if req.Temperature != nil {
	gen["temperature"] = *req.Temperature
}
if req.TopP != nil {
	gen["topP"] = *req.TopP
}
if len(req.Stop) > 0 {
	gen["stopSequences"] = req.Stop
}

req.ProviderOptions = map[string]any{"generationConfig": gen}
```

Note this has to be built *after* the rest of the request, and has to be kept in
sync if you later add a field. That fragility is exactly why the shallow merge
is on the silently-ignored list rather than being described as a feature.

</Solution>

</Challenge>

<Challenge title="Detect an accidental override">

Write a check that warns when a `ProviderOptions` key would override something
skyl set.

<Hint>

You know which top-level keys each adapter produces. A small allow-list is
enough.

</Hint>

<Solution>

```go verify
// Keys skyl itself sets on the OpenAI-format payload. Overriding one of these
// is legal — but it is almost never what someone meant to do.
var oaiManaged = map[string]bool{
	"model": true, "messages": true, "max_completion_tokens": true,
	"temperature": true, "top_p": true, "stop": true,
	"tools": true, "tool_choice": true, "stream_options": true,
}

func warnOverrides(opts map[string]any) {
	for k := range opts {
		if oaiManaged[k] {
			log.Printf("warning: ProviderOptions[%q] overrides a field skyl manages", k)
		}
	}
}
```

The `tools` and `messages` entries are the important ones: overriding either
replaces your entire conversation or tool set with whatever you put in the map,
and the request will still succeed.

</Solution>

</Challenge>

</Challenges>
