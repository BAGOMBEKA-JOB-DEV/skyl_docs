---
title: Rules of skyl
description: The commitments that shape every decision in the library.
---

<Intro>

These are not style guidelines. They are the commitments that decide arguments —
when a tradeoff is unclear, the rule higher in this list wins. Each one is
observable in the API, and each one has cost skyl something.

</Intro>

## The four

<CardGrid>

<YouWillLearnCard title="Model IDs are pass-through" path="/reference/rules/model-ids-are-pass-through">
Never block a user from a model. A curated list is guaranteed to be wrong.
</YouWillLearnCard>

<YouWillLearnCard title="The abstraction must be escapable" path="/reference/rules/escapable">
skyl must never be the reason you cannot ship.
</YouWillLearnCard>

<YouWillLearnCard title="Never silently drop data" path="/reference/rules/never-drop-data">
Honesty over coverage. Say "we don't support this" rather than pretending.
</YouWillLearnCard>

<YouWillLearnCard title="Dependencies are a tax" path="/reference/rules/dependencies-are-a-tax">
Every dependency is imposed on everyone who imports you, forever.
</YouWillLearnCard>

</CardGrid>

## Why write them down

A library that says "we value simplicity" has said nothing. A library that says
"the core module has zero external dependencies, and here is the module split
that proves it" has made a commitment you can check.

Each rule below is stated with the thing it costs, because a principle with no
cost is a slogan. Pass-through model IDs cost you compile-time checking. Zero
dependencies cost the maintainers a hand-written SSE parser. Refusing to drop
data means some requests fail that could have half-worked.

## Where they came from

They are drawn from the project's own `docs/idea.md` and `docs/rules.md` — the
latter being the checklist a reviewer actually applies. If you are contributing,
read [Engineering Rules](/community/engineering-rules), which covers the full
ten sections including testing, concurrency and security.

## What they are not

skyl is deliberately **not** an agent framework, a prompt-template engine, a
vector database, or an attempt to hide provider differences entirely. Some
differences are real and matter; skyl unifies the common 90% and exposes the
rest rather than pretending it away.
