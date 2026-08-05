---
title: Text
description: A run of plain text.
---

<Intro>

`Text` is the simplest [`Part`](/reference/skyl/part), and the one that appears
in almost every message.

</Intro>

## Reference

<Signature>{`type Text struct {
	Text string
}`}</Signature>

<Caveats>

- Mapped on every adapter, on user and assistant messages.
- **On a `tool` role message it is rejected by the OpenAI-format adapters** —
  *"tool messages may only contain tool results"*. Anthropic and Gemini turn it
  into user content instead.
- `Message.Text()` and `Response.Text()` concatenate every `Text` part and ignore
  the others.
- An empty `Text` is structurally valid; only a message with **no parts at all**
  is rejected.

</Caveats>

## Usage

<Recipe title="The usual way">

```go verify
skyl.UserText("Explain Go channels.")
```

</Recipe>

<Recipe title="Directly, when building mixed content">

```go
skyl.Message{
	Role: skyl.RoleUser,
	Parts: []skyl.Part{
		skyl.Text{Text: "Compare these two charts:"},
		skyl.Image{MediaType: "image/png", Data: before},
		skyl.Image{MediaType: "image/png", Data: after},
	},
}
```

</Recipe>

## Troubleshooting

<Trouble problem="ErrUnsupported on a tool message containing text">

You put a `Text` part on a `RoleTool` message and are on OpenAI or
openaicompat, which allow only tool results there. Put the prose in the
[`ToolResult.Content`](/reference/skyl/tool-result) instead — which is also
where it is most useful, since that is what the model reads.

</Trouble>
