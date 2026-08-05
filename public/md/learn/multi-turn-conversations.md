---
title: Multi-Turn Conversations
description: Append both turns, manage the window, and do not prefill.
---

<Intro>

skyl holds no conversation state. A conversation is a slice you own and grow,
which means the memory model is entirely explicit — and entirely yours to
truncate, persist, or replay.

</Intro>

<YouWillLearn>

- The append-both-turns loop, and the bug you get without it
- How to manage a growing context window
- Why you should not prefill an assistant turn
- How to persist and resume a conversation

</YouWillLearn>

## The loop

```go verify
req := &skyl.Request{
	Model:     "gpt-5.6",
	MaxTokens: 512,
	System:    "You are a concise assistant.",
}

for _, userInput := range inputs {
	req.Messages = append(req.Messages, skyl.UserText(userInput))

	resp, err := client.Complete(ctx, req)
	if err != nil {
		return err
	}
	fmt.Println(resp.Text())

	// Without this line the model has no memory and every turn looks like
	// the first — a bug that runs perfectly and answers wrongly.
	req.Messages = append(req.Messages, resp.Message)
}
```

Append `resp.Message` rather than `skyl.AssistantText(resp.Text())`. The
response message may carry tool calls as well as text, and reconstructing it
from `Text()` alone silently drops them.

## Managing the window

Conversations grow, and `InputTokens` grows with them — you re-send the entire
history every turn. Three approaches, in increasing order of effort:

**Truncate.** Keep the system prompt and the last N turns.

```go verify
// Keep the most recent maxTurns messages, dropping from the front. The system
// prompt is a Request field, not a message, so it survives untouched.
func trim(msgs []skyl.Message, maxTurns int) []skyl.Message {
	if len(msgs) <= maxTurns {
		return msgs
	}
	return msgs[len(msgs)-maxTurns:]
}
```

<Pitfall>

Truncating blindly can orphan a tool result — cutting the assistant turn that
made the call while keeping the `tool` message that answers it. Every provider
rejects that. Trim to a **user turn boundary**:

```go verify
func trimSafely(msgs []skyl.Message, keep int) []skyl.Message {
	if len(msgs) <= keep {
		return msgs
	}
	cut := len(msgs) - keep
	// Advance the cut point until it lands on a user turn, so no tool result
	// is left without the call it answers.
	for cut < len(msgs) && msgs[cut].Role != skyl.RoleUser {
		cut++
	}
	return msgs[cut:]
}
```

</Pitfall>

**Summarise.** Ask a cheap model to compress the old turns, and replace them
with one user message containing the summary.

**Cache.** Leave the history intact and let prompt caching absorb the cost;
`Usage.CacheReadTokens` tells you how much was discounted.

## Do not prefill

A pattern you may know from other SDKs — ending the request with an assistant
turn to steer the next response — is not supported.

```go
// DON'T
Messages: []skyl.Message{
	skyl.UserText("List three colours."),
	skyl.AssistantText("1."),   // ← trying to force a numbered list
}
```

Several current models reject a trailing assistant message outright, so this
works on one vendor and 400s on another. `AssistantText` exists to **replay**
prior turns. Steer with the system prompt instead.

## Persisting a conversation

`Message` contains a `Parts []Part` field, and `Part` is an interface — so it
does not round-trip through `encoding/json` on its own. Persist your own shape:

```go verify
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

<DeepDive title="Why skyl does not provide conversation serialisation">

Because the right shape depends on what you are building. A chat product needs
message IDs, timestamps, edit history and user attribution. A batch pipeline
needs none of that. A compliance-sensitive system may need to store a hash
rather than the content.

Any format skyl picked would be wrong for most callers, and it would become a
compatibility surface — a v1 format that could never change. Leaving it to you
costs the ten lines above and keeps the decision where it belongs.

Note that the helper above is **lossy**: it keeps text and drops tool calls. If
your conversations involve tools, store the parts explicitly.

</DeepDive>

<Recap>

- skyl holds no state; the conversation is a slice you own.
- Append `resp.Message`, not `AssistantText(resp.Text())` — the latter drops tool calls.
- Trim to a **user turn boundary**, or you orphan a tool result and every provider rejects it.
- Do not prefill an assistant turn; several models reject it.
- `Part` is an interface, so persist your own shape rather than marshalling `Message`.

</Recap>

<Challenges>

<Challenge title="Cap a conversation by tokens, not turns">

Trimming by message count is crude — one message may be a paragraph and another
a word. Trim by reported token usage instead.

<Hint>

You do not have a tokeniser, but you do have `Usage.InputTokens` from the last
response, and you know how much the history grew.

</Hint>

<Solution>

```go verify
// Track the input cost of the last call, and trim when it approaches your
// budget. This uses the provider's own count rather than guessing.
const inputBudget = 8000

if last != nil && last.Usage.InputTokens > inputBudget {
	req.Messages = trimSafely(req.Messages, len(req.Messages)/2)
}
```

Using the provider's reported count avoids shipping a tokeniser, and it is
correct by construction — it is the same number you are billed for. The
trade-off is that you only learn you overshot *after* a call, so leave headroom.

</Solution>

</Challenge>

</Challenges>
