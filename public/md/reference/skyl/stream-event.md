---
title: StreamEvent
description: One incremental update from a streaming response.
---

<Intro>

`StreamEvent` is a tagged union: `Type` says which fields are meaningful and the
rest are zero. Switch on `Type`.

</Intro>

## Reference

<Signature>{`type StreamEvent struct {
	Type       EventType
	Text       string
	ToolCall   *ToolCall
	Usage      *Usage
	StopReason StopReason
	Raw        json.RawMessage
}`}</Signature>

<DataTable
  headers={['Field', 'Meaningful for']}
  rows={[
    [<code key="a">Text</code>, 'EventTextDelta, EventThinkingDelta'],
    [<code key="b">ToolCall</code>, 'EventToolCall'],
    [<code key="c">Usage</code>, 'EventDone'],
    [<code key="d">StopReason</code>, 'EventDone'],
    [<code key="e">Raw</code>, 'varies sharply by adapter — see below'],
  ]}
/>

<Caveats>

- **`ToolCall` and `Usage` are pointers** — always nil-check before
  dereferencing.
- **`EventThinkingDelta` is emitted only by `provider/anthropic`.**
- `EventToolCall` is emitted **once**, when the call's JSON is whole. You never
  see a fragment.
- **`Raw` coverage varies**: Anthropic never populates it, the OpenAI-format
  adapters do so on text deltas only, Gemini on text and tool-call events. The
  terminal `EventDone` **never** carries it on any adapter.
- Unparseable SSE frames are **skipped rather than fatal**, because providers
  interleave keep-alives and vendor-specific records.

</Caveats>

## Usage

<Recipe title="Handling every type">

```go verify
for stream.Next() {
	switch ev := stream.Event(); ev.Type {
	case skyl.EventTextDelta:
		fmt.Print(ev.Text)
	case skyl.EventThinkingDelta:
		fmt.Fprint(os.Stderr, ev.Text) // reasoning, not the answer
	case skyl.EventToolCall:
		if ev.ToolCall != nil {
			calls = append(calls, *ev.ToolCall)
		}
	case skyl.EventDone:
		if ev.Usage != nil {
			total = total.Add(*ev.Usage)
		}
		stop = ev.StopReason
	}
}
```

</Recipe>

<Recipe title="Showing a thinking pane only where it exists">

```go verify
var sawThinking bool
for stream.Next() {
	if ev := stream.Event(); ev.Type == skyl.EventThinkingDelta {
		if !sawThinking {
			ui.OpenThinkingPane() // lazily, so three adapters show no empty box
			sawThinking = true
		}
		ui.AppendThinking(ev.Text)
	}
}
```

</Recipe>

<Recipe title="Collecting raw frames">

```go verify
var frames []json.RawMessage
for stream.Next() {
	if ev := stream.Event(); len(ev.Raw) > 0 {
		frames = append(frames, ev.Raw)
	}
}
```

</Recipe>

## Troubleshooting

<Trouble problem="I never receive EventThinkingDelta">

Only Anthropic emits it. The others do reason — their streaming formats simply
do not disclose it as a distinct frame.

</Trouble>

<Trouble problem="EventDone reported nil Usage">

On OpenAI-family hosts, usage requires `stream_options.include_usage` to be
honoured; many compatible hosts ignore it.

</Trouble>

<Trouble problem="Raw is empty on Anthropic">

It is never populated there. If you need raw fidelity on Anthropic, use
non-streaming `Complete`, where `Response.Raw` is always present.

</Trouble>
