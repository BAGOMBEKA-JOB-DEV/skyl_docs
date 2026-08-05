---
title: Model IDs are pass-through
description: Never block a user from a model they are entitled to use.
---

<Intro>

`Request.Model` is an opaque string passed straight to the provider. skyl ships
no model constants and validates nothing against a list. This is the most
consequential decision in the project.

</Intro>

## The rule

A library that maintains a hardcoded list of valid model IDs will, inevitably,
reject a model that its user is entitled to use — because the model shipped last
Tuesday and the library has not cut a release.

**A model released after your skyl build works immediately.**

## The evidence

Consider a four-week window in mid-2026:

<DataTable
  headers={['Model', 'Released']}
  rows={[
    ['GPT-5.6 Sol', '9 Jul 2026'],
    ['Gemini 3.6 Flash', '21 Jul 2026'],
    ['Claude Opus 5', '24 Jul 2026'],
    ['Qwen3.7 Flash', '27 Jul 2026'],
  ]}
/>

Any hardcoded table is wrong within weeks. And the failure mode is the worst
possible one: skyl *rejecting a model you are already paying for*.

## What it costs you

<Pitfall>

A typo is not a compile error. It is a round trip.

```go
Model: "gpt-5.6-turbo-preview"   // does not exist
```

This reaches the provider and returns
[`ErrNotFound`](/reference/skyl/errors/sentinels) after a network call.

skyl takes that trade because a **wrong rejection is unrecoverable** while a
**slow rejection is merely annoying**.

</Pitfall>

## What follows from it

- `Client.Models(ctx)` asks the provider live rather than returning a
  compiled-in list, so the answer is never stale.
- The sandbox serves a **deliberately small** model catalogue and 404s anything
  else — a sandbox that accepted every string would never exercise the
  not-found path, which is the only thing between a typo and an unactionable
  failure.
- Model metadata, when it lands, will be a **generated** registry refreshed from
  live endpoints by CI — never a hand-typed table that silently rots.

## In practice

<Recipe title="Keep model IDs in configuration">

```go verify
type Config struct {
	FastModel  string `env:"FAST_MODEL,required"`
	SmartModel string `env:"SMART_MODEL,required"`
}
```

Changing model becomes a deploy rather than a release — which is the benefit
pass-through was protecting.

</Recipe>

<Recipe title="Validate at startup, not per request">

```go
// A cheap sanity check. Per request it doubles your calls, and the list is a
// snapshot that can go stale between the check and the call.
if err := checkModels(ctx, client, cfg.FastModel, cfg.SmartModel); err != nil {
	return err
}
```

</Recipe>

Recorded as
[ADR-0004](/community/adr/0004-model-ids-are-pass-through).
