---
title: Client.Models
description: Lists what the provider currently offers, queried live.
---

<Intro>

`Models` asks the provider what it offers, right now. The answer comes from the
provider rather than from a compiled-in table, so it is never stale.

</Intro>

## Reference

<Signature>func (c *Client) Models(ctx context.Context) ([]ModelInfo, error)</Signature>

<Parameters>

- **`ctx`** — bounds the whole call, retries included.

</Parameters>

<Returns>

A slice of [`ModelInfo`](/reference/skyl/model-info), or an error. Providers
with no such endpoint return
[`ErrUnsupported`](/reference/skyl/errors/sentinels).

</Returns>

<Caveats>

- **`ErrUnsupported` is never retried**, even though the generic retry rules
  would allow it. A provider that cannot list models will never be able to, so
  retrying burns four attempts on a capability that does not exist.
- All four in-tree adapters support it; none return `ErrUnsupported`.
- What is *reported* varies sharply. Only `ID`, `Provider` and `Raw` are
  populated by every adapter.
- **On Gemini, `nextPageToken` is ignored** — beyond 1000 models the list is
  silently truncated.
- Rate limits and server errors **are** retried here, like any other call.

</Caveats>

## What each adapter reports

<DataTable
  headers={['Field', 'anthropic', 'openai', 'openaicompat', 'gemini']}
  rows={[
    ['ID, Provider, Raw', 'yes', 'yes', 'yes', 'yes'],
    ['DisplayName', 'yes', <strong key="a">empty</strong>, 'host-dependent', 'yes'],
    ['ContextWindow', 'yes', <strong key="b">empty</strong>, 'host-dependent', 'yes'],
    ['MaxOutputTokens', 'yes', <strong key="c">never set</strong>, <strong key="d">never set</strong>, 'yes'],
  ]}
/>

OpenAI's models endpoint has no such fields — the gap is upstream, not in the
adapter. `ModelInfo.Raw` carries the provider's untouched entry, so anything
they do report is reachable.

## Usage

<Recipe title="Listing models">

```go verify
models, err := client.Models(ctx)
if err != nil {
	return err
}
for _, m := range models {
	fmt.Printf("%s (%s) context=%d\n", m.ID, m.DisplayName, m.ContextWindow)
}
```

</Recipe>

<Recipe title="Validating configured model IDs at startup">

```go verify
func checkModels(ctx context.Context, c *skyl.Client, want ...string) error {
	models, err := c.Models(ctx)
	if err != nil {
		// A metadata endpoint being down is not a reason to refuse to start —
		// pass-through model IDs still work. Warn and continue.
		log.Printf("could not verify model IDs: %v", err)
		return nil
	}
	have := make(map[string]bool, len(models))
	for _, m := range models {
		have[m.ID] = true
	}
	for _, w := range want {
		if !have[w] {
			return fmt.Errorf("configured model %q is not offered by this provider", w)
		}
	}
	return nil
}
```

</Recipe>

<Recipe title="Handling providers that cannot list">

```go verify
models, err := client.Models(ctx)
if errors.Is(err, skyl.ErrUnsupported) {
	// A capability statement, not a failure. Fall back to configuration.
	return configuredModels, nil
}
```

</Recipe>

## Troubleshooting

<Trouble problem="DisplayName and ContextWindow are empty on OpenAI">

They are not reported by OpenAI's models endpoint at all. This is upstream, and
`ModelInfo.Raw` holds everything they do send.

For metadata OpenAI does not publish, you need your own table — which is why
skyl's plan is a **generated** registry refreshed from live endpoints by CI,
rather than a hand-typed one that rots.

</Trouble>

<Trouble problem="A model I know exists is not in the list">

On Gemini, check whether you are past 1000 entries — the adapter ignores
`nextPageToken` and truncates silently.

Otherwise, the list is scoped to your account: models you have not been granted
access to do not appear, even though the ID is valid for someone else.

</Trouble>

<Trouble problem="Should I validate Request.Model against this?">

At startup, yes — it is a cheap sanity check. Per request, no: it doubles your
calls, and the list is a snapshot that can go stale between the check and the
call. Model IDs are pass-through by design; a typo returning `ErrNotFound` is
the intended failure mode.

</Trouble>
