---
title: Response.ToolCalls
description: Every tool call the model requested, in order.
---

<Intro>

`ToolCalls` extracts the [`ToolCall`](/reference/skyl/tool-call) parts from the
assistant's message. It is shorthand for `Response.Message.ToolCalls()`.

</Intro>

## Reference

<Signature>func (r *Response) ToolCalls() []ToolCall</Signature>

<Returns>

Every tool call in the order the model produced them. **Returns `nil` when there
are none**, so a plain `range` is safe without a length check.

</Returns>

<Caveats>

- **Nil-safe** on a nil `*Response`.
- **On Gemini, `ToolCall.ID` is the function name**, because Gemini issues no
  call IDs. Two parallel calls to the same tool are therefore indistinguishable
  by ID — pair results by **position** instead.
- `Arguments` is `json.RawMessage`; skyl cannot know your tool's schema.
- It flattens ordering against text. Use `Message.Parts` when the interleaving
  matters.

</Caveats>

## Usage

<Recipe title="Running the calls">

```go verify
for _, call := range resp.ToolCalls() {
	var args struct {
		City string `json:"city"`
	}
	if err := json.Unmarshal(call.Arguments, &args); err != nil {
		req.Messages = append(req.Messages,
			skyl.ToolErrorMessage(call.ID, "could not parse arguments: "+err.Error()))
		continue
	}
	req.Messages = append(req.Messages,
		skyl.ToolResultMessage(call.ID, weather(args.City)))
}
```

</Recipe>

<Recipe title="Detecting the end of a tool loop">

```go verify
// More reliable than StopReason: on Gemini, any function call forces
// StopToolUse regardless of the actual finishReason.
if len(resp.ToolCalls()) == 0 {
	return resp, nil
}
```

</Recipe>

<Recipe title="Pairing results safely on every provider">

```go verify
calls := resp.ToolCalls()
results := make([]string, len(calls))
for i, call := range calls {
	results[i] = run(call) // indexed, so identical Gemini IDs cannot collide
}

req.Messages = append(req.Messages, resp.Message)
for i, call := range calls {
	req.Messages = append(req.Messages, skyl.ToolResultMessage(call.ID, results[i]))
}
```

</Recipe>

## Troubleshooting

<Trouble problem="Two calls to the same tool collapsed into one">

You keyed a map by `call.ID` and are on Gemini, where the ID is the function
name. Index by position instead.

</Trouble>

<Trouble problem="A call I expected did not appear, while streaming">

On OpenAI and openaicompat, a streamed tool call whose `name` never arrived is
**silently discarded** — it cannot be dispatched. Inspect `StreamEvent.Raw` on
the preceding frames.

</Trouble>

<Trouble problem="The provider rejected my next request with a 400">

Almost always ordering: `resp.Message` must be appended **before** any tool
result. Every provider rejects a result that does not follow its call.

</Trouble>
