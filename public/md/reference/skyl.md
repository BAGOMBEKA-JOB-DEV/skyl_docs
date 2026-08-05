---
title: skyl API Reference
description: Every exported symbol in the core module, with signatures, caveats, and usage recipes.
---

<Intro>

This section documents the core `skyl` module: the client, the request and
response types, the conversation model, streaming, and the error surface. Every
page follows the same shape — **Reference** for the exact contract, **Usage**
for what you actually do with it, **Troubleshooting** for what goes wrong.

</Intro>

## Installing

<TerminalBlock>go get github.com/BAGOMBEKA-JOB-DEV/skyl</TerminalBlock>

```go
import "github.com/BAGOMBEKA-JOB-DEV/skyl"
```

The core module requires **Go 1.22 or later** and has **zero external
dependencies**. Importing it pulls in no router, no logger, no vendor SDK.

## The modules

skyl is four Go modules in one repository. Which one a symbol lives in tells you
what it costs you.

<ModuleTable />

<Note>

`provider/openai`, `provider/gemini` and `provider/openaicompat` ship **inside**
the core module — they are implemented against `net/http` and `encoding/json`.
Only `provider/anthropic` is separate, because it wraps the official Anthropic
SDK. See [ADR-0006](/community/adr/0006-anthropic-adapter-is-its-own-module).

</Note>

## The shape of the API

Four concepts carry the whole library.

<ClientStackDiagram />

**[`Provider`](/reference/skyl/provider)** is the seam — four methods, small
enough to implement in your own repository. **[`Client`](/reference/skyl/client)**
wraps a provider and adds everything cross-cutting, so retry and validation are
written once instead of once per vendor. **[`Request`](/reference/skyl/request)**
and **[`Response`](/reference/skyl/response)** are the provider-agnostic shapes
that travel between them.

## Client

<DataTable
  headers={['Symbol', 'Signature']}
  rows={[
    [<a key="a" href="/reference/skyl/new">New</a>, <code key="b">func New(p Provider, opts ...Option) *Client</code>],
    [<a key="a" href="/reference/skyl/client-complete">Client.Complete</a>, <code key="b">func (c *Client) Complete(ctx, *Request) (*Response, error)</code>],
    [<a key="a" href="/reference/skyl/client-stream">Client.Stream</a>, <code key="b">func (c *Client) Stream(ctx, *Request) (Stream, error)</code>],
    [<a key="a" href="/reference/skyl/client-models">Client.Models</a>, <code key="b">func (c *Client) Models(ctx) ([]ModelInfo, error)</code>],
    [<a key="a" href="/reference/skyl/client-provider">Client.Provider</a>, <code key="b">func (c *Client) Provider() Provider</code>],
  ]}
/>

## Options

Every option is a `func(*Client)`, applied in order by [`New`](/reference/skyl/new).

<DataTable
  headers={['Option', 'Default', 'What it bounds']}
  rows={[
    [<a key="a" href="/reference/skyl/with-max-retries">WithMaxRetries</a>, '3', 'How many times a retryable failure is retried'],
    [<a key="a" href="/reference/skyl/with-retry-delay">WithRetryDelay</a>, '500ms / 30s', "skyl's own computed backoff"],
    [<a key="a" href="/reference/skyl/with-retry-after-cap">WithRetryAfterCap</a>, '5m', "How long a provider's Retry-After may delay a retry"],
    [<a key="a" href="/reference/skyl/with-timeout">WithTimeout</a>, '10m', 'A single attempt — not the whole retry sequence'],
    [<a key="a" href="/reference/skyl/with-hook">WithHook</a>, 'none', 'Nothing; it registers an observer'],
  ]}
/>

## Requests and responses

<Fields of="request" />

## Errors

skyl classifies every provider failure onto one of eight sentinels, so you
branch with `errors.Is` rather than on message text.

<SentinelTable />

Full detail: [Errors](/reference/skyl/errors).

## Escape hatches

Two, always present, because every abstraction over a fast-moving API is wrong
somewhere:

- [`Request.ProviderOptions`](/reference/skyl/request) sends arbitrary
  vendor-specific fields, overriding anything skyl set.
- [`Response.Raw`](/reference/skyl/response) is the untouched provider body, and
  is **always** populated.

<PreV1 />
