---
title: Provider feature matrix
description: What each adapter does with each part of a Request — including what it quietly does not.
---

<Intro>

What each adapter actually does with each part of a `skyl.Request`. Publishing
the gaps is the point: skyl's design principles hold that it is better to say
"we don't support this" than to ship something that looks supported and quietly
does the wrong thing — and a matrix that lists only the green cells is exactly
what that rejects.

</Intro>

## Reading it

<DataTable
  headers={['', 'Meaning']}
  rows={[
    ['✅', 'Mapped. Sent to the provider; the wire field is named.'],
    ['⛔', 'Rejected. Returns ErrUnsupported before any request is made.'],
    ['⚠️', <span key="a"><strong>Silently ignored.</strong> Accepted, then dropped. Nothing tells you.</span>],
    ['—', 'Not applicable.'],
  ]}
/>

The column worth reading is **⚠️**. Filter to it below, or see the
[dedicated list](/reference/provider/silently-ignored) with workarounds.

<Note>

`openai` and `openaicompat` share one implementation (`internal/oai`), so their
cells are identical except for the five differences documented on the
[openaicompat page](/reference/provider/openaicompat).

</Note>

## The matrix

<FeatureMatrix />

## Tool schemas

Your `Tool.Parameters` is a JSON Schema. Whether it arrives intact differs:

- **openai / openaicompat / gemini** — passed through **verbatim**. `$defs`,
  `$ref`, `oneOf`, `additionalProperties`, everything.
- **anthropic** — **reconstructed**. `properties` and `required` are read into
  the SDK's typed struct and every other key is re-attached, so `$defs`, `$ref`
  and `oneOf` *do* survive. Two things do not: the top-level **`type` is forced
  to `"object"`**, and **non-string entries in `required` are dropped**.

## When a gap matters

Everything in the ⚠️ list is reachable another way.

**Response-side gaps** — `Response.Raw` carries the provider's untouched body.
Nothing is lost, only unmodelled.

**Request-side gaps** — `ProviderOptions` sends anything skyl does not model,
subject to the shallow-merge caveat on three of the four adapters.

That is the deal skyl makes: it unifies the common 90% and gets out of the way
for the rest. A gap in this table should cost you a few lines, never a fork.

<Pitfall>

This matrix was written by reading the adapters, and is accurate as of the
commit that added it. **If you find a cell that no longer matches the code, that
is a bug — please report it.** Making drift somebody's problem is the only way
it gets fixed.

</Pitfall>

<ValidationSnapshot />
