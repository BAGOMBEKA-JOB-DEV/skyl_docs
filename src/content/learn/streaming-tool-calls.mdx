---
title: Streaming Tool Calls
description: skyl reassembles fragmented arguments so you never see half a call.
---

<Intro>

Providers stream tool-call arguments a few characters at a time. skyl buffers
them and emits one `EventToolCall` when the JSON is whole, because a half-parsed
call is not actionable.

</Intro>

<YouWillLearn>

- What arrives on the wire, and what skyl gives you instead
- How to run a tool loop while streaming
- Why reassembly used to be quadratic, and what fixed it
- The one case where a streamed call is silently dropped

</YouWillLearn>

## What the wire looks like

A single tool call frequently arrives as a dozen frames:

<ConsoleBlock>{`data: {"tool_calls":[{"index":0,"id":"call_1","function":{"name":"get_weather"}}]}
data: {"tool_calls":[{"index":0,"function":{"arguments":"{\\"ci"}}]}
data: {"tool_calls":[{"index":0,"function":{"arguments":"ty\\":\\"Kamp"}}]}
data: {"tool_calls":[{"index":0,"function":{"arguments":"ala\\"}"}}]}`}</ConsoleBlock>

## What skyl gives you

One event, once:

```go verify
for stream.Next() {
	ev := stream.Event()
	if ev.Type == skyl.EventToolCall && ev.ToolCall != nil {
		// Arguments are complete, valid JSON. Always.
		fmt.Printf("%s(%s)\n", ev.ToolCall.Name, ev.ToolCall.Arguments)
	}
}
```

On OpenAI and openaicompat, fragments are accumulated by `index` across frames.
On Anthropic they are buffered and emitted whole. On Gemini they arrive whole
already. Either way you see the same thing.

<DeepDive title="Why buffering, and why it was once quadratic">

There is nothing useful a caller can do with a fragment except accumulate it —
so every caller would implement the same accumulation, and most would implement
it the obvious way:

```go
args += fragment   // reallocates and copies EVERYTHING, every frame
```

That is O(n²) in the number of frames. A call with 512 fragments allocated
**2.2 MB** to assemble a few kilobytes of JSON.

skyl now uses a `strings.Builder`: **34 KB and 19 allocations** for the same
input, linear rather than quadratic. The bug was found by a benchmark added
specifically to cover the per-token paths, and that benchmark stays as the
guard.

This is the general argument for the buffering living in the library: it is
written once, measured once, and fixed once.

</DeepDive>

## A streaming tool loop

The pattern is the same as the non-streaming loop, except you rebuild the
assistant turn yourself — there is no `Response.Message` on a stream.

```go title="loop.go" verify
func streamTurn(ctx context.Context, client *skyl.Client, req *skyl.Request) (bool, error) {
	stream, err := client.Stream(ctx, req)
	if err != nil {
		return false, err
	}
	defer stream.Close()

	var text strings.Builder
	var calls []skyl.ToolCall

	for stream.Next() {
		switch ev := stream.Event(); ev.Type {
		case skyl.EventTextDelta:
			fmt.Print(ev.Text)
			text.WriteString(ev.Text)
		case skyl.EventToolCall:
			if ev.ToolCall != nil {
				calls = append(calls, *ev.ToolCall)
			}
		}
	}
	if err := stream.Err(); err != nil {
		return false, err
	}

	if len(calls) == 0 {
		req.Messages = append(req.Messages, skyl.AssistantText(text.String()))
		return false, nil
	}

	// Rebuild the assistant turn from what we saw, preserving text and calls.
	parts := make([]skyl.Part, 0, 1+len(calls))
	if text.Len() > 0 {
		parts = append(parts, skyl.Text{Text: text.String()})
	}
	for _, c := range calls {
		parts = append(parts, c)
	}
	req.Messages = append(req.Messages, skyl.Message{Role: skyl.RoleAssistant, Parts: parts})

	// Then one tool message per call.
	for _, c := range calls {
		req.Messages = append(req.Messages, skyl.ToolResultMessage(c.ID, run(c)))
	}
	return true, nil // more work to do
}
```

Call it in a bounded loop until it returns `false`.

<Pitfall>

`skyl.CollectStream` does exactly this assembly for you, including inferring
`StopToolUse` when calls were seen. If you do not need to print the deltas,
prefer it over hand-rolling the above — it is the same code, already tested.

</Pitfall>

## The silent drop

<Pitfall>

On **OpenAI and openaicompat**, a streamed tool call whose `name` never arrived
is **discarded silently**. It cannot be dispatched, so the adapter drops it.

This is entry 8 in the [silently ignored list](/reference/provider/silently-ignored).
If a call you expected does not appear, inspect `StreamEvent.Raw` on the
preceding frames — the OpenAI-format adapters populate it on text deltas, so
you may need the terminal frames from the provider directly.

</Pitfall>

## Tool choice still applies

`Request.ToolChoice` works identically on a stream. `ToolChoiceRequired` forces
at least one call, which means a stream that produces only text is a provider
bug rather than something you need to handle.

<Recap>

- Providers fragment tool-call arguments; skyl emits one complete event.
- Reassembly is linear, guarded by a benchmark after a quadratic bug was found.
- There is no `Response.Message` on a stream — rebuild the assistant turn yourself.
- `CollectStream` does that assembly for you if you do not need the deltas.
- **On the OpenAI family, a streamed call with no name is silently discarded.**
- `ToolChoice` behaves identically whether you stream or not.

</Recap>

<Challenges>

<Challenge title="Bound a streaming tool loop">

A model that keeps requesting tools forever must not spin your program forever.
Add a bound, and make exhausting it a clear error.

<Hint>

Count rounds, and include the count in the error so the log says what happened.

</Hint>

<Solution>

```go
const maxRounds = 5

for round := 0; ; round++ {
	if round >= maxRounds {
		return fmt.Errorf("gave up after %d tool rounds; the model kept requesting tools", maxRounds)
	}
	more, err := streamTurn(ctx, client, req)
	if err != nil {
		return err
	}
	if !more {
		return nil
	}
}
```

Five is a reasonable default: legitimate multi-step tool use rarely exceeds
three rounds, and anything beyond that is usually a tool returning something the
model cannot use — which the error message should prompt you to go and look at.

</Solution>

</Challenge>

</Challenges>
