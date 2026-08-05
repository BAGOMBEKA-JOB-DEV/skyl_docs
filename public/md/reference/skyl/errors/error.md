---
title: Error
description: A provider failure with enough context to act on.
---

<Intro>

`*skyl.Error` is what every adapter produces. It wraps a
[sentinel](/reference/skyl/errors/sentinels) so `errors.Is` works, and carries
the detail `errors.As` recovers.

</Intro>

## Reference

<Signature>type Error struct{ /* see below */ }</Signature>

<Fields of="error" />

### Methods

<Signature>{`func (e *Error) Error() string
func (e *Error) Unwrap() []error
func (e *Error) Retryable() bool
func (e *Error) Cause() error
func (e *Error) WithCause(err error) *Error`}</Signature>

<Caveats>

- **It never contains credentials.** `Body` is the provider's error payload
  truncated at **2048 bytes** — enough to diagnose, small enough not to bloat
  logs, and never a header.
- **`StatusCode == 0` means a transport-level failure** — a dial timeout, a
  reset connection, a rejected certificate.
- **`Unwrap` returns a slice**, so both the sentinel and the underlying cause
  match.
- `Kind` may be nil for an unclassified failure; guard before using it.
- `Error()` trims the sentinel's own `"skyl: "` prefix to avoid repeating it.

</Caveats>

## Usage

<Recipe title="Recovering the detail">

```go verify
var e *skyl.Error
if errors.As(err, &e) {
	log.Printf("%s returned %d: %s", e.Provider, e.StatusCode, e.Message)
	if e.RetryAfter > 0 {
		log.Printf("it asked for %s", e.RetryAfter)
	}
}
```

</Recipe>

<Recipe title="Passing a Retry-After through to your own callers">

```go verify
var e *skyl.Error
if errors.As(err, &e) && e.RetryAfter > 0 {
	w.Header().Set("Retry-After", strconv.Itoa(int(e.RetryAfter.Seconds())))
}
http.Error(w, "upstream capacity exhausted", http.StatusTooManyRequests)
```

</Recipe>

<Recipe title="Diagnosing an unclassified failure">

```go verify
var e *skyl.Error
if errors.As(err, &e) && e.Kind == nil {
	// Body is the provider's own words — the thing to paste into a ticket.
	log.Printf("unclassified: provider=%s status=%d body=%s", e.Provider, e.StatusCode, e.Body)
}
```

</Recipe>

## Troubleshooting

<Trouble problem="Body is empty">

The provider sent no error payload, which is common for transport-level
failures where `StatusCode` is also 0.

</Trouble>

<Trouble problem="Body ends with “… (truncated)”">

It exceeded 2048 bytes. That bound is deliberate — an unbounded error body in a
log line is how a single bad request fills a disk.

</Trouble>

<Trouble problem="Kind is nil">

The failure could not be classified. Check `StatusCode`: 0 means transport, and
anything else means the provider answered with something skyl did not recognise.
`Body` will say what.

</Trouble>
