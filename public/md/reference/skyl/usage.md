---
title: Usage
description: Token consumption, with cached tokens as a breakdown of input.
---

<Intro>

`Usage` reports what a request cost. Its inclusion semantics are normalised
across providers, which is the single most important thing on this page.

</Intro>

## Reference

<Signature>{`type Usage struct {
	InputTokens      int
	OutputTokens     int
	CacheReadTokens  int
	CacheWriteTokens int
}`}</Signature>

<Fields of="usage" />

### Methods

<Signature>{`func (u Usage) TotalTokens() int   // InputTokens + OutputTokens
func (u Usage) Add(other Usage) Usage`}</Signature>

<Caveats>

- **`InputTokens` is the total input, cached tokens included.** The cache fields
  are a **breakdown of** it, never an addition — so `TotalTokens()` deliberately
  does not add them again.
- **Zero means "not reported"**, not "zero tokens".
- **`CacheWriteTokens` is Anthropic-only.** The other wire formats have no such
  field, so it is always zero elsewhere.
- **Reasoning tokens are not surfaced.** They sit inside `OutputTokens` — except
  on Gemini, where `thoughtsTokenCount` is excluded from the output count, so
  `OutputTokens` genuinely **under-reports what you are billed**.
- On OpenAI and openaicompat, streaming usage requires the host to honour
  `stream_options.include_usage`; many compatible hosts do not, and report zero
  silently.

</Caveats>

## Why this needed normalising

<DeepDive title="What each provider sends before the adapters converge">

**OpenAI and Gemini** report a cache figure that is a *subset* of the prompt
count — their `prompt_tokens` already includes it.

**Anthropic** reports cache figures *disjoint* from its input count; its
`input_tokens` excludes them.

So the same cached conversation reported a different billable input depending on
who served it. Adding `InputTokens + CacheReadTokens` over-reported on two
providers, and `InputTokens` alone under-reported on the third.

The adapters now converge on one rule: Anthropic's adds the cache figures in,
the others copy the prompt count. If you were computing
`InputTokens + CacheReadTokens` yourself against an older build, **drop the
addition** — you are now double-counting.

</DeepDive>

## Usage

<Recipe title="Reporting a call's cost">

```go verify
fmt.Printf("%d in / %d out / %d total\n",
	resp.Usage.InputTokens, resp.Usage.OutputTokens, resp.Usage.TotalTokens())
```

</Recipe>

<Recipe title="Accumulating across a conversation">

```go verify
var total skyl.Usage
for {
	resp, err := client.Complete(ctx, req)
	if err != nil {
		return err
	}
	total = total.Add(resp.Usage)
	// …
}
```

</Recipe>

<Recipe title="Cache hit rate">

```go verify
func cacheRate(u skyl.Usage) float64 {
	if u.InputTokens == 0 {
		return 0
	}
	// A direct ratio, because CacheReadTokens is part of InputTokens.
	return float64(u.CacheReadTokens) / float64(u.InputTokens)
}
```

</Recipe>

<Recipe title="Accurate Gemini output counts">

```go verify
var raw struct {
	UsageMetadata struct {
		ThoughtsTokenCount int `json:"thoughtsTokenCount"`
	} `json:"usageMetadata"`
}
if err := json.Unmarshal(resp.Raw, &raw); err == nil {
	billed := resp.Usage.OutputTokens + raw.UsageMetadata.ThoughtsTokenCount
	_ = billed
}
```

</Recipe>

## Troubleshooting

<Trouble problem="My totals are higher than the provider's invoice">

You are probably adding the cache figures to `InputTokens`. They are already
inside it. `TotalTokens()` is input plus output, full stop.

</Trouble>

<Trouble problem="CacheWriteTokens is always zero">

You are not on Anthropic. No other wire format reports it. Treat the zero as
"not reported".

</Trouble>

<Trouble problem="Streaming reports zero tokens">

On OpenAI-family hosts, usage on the terminal event requires
`stream_options.include_usage` to be honoured. Many compatible hosts ignore it.

</Trouble>

<Trouble problem="Gemini output counts look too low">

They are. `thoughtsTokenCount` is excluded from `candidatesTokenCount`, so
reasoning tokens are billed but not counted in `OutputTokens`. Read the counter
from `Raw`.

</Trouble>
