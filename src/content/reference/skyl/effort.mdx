---
title: Effort
description: A hint at reasoning depth. A hint, not a contract.
---

<Intro>

`Effort` is a hint about how much reasoning the model should spend. Providers
interpret it differently and some ignore it entirely.

</Intro>

## Reference

<Signature>type Effort string</Signature>

<DataTable
  headers={['Constant', 'Value']}
  rows={[
    [<code key="a">EffortLow</code>, 'low'],
    [<code key="b">EffortMedium</code>, 'medium'],
    [<code key="c">EffortHigh</code>, 'high'],
    [<code key="d">EffortMax</code>, 'max'],
  ]}
/>

They are listed in increasing order. Set one on
[`Thinking.Effort`](/reference/skyl/thinking).

<Caveats>

- **It is a hint.** Adapters map it onto whatever the provider offers and ignore
  it where there is no equivalent.
- **Anthropic ignores it entirely** — its adaptive thinking config has no effort
  or budget field.
- **OpenAI does not define `max`.** skyl sends it literally, so expect a 400.
- Gemini maps each level onto a concrete token budget: 1024, 8192, 16384, 24576.
- skyl does not validate the value, so an unknown effort string reaches the
  provider.

</Caveats>

## Usage

<Recipe title="Setting a level">

```go verify
req.Thinking = &skyl.Thinking{Enabled: true, Effort: skyl.EffortMedium}
```

</Recipe>

<Recipe title="Avoiding the undefined max on OpenAI">

```go verify
effort := skyl.EffortMax
if provider == "openai" || provider == "openai-compatible" {
	effort = skyl.EffortHigh // "max" is not a value OpenAI defines
}
req.Thinking = &skyl.Thinking{Enabled: true, Effort: effort}
```

</Recipe>

## Troubleshooting

<Trouble problem="A 400 mentioning reasoning_effort">

You sent `EffortMax` to OpenAI. It is not one of their defined values; use
`EffortHigh`.

</Trouble>

<Trouble problem="Changing the effort changed nothing">

On Anthropic it is dropped. Reach the budget with
`ProviderOptions: {"thinking.budget_tokens": N}`, which works only there.

</Trouble>
