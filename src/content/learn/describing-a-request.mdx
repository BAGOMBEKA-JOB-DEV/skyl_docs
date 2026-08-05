---
title: Describing a Request
description: Everything that goes into a model call, and what each provider does with it.
---

<Intro>

A `skyl.Request` is the one shape every provider accepts. This chapter covers
each field: what it means, what happens when you leave it zero, and — where it
matters — which adapters quietly do something different with it.

</Intro>

<YouWillLearn isChapter>

- How to make a call and read the answer
- How roles work, and why there is no system role
- What the four content parts are, and why the interface is closed
- How system prompts and multi-turn conversations are represented
- How to send images, and which adapters accept which form
- Why `Temperature` is a pointer, and what that pointer means
- Why model IDs are opaque strings that skyl never validates

</YouWillLearn>

## Your first call

Three parts: build a provider, wrap it in a client, send a request.

```go verify
client := skyl.New(openai.New(os.Getenv("OPENAI_API_KEY")))

resp, err := client.Complete(ctx, &skyl.Request{
	Model:     "gpt-5.6",
	MaxTokens: 1024,
	Messages:  []skyl.Message{skyl.UserText("Explain Go channels in two sentences.")},
})
```

<LearnMore path="/learn/your-first-call">
Read **[Your First Call](/learn/your-first-call)** for what `Complete` validates before it sends anything, and what comes back.
</LearnMore>

## Messages and roles

There are three roles — `user`, `assistant` and `tool` — and deliberately no
`system`.

```go
Messages: []skyl.Message{
	skyl.UserText("What is a nil map?"),
	skyl.AssistantText("A map that is declared but not allocated."),
	skyl.UserText("Can I read from one?"),
}
```

<LearnMore path="/learn/messages-and-roles">
Read **[Messages and Roles](/learn/messages-and-roles)** for why skyl does not police role ordering, and what happens when a provider dislikes your shape.
</LearnMore>

## Content parts

A message is a role plus an *ordered list of parts*, because vendors disagree
about whether content is a string or a list of typed blocks. skyl models the
superset.

```go
skyl.Message{
	Role: skyl.RoleAssistant,
	Parts: []skyl.Part{
		skyl.Text{Text: "Let me look that up."},
		skyl.ToolCall{ID: "call_1", Name: "get_weather", Arguments: args},
	},
}
```

<LearnMore path="/learn/content-parts">
Read **[Content Parts](/learn/content-parts)** for the four implementations and why the `Part` interface is closed.
</LearnMore>

## System prompts

`System` is a field rather than a message, because Anthropic wants a top-level
parameter, OpenAI wants a leading message, and Gemini wants `systemInstruction`.

```go verify
req := &skyl.Request{
	Model:  "claude-opus-5",
	System: "You are a terse Go expert. Answer in one sentence.",
	Messages: []skyl.Message{skyl.UserText("What is a nil map?")},
}
```

<LearnMore path="/learn/system-prompts">
Read **[System Prompts](/learn/system-prompts)** for where each adapter places it and what that means for token accounting.
</LearnMore>

## Multi-turn conversations

Append both turns each round. `Response.Message` is already in the shape a
request takes, so it replays verbatim.

<LearnMore path="/learn/multi-turn-conversations">
Read **[Multi-Turn Conversations](/learn/multi-turn-conversations)** for context-window management and why you should not prefill an assistant turn.
</LearnMore>

## Images

<LearnMore path="/learn/images-and-multimodal">
Read **[Images and Multimodal](/learn/images-and-multimodal)** — Gemini rejects URL images outright, and setting both `Data` and `URL` silently drops one of them.
</LearnMore>

## Sampling parameters

`Temperature` and `TopP` are `*float64`, and a non-nil value is **always** sent
— even to models that reject it.

<LearnMore path="/learn/sampling-parameters">
Read **[Sampling Parameters](/learn/sampling-parameters)** for why skyl refuses to silently drop a field you set.
</LearnMore>

## Model IDs

<LearnMore path="/learn/model-ids">
Read **[Model IDs Are Just Strings](/learn/model-ids)** for the most consequential decision in the project, and the price it charges you.
</LearnMore>

<WhatsNext>

Start with [Your First Call](/learn/your-first-call). If you already have a call
working and want to know what comes back, skip ahead to
[Reading a Response](/learn/reading-a-response).

</WhatsNext>
