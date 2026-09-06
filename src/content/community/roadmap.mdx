---
title: Roadmap
description: What stands between skyl and a library a company can adopt.
---

<Intro>

A living document, ordered by **what blocks adoption** rather than by what is
interesting to build. It came out of an audit that went looking for the gap
between "CI is green" and "a company can depend on this" — and found the gap was
elsewhere, and larger than the test suite could see.

</Intro>

## Where this came from

CI was green: four modules, `-race`, coverage above every floor, a clean linter,
a fuzzer surviving millions of executions. Three things dominated everything
else, and only one of them was visible from inside the test suite.

<DataTable
  headers={['Finding', 'Status']}
  rows={[
    ['skyl could not be installed — no tags, and submodules required the root at v0.0.0 behind replace directives Go ignores', <strong key="a">Fixed</strong>],
    ['The Go 1.26 floor was not justified by the code — nothing outside tests used anything newer than 1.22', <strong key="b">Fixed</strong>],
    ['Some documented rules were not met — §6.5 (honour ProviderOptions), §6.1 (never silently drop data), §8.3 (runnable examples)', <strong key="c">Fixed</strong>],
  ]}
/>

<Note>

**A rule that is documented and unenforced is worse than no rule.** §6.5 and
§6.1 were treated as **defects** rather than as roadmap items — and §6.5 was
fixed with a contract-suite check, so it cannot regress in one adapter while
passing in another.

</Note>

## Phase 0 — Defects ✅

Nine bugs with specific failure modes, each fixed with a regression test that
failed before the fix. The ones worth knowing about because they changed
behaviour:

<DataTable
  headers={['Defect', 'Failure mode']}
  rows={[
    ['Anthropic ignored ProviderOptions', 'The only escape hatch to cache_control, top_k and beta features was unreachable there — with no workaround at all.'],
    ['TotalTokens double-counted cache reads', 'Cost dashboards over-reported by up to ~2× on a well-cached agent loop.'],
    ['Content arrays silently dropped', 'vLLM and some Azure/OpenRouter upstreams yielded a successful response with empty text.'],
    ['Retry-After clamped to maxDelay', 'A standard Retry-After: 60 was truncated to 30s, so the retry landed inside the still-open window and was rejected again.'],
    ['Transport errors lost their cause', 'errors.Is(err, context.DeadlineExceeded) was false after a timeout, and a permanent TLS misconfiguration was retried as transient.'],
    ['Anthropic tool schemas rebuilt lossily', '$defs, $ref and oneOf were dropped, so the same skyl.Tool behaved differently across providers — undercutting the one feature the library is named for.'],
    ['Gemini ignored Request.Thinking', '&Thinking{Enabled: false} could not disable reasoning, so a real cost control silently did nothing.'],
    ['Truncated streams looked complete', 'A connection dropped mid-generation returned a partial answer with a nil error.'],
    ['Refusals reported as success', "ErrRefusal was never produced by any adapter, and the gateway's 422 branch was unreachable."],
  ]}
/>

## Phase 1 — Prove correctness without credentials ✅

The sandbox: a local server speaking all four wire protocols, with fault models
for statuses, truncation and mid-stream errors. Plus runnable `Example`
functions, benchmarks on the per-token paths, and `internal/cassette` for
recorded replay.

The benchmark caught tool-argument accumulation being **quadratic** — 2.2 MB
allocated to assemble a few kilobytes. The fix brought it to 34 KB, and the
benchmark stays as the guard.

## Phase 2 — Make it installable ✅

Tags, the `replace`-directive removal, `go.work` for local development, and a CI
check that refuses a tag whose modules still carry a `replace` or a `v0.0.0`
require. Either one publishes a module nobody can install, and **the proxy will
serve it forever**.

## Phase 3 — What an enterprise review asks for ✅

Supply chain (`govulncheck`, CodeQL, Scorecard, Dependabot, SBOM, signed
provenance, digest-pinned actions, DCO), governance (`NOTICE`, per-module
licences, `CODEOWNERS`, `MAINTAINERS.md`, code of conduct, issue templates), and
the gateway hardening: `/readyz`, `/metrics`, graceful drain, concurrency
limits, rotatable labelled tokens, CORS, SSE keep-alives, and env vars for every
`skyl.Option`.

Plus `skyl/otel` as a fourth module, and
[data-handling](/community/data-handling) and
[threat-model](/community/threat-model) documents.

## Phase 4 — Documentation that survives an evaluation

In progress. The feature matrix, the silently-ignored list, and this site.

## What still limits adoption

<Pitfall>

**Live validation is a snapshot, not a subscription.**

Every adapter was exercised against its real provider API on 2026-08-05, which
is what makes the wire mapping confirmed rather than merely self-consistent —
before that, every fake in the suite had been written from the same provider
documentation as the adapter it tested, so a wrong field name would have been
wrong identically in both and CI would have stayed green.

Providers change their formats without warning, and a run that passed in August
proves nothing about today. `go test -tags=integration -v -run TestLive
./provider/` settles it for your account and your models; the procedure, the
cost and the failure triage are in
[Validating against real providers](/reference/sandbox/validating).

</Pitfall>

Recording a [cassette](/reference/sandbox/test-suites#cassettes) from such a run
improves the suite for everyone permanently, and is the single most useful thing
a contributor with a key can do.

The larger limit is coverage, not correctness: each adapter still silently
ignores some provider features, and the items below are deliberately deferred.

## Deferred, deliberately

- **A generated model registry** — context windows, pricing, modality —
  refreshed from live endpoints by CI. Generated, never hand-typed, so it cannot
  silently rot.
- **Cross-provider fallback.** A product decision, not a library one. See
  [Choosing a Provider](/learn/choosing-a-provider).
- **An `Agent` interface.** Possibly a v2. The Copilot agent runtime is a real,
  interesting capability — it just needs a different shape than `Completer`.

## What this is not

Not a promise of dates. It is an ordered list of what blocks adoption, and it
changes when the answer to that question changes.
