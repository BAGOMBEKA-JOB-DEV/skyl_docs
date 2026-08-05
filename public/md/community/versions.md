---
title: Versions
description: What pre-v1 means for breaking changes, and which versions are supported.
---

<Intro>

skyl is **pre-v1**. This page says exactly what that means for you, because
"expect breaking changes" on its own is not useful planning information.

</Intro>

## Current version

<DataTable
  headers={['', '']}
  rows={[
    ['Version', <strong key="a">0.1.0 — unreleased</strong>],
    ['Status', 'Ready to evaluate, not ready to depend on in production'],
    ['License', 'Apache 2.0'],
  ]}
/>

## The versioning policy

skyl follows [Semantic Versioning](https://semver.org/). Until v1.0.0:

- **Breaking changes may land in minor releases.** They will always be listed in
  the changelog **with a migration note** — never silently.
- After v1.0.0, no breaking change to exported API without a major bump.

## Go version floors

Each module declares the floor its dependencies actually set. Since Go 1.21 the
`go` directive is a hard requirement rather than a suggestion, so these are not
choices.

<ModuleTable />

CI builds every module against **its own floor**, so a directive that drifts from
what the code needs fails the build rather than reaching a user.

## Supported versions

Only the latest release receives fixes. There are **no maintained backport
branches** — a pre-v1 project maintaining backports is a pre-v1 project not
reaching v1.

## What "not ready to depend on" means

<Unvalidated />

This is the project's own assessment, stated on the front page of the
repository. It follows from its third design principle — honesty over coverage —
and it is worth reading literally rather than as modesty.

The gap is specific and closable: it needs someone with real credentials to run
`go test -tags=integration`, or to record a cassette. See
[The three test suites](/reference/sandbox/test-suites).

## Breaking changes so far

The pre-0.1.0 development period included several, all recorded with migration
notes. The two most consequential:

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

This site documents **v0.1.0**, shown in the badge beside the logo. There is no
version archive yet — there has been only one version.
