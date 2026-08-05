---
title: Reading Raw Provider JSON
description: The escape hatch that means nothing a provider sends is ever lost.
---

<Intro>

`Response.Raw` is the provider's untouched response body. It is populated on
every adapter, on every successful call, without exception — so skyl's
abstraction can be incomplete without ever being a wall.

</Intro>

<YouWillLearn>

- What `Raw` contains and when it is present
- How to read a field skyl does not model
- The three things you will most often want from it
- Why streaming is different

</YouWillLearn>

## The guarantee

```go
Raw json.RawMessage
```

Every adapter sets it. It is the bytes the provider sent, unparsed and
unmodified — not a re-serialisation of skyl's view of them.

```go verify
var full map[string]any
if err := json.Unmarshal(resp.Raw, &full); err != nil {
	return err
}
fmt.Printf("%#v\n", full)
```

In practice you want a typed struct for the provider you are on, because `Raw`
is provider-specific by definition:

```go verify
// OpenAI: read the system fingerprint, which skyl does not model.
var raw struct {
	SystemFingerprint string `json:"system_fingerprint"`
	Choices           []struct {
		LogProbs json.RawMessage `json:"logprobs"`
	} `json:"choices"`
}
if err := json.Unmarshal(resp.Raw, &raw); err != nil {
	return err
}
```

## The three common reasons

**Reasoning content.** Every adapter drops it from `Response.Message`; it stays
here. See [Text and Tool Calls](/learn/text-and-tool-calls).

**Accurate token counts on Gemini.** `thoughtsTokenCount` is excluded from the
output count, so `Usage.OutputTokens` under-reports what you are billed:

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

**A provider feature newer than your skyl build.** This is the case `Raw` exists
for. A field shipped last week is readable today, with no skyl release.

## Detecting a stop sequence

Because `StopStopSequence` only ever comes from Anthropic, this is a `Raw` job
on the other providers:

```go verify
// Anthropic tells you which sequence fired.
var raw struct {
	StopSequence string `json:"stop_sequence"`
}
_ = json.Unmarshal(resp.Raw, &raw)
```

## Streaming

<Pitfall>

A `*Response` from `skyl.CollectStream` has **no `Raw`** — it is assembled from
events, not from one provider body.

During a stream, `StreamEvent.Raw` carries per-event payloads, but coverage
varies: Anthropic never populates it, the OpenAI-format adapters populate it on
text deltas only, and Gemini on text and tool-call events. The terminal
`EventDone` never carries it on any adapter, because skyl assembles that event
itself.

</Pitfall>

If you need raw fidelity *and* streaming, accumulate the event payloads:

```go verify
var frames []json.RawMessage
for stream.Next() {
	if ev := stream.Event(); len(ev.Raw) > 0 {
		frames = append(frames, ev.Raw)
	}
}
```

## Cost

`Raw` holds the whole body in memory for the life of the response. For most
callers that is a few kilobytes and irrelevant. If you are holding thousands of
responses — a batch pipeline, say — extract what you need and drop the
reference:

```go verify
type result struct {
	Text  string
	Usage skyl.Usage
	// Deliberately not keeping Raw: at 10k responses it is the whole heap.
}
```

<DeepDive title="Why always populate it, rather than behind an option?">

Because the moment you need `Raw` is the moment something has already gone
wrong — a field is missing, a count looks off, a provider shipped something new
— and that is exactly when you cannot go back and re-run the request with a flag
set.

An option would mean the data is absent precisely when it matters. The cost is a
few kilobytes per response; the benefit is that skyl's abstraction can never
trap you. The gateway makes the opposite trade (`SKYL_INCLUDE_RAW` defaults
off), because there the body crosses a network boundary and can echo request
content back to a caller who should not see it.

</DeepDive>

<Recap>

- `Raw` is the provider's untouched body, populated on every adapter and every call.
- Use it for reasoning content, accurate Gemini token counts, and brand-new provider features.
- It is provider-specific — write a typed struct per provider rather than a generic map.
- `CollectStream` produces no `Raw`; `StreamEvent.Raw` coverage varies by adapter.
- Drop the reference if you hold thousands of responses.
- The gateway omits it by default, because there it crosses a trust boundary.

</Recap>

<Challenges>

<Challenge title="Read a field skyl does not model, portably">

Write a helper that extracts one JSON path from `Raw` and reports clearly when
the field is absent, so a provider that does not send it is not confused with a
parse failure.

<Hint>

Distinguish "unmarshal failed" from "field was not present".

</Hint>

<Solution>

```go
func rawField[T any](raw json.RawMessage, key string) (T, bool, error) {
	var zero T
	var top map[string]json.RawMessage
	if err := json.Unmarshal(raw, &top); err != nil {
		return zero, false, fmt.Errorf("raw body is not a JSON object: %w", err)
	}
	msg, ok := top[key]
	if !ok {
		return zero, false, nil // absent, not an error
	}
	var out T
	if err := json.Unmarshal(msg, &out); err != nil {
		return zero, false, fmt.Errorf("field %q: %w", key, err)
	}
	return out, true, nil
}
```

The three-value return is the point: "this provider does not send that field" is
a normal answer, not a failure, and conflating the two makes cross-provider code
report phantom errors.

</Solution>

</Challenge>

</Challenges>
