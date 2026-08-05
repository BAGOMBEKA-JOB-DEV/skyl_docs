---
title: ParseRetryAfter
description: Interprets a Retry-After header, in either wire form.
---

<Intro>

`Retry-After` comes in two shapes and providers use both. `ParseRetryAfter`
handles each, and never hands you a value that would make backoff nonsensical.

</Intro>

## Reference

<Signature>func ParseRetryAfter(v string) time.Duration</Signature>

<Returns>

<DataTable
  headers={['Header value', 'Returns']}
  rows={[
    [<code key="a">60</code>, '60 seconds'],
    [<code key="b">1.5</code>, '1.5 seconds — fractional values are accepted'],
    [<code key="c">Wed, 04 Aug 2026 21:00:00 GMT</code>, 'The remaining duration until that time'],
    [<code key="d">(a date in the past)</code>, <strong key="e">0</strong>],
    [<code key="f">garbage</code>, <strong key="g">0</strong>],
    [<code key="h">(empty)</code>, <strong key="i">0</strong>],
    [<code key="j">-5</code>, <strong key="k">0</strong>],
  ]}
/>

</Returns>

<Caveats>

- **It never returns a negative duration.** A date already in the past yields
  zero, so backoff falls back to its computed delay rather than doing something
  nonsensical.
- Zero means "no usable hint", not "retry immediately".
- Leading and trailing whitespace is trimmed.
- The value skyl honours is separately bounded by
  [`WithRetryAfterCap`](/reference/skyl/with-retry-after-cap), defaulting to
  5 minutes.

</Caveats>

## Usage

<Recipe title="In an adapter">

```go
e := skyl.NewError(p.Name(), res.StatusCode, skyl.ErrRateLimit, msg, raw)
e.RetryAfter = skyl.ParseRetryAfter(res.Header.Get("Retry-After"))
return nil, e
```

</Recipe>

<Recipe title="Reading the hint as a caller">

```go verify
var e *skyl.Error
if errors.As(err, &e) && e.RetryAfter > 0 {
	log.Printf("%s asked for %s", e.Provider, e.RetryAfter)
}
```

</Recipe>

<Recipe title="Propagating it to your own callers">

```go verify
if e != nil && e.RetryAfter > 0 {
	// So your callers back off in step with the real window rather than guessing.
	w.Header().Set("Retry-After", strconv.Itoa(int(e.RetryAfter.Seconds())))
}
```

</Recipe>

## Troubleshooting

<Trouble problem="RetryAfter is zero on a 429">

The provider did not send the header, or sent something unparseable. skyl falls
back to its computed backoff, which is the correct behaviour — a zero is not
"retry now".

</Trouble>

<Trouble problem="A retry waited five minutes">

That is `WithRetryAfterCap`'s default being reached: the provider asked for at
least that long. Lower the cap if your latency budget cannot absorb it.

</Trouble>
