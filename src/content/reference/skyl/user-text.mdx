---
title: UserText
description: A user message containing a single run of text.
---

<Intro>

The constructor you will type most often. It builds the shape that covers the
overwhelming majority of user turns.

</Intro>

## Reference

<Signature>func UserText(text string) Message</Signature>

<Returns>

`Message{Role: RoleUser, Parts: []Part{Text{Text: text}}}`.

</Returns>

<Caveats>

- An empty string produces a valid message with one empty `Text` part — only a
  message with **no parts at all** is rejected.
- For anything richer than one run of text, build the
  [`Message`](/reference/skyl/message) directly.

</Caveats>

## Usage

<Recipe title="A single turn">

```go verify
resp, err := client.Complete(ctx, &skyl.Request{
	Model:     "gpt-5.6",
	MaxTokens: 512,
	Messages:  []skyl.Message{skyl.UserText("Explain Go channels.")},
})
```

</Recipe>

<Recipe title="Growing a conversation">

```go verify
req.Messages = append(req.Messages, skyl.UserText(input))

resp, err := client.Complete(ctx, req)
if err != nil {
	return err
}
req.Messages = append(req.Messages, resp.Message)
```

</Recipe>

## Troubleshooting

<Trouble problem="I need an image alongside the text">

Use [`UserImage`](/reference/skyl/user-image), or build the message directly
with both parts in the order you want.

</Trouble>
