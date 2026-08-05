---
title: Error.Unwrap
description: Returns the sentinel and the underlying cause.
---

<Intro>

`Unwrap` returns a **slice** of errors rather than a single one. That is what
lets `errors.Is` match both a skyl sentinel and a wrapped standard error on the
same value.

</Intro>

## Reference

<Signature>func (e *Error) Unwrap() []error</Signature>

<Returns>

<DataTable
  headers={['State', 'Returns']}
  rows={[
    ['Kind and cause both set', <code key="a">{'[]error{Kind, cause}'}</code>],
    ['Kind only', <code key="b">{'[]error{Kind}'}</code>],
    ['cause only', <code key="c">{'[]error{cause}'}</code>],
    ['neither', <code key="d">nil</code>],
  ]}
/>

</Returns>

<Caveats>

- **`errors.Is` and `errors.As` handle the slice form natively**, so nothing in
  your code changes to take advantage of it.
- The cause is set by adapters through
  [`WithCause`](/reference/skyl/errors/error) for transport failures — a dial
  timeout, a TLS failure, a cancelled context.
- `Cause()` returns it directly if you need the value rather than a match.

</Caveats>

## Why a slice

<DeepDive title="Flattening the cause loses the information you need">

A dial timeout, a DNS failure and a rejected certificate all arrive with
`StatusCode == 0` and no sentinel. Flattening the cause into a message string
makes them indistinguishable — you get three different problems reported
identically, at exactly the moment you are trying to tell them apart.

With the multi-error `Unwrap`, precise questions work:

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

And the sentinel still matches on the same value, so
`errors.Is(err, skyl.ErrServer)` is unaffected.

</DeepDive>

## Usage

<Recipe title="Matching both at once">

```go verify
// Both of these are true of the same error.
timedOut := errors.Is(err, context.DeadlineExceeded)
serverSide := errors.Is(err, skyl.ErrServer)
```

</Recipe>

<Recipe title="Recognising a cancelled stream">

```go verify
if err := stream.Err(); err != nil {
	if errors.Is(err, context.Canceled) {
		return nil // the caller went away; not worth reporting
	}
	return err
}
```

</Recipe>

## Troubleshooting

<Trouble problem="errors.Is(err, context.DeadlineExceeded) returns false">

The adapter did not attach a cause — either it was not a transport failure, or
the error came from somewhere that had no cause to attach. Check
`e.StatusCode`: a non-zero status means the provider answered, so no context
error is involved.

</Trouble>

<Trouble problem="I used to type-assert Unwrap() to error and it broke">

`Unwrap` returns `[]error` now. Use `errors.Is` and `errors.As`, which handle
both forms — direct calls to `Unwrap` were never the intended interface.

</Trouble>
