---
title: "ADR-0004: Model IDs are opaque pass-through strings"
description: The most consequential decision in the project.
---

<Intro>

**Status:** Accepted.

</Intro>

## Context

Most SDKs ship model constants — `openai.GPT4Turbo`, that sort of thing. It
gives you autocomplete, compile-time checking against typos, and a discoverable
list.

It also means the library maintains a table of what exists. And model releases
are frequent and unannounced. Consider a four-week window in mid-2026:

<DataTable
  headers={['Model', 'Released']}
  rows={[
    ['GPT-5.6 Sol', '9 Jul 2026'],
    ['Gemini 3.6 Flash', '21 Jul 2026'],
    ['Claude Opus 5', '24 Jul 2026'],
    ['Qwen3.7 Flash', '27 Jul 2026'],
  ]}
/>

A library that validates against a table will, inevitably, **reject a model its
user is entitled to use and is already paying for** — because the model shipped
last Tuesday and the library has not cut a release.

## Decision

**`Request.Model` is an opaque string, passed to the provider untouched.** skyl
ships no model constants and validates nothing against a list.

`Client.Models(ctx)` asks the provider **live** rather than returning a
compiled-in answer.

## Consequences

**Good.** A model released after your skyl build works immediately, with no
upgrade. skyl can never be the reason you cannot reach a model. There is no
table to maintain, and none to rot.

**Bad.** A typo is **not a compile error** — it is a round trip, returning
`ErrNotFound`. You lose autocomplete, and you lose the discoverability a
constant list provides.

<Pitfall>

The trade, stated plainly: skyl accepts a **slow rejection** to avoid a **wrong
rejection**. The first is annoying; the second is unrecoverable.

</Pitfall>

## What follows from it

- The **sandbox serves a deliberately small catalogue** and 404s everything else.
  A sandbox that accepted every string would never exercise the not-found path —
  which is the only thing standing between a typo and an unactionable failure.
- Model **metadata**, when it lands, will be a **generated** registry refreshed
  from live provider endpoints by CI. Generated, never hand-typed, so it cannot
  silently rot.
- `Models` earns its place in the
  [four-method interface](/community/adr/0002-provider-interface), because live
  discovery is the only honest answer to "what can I use?"

## Alternatives considered

**A curated enum.** Rejected for the reason above.

**A soft warning** — accept anything, but log when the model is not in a known
list. Rejected: the list still rots, and now it produces false warnings on every
new model, training users to ignore warnings.

**Validation against a live list**, fetched at startup. Rejected: it adds a
network call to construction, fails when a metadata endpoint is down, and the
list can still go stale between the check and the call. Doing it *yourself* at
startup is fine and documented — but skyl imposing it is not.

## What would change this

Nothing plausible. The decision is a direct consequence of models shipping
faster than libraries release, and that is not a temporary condition.
