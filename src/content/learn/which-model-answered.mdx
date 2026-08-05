---
title: Which Model Actually Answered
description: Response.Model is read from the response, not echoed from your request.
---

<Intro>

You asked for `gpt-5.6`. Something answered. `Response.Model` tells you what,
and it is not always the same string — which matters more than it sounds when
you are comparing cost, latency or quality across a fleet.

</Intro>

<YouWillLearn>

- Why `Response.Model` is read from the response
- The three reasons a provider serves a different model
- How to detect and record substitutions
- What each adapter reads it from

</YouWillLearn>

## It is not an echo

```go verify
resp, err := client.Complete(ctx, &skyl.Request{Model: "gpt-5.6", /* … */})

fmt.Println(req.Model)   // gpt-5.6              — what you asked for
fmt.Println(resp.Model)  // gpt-5.6-2026-07-09   — what answered
```

Every adapter reads it from the provider's reply: Anthropic and the
OpenAI-format adapters from the response body's `model` field, Gemini from
`modelVersion`.

## Why they differ

**Alias resolution.** `gpt-5.6` is a moving pointer to a dated snapshot.
Providers resolve it at request time and tell you which one they picked.

**Capacity fallback.** Under load some providers serve a nearby model rather
than queueing or failing.

**Account routing.** Enterprise deployments may pin a specific snapshot for
reproducibility, so the alias resolves differently than it does on a personal
key.

<DeepDive title="Why this is worth a field of its own">

Because every number you compute about a model is wrong if you attribute it to
the wrong one.

A latency regression that appears when a provider silently moves an alias to a
new snapshot looks like *your* regression. A cost report grouped by
`req.Model` merges two snapshots with different pricing into one line. A quality
evaluation that says "gpt-5.6 scores 0.82" is meaningless if half the run was
served by a different snapshot.

skyl could have echoed the request — it would have been simpler, and nobody
would have noticed. Reading the response is the difference between a number and
a guess.

</DeepDive>

## Recording it

The right thing to group metrics by is `resp.Model`, and the right thing to log
alongside it is `resp.ID`:

```go verify
skyl.WithHook(func(_ context.Context, ev skyl.HookEvent) {
	// ev.Model is what was asked for; ev.ResponseModel is what answered.
	metrics.Record(ev.Provider, ev.ResponseModel, ev.Duration, ev.Usage.TotalTokens())

	if ev.ResponseModel != "" && ev.ResponseModel != ev.Model {
		log.Printf("substitution: asked %q, served %q (response %s)",
			ev.Model, ev.ResponseModel, ev.ResponseID)
	}
})
```

`HookEvent` carries both deliberately, for exactly this comparison.

<Pitfall>

Do not treat a substitution as an error. Alias resolution is normal and
constant — logging it at warning level will drown your logs on the first day.
Log it at info, or only when the *prefix* differs:

```go verify
// Only flag a genuinely different model family, not a dated snapshot.
if !strings.HasPrefix(ev.ResponseModel, ev.Model) {
	log.Printf("unexpected model: asked %q, served %q", ev.Model, ev.ResponseModel)
}
```

</Pitfall>

## When it is empty

`Response.Model` is best-effort. A provider that does not report it leaves the
field empty — so guard before comparing, or every response from such a provider
looks like a substitution.

## Reproducibility

If you need a fixed model for an evaluation or a regression test, pin the dated
snapshot in your configuration rather than the alias:

```go
FastModel:  "gpt-5.6-2026-07-09"   // pinned, reproducible
SmartModel: "claude-opus-5"        // moving, always current
```

skyl passes both through untouched, so this is entirely your choice — which is
the point of [pass-through model IDs](/learn/model-ids).

<Recap>

- `Response.Model` is read from the provider's reply, not echoed from your request.
- Aliases, capacity fallback and account routing all cause substitutions.
- Group metrics by `resp.Model` / `ev.ResponseModel`, or your numbers merge snapshots.
- Substitution is normal — log it at info, and only flag a different model *family*.
- The field is best-effort; guard against empty before comparing.
- Pin a dated snapshot in config when you need reproducibility.

</Recap>

<Challenges>

<Challenge title="Detect an alias moving under you">

Write a check that alerts when the snapshot behind an alias changes, without
alerting on every request.

<Hint>

Remember the last value you saw per requested model.

</Hint>

<Solution>

```go verify
type tracker struct {
	mu   sync.Mutex
	seen map[string]string // requested model -> last snapshot that answered
}

func (t *tracker) observe(asked, served string) {
	if served == "" || served == asked {
		return
	}
	t.mu.Lock()
	defer t.mu.Unlock()

	if prev, ok := t.seen[asked]; ok && prev != served {
		log.Printf("alias %q moved: %s -> %s", asked, prev, served)
	}
	t.seen[asked] = served
}
```

This fires once per move rather than once per request, which is the difference
between a useful signal and noise. Wire it into a hook and you will know the
morning a provider re-points an alias — usually before they announce it.

</Solution>

</Challenge>

</Challenges>
