---
title: ToolErrorMessage
description: ToolResultMessage for a tool that failed.
---

<Intro>

Identical to [`ToolResultMessage`](/reference/skyl/tool-result-message) except
that it sets `IsError`. That flag is genuinely lossy — which is why the *text*
matters more than the boolean.

</Intro>

## Reference

<Signature>func ToolErrorMessage(callID, content string) Message</Signature>

<Returns>

`Message{Role: RoleTool, Parts: []Part{ToolResult{CallID: callID, Content: content, IsError: true}}}`.

</Returns>

<Caveats>

- **The flag arrives intact only on Anthropic**, as a real `is_error` boolean.
- **OpenAI and openaicompat are lossy**: they prefix `"error: "` and **drop the
  flag entirely when `content` is empty**.
- **Gemini drops it completely** — the model is never told the tool failed.
- **Never pass an empty `content`.** It erases the signal on two adapters at
  once, and the model receives a successful-looking empty result.
- The same ordering rules apply as for `ToolResultMessage`.

</Caveats>

## Usage

<Recipe title="A failure the model can act on">

```go verify
skyl.ToolErrorMessage(call.ID,
	"ERROR: get_weather is unavailable (HTTP 503). This is a persistent outage — "+
		"do not call get_weather again in this conversation. Answer using what you "+
		"already know, and tell the user that live weather data is unavailable.")
```

Three instructions in one message: what failed, not to retry, and what to do
instead. Compare that with `"503"`, which reads like a transient failure worth
retrying — and produces a loop.

</Recipe>

<Recipe title="Branching on the tool's outcome">

```go
out, err := runTool(call)
if err != nil {
	msg := skyl.ToolErrorMessage(call.ID,
		fmt.Sprintf("ERROR: %s failed: %v", call.Name, err))
	req.Messages = append(req.Messages, msg)
} else {
	req.Messages = append(req.Messages, skyl.ToolResultMessage(call.ID, out))
}
```

</Recipe>

<Recipe title="Errors the model should not see">

```go verify
switch {
case errors.Is(err, errNotConfigured):
	// A credential problem is yours to fix. Telling the model invites a
	// confidently wrong answer built on an apology.
	return fmt.Errorf("tool %s: %w", call.Name, err)
case err != nil:
	req.Messages = append(req.Messages, skyl.ToolErrorMessage(call.ID, err.Error()))
}
```

</Recipe>

## Troubleshooting

<Trouble problem="The model behaved as though the tool succeeded">

You are on Gemini, where the flag never reaches the wire — or on the OpenAI
family with empty content, where it is dropped. Put the failure in the text.

</Trouble>

<Trouble problem="The model retried the failing tool forever">

Nothing told it not to. Say so explicitly in the content: "do not call this
again in this conversation".

</Trouble>
