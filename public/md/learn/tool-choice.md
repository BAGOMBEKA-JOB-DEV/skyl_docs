---
title: Tool Choice
description: Four modes, all mapped on all four adapters.
---

<Intro>

`Request.ToolChoice` constrains whether and how the model may call tools. It is
one of the few parts of skyl where all four adapters support everything.

</Intro>

<YouWillLearn>

- The four modes and when each is useful
- Why `ToolChoiceRequired` changes what you must handle
- What `Validate` checks
- How this interacts with streaming

</YouWillLearn>

## The four modes

```go
const (
	ToolChoiceAuto     ToolChoiceMode = "auto"     // the model decides — the default
	ToolChoiceNone     ToolChoiceMode = "none"     // no tool calls this request
	ToolChoiceRequired ToolChoiceMode = "required" // at least one call
	ToolChoiceSpecific ToolChoiceMode = "tool"     // a named tool
)
```

All four are `✅ mapped` on `anthropic`, `openai`, `openaicompat` and `gemini`.

## Auto

The default. A nil `ToolChoice` means auto — you do not have to set it.

```go verify
req.ToolChoice = nil // or omit the field entirely
```

## None

Offers the tools but forbids calling them this turn. Useful when you want the
model to *summarise* what it has already learned from tool results rather than
reaching for another one.

```go verify
// Final turn: the model has all the data it needs, so make it answer.
req.ToolChoice = &skyl.ToolChoice{Mode: skyl.ToolChoiceNone}
final, err := client.Complete(ctx, req)
```

This is the cleanest way to terminate a tool loop deliberately rather than
hoping the model stops.

## Required

Forces at least one call.

```go verify
req.ToolChoice = &skyl.ToolChoice{Mode: skyl.ToolChoiceRequired}
```

<Pitfall>

With `Required`, a response containing only text is a provider bug rather than
something you should handle gracefully — but do not assume it cannot happen.
Check the call list anyway:

```go verify
calls := resp.ToolCalls()
if len(calls) == 0 {
	return fmt.Errorf("%s returned no tool call despite tool_choice=required", resp.Provider)
}
```

Compatible hosts in particular implement OpenAI's *format* without always
implementing its *semantics*.

</Pitfall>

## Specific

Forces one named tool.

```go verify
req.ToolChoice = &skyl.ToolChoice{
	Mode: skyl.ToolChoiceSpecific,
	Name: "extract_invoice",
}
```

<Pitfall>

`Name` is required in this mode, and `Validate` rejects it locally:

<ConsoleBlock>skyl: invalid request: tool choice &quot;tool&quot; requires a name</ConsoleBlock>

`Name` is ignored in every other mode, so setting it with `Auto` does nothing.

</Pitfall>

## Structured output without a schema mode

`ToolChoiceSpecific` is the portable way to get structured output. Declare one
tool whose parameters are the shape you want, force it, and read the arguments:

```go verify
extract := skyl.Tool{
	Name:        "record_invoice",
	Description: "Record the fields extracted from an invoice.",
	Parameters: map[string]any{
		"type": "object",
		"properties": map[string]any{
			"number": map[string]any{"type": "string"},
			"total":  map[string]any{"type": "number"},
		},
		"required": []string{"number", "total"},
	},
}

resp, err := client.Complete(ctx, &skyl.Request{
	Model:      model,
	MaxTokens:  512,
	Messages:   []skyl.Message{skyl.UserText(documentText)},
	Tools:      []skyl.Tool{extract},
	ToolChoice: &skyl.ToolChoice{Mode: skyl.ToolChoiceSpecific, Name: "record_invoice"},
})
if err != nil {
	return err
}

calls := resp.ToolCalls()
if len(calls) == 0 {
	return errors.New("no extraction produced")
}

var invoice struct {
	Number string  `json:"number"`
	Total  float64 `json:"total"`
}
if err := json.Unmarshal(calls[0].Arguments, &invoice); err != nil {
	return err
}
```

<DeepDive title="Why not model JSON mode or structured outputs directly?">

Because the vendors' native structured-output features are genuinely different:
different schema dialects, different guarantees about validity, different
support across models, and different names. Modelling the intersection would
give you a feature that works on some models and silently degrades on others —
exactly the failure mode skyl's design principles reject.

A forced tool call gives you the same thing, portably, using machinery every
provider already implements identically. And where you want a vendor's native
mode, `ProviderOptions` reaches it — `response_format` on OpenAI,
`responseSchema` on Gemini.

</DeepDive>

## Streaming

`ToolChoice` behaves identically on a stream. With `Required`, expect at least
one `EventToolCall` before `EventDone`.

<Recap>

- Four modes, all mapped on all four adapters — a rare case of full parity.
- Nil means `Auto`; you rarely need to set it.
- `None` is the clean way to force a final answer and end a tool loop.
- `Required` should still be checked, because compatible hosts vary.
- `Specific` needs `Name`, enforced locally by `Validate`.
- A forced tool call is the portable route to structured output.

</Recap>

<Challenges>

<Challenge title="End a tool loop deliberately">

Rewrite the bounded tool loop so that on the last round it forces an answer
instead of erroring out.

<Hint>

`ToolChoiceNone` on the final iteration.

</Hint>

<Solution>

```go verify
for round := 0; round <= maxToolRounds; round++ {
	if round == maxToolRounds {
		// Out of rounds: stop offering the option and make it answer with
		// what it already has, rather than failing the whole request.
		req.ToolChoice = &skyl.ToolChoice{Mode: skyl.ToolChoiceNone}
	}

	resp, err := client.Complete(ctx, req)
	if err != nil {
		return nil, err
	}
	if calls := resp.ToolCalls(); len(calls) == 0 {
		return resp, nil
	}
	// … append and continue
}
```

This turns a hard failure into a degraded answer, which is usually what a user
would prefer — they get a response based on partial data rather than an error.
Log the fact that it happened, though, or you will never notice the tool that
caused it.

</Solution>

</Challenge>

</Challenges>
