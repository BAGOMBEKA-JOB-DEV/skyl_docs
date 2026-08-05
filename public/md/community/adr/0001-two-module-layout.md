---
title: "ADR-0001: Two-module repository layout"
description: Why the repository is several Go modules rather than one.
---

<Intro>

**Status:** Accepted. Superseded in detail by
[ADR-0003](/community/adr/0003-gateway-as-separate-module),
[ADR-0006](/community/adr/0006-anthropic-adapter-is-its-own-module) and
[ADR-0007](/community/adr/0007-otel-is-its-own-module), which added the third
and fourth modules.

</Intro>

## Context

skyl is a library. It is also, usefully, an HTTP service and an observability
integration. Those are different products with different dependency appetites.

A single Go module means one `go.mod`, so **every dependency any part needs is
imposed on everyone who imports any part**. Someone who wants a Go library that
talks to Gemini would inherit a router, an OpenTelemetry SDK and a vendor SDK
they never call — forever, including in their security scanners and their
upgrade schedule.

Go module versioning also means one version number for everything, so a patch to
the gateway forces a version bump on the library.

## Decision

**The repository holds several Go modules**, each with its own `go.mod` and its
own tag prefix.

The core library takes **zero external dependencies**. Anything that brings a
dependency graph becomes a separate module.

<ModuleTable />

## Consequences

**Good.** `go get` on the core library adds nothing to your dependency tree. The
Go version floors can differ, so the library stays on 1.22 while the SDK-bound
modules sit at 1.24 and 1.25. Modules version independently.

**Bad.** Releasing is more complicated, and the ordering is not optional —
each module's `require` must point at a version that already exists on the
proxy. See [Releasing](/community/releasing).

Local development needs `go.work`, and CI must build with `GOWORK=off` to prove
each module resolves on its own.

<Pitfall>

The failure this shape *introduced* was real: submodules once required the root
at `v0.0.0` behind `replace` directives. Go ignores `replace` in non-main
modules, so **the install command in the README did not work for anyone outside
the repository** — while working perfectly for everyone inside it.

CI now refuses a tag whose modules still carry a `replace` or a `v0.0.0`
require.

</Pitfall>

## Alternatives considered

**One module.** Simpler to release, and it makes every library user pay for the
gateway. Rejected: the whole value of a dependency-light library evaporates.

**Separate repositories.** Clean dependency separation, at the cost of
cross-repository changes for anything touching the seam — and the seam changes
most often. Rejected as premature.

**Build tags.** A single module where optional pieces are excluded by tag. Does
not work: `go.mod` requirements are not tag-conditional, so the dependencies
would be inherited regardless.
