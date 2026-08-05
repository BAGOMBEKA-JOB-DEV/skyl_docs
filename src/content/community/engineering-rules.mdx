---
title: Engineering Rules
description: The standards every change must meet. Not aspirational — CI enforces most of them.
---

<Intro>

These are the standards every change to skyl must meet. They are not
aspirational: CI enforces most of them, and review enforces the rest. If a rule
blocks something genuinely necessary, change the rule in a PR and say why — do
not route around it silently.

</Intro>

## 1. Public API

**1.1** Every exported symbol has a doc comment, starting with its name, in full
sentences. `go vet` and the linter enforce the form; review enforces that it
says something useful. *"Client is a client."* is not a doc comment.

**1.2** No breaking changes to exported API after v1.0.0 without a major version
bump and a migration note. Before v1, breaking changes are allowed but must
appear in the changelog.

**1.3** Accept interfaces, return structs. Constructors return concrete types so
callers can see what they have.

**1.4** Functional options for anything optional. Never a growing positional
parameter list, and never an exported config struct that cannot gain a field
without breaking users.

**1.5** `context.Context` is the first parameter of every function that does
I/O, and it **must be honoured** — passed to the request, not accepted and
ignored.

**1.6** **No `panic` in library code.** The only permitted panics are for
programmer error that cannot be recovered from — a nil `Provider` passed to
`New` — and those are documented on the function.

## 2. Errors

**2.1** Wrap with `%w`. Callers must be able to `errors.Is` through every layer.

**2.2** **Classify, don't stringify.** Adapters map vendor errors onto a
sentinel. Nothing in skyl may branch on error message text — that breaks the
moment a vendor rewords a message.

**2.3** Error strings are lowercase and unpunctuated, prefixed `skyl:` at the
boundary.

**2.4** Never discard an error. `_ =` requires a comment explaining why it
genuinely cannot matter.

**2.5** **Errors never contain credentials.** API keys must not reach an error
string, a log line, or `Error.Body`. **There is a test for this.**

## 3. Testing

**3.1** Every exported function has a test. No exceptions for "obvious" code;
obvious code is where the embarrassing bugs live.

**3.1a** Every adapter runs the shared contract suite in
`internal/providertest`, so a rule added there is enforced everywhere at once and
no adapter can regress behind another's tests.

**3.2** Table-driven tests with **named** cases. The name is printed on failure,
so it must identify the case: `"rate limit with retry-after header"`, not
`"case 3"`.

**3.3** **No network access in unit tests.** Use `httptest.Server`. A suite that
needs the internet is a suite that does not run.

**3.4** **Test the error paths.** Every branch of a classifier, every malformed
payload, every truncated stream. Coverage of happy paths only is theatre.

**3.5** `t.Parallel()` where safe, and the suite must pass under `-race`.

**3.6** Streaming tests assert **no goroutine leaks**, including on early
`Close()` and on cancellation mid-stream.

## 4. Dependencies

**4.1** **The core module has zero external dependencies.** Anything that brings
a dependency graph becomes a separate module — that is why
`provider/anthropic`, `gateway` and `otel` exist as their own modules.

## 5. Concurrency

`Client` and every adapter are safe for concurrent use. They hold no mutable
per-request state. A `Stream` is **not** concurrency-safe: one stream, one
consuming goroutine.

## 6. Provider adapters

**6.5** Every adapter must honour `Request.ProviderOptions`. This was once
violated silently by `provider/anthropic`, which is why the contract suite now
asserts it.

Adapters must also populate `Response.Raw`, read `Model` from the response,
return `ErrUnsupported` rather than dropping data, and report truncation rather
than emitting a clean terminal event over a partial answer.

## 7. Security

**7.2** Credentials are scrubbed from anything written down. A test walks every
committed fixture looking for credential-shaped strings.

## 8. Documentation

**8.3** Runnable examples live in `example_test.go` as `Example` functions, so CI
breaks when they rot rather than a reader discovering it.

## 9 & 10. Git and tooling

Conventional commits, DCO sign-off on every commit, `gofmt`, and
`golangci-lint` with the repository's configuration.

## Why they are written down

<DeepDive title="A rule with no cost is a slogan">

Each of these has cost the project something. Zero dependencies cost a
hand-written SSE parser and a fuzz suite. No-panic cost an error return on every
path. Refusing to branch on message text cost a full classification layer per
adapter.

Writing them down means an argument about a tradeoff has somewhere to land other
than taste — and means a contributor can predict what review will say before
they write the code.

</DeepDive>

The full text lives in `docs/rules.md` in the repository. See also the
[Rules of skyl](/reference/rules), which cover the four design principles those
standards serve.
