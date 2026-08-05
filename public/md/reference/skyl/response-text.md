---
title: Response.Text
description: Every Text part concatenated, ignoring everything else.
---

<Intro>

`Text` is the convenience method for the common case: you want the model's
prose. It is shorthand for `Response.Message.Text()`.

</Intro>

## Reference

<Signature>func (r *Response) Text() string</Signature>

<Returns>

Every [`Text`](/reference/skyl/text) part of the assistant's message,
concatenated in order. Other part types are ignored.

</Returns>

<Caveats>

- **Nil-safe.** Calling it on a nil `*Response` returns `""` rather than
  panicking, so an error path that logs it before checking `err` does not crash.
- **It ignores tool calls.** A turn containing only calls returns `""` — which
  looks exactly like a model that failed to answer. Check `StopReason`.
- **Reasoning content is not included**, because adapters drop it from `Message`
  entirely.
- It has fast paths for zero parts and for exactly one text part, so the
  overwhelmingly common shapes allocate nothing.

</Caveats>

## Usage

<Recipe title="The common case">

```go verify
fmt.Println(resp.Text())
```

</Recipe>

<Recipe title="Distinguishing empty from failed">

```go verify
if resp.Text() == "" {
	switch resp.StopReason {
	case skyl.StopToolUse:
		// Expected — run resp.ToolCalls().
	case skyl.StopRefusal:
		return errors.New("the model declined without explaining")
	default:
		return fmt.Errorf("empty response (%s)", resp.StopReason)
	}
}
```

</Recipe>

<Recipe title="When you need order instead">

```go verify
// Text() flattens; Parts preserves the interleaving of prose and calls.
for _, part := range resp.Message.Parts {
	switch p := part.(type) {
	case skyl.Text:
		fmt.Print(p.Text)
	case skyl.ToolCall:
		fmt.Printf("[calling %s]", p.Name)
	}
}
```

</Recipe>

## Troubleshooting

<Trouble problem="Text() returned empty but the model clearly answered">

If the answer arrived as tool calls, `Text()` is correctly empty — read
`ToolCalls()`.

On Gemini specifically, if you enabled thought output through `ProviderOptions`,
the thought text arrives as an ordinary `Text` part and is **indistinguishable
from the answer** — so `Text()` may contain the model's scratchpad rather than
its conclusion. Parse `Raw` if you do that.

</Trouble>

<Trouble problem="I want the reasoning as well as the answer">

`Text()` cannot give it to you; adapters drop reasoning from `Message`. Read
`Response.Raw`, or stream on Anthropic and collect `EventThinkingDelta`.

</Trouble>
