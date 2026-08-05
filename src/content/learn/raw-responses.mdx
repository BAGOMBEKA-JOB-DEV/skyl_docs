---
title: Raw Responses
description: Always populated, on every adapter, on every call.
---

<Intro>

`Response.Raw` is the provider's untouched body. It is the read-side escape
hatch, and unlike most such affordances it carries an unconditional guarantee:
it is always there.

</Intro>

<YouWillLearn>

- What the guarantee actually covers
- The three things people most often read from it
- How streaming changes the picture
- When to drop the reference

</YouWillLearn>

## The guarantee

Every adapter populates `Raw` on every successful `Complete`. Not "usually", not
"unless the body was large" — always, and it is the bytes the provider sent
rather than a re-serialisation of skyl's view of them.

```go verify
var raw struct {
	SystemFingerprint string `json:"system_fingerprint"`
}
if err := json.Unmarshal(resp.Raw, &raw); err != nil {
	return err
}
```

Write a typed struct per provider. `Raw` is provider-specific by definition, so a
generic `map[string]any` usually costs you more than it saves.

## The three common reasons

**Reasoning content.** Every adapter drops it from `Response.Message`; it lives
here. See [Text and Tool Calls](/learn/text-and-tool-calls).

**Accurate Gemini token counts.** `thoughtsTokenCount` is excluded from the
output count, so `Usage.OutputTokens` genuinely under-reports what you are
billed:

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

**A feature newer than your skyl build.** This is what `Raw` is really for. A
field shipped last week is readable today, with no skyl release and no fork.

## Streaming

<Pitfall>

A `*Response` from `skyl.CollectStream` has **no `Raw`** — it is assembled from
events, not from one provider body.

During a stream, `StreamEvent.Raw` carries per-event payloads, but coverage
varies: Anthropic never populates it, the OpenAI-format adapters populate it on
text deltas only, Gemini on text and tool-call events. The terminal `EventDone`
never carries it on any adapter.

</Pitfall>

If you need raw fidelity *and* streaming, accumulate the frames:

```go verify
var frames []json.RawMessage
for stream.Next() {
	if ev := stream.Event(); len(ev.Raw) > 0 {
		frames = append(frames, ev.Raw)
	}
}
```

## Memory

`Raw` holds the whole body for the life of the response. For most callers that
is a few kilobytes and irrelevant. In a batch pipeline holding thousands of
responses, it is the heap:

```go verify
type result struct {
	Text  string
	Usage skyl.Usage
	// Deliberately not keeping Raw: at 10k responses it dominates.
}

func extract(resp *skyl.Response) result {
	return result{Text: resp.Text(), Usage: resp.Usage}
}
```

<DeepDive title="Why always, rather than behind an option?">

Because the moment you need `Raw` is the moment something has already gone
wrong — a field is missing, a count looks off, a provider shipped something new
— and that is exactly when you cannot go back and re-run the request with a flag
set.

An option would mean the data is absent precisely when it matters. The cost is a
few kilobytes per response; the benefit is that skyl's abstraction can never
trap you, which is one of the project's stated design principles rather than a
nice-to-have.

The **gateway** makes the opposite trade — `SKYL_INCLUDE_RAW` defaults to off —
because there the body crosses a network boundary and can echo request content
back to a caller who should not see it. Same data, different trust boundary,
different default.

</DeepDive>

## Errors carry a body too

`*skyl.Error` has a `Body` field holding the provider's error payload, truncated
at 2 KB. It is the same idea for the failure path:

```go verify
var e *skyl.Error
if errors.As(err, &e) {
	log.Printf("provider said: %s", e.Body)
}
```

Enough to diagnose, small enough not to bloat logs, and never containing
credentials.

<Recap>

- `Raw` is populated on **every** adapter, on **every** successful call.
- Use a typed struct per provider rather than a generic map.
- The three common reasons: reasoning content, Gemini token counts, brand-new features.
- `CollectStream` produces no `Raw`; `StreamEvent.Raw` coverage varies by adapter.
- Drop the reference if you hold thousands of responses.
- The gateway omits it by default, because there it crosses a trust boundary.

</Recap>

<Challenges>

<Challenge title="Extract a field without coupling to one provider">

Read a field that exists on two providers under different names, and report
cleanly when neither has it.

<Hint>

Try each shape in turn. "Absent" is a normal answer, not an error.

</Hint>

<Solution>

```go verify
// Fingerprint identifies the exact serving configuration. OpenAI calls it
// system_fingerprint; Gemini exposes modelVersion. Neither is guaranteed.
func fingerprint(resp *skyl.Response) (string, bool) {
	var oai struct {
		SystemFingerprint string `json:"system_fingerprint"`
	}
	if err := json.Unmarshal(resp.Raw, &oai); err == nil && oai.SystemFingerprint != "" {
		return oai.SystemFingerprint, true
	}

	var gem struct {
		ModelVersion string `json:"modelVersion"`
	}
	if err := json.Unmarshal(resp.Raw, &gem); err == nil && gem.ModelVersion != "" {
		return gem.ModelVersion, true
	}
	return "", false
}
```

The boolean is the important part. Returning `""` alone would make "this
provider does not report it" indistinguishable from "it reported an empty
string", and cross-provider code would report phantom problems.

</Solution>

</Challenge>

</Challenges>
