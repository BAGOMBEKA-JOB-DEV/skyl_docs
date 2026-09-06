---
title: Versions
description: What v1.0.0 guarantees, what it does not, and which versions are supported.
---

<Intro>

skyl is **v1.0.0**. The exported API is frozen. This page says exactly what that
guarantees and what it does not, because "stable" on its own is not useful
planning information.

</Intro>

## Current version

<DataTable
  headers={['', '']}
  rows={[
    ['Version', <strong key="a">1.0.0 — released 2026-09-06</strong>],
    ['Status', 'API stable; provider coverage still incomplete'],
    ['License', 'Apache 2.0'],
  ]}
/>

## The versioning policy

skyl follows [Semantic Versioning](https://semver.org/). Since v1.0.0:

- **No breaking change to the exported API without a major version.** In Go a
  major version is a new import path — `.../skyl/v2` — so breaking is a
  deliberate act, not an oversight. That cost is the point.
- **Additive changes are minor releases**; fixes are patches. Both are listed in
  the changelog.
- The freeze covers `Provider`, `Client`, `Message`, `Part`, `Request`,
  `Response`, `Stream`, the error sentinels and every functional option.

### What the freeze does not cover

The API is a contract about *shape*, not about *coverage*. Still outstanding,
and still published rather than implied:

- Each adapter silently ignores some provider features — see the
  [feature matrix](/reference/provider/feature-matrix) and
  [what is silently ignored](/reference/provider/silently-ignored).
- Embeddings, prompt-caching control, batch APIs, token counting and failover
  are deliberately deferred. Each needs a design decision before code;
  embeddings in particular do not belong on `Provider`.

None of those requires a breaking change to add, which is why freezing now costs
nothing later.

## Go version floors

Each module declares the floor its dependencies actually set. Since Go 1.21 the
`go` directive is a hard requirement rather than a suggestion, so these are not
choices.

<ModuleTable />

CI builds every module against **its own floor**, so a directive that drifts from
what the code needs fails the build rather than reaching a user.

## Supported versions

**v1.x is supported.** Fixes land on `main`, ship in the next release, and are
backported to the current minor series as a patch.

v0.1.0 is superseded and receives nothing. Upgrading to v1.x breaks no API, so
there is no cost to moving off it.

There are **no maintained backport branches** beyond the current minor. One
maintainer cannot honestly promise more.

## What "validated" means here

<ValidationSnapshot />

Validation is a point in time, not a standing guarantee — providers change their
wire formats without warning. Re-run it against your own account and models with
`go test -tags=integration -v -run TestLive ./provider/`; see
[Validating against real providers](/reference/sandbox/validating) and
[The three test suites](/reference/sandbox/test-suites).

## Breaking changes so far

All of them predate v1.0.0. Nothing broke between v0.1.0 and v1.0.0, and nothing
may break again without a v2. Recorded here because they are still the two most
likely to bite anyone upgrading from a pre-0.1.0 checkout:

**The gateway's chat wire format was redesigned.** `ChatMessage.content` was a
string and became a list of typed parts, with a `text` shorthand.

```json
{"role": "user", "content": "hi"}    // OLD — now returns 400
{"role": "user", "text": "hi"}       // NEW
```

This is what makes a tool-calling loop possible at all: the old format could not
express an assistant turn containing tool calls. `DisallowUnknownFields` is on,
so **upgrade gateways before clients**.

**`Usage.TotalTokens()` stopped double-counting cached tokens.**
`InputTokens` is now the total input *including* cache, and the cache figures
are a breakdown of it rather than an addition. If you were computing
`InputTokens + CacheReadTokens` yourself, **drop the addition**.

## Reading the changelog

`CHANGELOG.md` follows [Keep a Changelog](https://keepachangelog.com/). Breaking
changes appear under **Changed** with a bolded migration note; the **Fixed**
section names the behaviour that was wrong rather than the commit that fixed it.

## Documentation versions

This site documents **v1.0.0**, shown in the badge beside the logo. There is no
version archive: the API is frozen, so one set of documentation describes every
v1.x release.
