---
title: Error Classification
description: Eight sentinels, one Error type, and errors.Is all the way down.
---

<Intro>

Classification matters more than message text, because callers branch on it.
skyl maps every provider failure onto one of eight sentinels and wraps it in a
`*skyl.Error` carrying enough context to act on.

</Intro>

<YouWillLearn>

- The eight sentinels and what each means
- How to recover the detail with `errors.As`
- Why `Unwrap` returns a slice, and what that buys you
- How HTTP statuses map onto sentinels

</YouWillLearn>

## The sentinels

<SentinelTable />

Branch on these with `errors.Is`. They are stable; provider messages are not.

## The Error type

```go
type Error struct {
	Provider   string         // "anthropic"
	StatusCode int            // the HTTP status, or 0 for transport failures
	Message    string         // the provider's explanation, when it gave one
	Kind       error          // the sentinel this classifies as
	RetryAfter time.Duration  // how long the provider asked us to wait
	Body       string         // the raw payload, truncated at 2048 bytes
}
```

```go verify
var e *skyl.Error
if errors.As(err, &e) {
	log.Printf("%s returned %d: %s", e.Provider, e.StatusCode, e.Message)
	log.Printf("retryable: %v", e.Retryable())
}
```

<Note>

An `Error` **never contains credentials**. `Body` is the provider's error
payload truncated to 2 KB — enough to diagnose, small enough not to bloat logs,
and never a header.

</Note>

## Unwrap returns a slice

```go
func (e *Error) Unwrap() []error
```

It returns **both** the sentinel and the underlying cause. That is what makes
this work:

```go verify
// Both of these match on the same value.
errors.Is(err, skyl.ErrServer)
errors.Is(err, context.DeadlineExceeded)
```

<DeepDive title="Why this matters">

Flattening the cause into a message string loses exactly the information that
tells a timeout apart from a DNS failure or a rejected certificate. All three
arrive as `StatusCode: 0` with no sentinel — indistinguishable, unless the cause
survives.

With the multi-error `Unwrap`, you can ask precise questions:

```go verify
switch {
case errors.Is(err, context.DeadlineExceeded):
	// We ran out of time.
case errors.Is(err, context.Canceled):
	// The caller went away.
default:
	var netErr net.Error
	if errors.As(err, &netErr) && netErr.Timeout() {
		// A transport-level timeout, distinct from our deadline.
	}
}
```

`errors.Is` and `errors.As` handle the slice form natively, so nothing in your
code changes to take advantage of it.

</DeepDive>

## Status mapping

`ClassifyStatus` is the fallback adapters use when a provider's own error type
is not more precise:

<DataTable
  headers={['Status', 'Sentinel']}
  rows={[
    ['401, 403, 407', <code key="a">ErrAuth</code>],
    ['404', <code key="b">ErrNotFound</code>],
    ['429', <code key="c">ErrRateLimit</code>],
    ['408, 409', <span key="d"><code>ErrServer</code> — transient, worth another attempt</span>],
    ['5xx', <code key="e">ErrServer</code>],
    ['other 4xx', <code key="f">ErrBadRequest</code>],
    ['2xx / 3xx', <span key="g">nil — not an error</span>],
  ]}
/>

Adapters prefer a provider's own error type where it is more precise, and fall
back to this. `408` and `409` mapping to `ErrServer` rather than `ErrBadRequest`
is deliberate — a request timeout and a transient conflict are both worth
retrying, and classifying them as client errors would mean skyl gave up on a
failure that would have succeeded.

## Local errors

Not every error comes from a provider. `Request.Validate` produces
`ErrBadRequest` without any network call, so the same branch catches both a
malformed request you built and one the provider rejected:

```go verify
if errors.Is(err, skyl.ErrBadRequest) {
	// Could be local validation or a provider 400 — both are your bug to fix,
	// and neither is worth retrying.
}
```

## Retryable

```go verify
var e *skyl.Error
if errors.As(err, &e) && e.Retryable() {
	// Rate limits, server errors, and transport failures.
}
```

An unclassified error with `StatusCode == 0` is treated as retryable — a dial
timeout or a reset connection, which is worth another attempt. An unclassified
error *with* a status is not.

<Recap>

- Eight sentinels; branch with `errors.Is`, never on message text.
- `errors.As` recovers `*skyl.Error` with provider, status, message and retry hint.
- `Unwrap` returns sentinel **and** cause, so `errors.Is(err, context.DeadlineExceeded)` works.
- An `Error` never contains credentials; `Body` is truncated at 2 KB.
- `408` and `409` classify as `ErrServer`, because both are worth retrying.
- Local validation failures are `ErrBadRequest` too, so one branch catches both.

</Recap>

<Challenges>

<Challenge title="Write an error handler that never string-matches">

Handle every sentinel with an appropriate action, and log enough detail to
diagnose the rest.

<Hint>

Use `errors.Is` for the branch and `errors.As` for the detail. They compose.

</Hint>

<Solution>

```go verify
func handle(err error) error {
	if err == nil {
		return nil
	}

	var e *skyl.Error
	errors.As(err, &e) // may leave e nil; that is fine below

	switch {
	case errors.Is(err, skyl.ErrAuth):
		return fmt.Errorf("credential rejected by %s: check the key", providerOf(e))
	case errors.Is(err, skyl.ErrNotFound):
		return fmt.Errorf("no such model on %s: check the spelling", providerOf(e))
	case errors.Is(err, skyl.ErrRateLimit):
		return fmt.Errorf("rate limited after retries; back off at the caller: %w", err)
	case errors.Is(err, skyl.ErrRefusal):
		return fmt.Errorf("the model declined; do not retry: %w", err)
	case errors.Is(err, skyl.ErrUnsupported):
		return fmt.Errorf("this provider cannot express the request: %w", err)
	case errors.Is(err, context.DeadlineExceeded):
		return fmt.Errorf("timed out: %w", err)
	default:
		if e != nil {
			log.Printf("unclassified: provider=%s status=%d body=%s", e.Provider, e.StatusCode, e.Body)
		}
		return err
	}
}

func providerOf(e *skyl.Error) string {
	if e == nil {
		return "the provider"
	}
	return e.Provider
}
```

The `default` branch logging `Body` is what makes an unknown failure
diagnosable — it is the provider's own words, truncated, and it is the thing
you will paste into a support ticket.

</Solution>

</Challenge>

</Challenges>
