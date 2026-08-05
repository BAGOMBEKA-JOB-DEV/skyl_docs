---
title: The abstraction must be escapable
description: skyl must never be the reason you cannot ship.
---

<Intro>

Every abstraction over a fast-moving API is wrong somewhere. If skyl's `Request`
cannot express the thing you need, skyl must not be what stops you.

</Intro>

## The rule

**Two escape hatches, always present.**

<DataTable
  headers={['Direction', 'Hatch', 'Guarantee']}
  rows={[
    ['Send', <a key="a" href="/reference/skyl/request">Request.ProviderOptions</a>, 'Arbitrary vendor fields, merged into the payload, overriding anything skyl set.'],
    ['Read', <a key="b" href="/reference/skyl/response">Response.Raw</a>, <strong key="c">Always populated. Every adapter, every call.</strong>],
  ]}
/>

You should never have to fork skyl to use a provider feature. If you do, that is
a bug worth reporting.

## Why Raw is unconditional

<DeepDive title="An option would make it absent exactly when it matters">

The moment you need `Raw` is the moment something has already gone wrong — a
field is missing, a count looks off, a provider shipped something new — and that
is exactly when you cannot go back and re-run the request with a flag set.

The cost is a few kilobytes per response. The benefit is that skyl's abstraction
can never trap you.

The **gateway** makes the opposite trade (`SKYL_INCLUDE_RAW` defaults off),
because there the body crosses a network boundary and can echo request content
back to a caller who should not see it. Same data, different trust boundary,
different default — which is itself an example of the rule being applied rather
than recited.

</DeepDive>

## What it cost

`ProviderOptions` had to be honoured by **every** adapter, and once was not:
`provider/anthropic` silently ignored it entirely, leaving `cache_control`,
`top_k` and every beta feature unreachable there with **no workaround at all**.

The fix was not just the code. The shared contract suite now asserts that every
adapter honours it, so the rule cannot be met by one adapter and quietly missed
by another.

## The seam is escapable too

The rule extends past the request. `Provider` is
[four methods](/reference/skyl/provider), so:

- You can **decorate** an adapter — caching, circuit breaking, request
  rewriting — and still get retry and hooks by passing the result to
  `skyl.New`.
- You can **replace** it entirely with your own adapter, in your own repository,
  and inherit everything.
- You can **bypass** `Client` with
  [`Client.Provider()`](/reference/skyl/client-provider) when you want none of it.

## The caveat that comes with it

<Pitfall>

`ProviderOptions` is a **shallow top-level merge** on `openai`, `openaicompat`
and `gemini` — a nested object you set replaces the whole object. Only Anthropic
applies options by JSON path.

An escape hatch with a sharp edge is still documented as an escape hatch. See
[Provider Options](/learn/provider-options).

</Pitfall>
