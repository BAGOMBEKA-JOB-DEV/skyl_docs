---
title: Project Plan
description: Milestones, scope, and what is explicitly out of scope.
---

<Intro>

A living document tracking the milestones that built what exists. The
[roadmap](/community/roadmap) tracks what stands between that and production
adoption; this tracks what has been done.

</Intro>

## Milestones

### M0 — Foundation ✅

Repository, governance, and the decisions everything else depends on: the module
path, `docs/` with idea/architecture/rules/providers/gateway/getting-started, the
first six ADRs, `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`, and a
feature-branch workflow on `main`.

### M1 — Core library ✅

The provider-agnostic types and the client that drives them:

- `Message` / `Part` conversation model — text, image, tool call, tool result
- `Request` / `Response` / `Usage` / `StopReason`
- The `Provider` interface — the seam
- `Client` with validation, retry, hooks and timeouts
- Typed error classification
- Exponential backoff with **full jitter** and `Retry-After` support
- `Stream` pull iterator with leak-free cancellation
- An internal SSE reader

### M2 — Provider adapters ✅

All four, plus live model discovery on each. `provider/anthropic` as a separate
module built on the official SDK; `openai`, `gemini` and `openaicompat` inside
the core module.

### M3 — Test suite ✅

Table-driven unit tests with `httptest` fakes and **no network**; error-path
coverage per adapter; the shared contract suite in `internal/providertest` that
every adapter runs; goroutine-leak assertions on abandoned streams; a fuzz
target on the SSE reader; `-race` clean.

### M4 — Gateway ✅

chi router, mandatory bearer auth, the typed-parts wire format, SSE streaming
with keep-alives, health and readiness, Prometheus metrics, graceful drain, and
environment configuration for every `skyl.Option`.

### M5 — Hardening ✅

Supply chain, governance, `skyl/otel`, the sandbox, cassettes, benchmarks, and
the data-handling and threat-model documents.

### M6 — Live validation

**Not done.** This is the milestone that decides whether skyl is ready to depend
on. See the [roadmap](/community/roadmap).

A generated model registry — context window, pricing, modality, refreshed from
live endpoints by CI — is scoped here too.

## Under consideration

- **An `Agent` interface.** The Copilot agent runtime is a real capability with a
  fundamentally different shape from a completions call. Possibly a v2.
- **Embeddings.** A genuinely different request/response shape; adding it to
  `Provider` would mean several adapters returning `ErrUnsupported` from a
  fifth method, which is the failure mode
  [ADR-0002](/community/adr/0002-provider-interface) rejects.
- **A generated model registry.**

## Explicitly out of scope

<DataTable
  headers={['Not a goal', 'Why']}
  rows={[
    ['An agent framework', 'Planning loops, memory and orchestration are opinionated and change fast. skyl is the transport layer they sit on.'],
    ['A prompt-template engine', <span key="a">Go has <code>text/template</code>.</span>],
    ['A vector database or RAG stack', 'Different problem, different library.'],
    ['Hiding provider differences entirely', 'Some differences are real and matter. skyl unifies the common 90% and exposes the rest rather than pretending it away.'],
    ['Supporting every model at full fidelity', 'Native adapters get deep support; the long tail is reached through openaicompat at whatever fidelity that endpoint offers. Documented, not disguised.'],
    ['Cross-provider fallback', 'A product decision — the second model answers differently, costs differently, and may have different data-residency implications.'],
  ]}
/>

## Who this is for

Go teams adding AI features who do not want to own vendor plumbing; teams running
**multi-provider** setups for cost, latency or redundancy; anyone developing
against a local model and deploying against a hosted one; and platform teams who
need a **single audited egress point** for model traffic — which is what the
gateway is for.

## Who this is not for

If you use exactly one model from exactly one vendor and always will, use that
vendor's official SDK. It will always support their newest feature first.

**skyl earns its place the moment you have a second model.**
