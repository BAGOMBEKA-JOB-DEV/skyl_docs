---
title: ToolCall
description: The model's request to invoke a tool.
---

<Intro>

A `ToolCall` arrives on the assistant's turn when the model wants you to run
something. You execute it and send back a
[`ToolResult`](/reference/skyl/tool-result).

</Intro>

## Reference

<Signature>{`type ToolCall struct {
	ID        string
	Name      string
	Arguments json.RawMessage
}`}</Signature>

<Parameters>

- **`ID`** — correlates this call with its result. Providers generate it.
- **`Name`** — the tool the model wants to run.
- **`Arguments`** — the JSON object the model produced. Raw, because skyl cannot
  know your tool's schema.

</Parameters>

<Caveats>

- **`Validate` requires both `ID` and `Name`** on a call you construct.
- **On Gemini, `ID` is set to the function name**, because Gemini issues no call
  IDs. Two parallel calls to the same tool are indistinguishable by ID — pair by
  **position**.
- On Anthropic, `Arguments` is **validated as JSON** and a malformed value is
  rejected; the other adapters treat it as opaque.
- Streaming emits `EventToolCall` **once**, when the arguments are whole — you
  never see a fragment.
- On the OpenAI family, a streamed call whose `name` never arrived is **silently
  discarded**.

</Caveats>

## Usage

<Recipe title="Running a call">

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

<Recipe title="Replaying an assistant turn that contained calls">

```go verify
parts := []skyl.Part{skyl.Text{Text: "Let me check."}}
for _, c := range calls {
	parts = append(parts, c)
}
turn := skyl.Message{Role: skyl.RoleAssistant, Parts: parts}
```

In practice you rarely build this — `Response.Message` already is it.

</Recipe>

## Troubleshooting

<Trouble problem="Two calls to the same tool collapsed into one">

You keyed a map by `call.ID` on Gemini, where the ID is the function name. Index
by position instead.

</Trouble>

<Trouble problem="Anthropic rejected my replayed tool call">

Anthropic validates `Arguments` as JSON. If you constructed the call yourself
with a non-JSON value, it is rejected there and accepted elsewhere.

</Trouble>

<Trouble problem="A streamed call never arrived">

On OpenAI and openaicompat, a call accumulated across frames with no name is
discarded — it cannot be dispatched. Inspect `StreamEvent.Raw` on the preceding
frames.

</Trouble>
