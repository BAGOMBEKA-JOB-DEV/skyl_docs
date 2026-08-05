---
title: Data Handling
description: Exactly what leaves your process, what is kept, and what is written down.
---

<Intro>

skyl's entire function is sending your users' text to a third party. This page
says exactly what leaves your process, derived from the code rather than from
intent — written for the person who has to answer "where does the prompt go?" in
a privacy review.

</Intro>

## Short version

- **Everything you put in a `Request` is transmitted** to the provider you chose.
- **The library keeps nothing** after a call returns, and **logs nothing, ever**.
- **The gateway logs metadata only** — with one exception, named below.
- **Nothing is written to disk** unless you explicitly turn on cassette recording.

<Pitfall>

The thing skyl **cannot** tell you is what the *provider* does with the prompt
once it arrives. That is their retention policy, their jurisdiction, their
sub-processors, and their training-data terms. Read those. skyl chooses none of
it for you and cannot mitigate it.

</Pitfall>

## What leaves your process

### Everything in the Request

Every field of `skyl.Request` is transmitted: `System`, `Messages` (all text,
images, tool calls and tool results), `Tools`, `Model`, sampling parameters, and
`ProviderOptions` verbatim.

<Note>

**Tool descriptions and schemas are prompt content.** If your tool descriptions
name internal systems, those names go to the provider on every request that
declares the tool. This is easy to miss, because they do not look like user
data.

</Note>

### The credential

One header per provider:

<DataTable
  headers={['Adapter', 'Header']}
  rows={[
    ['openai / openaicompat', <code key="a">Authorization: Bearer</code>],
    ['anthropic', <code key="b">X-Api-Key</code>],
    ['gemini', <code key="c">x-goog-api-key</code>],
  ]}
/>

Gemini's key is deliberately a **header** rather than a URL parameter, so it does
not land in proxy access logs.

### Two negotiation headers

`Content-Type` and `Accept`. That is the complete list skyl adds — no
User-Agent, no client identifier, no request ID.

### One exception: the Anthropic adapter

<Pitfall>

`provider/anthropic` is built on the official `anthropic-sdk-go`, which adds
headers skyl never asked for and **cannot remove**:

- `X-Stainless-OS`, `X-Stainless-Arch`, `X-Stainless-Runtime-Version` — your
  operating system, CPU architecture and exact Go toolchain version
- `X-Stainless-Lang`, `X-Stainless-Package-Version`, `X-Stainless-Retry-Count`
- `User-Agent`

This is host fingerprinting, sent on every request. If it matters to you, that
is a reason to reach Claude through `provider/openaicompat` against a gateway
you control — or to accept it, which is what using a vendor's own SDK normally
implies.

</Pitfall>

## What is kept in memory

`Response.Raw` holds the provider's whole body for the life of the response. In
a batch pipeline holding thousands of responses, that is the heap — extract what
you need and drop the reference.

`Client` itself holds **no per-request state**. `Request` is retained only for
the duration of the call, and is reused across retries.

## What is written to disk

**Nothing**, unless you turn on cassette recording — the mechanism that records
real provider exchanges for offline replay. Credentials are scrubbed on write,
and a test walks every committed fixture looking for credential-shaped strings.

## What is logged

**The library logs nothing.** It has no logger and takes no logging dependency.

**The gateway** logs method, path, status, duration, request ID, and the caller
*label* from `SKYL_AUTH_TOKENS` — never headers, never bodies, never tokens.

**`skyl/otel`** records model, sampling parameters and token counts. **No prompt
content**, deliberately: a span is a durable record shipped to a third-party
backend.

<Pitfall>

**The one place you can leak is a hook you write.** `HookEvent.Request` carries
the whole conversation, and logging it verbatim ships prompts wherever your logs
go.

```go verify
// Log shape, never content.
log.Printf("%s %s msgs=%d in=%d out=%d",
	ev.Provider, ev.Operation, len(ev.Request.Messages),
	ev.Usage.InputTokens, ev.Usage.OutputTokens)
```

</Pitfall>

## Errors

`*skyl.Error` carries provider, status, message, retry hint, and up to **2 KB**
of the provider's error body. **It never contains credentials** — there is a
test asserting this.

The gateway deliberately does **not forward** provider error bodies to callers:
they can echo request content back to someone who should not see it.

## For your privacy review

<DataTable
  headers={['Question', 'Answer']}
  rows={[
    ['Where does the prompt go?', 'To the provider you constructed. skyl chooses no default provider and no default host.'],
    ['Does skyl retain it?', 'No. Nothing after the call returns.'],
    ['Does skyl log it?', 'No. The library has no logger.'],
    ['Does skyl write it to disk?', 'Only with cassette recording explicitly enabled.'],
    ['Can I audit egress?', 'Yes — supply your own *http.Client, or route everything through the gateway.'],
    ['What about sub-processors?', "The provider's business. skyl adds none."],
  ]}
/>

## See also

- [Threat Model](/community/threat-model) — trust boundaries and what an
  authenticated caller can do.
- [Security Policy](/community/security) — reporting a vulnerability.
- [Credentials](/learn/credentials) — where keys should live.
