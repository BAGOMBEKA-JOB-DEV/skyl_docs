---
title: WithTimeout
description: Bounds a single attempt — not the whole retry sequence. Default 10m.
---

<Intro>

`WithTimeout` applies **per attempt**. To bound the whole call including retries
and the delays between them, use the context you pass to `Complete`.

</Intro>

## Reference

<Signature>func WithTimeout(d time.Duration) Option</Signature>

<Parameters>

- **`d`** — the per-attempt deadline. **Non-positive values disable the
  per-attempt timeout entirely**, leaving only the caller's context.

</Parameters>

<Caveats>

- It applies to [`Complete`](/reference/skyl/client-complete) and
  [`Models`](/reference/skyl/client-models).
- **It is deliberately not applied to
  [`Stream`](/reference/skyl/client-stream)**, because the stream outlives the
  call — cancelling on a per-attempt timer would kill a stream that is working.
- The default is **10 minutes**, which is generous on purpose: reasoning models
  legitimately take minutes on hard problems.
- Expiry surfaces as `context.DeadlineExceeded`, reachable through
  `*skyl.Error` because it wraps its cause.

</Caveats>

## Why per attempt

<DeepDive title="A per-call bound starves later retries">

If `WithTimeout` bounded the whole sequence, a request that failed twice would
have less time left for its third attempt than its first. The attempt most
likely to be starved would be the one you most want to succeed — and the
starvation would grow with the retry count, which is exactly backwards.

Bounding each attempt separately keeps them comparable. The sequence bound is a
different decision — "how long is this whole operation allowed to take" — and it
belongs to the caller, who knows whether a user is waiting.

</DeepDive>

## Usage

<Recipe title="Both bounds together">

```go verify
client := skyl.New(p, skyl.WithTimeout(90*time.Second)) // per attempt

ctx, cancel := context.WithTimeout(ctx, 5*time.Minute)  // per call
defer cancel()

resp, err := client.Complete(ctx, req)
```

</Recipe>

<Recipe title="A fast classifier">

```go verify
// This workload should answer in under two seconds; ten is already generous.
fast := skyl.New(p, skyl.WithTimeout(10*time.Second))
```

</Recipe>

<Recipe title="Disabling the per-attempt timeout">

```go verify
// Only ctx bounds anything now.
client := skyl.New(p, skyl.WithTimeout(0))
```

</Recipe>

<Recipe title="Bounding a stream, since this option does not">

```go verify
ctx, cancel := context.WithTimeout(ctx, 5*time.Minute)
defer cancel()

stream, err := client.Stream(ctx, req)
if err != nil {
	return err
}
defer stream.Close()
```

</Recipe>

## Troubleshooting

<Trouble problem="A call took much longer than my timeout">

It bounds one attempt. With three retries plus backoff, the worst case is
roughly four times your timeout plus the delays. Bound the whole call with a
context deadline.

</Trouble>

<Trouble problem="My streams ignore this setting">

Correct — it is not applied to `Stream`. Set a context deadline instead.

</Trouble>

<Trouble problem="Reasoning models keep timing out">

The default of ten minutes exists precisely for them. If you lowered it, raise
it back for the models that think; keep the low value for a separate client
serving fast workloads.

</Trouble>
