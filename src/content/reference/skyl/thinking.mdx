---
title: Thinking
description: Requests reasoning. The least uniform field in the library.
---

<Intro>

`Thinking` asks the model to reason before answering. Support varies more here
than anywhere else in skyl, so the per-provider table below is the important
part of this page.

</Intro>

## Reference

<Signature>{`type Thinking struct {
	Enabled bool
	Effort  Effort
}`}</Signature>

<Parameters>

- **`Enabled`** — requests reasoning.
- **`Effort`** — hints at depth: `low`, `medium`, `high`, `max`. Empty means the
  provider's default.

</Parameters>

<Caveats>

- **A nil `*Thinking` and `&Thinking{}` mean different things.** Nil is "provider
  default"; the zero value is "explicitly off".
- **On Anthropic, `Effort` does nothing.** The SDK's adaptive thinking config has
  no budget or effort field, so there is nothing to map it onto.
- **On OpenAI and openaicompat, `Thinking` is ignored unless both `Enabled` and
  `Effort` are set.** So `&Thinking{Enabled: false}` does nothing there.
- `Effort: max` is sent literally to OpenAI, which **does not define that
  value** — expect a 400.
- Only Gemini maps every case, including a zero budget.

</Caveats>

## What each adapter does

<DataTable
  headers={['Value', 'anthropic', 'openai / compat', 'gemini']}
  rows={[
    ['nil', 'nothing sent', 'nothing sent', 'nothing sent'],
    ['{Enabled: true}', 'thinking: adaptive', <strong key="a">ignored</strong>, 'budget -1 (model decides)'],
    ['{Enabled: false}', 'thinking: disabled', <strong key="b">ignored</strong>, 'budget 0'],
    ['… Effort: low', <strong key="c">effort ignored</strong>, 'reasoning_effort: low', 'budget 1024'],
    ['… Effort: medium', <strong key="d">effort ignored</strong>, 'medium', 'budget 8192'],
    ['… Effort: high', <strong key="e">effort ignored</strong>, 'high', 'budget 16384'],
    ['… Effort: max', <strong key="f">effort ignored</strong>, <span key="g">sent — <strong>undefined by OpenAI</strong></span>, 'budget 24576'],
  ]}
/>

## Usage

<Recipe title="Asking for deep reasoning">

```go verify
req.Thinking = &skyl.Thinking{Enabled: true, Effort: skyl.EffortHigh}
```

</Recipe>

<Recipe title="Turning reasoning off, portably">

```go verify
req.Thinking = &skyl.Thinking{Enabled: false} // works on anthropic and gemini

if provider == "openai" || provider == "openai-compatible" {
	// The adapter ignores Thinking without an Effort, so reach the wire field.
	if req.ProviderOptions == nil {
		req.ProviderOptions = map[string]any{}
	}
	req.ProviderOptions["reasoning_effort"] = "minimal"
}
```

</Recipe>

<Recipe title="Setting a precise budget on Anthropic">

```go verify
// Effort is ignored there, but the budget is reachable by JSON path —
// which only Anthropic supports.
req.ProviderOptions = map[string]any{"thinking.budget_tokens": 4096}
```

</Recipe>

## Troubleshooting

<Trouble problem="Turning reasoning off had no effect on cost">

You are on OpenAI, where `&Thinking{Enabled: false}` is ignored entirely. Send
`reasoning_effort` through `ProviderOptions`.

</Trouble>

<Trouble problem="Effort makes no difference on Anthropic">

It is dropped. Use `ProviderOptions` with `thinking.budget_tokens`.

</Trouble>

<Trouble problem="Where is the reasoning in the response?">

Dropped from `Message` by every adapter; it stays in `Response.Raw`. Streaming on
Anthropic emits `EventThinkingDelta`, and is the only structured access skyl
offers.

</Trouble>
