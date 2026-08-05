---
title: Role
description: Who produced a message. Three values, and no system role.
---

<Intro>

`Role` identifies the author of a [`Message`](/reference/skyl/message). skyl has
exactly three, and pointedly not a fourth.

</Intro>

## Reference

<Signature>type Role string</Signature>

<DataTable
  headers={['Constant', 'Value', 'Meaning']}
  rows={[
    [<code key="a">RoleUser</code>, 'user', 'Input from your application or its users.'],
    [<code key="b">RoleAssistant</code>, 'assistant', 'What the model produced. Append it to replay prior turns.'],
    [<code key="c">RoleTool</code>, 'tool', 'The result of a tool the model asked you to run.'],
  ]}
/>

<Signature>func (r Role) Valid() bool</Signature>

<Caveats>

- **There is no system role.** System prompts live on
  [`Request.System`](/reference/skyl/request), because providers place them in
  three different locations.
- An invalid role is rejected by `Validate` with
  `message N has invalid role "x"`.
- skyl does **not** validate ordering — two user turns in a row, or a leading
  assistant turn, are your provider's business rather than skyl's.
- **Do not prefill an assistant turn** to steer the next response. Several
  current models reject a trailing assistant message.

</Caveats>

## Why no system role

<DeepDive title="Two reasons">

**Placement.** Anthropic has one top-level `system` parameter, not a message
stream; Gemini has `systemInstruction`. If `system` were a role, skyl would have
to decide what a system message *in the middle* of a conversation means — and
either concatenate it into the top-level field (surprising) or reject it
(arbitrary).

**Ordering.** A role can appear anywhere, and "a system message after three user
turns" behaves differently on every vendor. A field has exactly one meaning.

The cost is that you cannot express OpenAI's `developer` role separately from
`system`. `ProviderOptions` reaches it if you need to.

</DeepDive>

## Usage

<Recipe title="Building a turn by hand">

```go
skyl.Message{Role: skyl.RoleUser, Parts: []skyl.Part{skyl.Text{Text: "hello"}}}
```

</Recipe>

<Recipe title="Filtering a conversation by role">

```go verify
func userTurns(msgs []skyl.Message) []skyl.Message {
	var out []skyl.Message
	for _, m := range msgs {
		if m.Role == skyl.RoleUser {
			out = append(out, m)
		}
	}
	return out
}
```

</Recipe>

## Troubleshooting

<Trouble problem="Where do I put the system prompt?">

`Request.System`. It is a field, not a role.

</Trouble>

<Trouble problem="ErrBadRequest: invalid role “system”">

You constructed `skyl.Role("system")`. Use `Request.System` instead.

</Trouble>

<Trouble problem="My prefilled assistant turn worked on one provider and 400ed on another">

Prefilling is not supported. `AssistantText` exists to replay prior turns; steer
with the system prompt instead.

</Trouble>
