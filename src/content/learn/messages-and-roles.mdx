---
title: Messages and Roles
description: Three roles, no system role, and why skyl does not police your ordering.
---

<Intro>

A conversation is a `[]skyl.Message`, and each message is a role plus ordered
content. There are exactly three roles, and one that pointedly does not exist.

</Intro>

<YouWillLearn>

- The three roles and what each is for
- Why there is no system role
- Why skyl refuses to validate role ordering
- The constructors that cover the common shapes

</YouWillLearn>

## The three roles

```go
const (
	RoleUser      Role = "user"
	RoleAssistant Role = "assistant"
	RoleTool      Role = "tool"
)
```

`RoleUser` is input from your application or its users. `RoleAssistant` is what
the model produced — you append it to replay prior turns. `RoleTool` carries the
result of a tool the model asked you to run.

`Role.Valid()` reports whether a value is one skyl understands; anything else is
rejected by `Validate` with `ErrBadRequest`.

## There is no system role

```go verify
req := &skyl.Request{
	System:   "You are a terse Go expert.",  // ← a field
	Messages: []skyl.Message{skyl.UserText("What is a nil map?")},
}
```

Providers place the system prompt in three different locations: a top-level
`system` parameter for Anthropic, a leading `system` message for OpenAI,
`systemInstruction` for Gemini. Modelling it as a role would force skyl to
either pick one vendor's convention and translate, or make you know which.

A dedicated field means the adapter puts it where its provider expects, and you
never think about it. See [System Prompts](/learn/system-prompts).

## Constructors

Most turns are one run of text, so skyl provides constructors for the shapes you
write constantly:

<DataTable
  headers={['Constructor', 'Produces']}
  rows={[
    [<code key="a">skyl.UserText(s)</code>, 'A user message with one Text part'],
    [<code key="b">skyl.AssistantText(s)</code>, 'An assistant message with one Text part'],
    [<code key="c">skyl.UserImage(mediaType, data, caption)</code>, 'A user message with an Image and optional Text'],
    [<code key="d">skyl.ToolResultMessage(callID, content)</code>, 'A tool message answering a call'],
    [<code key="e">skyl.ToolErrorMessage(callID, content)</code>, 'The same, with IsError set'],
  ]}
/>

For anything else, build the struct directly:

```go
skyl.Message{
	Role: skyl.RoleAssistant,
	Parts: []skyl.Part{
		skyl.Text{Text: "Let me check the weather."},
		skyl.ToolCall{ID: "call_1", Name: "get_weather", Arguments: args},
	},
}
```

## skyl does not police ordering

You can send two user turns in a row, or start with an assistant turn. skyl will
not stop you.

<DeepDive title="Why not validate the conversation shape?">

Because providers disagree about what is legal, and they change their minds.
Some accept a leading assistant turn as a prefill; some reject it. Some accept
consecutive user messages; some merge them; some 400.

If skyl rejected a shape that one vendor accepts, it would be deciding something
it has no business deciding — and you would have no way to reach a capability
your provider genuinely offers. An ordering a provider dislikes comes back as
that provider's own error, classified as `ErrBadRequest`, which is strictly more
information than a local rejection.

The one exception is structural validity: a message with **no parts** is
rejected locally, because that is meaningless on every provider.

</DeepDive>

<Pitfall>

skyl does not support prefilling an assistant turn to steer the next response.
`AssistantText` exists to *replay* prior turns. Several current models reject a
trailing assistant message outright, so a pattern that works on one vendor
breaks on another — and you will discover it after switching.

</Pitfall>

## Reading a message back

`Message.Text()` concatenates every `Text` part and ignores the rest, which is
the common case. `Message.ToolCalls()` returns every `ToolCall` part in order.

```go verify
fmt.Println(resp.Message.Text())        // just the prose
for _, c := range resp.Message.ToolCalls() {
	fmt.Println(c.Name, string(c.Arguments))
}
```

`Response.Text()` and `Response.ToolCalls()` are shorthands for exactly these.

<Recap>

- Three roles: `user`, `assistant`, `tool`. There is no system role.
- System prompts live on `Request.System` because vendors place them differently.
- Constructors cover the common shapes; build `Message` directly for mixed content.
- skyl does not validate role ordering — providers disagree, so their error is more useful.
- A message with no parts *is* rejected locally, because that is meaningless everywhere.
- Do not prefill an assistant turn; several current models reject it.

</Recap>

<Challenges>

<Challenge title="Build a mixed-content assistant turn">

Reconstruct an assistant turn that contained both prose and two tool calls, so
it can be appended to a conversation.

<Hint>

Order matters — parts are ordered, and the provider replays them in sequence.

</Hint>

<Solution>

```go verify
parts := []skyl.Part{skyl.Text{Text: "I'll check both cities."}}
for _, c := range calls {
	parts = append(parts, c)
}
turn := skyl.Message{Role: skyl.RoleAssistant, Parts: parts}
```

In practice you rarely build this by hand — `Response.Message` already is it,
which is exactly why it is exposed in the same shape a request takes.

</Solution>

</Challenge>

</Challenges>
