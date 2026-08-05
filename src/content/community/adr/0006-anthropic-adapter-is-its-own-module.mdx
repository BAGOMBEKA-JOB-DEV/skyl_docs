---
title: "ADR-0006: The Anthropic adapter is its own module"
description: Why Claude support is a second go get.
---

<Intro>

**Status:** Accepted.

</Intro>

## Context

`provider/openai`, `provider/gemini` and `provider/openaicompat` are written
directly against `net/http` and `encoding/json`, so they cost nothing to ship
inside the core module.

Anthropic is different. The adapter is built on the **official
`anthropic-sdk-go`**, which brings roughly a dozen transitive dependencies and
sets its own Go version floor at 1.24.

Putting it in the core module would charge **every** skyl user — including
someone who only ever calls Gemini — for a vendor SDK they never touch, and would
raise the library's Go floor from 1.22 to 1.24 for everyone.

## Decision

**`provider/anthropic` is a separate Go module**, installed explicitly:

<TerminalBlock>go get github.com/BAGOMBEKA-JOB-DEV/skyl/provider/anthropic</TerminalBlock>

## Consequences

**Good.** The core module keeps **zero external dependencies** and a Go 1.22
floor. A user who wants Gemini inherits nothing from Anthropic's SDK — not its
dependencies, not its Go requirement, not its CVEs.

**Bad.** Claude support requires a second `go get`, which is a real papercut and
the most common surprise in the library. It also means one more module in the
release process.

And it produces an asymmetry that reads as arbitrary until you know why: three
adapters ship in the core, one does not.

## Why use the SDK at all

<DeepDive title="It could have been hand-written like the other three">

Writing it against `net/http` would have kept everything in one module.

It was rejected because Anthropic's API has the most vendor-specific surface of
the four — typed content blocks, extended thinking, prompt-cache breakpoints,
`is_error` on tool results — and those are precisely the features that make a
native adapter worth having over `openaicompat`. Tracking them by hand means
tracking a moving target, and getting a field name wrong is exactly the failure
class skyl already cannot detect without live credentials.

The SDK is the vendor's own model of their API. Using it trades a dependency for
correctness on the surface where correctness is hardest.

</DeepDive>

## What it costs, concretely

The SDK adds headers skyl never asked for and cannot remove:
`X-Stainless-OS`, `X-Stainless-Arch`, `X-Stainless-Runtime-Version`,
`User-Agent` and others — your operating system, CPU architecture and exact Go
toolchain version, on every request.

That is documented in [Data Handling](/community/data-handling), because it is a
real consequence users should be able to see rather than discover.

It also forced a design difference: the adapter builds a **typed params struct**
rather than a map, so `ProviderOptions` had to be applied by **JSON path**
instead of by shallow merge — which turned out to be strictly more capable, and
is the one place in skyl where a key containing a `.` changes meaning.

## Alternatives considered

**Hand-write it.** See the deep dive above.

**Put the SDK in the core module.** Rejected: it taxes every user for one
vendor.

**A build tag.** Does not work — `go.mod` requirements are not tag-conditional.

## Related

Same reasoning as
[ADR-0003](/community/adr/0003-gateway-as-separate-module) and
[ADR-0007](/community/adr/0007-otel-is-its-own-module). The rule is
[dependencies are a tax](/reference/rules/dependencies-are-a-tax).
