---
title: ToolResultMessage
description: A tool message answering the call identified by callID.
---

<Intro>

`ToolResultMessage` wraps a tool's output in the message shape providers expect.
The ordering rule around it is the part people get wrong.

</Intro>

## Reference

<Signature>func ToolResultMessage(callID, content string) Message</Signature>

<Returns>

`Message{Role: RoleTool, Parts: []Part{ToolResult{CallID: callID, Content: content}}}`.

</Returns>

<Caveats>

- **Append it after the assistant message that requested the call.** Every
  provider rejects a tool result that does not follow its call.
- When several tools were called in one turn, append the assistant turn **once**
  and then **one message per call**.
- **Every call must get a result.** A call left unanswered invalidates the whole
  turn.
- `callID` must match the `ToolCall.ID`. On Gemini that ID is the function name,
  so pair by position when several calls hit the same tool.
- For a failure, prefer
  [`ToolErrorMessage`](/reference/skyl/tool-error-message) — and put the failure
  in the text as well, since the flag is lossy on three adapters.

</Caveats>

## Usage

<Recipe title="The correct ordering">

```go verify
req.Messages = append(req.Messages, resp.Message) // the assistant turn FIRST
for _, call := range resp.ToolCalls() {
	req.Messages = append(req.Messages,
		skyl.ToolResultMessage(call.ID, run(call)))
}
```

</Recipe>

<Recipe title="Guarding against a missing result">

```go verify
func applyResults(req *skyl.Request, resp *skyl.Response, results map[string]string) {
	req.Messages = append(req.Messages, resp.Message)
	for _, call := range resp.ToolCalls() {
		out, ok := results[call.ID]
		if !ok {
			// An unanswered call is rejected by every provider, and is much
			// harder to spot than an error result.
			out = "ERROR: no result was produced for this call"
		}
		req.Messages = append(req.Messages, skyl.ToolResultMessage(call.ID, out))
	}
}
```

</Recipe>

## Troubleshooting

<Trouble problem="A 400 right after appending my result">

The assistant turn was not appended first, or one call was left unanswered.

</Trouble>

<Trouble problem="Results paired with the wrong calls on Gemini">

Gemini sets `ToolCall.ID` to the function name, so two calls to the same tool
share an ID. Pair by position.

</Trouble>
