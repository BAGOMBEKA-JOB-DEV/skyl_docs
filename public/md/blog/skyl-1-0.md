---
title: skyl 1.0
description: The API is frozen. What that promises, what it deliberately does not, and why freezing now was cheap.
date: '2026-09-06'
author: skyl maintainers
---

<Intro>

skyl is v1.0.0. The exported API is frozen: `Provider`, `Client`, `Message`,
`Part`, `Request`, `Response`, `Stream`, the error sentinels and every functional
option will not change without a major version.

This post is about what that is worth, and what it is not.

</Intro>

## Upgrading is a version bump

Nothing broke between v0.1.0 and v1.0.0. The release is additive — structured
output on all four adapters, and `Thinking.Effort` finally reaching Anthropic —
so there is no migration note, because there is nothing to migrate.

```bash
go get github.com/BAGOMBEKA-JOB-DEV/skyl@v1.0.0
```

Four modules move together: the library, `provider/anthropic`, `otel`, and
`gateway`. The gateway also ships its first published container image, signed
and attested.

## What "stable" is a promise about

In Go, a major version is a new import path. Breaking the API means shipping
`.../skyl/v2` and every consumer editing every import line. That cost is the
reason the guarantee is worth anything: it makes breaking a deliberate act
rather than something that happens on a Tuesday.

So the promise is precise. The *shape* of the API is fixed. If you write against
it today, that code compiles against every v1.x release you will ever install.

## What it is not a promise about

It is not a claim that skyl is finished, and this is the part usually left out of
a 1.0 announcement.

Each adapter still silently ignores some provider features. The
[feature matrix](/reference/provider/feature-matrix) lists every one of them,
and [a whole blog post](/blog/silently-ignored) exists because that list costs
you an afternoon if nobody writes it down. Twenty entries survive into v1.0.0.

Embeddings, prompt-caching control, batch APIs, token counting and failover are
all deliberately deferred. Each needs a design decision before code — embeddings
in particular do not belong on `Provider`, because a different shape deserves a
different interface.

Prompt caching is the sharpest of them: skyl *reports* `CacheWriteTokens` while
offering no way to *request* caching. That is a real gap, it is documented as
one, and 1.0 does not close it.

## Why freezing now was cheap

A 1.0 is usually treated as a milestone you earn by finishing. It is more useful
to think of it as a decision about whether the interface is *right*, which is a
different question from whether the feature set is complete.

Every deferred item above is additive. Embeddings get their own interface.
Prompt caching is a new option. Batch, token counting and failover are new
surfaces, not changes to existing ones. None of them forces a v2 — which is
precisely why freezing now costs nothing later.

The interface has also had the one test that matters. Every adapter has been
exercised against its live provider API, so the wire mapping is confirmed rather
than merely self-consistent. Before that, every fake in the test suite had been
written from the same provider documentation as the adapter it tested: a wrong
field name would have been wrong identically in both, and CI would have stayed
green.

That validation is a snapshot, not a subscription. Providers change their
formats, and a run that passed in August proves nothing about today —
[re-run it against your own account](/reference/sandbox/validating) before
depending on a behaviour that matters to you.

## What changes for you

If you were waiting for the API to settle, it has. If you were waiting for
complete provider coverage, read the feature matrix first — it is still the most
useful page on this site, and it is still honest about what is missing.
