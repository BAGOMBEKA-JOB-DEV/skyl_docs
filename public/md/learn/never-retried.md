---
title: What Is Never Retried
description: Five sentinels skyl refuses to retry, and one case that surprises people.
---

<Intro>

Retrying the wrong failure is worse than not retrying at all: it burns quota,
adds latency, and delays the error an operator needs to see. skyl retries three
classes of failure and refuses five.

</Intro>

<YouWillLearn>

- Which failures are never retried, and why each one is hopeless
- The certificate case, which surprises people
- How `Error.Retryable()` decides
- When to retry at your own level instead

</YouWillLearn>

## The five

<DataTable
  headers={['Sentinel', 'Why retrying is pointless']}
  rows={[
    [<code key="a">ErrAuth</code>, 'The same key will fail again. Rotating it is a human action, not a retry.'],
    [<code key="b">ErrBadRequest</code>, 'The request is malformed. Sending it again produces the same rejection.'],
    [<code key="c">ErrNotFound</code>, 'The model does not exist for this account. It will not appear between attempts.'],
    [<code key="d">ErrRefusal</code>, 'The same prompt gets the same answer, and retrying looks like policy evasion.'],
    [<code key="e">ErrUnsupported</code>, 'The provider structurally cannot express the request. This is produced locally.'],
  ]}
/>

`ErrUnsupported` is often returned **before any network call**, so there is
nothing to retry in the first place.

## The three that are

`ErrRateLimit`, `ErrServer`, and unclassified transport failures — a dial
timeout, a reset connection, a DNS blip. These are the ones where the same
request, sent again in a moment, plausibly succeeds.

## The certificate case

<Pitfall>

**A rejected TLS certificate is not retried**, even though it arrives as a
transport failure with `StatusCode == 0`.

That took a specific fix. A certificate failure is a *misconfiguration* — an
expired cert, a missing CA, a MITM proxy — not a blip. Retrying it spent the
whole retry budget to receive the same answer, and delayed the error the
operator actually needed to see by several seconds at exactly the moment they
were debugging a connection problem.

</Pitfall>

This is the general shape of the rule: retryability is about whether the *world*
might differ in a moment, not about whether the error was transport-level.

## How the decision is made

```go
func (e *Error) Retryable() bool {
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
}
```

An unclassified error **with** a status is not retried: the provider answered,
skyl just could not classify what it said, and repeating the request is unlikely
to produce a more classifiable answer.

You can call it yourself:

```go verify
var e *skyl.Error
if errors.As(err, &e) && !e.Retryable() {
	// A permanent failure. Alert rather than backing off.
	return fmt.Errorf("permanent failure on %s: %w", e.Provider, err)
}
```

## Cancellation stops everything

Retrying also stops immediately when your context is cancelled — skyl checks
`ctx.Err()` after each attempt, and the backoff wait is itself cancellable:

<ConsoleBlock>skyl: waiting to retry: context deadline exceeded</ConsoleBlock>

So a deadline you set is always respected, regardless of how many retries remain
configured.

## Models is special

`Client.Models` additionally refuses to retry `ErrUnsupported`, because a
provider that cannot list models will never be able to. That is a capability
statement rather than a failure.

## When to retry yourself

<DeepDive title="The cases skyl deliberately leaves to you">

**Cross-provider fallback.** Failing over to a different vendor is a product
decision — the second model answers differently, costs differently, and may have
different data-residency implications. See
[Choosing a Provider](/learn/choosing-a-provider).

**Mid-stream failures.** skyl retries only the handshake, because replaying a
partially consumed response would duplicate output the caller has seen. In a
batch job that buffers, retrying is trivially safe and you should. In a UI, it is
not.

**Refusals after rephrasing.** Retrying the *same* prompt is pointless.
Retrying a *rephrased* one is a different request, and entirely reasonable — but
only you can decide what the rephrasing should be.

In each case skyl declines not because it could not, but because the right
answer depends on knowledge skyl does not have.

</DeepDive>

<Recap>

- Never retried: `ErrAuth`, `ErrBadRequest`, `ErrNotFound`, `ErrRefusal`, `ErrUnsupported`.
- Retried: `ErrRateLimit`, `ErrServer`, and transport failures with no status.
- **Certificate failures are not retried** — a misconfiguration is not a blip.
- An unclassified error *with* a status is not retried; the provider did answer.
- Context cancellation stops retrying immediately, including mid-backoff.
- Cross-provider fallback, mid-stream retry and rephrasing are deliberately yours.

</Recap>

<Challenges>

<Challenge title="Alert on permanent failures only">

Page a human for failures that will not fix themselves, and stay quiet about the
ones backoff is already absorbing.

<Hint>

`Retryable()` is the distinction — but remember a retryable error that exhausted
its retries is also worth knowing about.

</Hint>

<Solution>

```go verify
skyl.WithHook(func(_ context.Context, ev skyl.HookEvent) {
	if ev.Err == nil {
		return
	}
	var e *skyl.Error
	if !errors.As(ev.Err, &e) {
		return
	}

	switch {
	case !e.Retryable():
		// Will never succeed on its own. Page.
		alerts.Page("skyl permanent failure", "provider", e.Provider, "kind", e.Kind)
	case ev.Attempt > 0:
		// Retryable, but we are already burning attempts. Trend it.
		metrics.Inc("skyl.retry", "provider", e.Provider)
	}
})
```

Note the hook fires per *attempt*, so a permanent failure pages once — it is
never retried — while a retryable one increments a counter you can alert on by
rate rather than by occurrence.

</Solution>

</Challenge>

</Challenges>
