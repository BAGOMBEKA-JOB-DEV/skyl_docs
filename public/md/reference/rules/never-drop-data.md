---
title: Never silently drop data
description: Honesty over coverage. It is better to say "we don't support this".
---

<Intro>

Silent data loss is the worst failure mode a library like this has. A dropped
image looks exactly like a model that ignored your question — and you will spend
an afternoon on the prompt before you suspect the transport.

</Intro>

## The rule

An adapter that cannot represent something returns
[`ErrUnsupported`](/reference/skyl/errors/sentinels) **naming what failed**,
before any request is made:

<ConsoleBlock>skyl: gemini: Gemini requires inline image data, not a URL</ConsoleBlock>

Not a dropped field. Not a silent conversion. An error that says which part and
why.

## Where you can see it

<DataTable
  headers={['Situation', 'What skyl does']}
  rows={[
    ['An image URL on Gemini', 'ErrUnsupported before sending'],
    ['Text on a tool message, on OpenAI', 'ErrUnsupported before sending'],
    ['A stream that ends without its terminal event', 'Err() reports truncation — the partial text is still delivered'],
    ['A refusal with no content', 'ErrRefusal, rather than an empty success'],
    ['A provider stop reason skyl does not model', 'StopUnknown, not a wrong guess'],
    ['A model ID skyl has never seen', "Passed through — the provider's answer, not skyl's opinion"],
  ]}
/>

Each of the first four was once a silent failure and was fixed before release. A
truncated stream used to look like a complete short answer. An empty refusal
used to be reported as success, which meant `ErrRefusal` was never produced by
any adapter and the gateway's 422 branch was unreachable.

## Why not convert instead

<DeepDive title="skyl could fetch that image URL for you. It does not.">

Fetching a URL from inside a library means making an outbound request the caller
did not ask for, to a host the caller did not vet, from a process that may sit
inside a network boundary — and then charging them for the tokens.

It also changes the failure mode silently: a 404 on the image becomes a model
error rather than a fetch error.

`ErrUnsupported` names the problem and hands the decision back. Three lines of
`http.Get` in your code is a better trade than a surprise egress in a library.

The same reasoning explains why skyl does not normalise `ToolResult.IsError` by
inventing a text prefix on Gemini: that would be skyl editing your tool output on
one adapter and not another.

</DeepDive>

## Where it is not yet true

<Pitfall>

skyl still has **fourteen** cases where something is quietly dropped. They are
[published in one list](/reference/provider/silently-ignored) with workarounds,
rather than discovered in production.

Publishing the gaps *is* the rule being followed. A matrix that listed only the
green cells would be exactly what this section rejects — and the
[feature matrix](/reference/provider/feature-matrix) has a dedicated ⚠️ state
for precisely this reason.

</Pitfall>

## The corollary

This is also why there is **no GitHub Copilot provider**. Copilot exposes no
completions API, so a `provider/copilot` package could only be a relabelled
OpenAI call. Users would make architectural and licensing decisions based on that
label, and it would be false.

Recorded as [ADR-0005](/community/adr/0005-no-copilot-provider).
