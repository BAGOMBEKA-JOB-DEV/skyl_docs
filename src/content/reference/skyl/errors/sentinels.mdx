---
title: Sentinel errors
description: What went wrong, independent of provider.
---

<Intro>

Eight package-level values. Branch on them with `errors.Is` rather than
inspecting message text — providers reword their messages, and string matching
breaks silently when they do.

</Intro>

## Reference

<Signature>{`var (
	ErrAuth         = errors.New("skyl: authentication failed")
	ErrRateLimit    = errors.New("skyl: rate limited")
	ErrNotFound     = errors.New("skyl: not found")
	ErrBadRequest   = errors.New("skyl: invalid request")
	ErrServer       = errors.New("skyl: provider server error")
	ErrUnsupported  = errors.New("skyl: unsupported by this provider")
	ErrRefusal      = errors.New("skyl: model declined the request")
	ErrStreamClosed = errors.New("skyl: stream is closed")
)`}</Signature>

<SentinelTable />

<Caveats>

- Only **`ErrRateLimit`, `ErrServer` and unclassified transport failures** are
  retried. The rest are hopeless by construction.
- **`ErrBadRequest` is also produced locally** by
  [`Request.Validate`](/reference/skyl/request-validate), so one branch catches
  both your malformed request and the provider's rejection.
- **`ErrUnsupported` is usually produced before any network call**, when an
  adapter cannot represent part of the request.
- A refusal **with** text arrives as a normal response with `StopRefusal`; one
  **without** text is `ErrRefusal`. Handle both.
- They match through wrapping: the "giving up after 4 attempts" wrapper does not
  hide the sentinel.

</Caveats>

## Usage

<Recipe title="Branching">

```go verify
switch {
case errors.Is(err, skyl.ErrAuth):
	return fmt.Errorf("credential rejected: %w", err)
case errors.Is(err, skyl.ErrNotFound):
	return fmt.Errorf("no such model: %w", err)
case errors.Is(err, skyl.ErrRateLimit):
	return fmt.Errorf("rate limited after retries: %w", err)
case errors.Is(err, skyl.ErrRefusal):
	return fmt.Errorf("the model declined: %w", err)
}
```

</Recipe>

<Recipe title="Separating permanent from transient">

```go verify
var e *skyl.Error
if errors.As(err, &e) && !e.Retryable() {
	// Will never succeed on its own. Alert rather than backing off.
	alerts.Page("permanent failure", "provider", e.Provider)
}
```

</Recipe>

## Troubleshooting

<Trouble problem="ErrNotFound on a model I am sure exists">

Because model IDs pass through unvalidated, a typo arrives here rather than
failing locally. Check the spelling — and check that your account has access,
since the list is scoped per account.

</Trouble>

<Trouble problem="ErrUnsupported with no network call">

Correct. An adapter that cannot represent a part of your request says so before
sending anything — an image URL on Gemini, or a tool call on a user message on
OpenAI.

</Trouble>

<Trouble problem="ErrStreamClosed">

You used a stream after closing it. `Close` is idempotent, but `Next` and
`Event` after it are not meaningful.

</Trouble>
