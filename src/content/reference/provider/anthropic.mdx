---
title: provider/anthropic
description: Claude, native. A separate module, because it wraps the official SDK.
badge: own module
---

<Intro>

The Anthropic adapter reaches Claude at full fidelity — extended thinking,
prompt caching, native tool calling. It is the only adapter that lives in its
own Go module.

</Intro>

## Installing

<TerminalBlock>go get github.com/BAGOMBEKA-JOB-DEV/skyl/provider/anthropic</TerminalBlock>

```go
import "github.com/BAGOMBEKA-JOB-DEV/skyl/provider/anthropic"
```

Requires **Go 1.24+**, inherited from `anthropic-sdk-go`.

## Reference

<Signature>func New(apiKey string, opts ...Option) *Provider</Signature>

<Parameters>

- **`apiKey`** — your Anthropic credential. Sent as the `x-api-key` header.
- **`opts`** — functional options, applied in order.

</Parameters>

<ProviderOptionTable provider="anthropic" />

<Caveats>

- **This is a separate module.** `go get` on the core library does not bring it,
  and it raises your Go floor to 1.24. That split is deliberate — see
  [ADR-0006](/community/adr/0006-anthropic-adapter-is-its-own-module).
- **`MaxTokens` defaults to 4096** when you leave it zero. Anthropic's API
  requires the field, so skyl supplies a value rather than failing a request
  every other provider would accept. It is the only substituted default in the
  library.
- **`ProviderOptions` uses JSON paths here**, not a shallow merge — so
  `"thinking.budget_tokens": 4096` sets one nested field without disturbing its
  siblings. A top-level key containing a `.` is therefore interpreted as a path.
- **`Thinking.Effort` is ignored.** The SDK's adaptive thinking config has no
  budget or effort field.
- **Tool schemas are reconstructed**, not forwarded. `$defs`, `$ref` and `oneOf`
  survive; the top-level `type` is forced to `"object"` and non-string entries in
  `required` are dropped.

</Caveats>

## What only this adapter does

<DataTable
  headers={['Capability', 'Elsewhere']}
  rows={[
    [<span key="a">Emits <code>EventThinkingDelta</code></span>, 'Never emitted by the other three'],
    [<span key="b">Reports <code>Usage.CacheWriteTokens</code></span>, 'Always zero — no wire field'],
    [<span key="c">Delivers <code>ToolResult.IsError</code> as a real boolean</span>, 'Lossy on OpenAI, dropped on Gemini'],
    [<span key="d"><code>ProviderOptions</code> by JSON path</span>, 'Shallow top-level merge'],
    [<span key="e">Reports <code>StopStopSequence</code></span>, 'Reported as plain stop/STOP'],
  ]}
/>

## Usage

<Recipe title="Constructing">

```go verify
p := anthropic.New(os.Getenv("ANTHROPIC_API_KEY"))
client := skyl.New(p)
```

</Recipe>

<Recipe title="Against the sandbox, with no credential">

```go verify
p := anthropic.New("sandbox-key",
	anthropic.WithBaseURL("http://127.0.0.1:8099/anthropic"))
```

</Recipe>

<Recipe title="Prompt caching">

```go verify
// JSON-path options work only here, which is what makes this reachable
// without restating the whole system field.
req.ProviderOptions = map[string]any{
	"system.0.cache_control": map[string]any{"type": "ephemeral"},
}
```

Then `Usage.CacheReadTokens` tells you how much of `InputTokens` was discounted.

</Recipe>

<Recipe title="A precise thinking budget">

```go verify
// Effort is ignored on this adapter; the budget is reachable by path.
req.Thinking = &skyl.Thinking{Enabled: true}
req.ProviderOptions = map[string]any{"thinking.budget_tokens": 4096}
```

</Recipe>

<Recipe title="A beta feature header">

```go verify
// Headers are fixed at construction. ProviderOptions never sets headers.
p := anthropic.New(key, anthropic.WithHeader("anthropic-beta", "some-feature-2026-01-01"))
```

</Recipe>

## Troubleshooting

<Trouble problem="The build fails mentioning the go directive">

You are on Go 1.22 or 1.23. This module requires 1.24, inherited from the SDK.
Upgrade Go — the core library still works on 1.22 if you drop this adapter.

</Trouble>

<Trouble problem="My tool's required list is not enforced">

Non-string entries in `required` are dropped by this adapter. A schema loaded
from JSON decodes them as `[]any`. Convert to `[]string`.

</Trouble>

<Trouble problem="Setting a ProviderOptions key with a dot did something unexpected">

Keys are JSON paths on this adapter. `"a.b"` sets `b` inside `a`, not a
top-level key literally named `a.b`. This is the only adapter where a key's
spelling changes its meaning.

</Trouble>

<Trouble problem="Effort had no effect">

It is dropped here. Use `thinking.budget_tokens` through `ProviderOptions`.

</Trouble>

<ValidationSnapshot />
