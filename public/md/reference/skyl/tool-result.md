---
title: ToolResult
description: Carries the outcome of a tool invocation back to the model.
---

<Intro>

A `ToolResult` answers a [`ToolCall`](/reference/skyl/tool-call). Its `IsError`
flag is one of skyl's genuinely lossy fields — it reaches the model faithfully
on exactly one adapter.

</Intro>

## Reference

<Signature>{`type ToolResult struct {
	CallID  string
	Content string
	IsError bool
}`}</Signature>

<Parameters>

- **`CallID`** — must match the `ToolCall.ID` this result answers. Required.
- **`Content`** — the tool's output, rendered as text.
- **`IsError`** — reports that the tool failed.

</Parameters>

<Caveats>

- **`Validate` requires `CallID`.**
- **Every provider rejects a result that does not follow the call it answers.**
  Append the assistant's turn first.
- **`IsError` arrives intact only on Anthropic**, as a real `is_error` boolean.
- The OpenAI-format adapters are **lossy**: they prefix `"error: "` to the
  content, and **drop the flag entirely when the content is empty**.
- **Gemini drops it completely** — the signal never reaches the wire.
- Never return an empty `Content` for a failure; it erases the signal on two
  adapters at once.

</Caveats>

## Usage

<Recipe title="The portable way to report a failure">

```go verify
// The prose is the signal that works everywhere. IsError is a bonus where
// it survives.
skyl.ToolErrorMessage(call.ID,
	fmt.Sprintf("ERROR: %s failed: %v. Do not retry; tell the user the data "+
		"is unavailable.", call.Name, err))
```

Three things that text does which the boolean cannot: it names the tool, it says
what to do next, and it works on all four adapters.

</Recipe>

<Recipe title="A successful result">

```go verify
skyl.ToolResultMessage(call.ID, "22C and sunny in Kampala")
```

</Recipe>

<Recipe title="Constructing one directly">

```go
skyl.Message{
	Role: skyl.RoleTool,
	Parts: []skyl.Part{skyl.ToolResult{
		CallID:  call.ID,
		Content: "22C and sunny",
		IsError: false,
	}},
}
```

</Recipe>

## Troubleshooting

<Trouble problem="The model kept calling a tool that had failed">

On Gemini and, when content is empty, on the OpenAI family, the model was never
told it failed. Put the failure in the text and say explicitly not to retry.

</Trouble>

<Trouble problem="A 400 after appending my tool result">

Almost always ordering: the assistant turn containing the call must be appended
**before** the result. Every provider enforces this.

</Trouble>

<Trouble problem="A call I skipped caused the whole turn to be rejected">

Every call must get a result. If a tool panicked, send an error message rather
than nothing.

</Trouble>
