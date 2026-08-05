---
title: Model IDs Are Just Strings
description: The most consequential decision in the project, and the price it charges you.
---

<Intro>

skyl ships no model-name constants and never validates a model against a list.
`Request.Model` is an opaque string passed straight to the provider. This page
is about why, and about the trade you are accepting.

</Intro>

<YouWillLearn>

- Why a curated model list is guaranteed to be wrong
- What you give up by not having one
- How to discover what a provider currently offers
- What model metadata skyl does and does not give you

</YouWillLearn>

## The decision

```go
Model: "claude-opus-5"     // works the day it launches
Model: "gpt-5.6"
Model: "gemini-3.6-flash"
Model: "llama3.3"          // your own Ollama tag
```

No enum, no validation table, no release required.

<DeepDive title="Why a curated list is guaranteed to be wrong">

Consider a four-week window in mid-2026:

| Model | Released |
|---|---|
| GPT-5.6 Sol | 9 Jul 2026 |
| Gemini 3.6 Flash | 21 Jul 2026 |
| Claude Opus 5 | 24 Jul 2026 |
| Qwen3.7 Flash | 27 Jul 2026 |

Any hardcoded table is wrong within weeks. And the failure mode is the worst
possible one for a library: skyl would be *rejecting a model you are entitled to
use and are already paying for*, because skyl has not cut a release.

Pass-through is correct forever. Recorded as
[ADR-0004](/community/adr/0004-model-ids-are-pass-through).

</DeepDive>

## The price

<Pitfall>

A typo is not a compile error. It is a round trip.

```go
Model: "gpt-5.6-turbo-preview"   // does not exist
```

This reaches the provider and comes back as `ErrNotFound`. You pay a network
round trip and a few hundred milliseconds to learn what an enum would have told
you instantly.

That is the trade, stated plainly. skyl takes it because a wrong rejection is
unrecoverable while a slow rejection is merely annoying.

</Pitfall>

Handle it explicitly, because the message is otherwise easy to misread as a
credential problem:

```go verify
resp, err := client.Complete(ctx, req)
if errors.Is(err, skyl.ErrNotFound) {
	return fmt.Errorf("no model %q on %s — check the spelling, or your account's access", req.Model, resp.Provider)
}
```

## Discovering what is available

Ask the provider, live:

```go verify
models, err := client.Models(ctx)
if err != nil {
	return err
}
for _, m := range models {
	fmt.Printf("%s (%s) context=%d\n", m.ID, m.DisplayName, m.ContextWindow)
}
```

That hits the provider's real models endpoint, so the answer is never stale — it
is not skyl's opinion, it is the provider's answer.

All four adapters support it; none return `ErrUnsupported`. What they *report*
varies:

<DataTable
  headers={['Field', 'anthropic', 'openai', 'openaicompat', 'gemini']}
  rows={[
    ['ID, Provider, Raw', 'yes', 'yes', 'yes', 'yes'],
    ['DisplayName', 'yes', <strong key="a">empty</strong>, 'host-dependent', 'yes'],
    ['ContextWindow', 'yes', <strong key="b">empty</strong>, 'host-dependent', 'yes'],
    ['MaxOutputTokens', 'yes', <strong key="c">never set</strong>, <strong key="d">never set</strong>, 'yes'],
  ]}
/>

OpenAI's models endpoint simply has no such fields — the gap is upstream, not in
the adapter. `ModelInfo.Raw` carries the provider's untouched entry, so anything
they do report is reachable.

<Pitfall>

On Gemini, `Models` ignores `nextPageToken`. Beyond 1000 models the list is
silently truncated. In practice Gemini offers far fewer than that, but if you
depend on completeness, query the endpoint directly.

</Pitfall>

## Model metadata

Context window, pricing and modality are genuinely useful, and skyl does not
have them for every provider today. The plan is a **generated** registry — a
scheduled CI job that queries live provider endpoints and regenerates a
committed file — rather than a hand-typed table that silently rots. Until it
lands, `ModelInfo` carries what the provider returns.

## Practical advice

Put model IDs in configuration, not in code. Since skyl will not validate them,
your config layer is the right place to fail fast:

```go verify
type Config struct {
	FastModel  string `env:"FAST_MODEL,required"`
	SmartModel string `env:"SMART_MODEL,required"`
}
```

That way changing model is a deploy, not a release — which is the whole benefit
pass-through was protecting.

<Recap>

- Model IDs are opaque strings; skyl ships no constants and validates nothing.
- A curated list would eventually reject a model you are entitled to use.
- The price is that a typo costs a round trip and arrives as `ErrNotFound`.
- `Client.Models(ctx)` asks the provider live, so the answer is never stale.
- What model listing reports varies sharply; OpenAI supplies ID and little else.
- Keep model IDs in configuration so changing one is a deploy, not a release.

</Recap>

<Challenges>

<Challenge title="Validate model IDs at startup">

You cannot get compile-time checking, but you can fail at boot rather than on
the first user request.

<Hint>

`Client.Models` gives you the live list. Check your configured IDs against it
once, during startup.

</Hint>

<Solution>

```go verify
func checkModels(ctx context.Context, c *skyl.Client, want ...string) error {
	models, err := c.Models(ctx)
	if err != nil {
		// A provider that cannot list models is not a reason to refuse to
		// start — pass-through still works. Warn and continue.
		log.Printf("could not verify model IDs: %v", err)
		return nil
	}

	have := make(map[string]bool, len(models))
	for _, m := range models {
		have[m.ID] = true
	}
	for _, w := range want {
		if !have[w] {
			return fmt.Errorf("configured model %q is not offered by this provider", w)
		}
	}
	return nil
}
```

Note the deliberate non-failure when listing itself fails. Refusing to start
because a *metadata* endpoint was down would be worse than the typo you are
guarding against.

</Solution>

</Challenge>

</Challenges>
