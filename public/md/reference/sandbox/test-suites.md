---
title: The three test suites
description: And the gap between the second and the third, which is the whole story.
---

<Intro>

skyl has three test suites. Two run in CI on every change. The third is the one
only you can run, and it is the one that decides whether skyl is ready to depend
on.

</Intro>

## The suites

<TestSuiteTable />

## What each proves

**`go test ./...`** — mapping logic, in process. Every adapter test runs against
an `httptest.Server` replaying recorded payloads. Fast, and covers the branches.

**`go test -tags=sandbox ./...`** — the full stack over **real sockets**. This is
what the sandbox exists for: chunked SSE arriving in pieces, connection reuse,
status codes, `Retry-After`, cancellation landing mid-backoff. It needs no
credential, so CI runs it on every change.

**`go test -tags=integration ./...`** — real providers. Needs your keys, costs
money, and is excluded from default CI for both reasons.

## The gap

<Pitfall>

**The gap between the second and third suites is the whole story.**

The sandbox was written from the same provider documentation as the adapters. If
a field name is wrong, the fake is wrong in the same way and **both stay green**.

Only the live suite settles it, and it needs your own credentials:

<TerminalBlock>{`export ANTHROPIC_API_KEY=... OPENAI_API_KEY=... GEMINI_API_KEY=...

# openai, gemini and openaicompat live in the root module.
go test -tags=integration -v -run TestLive ./provider/

# provider/anthropic is its own module.
cd provider/anthropic && go test -tags=integration -v -run TestLive ./...`}</TerminalBlock>

A full pass is **8 checks per provider** and costs roughly **$0.05–0.50**. See
[Validating against real providers](/reference/sandbox/validating) for what each
check proves and how to read a failure.

</Pitfall>

This is why the project describes itself as **ready to evaluate, not ready to
depend on**. Everything is implemented, unit-tested, contract-tested, exercised
end to end over real sockets and CI-green — and no adapter has yet made a call
to a real provider.

## Cassettes

There is a fourth mechanism that narrows the gap without needing everyone to
hold a key: `internal/cassette` records real provider HTTP exchanges and replays
them, using the standard library only.

One contributor with a key records; everyone else replays offline, forever.
Credentials are scrubbed on write, and a test walks every committed fixture
looking for credential-shaped strings.

Replay tests are **untagged**, so they begin asserting in ordinary CI as soon as
a recording lands — which means the first person to record a real exchange
improves the suite for everyone permanently.

## The contract suite

`internal/providertest` is a shared suite every adapter must pass. It exists so
a rule cannot be met by one adapter and quietly missed by another — it is what
caught `provider/anthropic` ignoring `ProviderOptions` entirely, and what now
asserts that every adapter honours it.

If you write your own adapter, running against the same expectations is the
fastest way to know it behaves like an in-tree one. See
[Writing an Adapter](/community/writing-an-adapter).

## Other guarantees

- **`-race` on every package, in CI, on every push.**
- **Goroutine-leak checks** on streaming, because a leaked goroutine per request
  is the kind of bug that only shows up in production at 3am.
- **Fuzzing** on the SSE parser.
- **Benchmarks** on the per-token paths — SSE frame parsing, per-chunk JSON
  decode, tool-argument accumulation. One of them caught the accumulation being
  quadratic, and stays as the guard.
- **Error paths are tested as thoroughly as success paths**; every branch of the
  error classifier has a case.

## Troubleshooting

<Trouble problem="Should I run the integration suite?">

If you are evaluating skyl for production, **yes** — it is the only thing that
answers the question you actually have. It costs a few cents.

</Trouble>

<Trouble problem="The sandbox suite passes but a real provider rejects my request">

Exactly the gap described above. Please report it: a field name the sandbox and
the adapter agree on but the provider does not is the single most valuable bug
report this project can receive.

</Trouble>
