---
title: Sampling Parameters
description: Why Temperature is a pointer, and why skyl always sends what you set.
---

<Intro>

`Temperature` and `TopP` are `*float64` rather than `float64`. That is not
stylistic — it is the only way to distinguish "use the provider's default" from
"use exactly zero", and the difference is load-bearing.

</Intro>

<YouWillLearn>

- Why the sampling fields are pointers
- Why skyl always sends a non-nil value, even to models that reject it
- How `Stop` sequences behave across providers
- What `Thinking` does, and why it is the least uniform field in the library

</YouWillLearn>

## The pointer

```go
Temperature *float64
TopP        *float64
```

`nil` means "do not send this field at all" — the provider applies its own
default. A non-nil pointer means "send exactly this".

With a plain `float64`, `0` would be indistinguishable from unset, and
temperature zero is a value people genuinely want.

```go
func f(v float64) *float64 { return &v }

req := &skyl.Request{
	Model:       "gpt-5.6",
	MaxTokens:   512,
	Temperature: f(0),   // explicitly deterministic — NOT "unset"
	Messages:    []skyl.Message{skyl.UserText("Extract the invoice number.")},
}
```

## skyl always sends what you set

<Pitfall>

Several current reasoning models **reject** `temperature` and `top_p` outright,
returning a 400. skyl does not second-guess that: a non-nil value is always
sent, and you get the provider's error.

That is deliberate. Silently dropping a field you explicitly set is worse than
an error, because you would have no way to tell it had happened — you would just
get output that did not match the determinism you asked for, and no signal.

**Leave them nil unless you mean them.**

</Pitfall>

This is one of the clearest expressions of skyl's "never silently drop data"
rule: the library would rather hand you a 400 that names the problem than
produce a request that quietly is not what you wrote.

## Stop sequences

```go verify
req.Stop = []string{"\n\nUser:", "END"}
```

Mapped on all four adapters — `stop_sequences` on Anthropic, `stop` on the
OpenAI-format adapters, `generationConfig.stopSequences` on Gemini.

<Pitfall>

Detecting that a stop sequence *fired* is not portable.
`StopReason == StopStopSequence` **only ever comes from Anthropic**. OpenAI
reports a stop-sequence hit as plain `stop`, so it arrives as `StopEndTurn`;
Gemini reports `STOP`, likewise.

If you branch on a stop sequence having fired, read `Response.Raw` — or, more
robustly, check whether the text ends where you expected.

</Pitfall>

## MaxTokens

```go verify
req.MaxTokens = 1024
```

Zero means the provider's default — except on Anthropic, whose API *requires*
the field, so that adapter supplies **4096** rather than failing a request every
other provider would accept. It is the only substituted default in the library.

A negative value is rejected locally by `Validate`.

Hitting the cap gives you `StopReason == StopMaxTokens`, and the response is
**truncated**. Treat it as incomplete rather than as a short answer.

## Thinking

```go
type Thinking struct {
	Enabled bool
	Effort  Effort  // low, medium, high, max
}
```

A `nil` pointer and a zero value mean different things: `nil` is "provider
default", `&Thinking{}` is "explicitly off".

This is the least uniform field in skyl, and it is worth reading the row for
your provider before relying on it:

<DataTable
  headers={['Value', 'anthropic', 'openai / compat', 'gemini']}
  rows={[
    ['nil', 'nothing sent', 'nothing sent', 'nothing sent'],
    ['{Enabled: true}', 'thinking: adaptive', <strong key="a">ignored</strong>, 'budget -1'],
    ['{Enabled: false}', 'thinking: disabled', <strong key="b">ignored</strong>, 'budget 0'],
    ['{Enabled: true, Effort: low}', <strong key="c">effort ignored</strong>, 'reasoning_effort: low', 'budget 1024'],
    ['… Effort: max', <strong key="d">effort ignored</strong>, 'sent — OpenAI does not define it, expect 400', 'budget 24576'],
  ]}
/>

Two consequences worth stating plainly:

- **On OpenAI, `&Thinking{Enabled: false}` does nothing.** If you are turning
  reasoning off to control cost, it will not work there. Use
  `ProviderOptions` to send `reasoning_effort` directly.
- **On Anthropic, `Effort` does nothing.** The SDK's adaptive thinking config
  has no budget field, so there is nothing to map it onto. Reach the budget with
  `ProviderOptions: {"thinking.budget_tokens": 4096}`.

<Recap>

- `Temperature` and `TopP` are pointers so that zero is distinguishable from unset.
- A non-nil value is **always sent**, even to models that reject it — silence would be worse.
- `Stop` is mapped everywhere, but detecting that it fired is Anthropic-only.
- `MaxTokens` zero means the provider default, except Anthropic, where skyl supplies 4096.
- `Thinking` is the least portable field in the library. Check the matrix row for your provider.

</Recap>

<Challenges>

<Challenge title="Turn reasoning off on all three providers">

`&Thinking{Enabled: false}` does nothing on OpenAI. Write a helper that
genuinely disables reasoning wherever it can.

<Hint>

Anthropic and Gemini honour the field. OpenAI needs `ProviderOptions`.

</Hint>

<Solution>

```go verify
func noThinking(req *skyl.Request, provider string) {
	req.Thinking = &skyl.Thinking{Enabled: false}

	if provider == "openai" || provider == "openai-compatible" {
		// The adapter ignores Thinking unless Effort is set, so reach the wire
		// field directly. This is a shallow top-level merge, which is fine
		// here because reasoning_effort is a top-level key.
		if req.ProviderOptions == nil {
			req.ProviderOptions = map[string]any{}
		}
		req.ProviderOptions["reasoning_effort"] = "minimal"
	}
}
```

Note the shallow-merge caveat does not bite here because `reasoning_effort` is
top-level. It would bite if you were setting something inside
`generationConfig`.

</Solution>

</Challenge>

<Challenge title="Detect a truncated answer">

`StopMaxTokens` means the response is incomplete. Handle it rather than
presenting a half-sentence as an answer.

<Hint>

You can either raise `MaxTokens` and retry, or tell the caller it was cut off.
Do not silently pretend it is complete.

</Hint>

<Solution>

```go verify
resp, err := client.Complete(ctx, req)
if err != nil {
	return err
}

if resp.StopReason == skyl.StopMaxTokens {
	return fmt.Errorf("answer truncated at %d tokens; raise MaxTokens", req.MaxTokens)
}
```

Silently returning the truncated text is how a summariser ends up producing
summaries that stop mid-word, and nobody notices for a week because the output
still looks plausible.

</Solution>

</Challenge>

</Challenges>
