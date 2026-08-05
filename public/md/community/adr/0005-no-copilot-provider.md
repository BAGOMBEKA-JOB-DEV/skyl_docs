---
title: "ADR-0005: No GitHub Copilot provider"
description: Why a package that could exist deliberately does not.
---

<Intro>

**Status:** Accepted.

</Intro>

## Context

Copilot is widely used, and "does skyl support Copilot?" is a reasonable
question. It would be easy to ship a `provider/copilot` package, and it would
attract users.

The research is unambiguous:

- **GitHub's REST Copilot endpoints are administrative only** — seat assignment,
  org metrics, content-exclusion policy. **There is no completions endpoint.**
- The [Copilot SDK](https://github.com/github/copilot-sdk) is an **agent
  runtime**, a fundamentally different shape from a completions call, and it
  requires a Copilot subscription.
- Its BYOK mode **forwards to other providers' keys** — so a skyl "Copilot
  provider" built on it would loop straight back through skyl.

## Decision

**skyl ships no Copilot provider**, and says so prominently rather than staying
silent about it.

## Consequences

**Good.** No user makes an architectural or licensing decision based on a label
that is not true. The `Provider` interface keeps meaning "this talks to that
vendor's model API".

**Bad.** skyl looks less complete than a competitor that ships a package with
that name. Some users will assume it is an oversight and ask.

That is why the absence is documented on the front page of the repository, in
the [provider overview](/reference/provider), and here.

## Why not ship it anyway

<DeepDive title="A relabelled OpenAI call is a lie with consequences">

A `provider/copilot` package could only be one of two things.

**An OpenAI call wearing a different name.** Users would believe their traffic
goes to GitHub under their Copilot agreement — with its data-handling terms, its
retention policy, its billing. It would not. That is not a naming quibble; it is
a compliance statement that is false.

**A wrapper over the agent runtime**, which needs an `Agent` interface rather
than `Completer`. Forcing it through `Complete(ctx, *Request) (*Response,
error)` would either lose most of what makes it useful or lie about what the
call does.

This is [honesty over coverage](/reference/rules/never-drop-data) applied to a
whole package rather than a field: it is better to say "we don't support this"
than to ship something that looks supported and quietly does something else.

</DeepDive>

## Alternatives considered

**Ship it as an alias with a documentation note.** Rejected: nobody reads the
note, and the package name is what ends up in an architecture diagram.

**Ship it and return `ErrUnsupported` from everything.** Rejected: a package
that exists and does nothing is worse than one that does not exist, because it
implies the capability is coming.

## What would change this

GitHub exposing a **real completions endpoint** under the Copilot agreement,
reachable with a Copilot credential. If that happens, this ADR is superseded and
the adapter is straightforward.

The Copilot **agent** runtime remains a real, interesting capability — it needs
an `Agent` interface, which is tracked as a possible v2 in the
[project plan](/community/project-plan).
