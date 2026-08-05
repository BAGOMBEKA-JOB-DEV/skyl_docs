---
title: Text and Tool Calls
description: Getting prose, calls, or both — and what is deliberately not there.
---

<Intro>

An assistant turn can contain prose, tool calls, or both in one message. This
page covers how to read each, and the one category of content that all four
adapters discard.

</Intro>

<YouWillLearn>

- The difference between `Text()`, `ToolCalls()`, and `Message.Parts`
- How to handle a turn containing both
- Why reasoning content is dropped by every adapter, and where to find it

</YouWillLearn>

## Prose

```go verify
fmt.Println(resp.Text())
```

`Text()` concatenates every `Text` part and ignores everything else. It has fast
paths for the overwhelmingly common shapes — zero parts, and exactly one text
part — so the usual case allocates nothing.

## Tool calls

```go verify
for _, call := range resp.ToolCalls() {
	fmt.Printf("%s(%s)\n", call.Name, call.Arguments)
}
```

`Arguments` is `json.RawMessage`, because skyl cannot know your tool's schema.
Unmarshal it into your own type:

```go verify
var args struct {
	City string `json:"city"`
}
if err := json.Unmarshal(call.Arguments, &args); err != nil {
	return skyl.ToolErrorMessage(call.ID, "could not parse arguments: "+err.Error())
}
```

<Pitfall>

On **Gemini**, `ToolCall.ID` is set to the **function name**, because Gemini
issues no call IDs on the wire. Two parallel calls to the same tool are
therefore indistinguishable, and pairing results with calls by ID does not work
there.

If you support Gemini and issue parallel calls, match by position instead of by
ID.

</Pitfall>

## Both at once

A single turn can contain prose *and* calls, in order:

```go verify
for _, part := range resp.Message.Parts {
	switch p := part.(type) {
	case skyl.Text:
		fmt.Println("prose:", p.Text)
	case skyl.ToolCall:
		fmt.Println("call:", p.Name)
	}
}
```

Use `Message.Parts` directly whenever order matters — a model saying "let me
check two cities" and then issuing two calls is a common and meaningful
sequence.

## What is not there: reasoning

<Pitfall>

**All four adapters discard reasoning content from non-streaming responses.**
Anthropic thinking blocks, OpenAI-family `reasoning_content`, and Gemini
`thought` parts are all dropped from `Response.Message`.

They remain in `Response.Raw`.

</Pitfall>

On Gemini specifically it is worse: if you enable thought output through
`ProviderOptions`, the thought text arrives as an ordinary `Text` part and is
**indistinguishable from the answer**. Do not do that without parsing `Raw`
yourself, or your users will read the model's scratchpad as though it were the
response.

<DeepDive title="Why is reasoning dropped rather than modelled?">

Because it is not one thing. Anthropic returns typed thinking blocks that can be
replayed. OpenAI returns an opaque summary that cannot. Gemini returns parts
flagged with a boolean. Their retention rules, billing treatment and replay
semantics all differ.

Modelling the intersection would give you a field that is empty on most
providers and lossy on the rest — which is worse than an honest omission plus
`Raw`.

There is one exception, and it is the streaming path: `EventThinkingDelta`
carries reasoning fragments as they arrive. **Only Anthropic emits it.**

</DeepDive>

To read it anyway:

```go verify
var raw struct {
	Content []struct {
		Type     string `json:"type"`
		Thinking string `json:"thinking"`
	} `json:"content"`
}
if err := json.Unmarshal(resp.Raw, &raw); err != nil {
	return err
}
for _, c := range raw.Content {
	if c.Type == "thinking" {
		fmt.Println("reasoning:", c.Thinking)
	}
}
```

That shape is Anthropic's. It is provider-specific by definition — which is what
`Raw` is for.

<Recap>

- `Text()` gives prose; `ToolCalls()` gives calls; `Message.Parts` gives order.
- `ToolCall.Arguments` is raw JSON — unmarshal it into your own type.
- **On Gemini, `ToolCall.ID` is the function name**, so parallel calls are indistinguishable.
- **Every adapter drops reasoning content** from non-streaming responses; it stays in `Raw`.
- On Gemini, re-enabled thought text is indistinguishable from the answer.
- `EventThinkingDelta` is the streaming exception, and only Anthropic emits it.

</Recap>

<Challenges>

<Challenge title="Handle a mixed turn correctly">

Print the model's prose, then run its tool calls, preserving the order the model
produced them in.

<Hint>

`ToolCalls()` loses interleaving. `Message.Parts` does not.

</Hint>

<Solution>

```go verify
for _, part := range resp.Message.Parts {
	switch p := part.(type) {
	case skyl.Text:
		fmt.Print(p.Text)
	case skyl.ToolCall:
		out := run(p.Name, p.Arguments)
		req.Messages = append(req.Messages, skyl.ToolResultMessage(p.ID, out))
	}
}
```

Remember to append `resp.Message` before any of those results — every provider
rejects a tool result that does not follow its call.

</Solution>

</Challenge>

</Challenges>
