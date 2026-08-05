---
title: Token Usage and Caching
description: Why cached tokens are a breakdown of your input, not an addition to it.
---

<Intro>

Providers disagree about whether cached tokens are part of the prompt count.
Summing the fields blindly over-reports on some providers and under-reports on
others — so skyl normalises to one rule that every adapter obeys. This page is
that rule.

</Intro>

<YouWillLearn>

- The inclusion rule, and why it exists
- What each provider reports on the wire, before normalisation
- How to accumulate usage across a conversation
- Which token counts skyl cannot give you

</YouWillLearn>

## The rule

<Fields of="usage" />

Stated once, plainly:

- **`InputTokens` is the total input, cached tokens included.** It is what you
  are billed for.
- **`CacheReadTokens` and `CacheWriteTokens` are a breakdown OF `InputTokens`**,
  not an addition to it. `CacheReadTokens` is how much of your bill was
  discounted.

Therefore:

```go
func (u Usage) TotalTokens() int {
	return u.InputTokens + u.OutputTokens   // cache is NOT added again
}
```

## Why this needed normalising

<DeepDive title="What each provider actually sends">

**OpenAI and Gemini** report a cache figure that is a *subset* of the prompt
count. Their `prompt_tokens` already includes the cached tokens.

**Anthropic** reports cache figures that are *disjoint* from its input count.
Its `input_tokens` excludes them entirely.

So before normalisation, the same cached conversation reported a different
billable input depending on which provider served it. Naively adding
`InputTokens + CacheReadTokens` over-reported on OpenAI and Gemini by the size
of the cache, while `InputTokens` alone under-reported on Anthropic by the same
amount.

The adapters now converge: Anthropic's adapter adds the cache figures **in**,
the others copy the prompt count as-is. One rule, four adapters.

</DeepDive>

<Pitfall>

If you were computing `InputTokens + CacheReadTokens` yourself — a reasonable
thing to have done against an earlier build, or against a vendor SDK — **drop
the addition**. You are now double-counting.

</Pitfall>

## Accumulating

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

fmt.Printf("%d in / %d out / %d total\n",
	total.InputTokens, total.OutputTokens, total.TotalTokens())
fmt.Printf("%d of the input was served from cache\n", total.CacheReadTokens)
```

`Add` sums all four fields, so the inclusion rule survives accumulation.

## Zero means "not reported"

<Pitfall>

A zero is not a claim that zero tokens were used. It means the provider did not
report that field.

`CacheWriteTokens` is zero on OpenAI, Gemini and openaicompat **always** —
their wire formats have no such field. Only Anthropic reports it. Treating that
zero as "no cache writes happened" will make an Anthropic-vs-OpenAI cost
comparison wrong.

</Pitfall>

## Streaming usage

Usage arrives on the terminal `EventDone`:

```go verify
for stream.Next() {
	if ev := stream.Event(); ev.Type == skyl.EventDone && ev.Usage != nil {
		total = total.Add(*ev.Usage)
	}
}
```

<Pitfall>

On OpenAI and openaicompat, streaming usage requires the host to honour
`stream_options.include_usage`. Many compatible hosts do not, and you get
**zero** — silently. If your cost reporting is correct in non-streaming mode and
zero in streaming mode, this is why.

</Pitfall>

For a stream the caller abandoned, the `stream_end` hook still fires with
whatever usage arrived — usually nothing. Those tokens were generated and billed
regardless, so reporting nothing would make that spend invisible. See
[Hooks](/learn/hooks).

## What skyl cannot tell you

**Reasoning-token counts are not surfaced.** They sit inside `OutputTokens` on
Anthropic and the OpenAI family.

On **Gemini** it is worse: `thoughtsTokenCount` is excluded from
`candidatesTokenCount`, so `OutputTokens` genuinely **under-reports what you are
billed**. If you run reasoning models on Gemini and need accurate cost, read the
counter from `Response.Raw`:

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

<Recap>

- `InputTokens` **includes** cached tokens; the cache fields break it down.
- `TotalTokens()` is input plus output — never add the cache figures again.
- Providers disagree on the wire; the adapters normalise so you do not have to.
- Zero means "not reported". `CacheWriteTokens` is Anthropic-only.
- Streaming usage on OpenAI needs the host to honour `stream_options.include_usage`.
- Reasoning tokens are not surfaced, and on Gemini `OutputTokens` under-reports.

</Recap>

<Challenges>

<Challenge title="Compute a cache hit rate">

Report what fraction of your input tokens were served from cache, across a run.

<Hint>

The inclusion rule makes this simpler than it looks — no subtraction needed.

</Hint>

<Solution>

```go verify
func cacheRate(u skyl.Usage) float64 {
	if u.InputTokens == 0 {
		return 0
	}
	// CacheReadTokens is part of InputTokens, so this is a direct ratio.
	return float64(u.CacheReadTokens) / float64(u.InputTokens)
}
```

If the inclusion rule were the other way round, this would be
`CacheRead / (Input + CacheRead)` — and you would have to know which provider
served it to get it right. That is exactly the difference normalisation buys.

</Solution>

</Challenge>

<Challenge title="Detect silently missing streaming usage">

Warn when a streaming call reports zero usage, so a compatible host that ignores
`include_usage` does not quietly zero your cost report.

<Hint>

A completed stream that produced text but reports zero input tokens is
suspicious.

</Hint>

<Solution>

```go verify
skyl.WithHook(func(_ context.Context, ev skyl.HookEvent) {
	if ev.Operation == skyl.OpStreamEnd && ev.Completed && ev.Usage.InputTokens == 0 {
		log.Printf("warning: %s reported no usage for a completed stream; "+
			"the host may not honour stream_options.include_usage", ev.Provider)
	}
})
```

Gating on `ev.Completed` avoids a false warning for streams the caller
abandoned, where zero usage is expected.

</Solution>

</Challenge>

</Challenges>
