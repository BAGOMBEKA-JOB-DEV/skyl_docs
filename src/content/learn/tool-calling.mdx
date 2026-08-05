---
title: Tool Calling
description: Letting the model run your code, and getting the results back safely.
---

<Intro>

Tool calling is a loop, not a call. You declare what the model may invoke, it
asks, you run it, you send the result back, and you repeat until it stops
asking. This chapter covers each step and the places providers differ.

</Intro>

<YouWillLearn isChapter>

- How to declare a tool the model can call
- What a JSON Schema needs to survive the trip to each provider
- The loop, and why the assistant turn must be appended first
- How to force, forbid, or require a specific tool
- How to tell the model a tool failed — and where that signal is lost
- What happens when the model calls several tools at once

</YouWillLearn>

## Declaring a tool

```go
Tools: []skyl.Tool{{
	Name:        "get_weather",
	Description: "Get the current weather for a city. Call this whenever the user asks about weather, temperature, or conditions in a named place.",
	Parameters: map[string]any{
		"type": "object",
		"properties": map[string]any{
			"city": map[string]any{"type": "string"},
		},
		"required": []string{"city"},
	},
}}
```

<LearnMore path="/learn/declaring-tools">
Read **[Declaring Tools](/learn/declaring-tools)** for why the description should describe *when* to call, not only what it does.
</LearnMore>

## Schemas

<LearnMore path="/learn/tool-schemas">
Read **[Tool Schemas](/learn/tool-schemas)** — three adapters pass your schema through verbatim and one rebuilds it, dropping two things.
</LearnMore>

## The loop

```go verify
for _, call := range resp.ToolCalls() {
	req.Messages = append(req.Messages,
		resp.Message,                                  // the assistant's turn FIRST
		skyl.ToolResultMessage(call.ID, run(call)),    // then your answer
	)
}
```

<LearnMore path="/learn/the-tool-loop">
Read **[The Tool Loop](/learn/the-tool-loop)** for the bounded version, and why ordering is not optional.
</LearnMore>

## Tool choice

<LearnMore path="/learn/tool-choice">
Read **[Tool Choice](/learn/tool-choice)** for the four modes, all of which are mapped on all four adapters.
</LearnMore>

## Errors

<LearnMore path="/learn/reporting-tool-errors">
Read **[Reporting Tool Errors](/learn/reporting-tool-errors)** — `IsError` reaches the model faithfully on exactly one adapter.
</LearnMore>

## Parallel calls

<LearnMore path="/learn/parallel-tool-calls">
Read **[Parallel Tool Calls](/learn/parallel-tool-calls)** for running several concurrently, and why Gemini makes pairing harder.
</LearnMore>

<WhatsNext>

Start with [Declaring Tools](/learn/declaring-tools). If you already have a loop
and it is failing on one provider but not another, the answer is almost
certainly in [Tool Schemas](/learn/tool-schemas).

</WhatsNext>
