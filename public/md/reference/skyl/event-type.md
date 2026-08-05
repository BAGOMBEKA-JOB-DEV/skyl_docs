---
title: EventType
description: What a StreamEvent carries.
---

<Intro>

Four values. Two are emitted by every adapter, one by all four with different
fidelity, and one by exactly one adapter.

</Intro>

## Reference

<Signature>type EventType string</Signature>

<EventTypeTable />

<Caveats>

- **`EventThinkingDelta` is Anthropic-only.** A UI driven by it stays empty on
  the other three.
- **`EventToolCall` fires once per call**, when the arguments are whole. skyl
  buffers the fragments for you.
- **`EventDone` is the terminal event.** A stream that ends without it is
  reported as truncated through `Stream.Err()`.
- Provider events carrying no actionable information are dropped rather than
  surfaced.

</Caveats>

## Usage

<Recipe title="Text only, the common case">

```go verify
for stream.Next() {
	if ev := stream.Event(); ev.Type == skyl.EventTextDelta {
		fmt.Print(ev.Text)
	}
}
```

</Recipe>

<Recipe title="Detecting the terminal event">

```go verify
var sawDone bool
for stream.Next() {
	if stream.Event().Type == skyl.EventDone {
		sawDone = true
	}
}
// Redundant in practice — Err() already reports a missing terminal event —
// but explicit if you are asserting on it in a test.
if err := stream.Err(); err != nil || !sawDone {
	return fmt.Errorf("incomplete stream: %w", err)
}
```

</Recipe>

## Troubleshooting

<Trouble problem="Should I handle event types I do not recognise?">

There are only four, and they are stable. A `default` branch that ignores
anything unknown is safe — skyl drops provider events that carry no actionable
information rather than passing them through as new types.

</Trouble>
