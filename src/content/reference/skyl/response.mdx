---
title: Response
description: A provider-agnostic model reply, always carrying the untouched body.
---

<Intro>

`Response` is what a successful [`Complete`](/reference/skyl/client-complete)
returns. Two of its fields are guaranteed on every adapter and every call; the
rest are best-effort, because providers differ in what they disclose.

</Intro>

## Reference

<Signature>type Response struct{ /* see below */ }</Signature>

<Fields of="response" />

### Methods

- [`Text() string`](/reference/skyl/response-text) — every `Text` part concatenated.
- [`ToolCalls() []ToolCall`](/reference/skyl/response-toolcalls) — every `ToolCall` part, in order.

<Caveats>

- **`Provider` and `Raw` are always populated.** `Raw` is the provider's
  untouched body, so nothing they sent is ever lost — only unmodelled.
- **`Model` is read from the response**, not echoed from the request. Providers
  substitute: aliases resolve to dated snapshots, and capacity fallback happens.
- **`Usage` zero means "not reported"**, not "zero tokens".
- **Reasoning content is dropped from `Message`** by all four adapters. It stays
  in `Raw`.
- Both methods are **nil-safe** on a nil `*Response`.
- A `Response` from [`CollectStream`](/reference/skyl/collect-stream) has **no
  `Raw`**, because it is assembled from events rather than one body.

</Caveats>

## Usage

<Recipe title="Reading the answer">

```go verify
resp, err := client.Complete(ctx, req)
if err != nil {
	return err
}
fmt.Println(resp.Text())
fmt.Printf("%d in / %d out\n", resp.Usage.InputTokens, resp.Usage.OutputTokens)
```

</Recipe>

<Recipe title="Continuing a conversation">

```go verify
// Append the response message itself — reconstructing it with AssistantText
// would silently drop any tool calls it contains.
req.Messages = append(req.Messages, resp.Message)
```

</Recipe>

<Recipe title="Checking why it stopped">

```go verify
switch resp.StopReason {
case skyl.StopMaxTokens:
	return "", fmt.Errorf("truncated at %d tokens", req.MaxTokens)
case skyl.StopToolUse:
	// The model wants a tool run; Text() may be empty.
case skyl.StopRefusal:
	return "", fmt.Errorf("the model declined: %s", resp.Text())
}
```

</Recipe>

<Recipe title="Reading a field skyl does not model">

```go verify
var raw struct {
	SystemFingerprint string `json:"system_fingerprint"`
}
if err := json.Unmarshal(resp.Raw, &raw); err != nil {
	return err
}
```

</Recipe>

## Troubleshooting

<Trouble problem="Text() is empty and there was no error">

Check `StopReason`. `StopToolUse` means the model produced calls rather than
prose — normal. `StopRefusal` means it declined without explaining.

</Trouble>

<Trouble problem="resp.Model differs from what I asked for">

Normal. Aliases resolve to dated snapshots, and providers fall back under load.
Group your metrics by `resp.Model` so two snapshots are not merged into one
line. See [Which Model Actually Answered](/learn/which-model-answered).

</Trouble>

<Trouble problem="Where is the model's reasoning?">

Dropped from `Message` by every adapter, and present in `Raw`. Streaming on
Anthropic is the only place skyl surfaces it as structured data, via
`EventThinkingDelta`.

</Trouble>

<Trouble problem="Raw is nil">

You are looking at a `Response` from `CollectStream`, which assembles one from
events. There is no single provider body to expose.

</Trouble>
