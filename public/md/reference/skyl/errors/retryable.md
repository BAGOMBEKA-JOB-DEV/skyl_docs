---
title: Error.Retryable
description: Reports whether retrying could plausibly succeed.
---

<Intro>

`Retryable` is the predicate [`Client`](/reference/skyl/client)'s retry loop
uses. It is exported so you can make the same judgement at your own level.

</Intro>

## Reference

<Signature>func (e *Error) Retryable() bool</Signature>

<Returns>

`true` for rate limits, server errors, and unclassified failures that got no
reply at all. `false` for everything else.

</Returns>

## The rule

```go
switch {
case errors.Is(e.Kind, ErrRateLimit), errors.Is(e.Kind, ErrServer):
	return true
case e.Kind == nil:
	// Unclassified with no reply at all — a dial timeout, a reset
	// connection. Worth another attempt.
	return e.StatusCode == 0
default:
	return false
}
```

<Caveats>

- **An unclassified error *with* a status is not retryable.** The provider did
  answer; skyl just could not classify what it said, and repeating the request
  is unlikely to produce a more classifiable answer.
- **`ErrAuth`, `ErrBadRequest`, `ErrNotFound`, `ErrRefusal` and `ErrUnsupported`
  are never retryable** — retrying burns quota to receive the same answer.
- **Certificate failures are not retried** despite arriving as transport
  failures. A rejected certificate is a misconfiguration, not a blip.
- `Client.Models` additionally refuses to retry `ErrUnsupported`, because a
  provider that cannot list models never will.

</Caveats>

## Usage

<Recipe title="Deciding whether to alert or back off">

```go verify
var e *skyl.Error
if errors.As(err, &e) {
	if e.Retryable() {
		metrics.Inc("skyl.transient", "provider", e.Provider)
	} else {
		// Will never succeed on its own.
		alerts.Page("skyl permanent failure", "provider", e.Provider, "kind", e.Kind)
	}
}
```

</Recipe>

<Recipe title="Retrying at your own level">

```go verify
// Safe in a batch job, where nothing has been displayed yet.
for attempt := 0; attempt < 3; attempt++ {
	resp, err := collect(ctx, client, req)
	if err == nil {
		return resp, nil
	}
	var e *skyl.Error
	if !errors.As(err, &e) || !e.Retryable() {
		return nil, err
	}
}
```

</Recipe>

## Troubleshooting

<Trouble problem="A certificate error reported Retryable() == false">

Correct, and deliberate. Retrying an expired certificate spends the whole budget
to receive the same answer, and delays the error the operator needs to see at
exactly the moment they are debugging a connection problem.

</Trouble>

<Trouble problem="Client retried something Retryable() says is false">

It should not. If you saw that, the error reaching `Client` was a different
value from the one you inspected — most likely an unclassified transport error
with `StatusCode == 0`, which is retryable.

</Trouble>
