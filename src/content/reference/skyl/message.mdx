---
title: Message
description: One turn in a conversation — a role and its ordered content.
---

<Intro>

A `Message` is a role plus an ordered list of parts. skyl models the superset of
what vendors accept, because they disagree about whether content is a string or
a list of typed blocks.

</Intro>

## Reference

<Signature>{`type Message struct {
	Role  Role
	Parts []Part
}`}</Signature>

### Methods

<Signature>{`func (m Message) Text() string          // every Text part concatenated
func (m Message) ToolCalls() []ToolCall // every ToolCall part, in order`}</Signature>

<Caveats>

- **A message with no parts is rejected** by `Validate` — it is meaningless on
  every provider.
- **There is no system role.** System prompts live on
  [`Request.System`](/reference/skyl/request).
- **skyl does not police role ordering.** Providers disagree about what is legal,
  and their own error is more informative than a local rejection.
- **`Part` is a closed interface** — only skyl can implement it. See
  [`Part`](/reference/skyl/part).
- `Text()` ignores non-text parts, so a turn of pure tool calls returns `""`.
- `ToolCalls()` returns `nil` when there are none, so `range` is safe.

</Caveats>

## Constructors

<DataTable
  headers={['Constructor', 'Produces']}
  rows={[
    [<a key="a" href="/reference/skyl/user-text">UserText(s)</a>, 'A user message with one Text part'],
    [<a key="b" href="/reference/skyl/assistant-text">AssistantText(s)</a>, 'An assistant message with one Text part'],
    [<a key="c" href="/reference/skyl/user-image">UserImage(mediaType, data, caption)</a>, 'A user message with an Image and optional Text'],
    [<a key="d" href="/reference/skyl/tool-result-message">ToolResultMessage(callID, content)</a>, 'A tool message answering a call'],
    [<a key="e" href="/reference/skyl/tool-error-message">ToolErrorMessage(callID, content)</a>, 'The same, with IsError set'],
  ]}
/>

## Usage

<Recipe title="A conversation">

```go verify
msgs := []skyl.Message{
	skyl.UserText("What is a nil map?"),
	skyl.AssistantText("A map that is declared but not allocated."),
	skyl.UserText("Can I read from one?"),
}
```

</Recipe>

<Recipe title="Mixed content">

```go
skyl.Message{
	Role: skyl.RoleAssistant,
	Parts: []skyl.Part{
		skyl.Text{Text: "Let me check both cities."},
		skyl.ToolCall{ID: "c1", Name: "get_weather", Arguments: a1},
		skyl.ToolCall{ID: "c2", Name: "get_weather", Arguments: a2},
	},
}
```

</Recipe>

<Recipe title="Persisting a conversation">

```go verify
// Part is an interface, so Message does not round-trip through encoding/json.
// Store your own shape — and note this one is lossy: it keeps text and drops
// tool calls.
type storedTurn struct {
	Role string `json:"role"`
	Text string `json:"text"`
}

func store(msgs []skyl.Message) []storedTurn {
	out := make([]storedTurn, 0, len(msgs))
	for _, m := range msgs {
		out = append(out, storedTurn{Role: string(m.Role), Text: m.Text()})
	}
	return out
}
```

</Recipe>

## Troubleshooting

<Trouble problem="ErrBadRequest: message N has no parts">

Every message needs at least one part. An empty `skyl.Message{Role: ...}` is
rejected locally.

</Trouble>

<Trouble problem="The model has no memory of earlier turns">

You are not appending `resp.Message` after each response. Append it — and append
the response message itself, not `AssistantText(resp.Text())`, which drops tool
calls.

</Trouble>

<Trouble problem="json.Marshal on a Message produced empty parts">

`Part` is an interface with unexported methods; it does not marshal. Persist
your own shape.

</Trouble>
