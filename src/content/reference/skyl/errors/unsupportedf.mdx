---
title: Unsupportedf
description: Builds an ErrUnsupported naming exactly what could not be represented.
---

<Intro>

Adapters use `Unsupportedf` instead of silently dropping data they cannot
express. The formatted message is the point: it tells the caller precisely which
part failed, so they can fix it rather than guess.

</Intro>

## Reference

<Signature>func Unsupportedf(provider, format string, args ...any) error</Signature>

<Parameters>

- **`provider`** — the adapter's name.
- **`format`, `args`** — a `fmt`-style message naming what could not be
  represented.

</Parameters>

<Returns>

An `*Error` with `Kind: ErrUnsupported`, no status code, and the formatted
message.

</Returns>

<Caveats>

- It is normally returned **before any network call**, so it costs nothing.
- `Retryable()` returns **false** — a provider that structurally cannot express
  something will not be able to on a second attempt.
- `Client.Models` treats it specially and does not retry it at all.
- Name the *specific* thing. "unsupported" tells the caller nothing they did not
  already know from the sentinel.

</Caveats>

## Usage

<Recipe title="Rejecting a part an adapter cannot render">

```go verify
if img.URL != "" {
	// Name the constraint, so the caller knows what to change.
	return nil, skyl.Unsupportedf(p.Name(),
		"Gemini requires inline image data, not a URL")
}
```

</Recipe>

<Recipe title="Naming a role restriction">

```go
if m.Role == skyl.RoleTool {
	if _, isText := part.(skyl.Text); isText {
		return nil, skyl.Unsupportedf(p.Name(),
			"tool messages may only contain tool results")
	}
}
```

</Recipe>

<Recipe title="Reporting it to a user">

```go verify
var e *skyl.Error
if errors.As(err, &e) && errors.Is(err, skyl.ErrUnsupported) {
	// The message is specific enough to show directly.
	return fmt.Errorf("this model (%s) cannot handle that input: %s", e.Provider, e.Message)
}
```

</Recipe>

## Troubleshooting

<Trouble problem="Should my adapter drop the data instead?">

No. Silent data loss is the worst failure mode this library has — a dropped
image looks exactly like a model that ignored the question, and the caller will
spend an afternoon on the prompt before suspecting the transport.

</Trouble>

<Trouble problem="Should I return this for a feature the provider might add later?">

Yes. It is the honest answer today, and it costs the caller one line to route
around via `ProviderOptions`. Pretending support exists is worse.

</Trouble>
