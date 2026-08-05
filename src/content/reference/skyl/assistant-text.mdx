---
title: AssistantText
description: An assistant message containing a single run of text.
---

<Intro>

`AssistantText` exists to **replay prior turns** — reconstructing a conversation
from storage, or seeding a few-shot example. It is not for steering the next
response.

</Intro>

## Reference

<Signature>func AssistantText(text string) Message</Signature>

<Returns>

`Message{Role: RoleAssistant, Parts: []Part{Text{Text: text}}}`.

</Returns>

<Caveats>

- **Do not use it to prefill an assistant turn** to steer the model. Several
  current models reject a trailing assistant message, so the pattern works on one
  vendor and 400s on another.
- **Do not use it to append a response.** Use `resp.Message` — reconstructing
  from `resp.Text()` **silently drops any tool calls**, and the tool result you
  append next then has nothing to answer.

</Caveats>

## Usage

<Recipe title="Replaying stored history">

```go verify
for _, turn := range stored {
	switch turn.Role {
	case "user":
		req.Messages = append(req.Messages, skyl.UserText(turn.Text))
	case "assistant":
		req.Messages = append(req.Messages, skyl.AssistantText(turn.Text))
	}
}
```

</Recipe>

<Recipe title="A few-shot example">

```go verify
req.Messages = []skyl.Message{
	skyl.UserText("Classify: 'the parcel never arrived'"),
	skyl.AssistantText("delivery"),
	skyl.UserText("Classify: 'I was charged twice'"),
}
```

</Recipe>

## Troubleshooting

<Trouble problem="My prefilled turn worked on one provider and failed on another">

Prefilling is not supported. Steer with `Request.System` instead.

</Trouble>

<Trouble problem="Tool calls vanished from my conversation">

You appended `AssistantText(resp.Text())` rather than `resp.Message`. Only the
latter preserves tool calls.

</Trouble>
