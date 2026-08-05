---
title: Contributing
description: How to propose a change, and what CI will run.
---

<Intro>

skyl is a small library with an unusually explicit standard for what "done"
means. Reading [Engineering Rules](/community/engineering-rules) first will save
you a round trip — they are the checklist a reviewer actually applies.

</Intro>

## Before you start

Open an issue for anything larger than a bug fix. The project has explicit
[non-goals](/reference/rules), and a change that conflicts with one is better
discussed than written.

Good first contributions:

- A **cassette recording** of a real provider exchange. One contributor with a
  key records; everyone else replays offline, forever. This is the single most
  valuable thing you can contribute right now.
- A **feature-matrix correction**. If a cell no longer matches the code, that is
  a bug — and making drift somebody's problem is the only way it gets fixed.
- **An adapter** for a provider whose API is genuinely a different shape.

## The DCO

Every commit must be signed off:

<TerminalBlock>git commit -s -m "fix: correct the retry-after cap"</TerminalBlock>

That adds a `Signed-off-by` line certifying you have the right to submit the
work. CI enforces it, and a repository hook can add it for you:

<TerminalBlock>git config core.hooksPath .githooks</TerminalBlock>

## What CI runs

<DataTable
  headers={['Check', 'What it means for you']}
  rows={[
    [
      <span key="a">
        <code>go build</code> per module, with <code>GOWORK=off</code>
      </span>,
      'Each module must resolve on its own — the workspace is for local development only.',
    ],
    [<code key="c">go test ./...</code>, 'Unit tests, under -race.'],
    [<code key="d">go test -tags=sandbox ./...</code>, 'The full stack over real sockets. Needs no credential.'],
    ['golangci-lint', 'The configuration is in the repository.'],
    ['Coverage threshold', 'New code needs tests. §3.1: every exported function has one.'],
    ['govulncheck, CodeQL, Scorecard', 'Supply chain.'],
    ['DCO', 'Every commit signed off.'],
  ]}
/>

The `-tags=integration` suite is **not** run in CI — it needs real keys and costs
money. Run it locally if your change touches an adapter's wire mapping.

## The rules that catch people out

<Pitfall>

**Every exported symbol needs a doc comment** that says something useful.
*"Client is a client."* is not a doc comment.

**Never branch on error message text.** Adapters map vendor errors onto a
sentinel. Nothing in skyl may match on a message — that breaks the moment a
vendor rewords one.

**No `panic` in library code.** The only permitted panics are for programmer
error that cannot be recovered from — a nil `Provider` passed to `New` — and
those are documented on the function.

**No network access in unit tests.** Use `httptest.Server`. A suite that needs
the internet is a suite that does not run.

**Streaming tests must assert no goroutine leaks**, including on early `Close()`
and on cancellation mid-stream.

</Pitfall>

## Adding an adapter

Every adapter runs the shared contract suite in `internal/providertest`. It
enforces the adapter rules uniformly, so a rule added there is enforced
everywhere at once and no adapter can regress behind another's tests.

See [Writing an Adapter](/community/writing-an-adapter).

## Commit messages

Conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`.
The subject is lowercase and imperative. Explain **why** in the body — the diff
already says what.

## Releasing

Contributors do not cut releases. If your change is user-visible, add a
`CHANGELOG.md` entry under *Unreleased*, with a migration note if it is
breaking. See [Releasing](/community/releasing).

## Code of conduct

By participating you agree to the [Code of Conduct](/community/code-of-conduct).
