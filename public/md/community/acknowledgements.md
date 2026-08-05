---
title: Acknowledgements
description: What skyl is built on, and what it learned from.
---

<Intro>

skyl's core module has zero external dependencies, which makes the list of
things it stands on shorter than most — but not empty, and worth naming.

</Intro>

## The standard library

The core module is `net/http` and `encoding/json`, and very little else. The SSE
reader, the backoff implementation and the HTTP layer are hand-written because
[dependencies are a tax](/reference/rules/dependencies-are-a-tax) — but they are
hand-written *on top of* a standard library good enough to make that a
reasonable decision rather than a heroic one.

`errors.Is`, `errors.As` and multi-error `Unwrap` in particular do a great deal
of work in skyl's error model.

## Direct dependencies, in the modules that have them

<DataTable
  headers={['Module', 'Depends on', 'For']}
  rows={[
    [<code key="a">provider/anthropic</code>, <a key="b" href="https://github.com/anthropics/anthropic-sdk-go">anthropic-sdk-go</a>, "Anthropic's official Go SDK"],
    [<code key="c">gateway</code>, <a key="d" href="https://github.com/go-chi/chi">go-chi/chi</a>, 'Routing and middleware'],
    [<code key="e">otel</code>, <a key="f" href="https://opentelemetry.io/">OpenTelemetry Go</a>, 'Traces and metrics'],
  ]}
/>

Each lives in its own module precisely so that nobody who does not want it pays
for it.

## Conventions it follows

- **[OpenTelemetry GenAI semantic conventions](https://opentelemetry.io/docs/specs/semconv/gen-ai/)**
  — so model traffic looks the same in your observability stack whichever
  provider served it.
- **[Keep a Changelog](https://keepachangelog.com/)** and
  **[Semantic Versioning](https://semver.org/)**.
- **[Contributor Covenant](https://www.contributor-covenant.org/)**.
- **[Developer Certificate of Origin](https://developercertificate.org/)**.

## Ideas it borrowed

The **functional options** pattern, which is Go community folklore by now but
worth naming.

The **closed interface** — an interface with an unexported marker method — which
is how `Part` turns a class of runtime bug into a compile error.

**Full jitter** backoff, from the AWS Architecture Blog's analysis of why fixed
exponential backoff synchronises a fleet rather than spreading it.

**Table-driven tests with named cases**, from the standard library's own suites.

## Providers

skyl exists because Anthropic, OpenAI, Google and a long tail of others built
APIs worth talking to. It documents their differences bluntly — that is what a
compatibility layer is for — but the differences exist because each of them made
real design decisions, not arbitrary ones.

## This documentation

Structured after **[react.dev](https://react.dev)**, whose two-track
Learn/Reference split, page templates, and component vocabulary are the best
working demonstration of documentation as a designed artefact rather than a pile
of Markdown.

## License

skyl is Apache 2.0. Attributions are recorded in `NOTICE`, and each module
carries its own `LICENSE`.
