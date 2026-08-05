---
title: Why there is no Copilot provider
description: A package that could exist, would be popular, and deliberately does not.
date: '2026-08-05'
author: skyl maintainers
---

<Intro>

"Does skyl support Copilot?" is a reasonable question, and the answer is no —
deliberately. It would be easy to ship a `provider/copilot` package, and it
would attract users. It would also be a lie, and this post is about why that
matters more than the users.

</Intro>

## What Copilot actually exposes

The research is unambiguous, and it is the whole argument.

**GitHub's REST Copilot endpoints are administrative only.** Seat assignment,
organisation metrics, content-exclusion policy. **There is no completions
endpoint.** Nothing to send a prompt to.

**The [Copilot SDK](https://github.com/github/copilot-sdk) is an agent
runtime** — a fundamentally different shape from a completions call, and it
requires a Copilot subscription.

**Its BYOK mode forwards to other providers' keys.** So a skyl "Copilot
provider" built on it would loop straight back out through the same vendors skyl
already reaches directly.

## What shipping it anyway would mean

A `provider/copilot` package could only be one of two things.

**An OpenAI call wearing a different name.** Users would believe their traffic
goes to GitHub under their Copilot agreement — with its data-handling terms, its
retention policy, its billing. It would not. That is not a naming quibble; it is
a compliance statement that is false, and people make architectural and
licensing decisions on the strength of a package name.

**A wrapper over the agent runtime**, forced through
`Complete(ctx, *Request) (*Response, error)`. That either loses most of what
makes an agent runtime useful, or lies about what the call does.

Neither is worth having.

## The principle underneath

skyl's design principles are ordered, and the third one decides this:

> It is better to say "we don't support this" than to ship something that looks
> supported and quietly does the wrong thing.

The same rule shows up all over the library in smaller ways. An adapter that
cannot represent an image URL returns
[`ErrUnsupported`](/reference/skyl/errors/sentinels) naming the problem rather
than dropping the image. A stream that ends without its terminal event is
[reported as truncated](/learn/truncated-streams) rather than passed off as a
complete short answer. The
[fourteen places skyl still drops something quietly](/blog/silently-ignored) are
published in a list rather than discovered in production.

A missing provider is the same rule applied to a whole package instead of a
field.

## What we did instead

We wrote it down. [ADR-0005](/community/adr/0005-no-copilot-provider) records
the decision, the alternatives considered, and — importantly — what would change
it.

Alternatives that were rejected:

**Ship it with a documentation note.** Nobody reads the note. The package name
is what ends up in an architecture diagram.

**Ship it returning `ErrUnsupported` from everything.** A package that exists
and does nothing is worse than one that does not exist, because it implies the
capability is coming.

## What would change this

GitHub exposing a real completions endpoint under the Copilot agreement,
reachable with a Copilot credential. If that happens, the ADR is superseded and
the adapter is a straightforward afternoon.

The Copilot **agent** runtime remains a genuinely interesting capability. It
just needs an `Agent` interface rather than a `Completer` — which is tracked as
a possible v2 in the [project plan](/community/project-plan), and is a different
piece of work from the one people are asking for when they ask this question.

## If you need Copilot-like behaviour today

You are almost certainly reaching for one of the models Copilot itself brokers.
skyl reaches those directly — with your own key, your own terms, and no
ambiguity about where the traffic goes. See
[Choosing a Provider](/learn/choosing-a-provider).
