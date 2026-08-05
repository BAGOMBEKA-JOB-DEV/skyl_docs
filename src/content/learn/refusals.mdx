---
title: Refusals
description: A refusal reaches you two ways, depending on whether it carried text.
---

<Intro>

When a model or its safety classifiers decline, skyl reports it — but through
two different channels depending on whether the refusal came with an
explanation. Handling only one of them is a common gap.

</Intro>

<YouWillLearn>

- The two ways a refusal arrives
- Why an empty refusal is an error and a spoken one is not
- Why refusals are never retried
- How to recover a conversation that has been poisoned by one

</YouWillLearn>

## Two channels

**A refusal that carries text** is returned as a normal response with
`StopReason == skyl.StopRefusal`.

**A refusal with no content** becomes an **error**: `skyl.ErrRefusal`.

```go verify
resp, err := client.Complete(ctx, req)
switch {
case errors.Is(err, skyl.ErrRefusal):
	// Declined, with nothing to show for it.
	return "the model declined to answer", nil
case err != nil:
	return "", err
case resp.StopReason == skyl.StopRefusal:
	// Declined, but said something about why — show it.
	return resp.Text(), nil
}
```

<Pitfall>

Handling only the error case means a spoken refusal reaches your users as though
it were a normal answer. Handling only the stop reason means an empty refusal
arrives as an unexplained error.

You need both branches.

</Pitfall>

<DeepDive title="Why the split, rather than one or the other?">

Because a refusal with text *is* a useful response. "I can't help with that, but
here's a related thing I can do" is content your user should see, and turning it
into an error would throw it away.

A refusal with **no** content is a different animal: a successful HTTP response
carrying nothing. Returning that as a normal response means the caller gets an
empty string and no signal — which looks exactly like a bug in their own code.

This was in fact broken before the first release: `content_filter` and `refusal`
mapped to `StopRefusal` but returned no error, so `ErrRefusal` was never produced
by any adapter and the gateway's 422 branch was unreachable.

</DeepDive>

## What maps to a refusal

Adapters classify a wide set of provider values onto `StopRefusal`:

<ConsoleBlock>refusal · content_filter · SAFETY · RECITATION · BLOCKLIST · PROHIBITED_CONTENT · SPII</ConsoleBlock>

Those come from all three vendors' vocabularies. Anything skyl does not
recognise becomes `StopUnknown` rather than being guessed at.

## Never retried

`ErrRefusal` is never retried, and `Error.Retryable()` returns false for it.

The same prompt gets the same answer — safety classifiers are deterministic
enough that retrying is purely wasted quota. Worse, an automatic retry on
refusal looks, from the provider's side, like an attempt to work around their
policy.

## Recovering a conversation

<Pitfall>

A refused turn stays in your `Messages` slice. Every subsequent request replays
it, and the model refuses again — so one refusal poisons the whole conversation
unless you remove it.

</Pitfall>

```go verify
resp, err := client.Complete(ctx, req)
if errors.Is(err, skyl.ErrRefusal) {
	// Drop the user turn that triggered it, or every later request carries
	// the same trigger and gets the same answer.
	req.Messages = req.Messages[:len(req.Messages)-1]
	return "I can't help with that. Try rephrasing?", nil
}
```

## The gateway

Over HTTP, a refusal becomes **422 Unprocessable Entity** with
`"kind": "refusal"` — chosen because the request was well-formed and understood,
and the model declined to act on it, which is precisely what 422 means.

## Distinguishing a refusal from a filter

skyl does not separate "the model chose not to" from "a classifier blocked it",
because the vendors do not expose that distinction consistently. If you need it,
`Response.Raw` carries the provider's original value:

```go verify
var raw struct {
	StopReason string `json:"stop_reason"`
}
_ = json.Unmarshal(resp.Raw, &raw)
// e.g. "refusal" vs "content_filter" — the distinction skyl flattens.
```

<Recap>

- A refusal **with** text is a response with `StopRefusal`; one **without** is `ErrRefusal`.
- Handle both branches, or you will miss one of the two cases.
- Seven provider values across three vendors map onto `StopRefusal`.
- Refusals are **never retried** — the same prompt gets the same answer.
- Remove the refused turn, or it poisons every later request in the conversation.
- The gateway returns **422** with `"kind": "refusal"`.

</Recap>

<Challenges>

<Challenge title="Handle both refusal channels in one function">

Write a helper that returns a single, consistent result whichever way the
refusal arrives.

<Hint>

A small result type is clearer than juggling two return paths at every call
site.

</Hint>

<Solution>

```go verify
type Answer struct {
	Text    string
	Refused bool
}

func ask(ctx context.Context, c *skyl.Client, req *skyl.Request) (Answer, error) {
	resp, err := c.Complete(ctx, req)
	switch {
	case errors.Is(err, skyl.ErrRefusal):
		return Answer{Refused: true}, nil
	case err != nil:
		return Answer{}, err
	case resp.StopReason == skyl.StopRefusal:
		return Answer{Text: resp.Text(), Refused: true}, nil
	default:
		return Answer{Text: resp.Text()}, nil
	}
}
```

Both channels now converge on `Refused: true`, and the caller decides once
whether to show `Text` — which may be empty. No call site has to remember there
were two cases.

</Solution>

</Challenge>

</Challenges>
