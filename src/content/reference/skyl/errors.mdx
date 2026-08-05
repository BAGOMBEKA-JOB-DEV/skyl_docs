---
title: Errors
description: Eight sentinels, one Error type, and errors.Is all the way down.
---

<Intro>

skyl classifies every provider failure onto one of eight sentinels and wraps it
in an [`*Error`](/reference/skyl/errors/error) carrying enough context to act on.
You branch on the classification, never on message text — providers reword their
messages, and string matching breaks silently when they do.

</Intro>

## The sentinels

<SentinelTable />

<Caveats>

- **Branch with `errors.Is`.** The sentinels are stable; provider messages are
  not.
- **`Unwrap` returns a slice** — the sentinel **and** the underlying cause — so
  `errors.Is(err, context.DeadlineExceeded)` works on the same value that
  matches `errors.Is(err, skyl.ErrServer)`.
- **An `Error` never contains credentials.** `Body` is the provider's payload
  truncated to 2 KB.
- Local validation failures are `ErrBadRequest` too, so one branch catches both
  yours and the provider's.

</Caveats>

## The API

<DataTable
  headers={['Symbol', 'Purpose']}
  rows={[
    [<a key="a" href="/reference/skyl/errors/sentinels">Sentinel errors</a>, 'The eight values you branch on'],
    [<a key="b" href="/reference/skyl/errors/error">Error</a>, 'The type carrying provider, status, message and retry hint'],
    [<a key="c" href="/reference/skyl/errors/retryable">Error.Retryable</a>, 'Whether retrying could plausibly succeed'],
    [<a key="d" href="/reference/skyl/errors/unwrap">Error.Unwrap</a>, 'Returns the sentinel and the cause'],
    [<a key="e" href="/reference/skyl/errors/new-error">NewError</a>, 'Builds a classified provider error'],
    [<a key="f" href="/reference/skyl/errors/classify-status">ClassifyStatus</a>, 'Maps an HTTP status onto a sentinel'],
    [<a key="g" href="/reference/skyl/errors/parse-retry-after">ParseRetryAfter</a>, 'Interprets a Retry-After header'],
    [<a key="h" href="/reference/skyl/errors/unsupportedf">Unsupportedf</a>, 'Builds an ErrUnsupported naming what failed'],
  ]}
/>

The last four are exported so that an adapter in **your** repository produces
errors indistinguishable from an in-tree one.

## Usage

<Recipe title="Branching">

```go verify
resp, err := client.Complete(ctx, req)
switch {
case err == nil:
case errors.Is(err, skyl.ErrRateLimit):
	// Already retried with backoff; it kept failing. Shed load.
case errors.Is(err, skyl.ErrAuth):
	return fmt.Errorf("credential rejected: %w", err)
case errors.Is(err, skyl.ErrRefusal):
	// Never retried — the same prompt gets the same answer.
default:
	return err
}
```

</Recipe>

<Recipe title="Recovering the detail">

```go verify
var e *skyl.Error
if errors.As(err, &e) {
	log.Printf("%s returned %d: %s (retryable=%v)",
		e.Provider, e.StatusCode, e.Message, e.Retryable())
}
```

</Recipe>

## Troubleshooting

<Trouble problem="My error handling broke after a provider changed its wording">

You were matching on message text. Branch on the sentinels with `errors.Is`;
that is what they are for.

</Trouble>

<Trouble problem="I cannot tell a timeout from a DNS failure">

Both arrive with `StatusCode == 0` and no sentinel — but the **cause** survives:

```go verify
if errors.Is(err, context.DeadlineExceeded) { /* we ran out of time */ }
var netErr net.Error
if errors.As(err, &netErr) && netErr.Timeout() { /* a transport timeout */ }
```

</Trouble>
