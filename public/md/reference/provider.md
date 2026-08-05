---
title: Providers
description: Three native adapters, one generic adapter, and the gaps between them.
---

<Intro>

skyl ships four adapters. Three are native — written against a specific vendor's
API at full fidelity. One is generic, and reaches the long tail of hosts that
speak OpenAI's wire format.

</Intro>

## The four

<ProviderTable />

<Note>

`openai`, `gemini` and `openaicompat` ship **inside the core module** — they are
implemented against `net/http` and `encoding/json`, so they cost you no
dependencies. Only `provider/anthropic` is separate, because it wraps the
official Anthropic SDK. See
[ADR-0006](/community/adr/0006-anthropic-adapter-is-its-own-module).

</Note>

## Choosing between them

**Use a native adapter** when you want a vendor's deep features and its exact
error semantics. Concretely: Anthropic is the only adapter that emits
`EventThinkingDelta`, reports `CacheWriteTokens`, or delivers
`ToolResult.IsError` faithfully. Gemini is the only one where `Request.Thinking`
maps completely.

**Use `openaicompat`** for reach — roughly eighteen hosts, including local
runtimes that need no credential at all. OpenRouter alone brokers 300+ models,
so this single adapter puts the realistic reachable total in the hundreds.

## Where they differ

The [feature matrix](/reference/provider/feature-matrix) documents every field,
per adapter, in four states: mapped, rejected, **silently ignored**, and not
applicable. The third is the one worth reading — it is where skyl accepts
something and quietly does not do it.

There are fourteen such cases, and they are
[published in one list](/reference/provider/silently-ignored) rather than
discovered in production.

## Writing your own

`Provider` is [four methods](/reference/skyl/provider), and nothing in skyl
privileges the in-tree adapters. An adapter in your own repository inherits
retry, hooks, validation and the gateway with no changes to skyl. See
[Writing an Adapter](/community/writing-an-adapter).

<Unvalidated />
