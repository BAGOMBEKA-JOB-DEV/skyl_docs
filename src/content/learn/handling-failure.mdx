---
title: Handling Failure
description: Classified errors, jittered backoff, and knowing what never to retry.
---

<Intro>

skyl classifies every provider failure onto one of eight sentinels, retries the
three that are worth retrying, and never retries the five that are not. This
chapter is about branching on that classification instead of on message text.

</Intro>

<YouWillLearn isChapter>

- The eight sentinel errors and what each means
- How `*skyl.Error` carries the detail, and how to reach it
- How backoff works, and why jitter is not optional
- The difference between a per-attempt timeout and your own deadline
- What a rate limit means *after* skyl has already retried
- Why refusals and auth failures are never retried

</YouWillLearn>

## Branch on classification

```go verify
resp, err := client.Complete(ctx, req)
switch {
case err == nil:
	// ok
case errors.Is(err, skyl.ErrRateLimit):
	// skyl already retried with backoff; this means it kept failing.
case errors.Is(err, skyl.ErrAuth):
	log.Fatal("bad API key")
case errors.Is(err, skyl.ErrNotFound):
	log.Fatal("no such model for this provider")
}
```

Never match on message text. Providers reword their messages, and string
matching breaks silently when they do.

<SentinelTable />

<LearnMore path="/learn/error-classification">
Read **[Error Classification](/learn/error-classification)** for `*skyl.Error`, `errors.As`, and how HTTP statuses map onto sentinels.
</LearnMore>

## Retries

<LearnMore path="/learn/retries-and-backoff">
Read **[Retries and Backoff](/learn/retries-and-backoff)** for the exact delay formula and why full jitter matters at fleet scale.
</LearnMore>

## Timeouts

<LearnMore path="/learn/timeouts-and-cancellation">
Read **[Timeouts and Cancellation](/learn/timeouts-and-cancellation)** — `WithTimeout` bounds an attempt, your context bounds the call.
</LearnMore>

## Rate limits

<LearnMore path="/learn/rate-limits">
Read **[Rate Limits and Retry-After](/learn/rate-limits)** for why `Retry-After` has its own cap, separate from the backoff ceiling.
</LearnMore>

## Refusals

<LearnMore path="/learn/refusals">
Read **[Refusals](/learn/refusals)** — a refusal reaches you two different ways depending on whether it carried text.
</LearnMore>

## What is never retried

<LearnMore path="/learn/never-retried">
Read **[What Is Never Retried](/learn/never-retried)** for the five sentinels skyl refuses to retry, and the one surprising case.
</LearnMore>

<WhatsNext>

Start with [Error Classification](/learn/error-classification). If you are
debugging a specific failure right now, the sentinel table above will tell you
which page to jump to.

</WhatsNext>
