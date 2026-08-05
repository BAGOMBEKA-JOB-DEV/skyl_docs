---
title: Stream Events
description: Four types, and which providers actually emit them.
---

<Intro>

`StreamEvent` is a tagged union: `Type` says which fields are meaningful and the
rest are zero. There are four types, and support for two of them varies sharply
by provider.

</Intro>

<YouWillLearn>

- What each event type carries
- Which adapters emit thinking deltas (one of them)
- Why tool calls arrive whole rather than in fragments
- What `StreamEvent.Raw` contains, and where it is missing

</YouWillLearn>

## The types

<EventTypeTable />

## The struct

```go
type StreamEvent struct {
	Type       EventType
	Text       string           // EventTextDelta, EventThinkingDelta
	ToolCall   *ToolCall        // EventToolCall
	Usage      *Usage           // EventDone
	StopReason StopReason       // EventDone
	Raw        json.RawMessage  // when one exists
}
```

Fields not relevant to the type are zero, so a `switch` on `Type` is the correct
way to read it.

```go verify
for stream.Next() {
	ev := stream.Event()
	switch ev.Type {
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

## Thinking deltas are Anthropic-only

<Pitfall>

**`EventThinkingDelta` is emitted only by `provider/anthropic`.** OpenAI,
openaicompat and Gemini never emit it — not because reasoning did not happen,
but because their streaming formats do not disclose it as a distinct frame.

A UI that shows a "thinking…" pane driven by this event will simply stay empty
on three of the four adapters.

</Pitfall>

Note also that reasoning is dropped entirely from *non*-streaming responses on
every adapter. Streaming on Anthropic is the only way skyl surfaces it as
structured data.

## Tool calls arrive whole

skyl buffers partial tool arguments and emits `EventToolCall` **once**, when the
call's JSON is complete.

<DeepDive title="Why buffer rather than stream the fragments?">

Because a half-parsed tool call is not actionable. Providers send arguments a
few characters at a time — `{"ci`, `ty":"Kamp`, `ala"}` — and there is nothing
useful a caller can do with a fragment except accumulate it, which every caller
would then have to implement identically.

Worse, they would implement it identically *wrongly*: the obvious accumulation
is `args += fragment`, which reallocates and copies the whole accumulated string
on every frame. A call with 512 fragments allocates 2.2 MB to assemble a few
kilobytes. skyl uses a `strings.Builder` — 34 KB and 19 allocations for the same
input, linear rather than quadratic — and that fix is guarded by a benchmark.

</DeepDive>

On OpenAI and openaicompat, fragments are accumulated by index across frames. On
Gemini they arrive whole already. Either way you see one complete event.

<Pitfall>

On OpenAI and openaicompat, a streamed tool call whose `name` never arrived is
**discarded silently** — it cannot be dispatched, so it is dropped. If a call
you expected does not appear, check `StreamEvent.Raw` on the preceding frames.

</Pitfall>

## StreamEvent.Raw

Coverage varies, and this is worth knowing before you depend on it:

<DataTable
  headers={['Adapter', 'Raw on stream events']}
  rows={[
    ['anthropic', <strong key="a">never populated</strong>],
    ['openai / openaicompat', 'text deltas only'],
    ['gemini', 'text and tool-call events'],
  ]}
/>

The terminal `EventDone` **never** carries `Raw` on any adapter, because skyl
assembles that event itself rather than copying one provider frame.

## Unparseable frames are skipped

An SSE frame skyl cannot parse is skipped rather than treated as fatal.
Providers interleave keep-alives and vendor-specific records, and failing the
whole stream because of one unrecognised line would make skyl brittle against
every provider's next feature.

That is a deliberate design decision rather than an oversight — and it is the
one place skyl chooses tolerance over strictness.

<Recap>

- Four event types; `Type` says which fields are meaningful.
- **`EventThinkingDelta` is Anthropic-only** — three adapters never emit it.
- Tool calls are buffered and emitted **once**, when their JSON is whole.
- On the OpenAI family, a streamed call with no name is silently discarded.
- `StreamEvent.Raw` coverage varies; the terminal `EventDone` never has it.
- Unparseable SSE frames are skipped by design, not treated as fatal.

</Recap>

<Challenges>

<Challenge title="Show reasoning where it exists, gracefully elsewhere">

Build a UI layer that displays a thinking pane on Anthropic and does not show an
empty box on the other three.

<Hint>

You cannot ask an adapter whether it emits thinking deltas. But you can notice
whether one has arrived.

</Hint>

<Solution>

```go verify
var sawThinking bool

for stream.Next() {
	ev := stream.Event()
	switch ev.Type {
	case skyl.EventThinkingDelta:
		if !sawThinking {
			ui.OpenThinkingPane()   // only once we know there is something to show
			sawThinking = true
		}
		ui.AppendThinking(ev.Text)
	case skyl.EventTextDelta:
		ui.AppendAnswer(ev.Text)
	}
}
if sawThinking {
	ui.CollapseThinkingPane()
}
```

Opening the pane lazily on the first event means the layout is correct on every
provider without your code branching on provider name — which would break the
moment another vendor starts emitting them.

</Solution>

</Challenge>

</Challenges>
