---
title: Stop Reasons
description: Six values, two of which are effectively provider-specific.
---

<Intro>

`Response.StopReason` tells you why generation ended. Getting this wrong is how
a truncated answer gets presented as a complete one, so it is worth branching on
rather than ignoring.

</Intro>

<YouWillLearn>

- What each stop reason means, and which need handling
- Which provider values map onto each
- Why `StopStopSequence` only ever comes from Anthropic
- How to handle truncation and refusal properly

</YouWillLearn>

## The values

<StopReasonTable />

Adapters map provider-specific values onto these and fall back to `StopUnknown`
rather than inventing a new one — so a value you have never seen is always
readable in `Response.Raw`.

## The two that need handling

**`StopMaxTokens`** means the response is **truncated**. The text you have is a
prefix of what the model was going to say.

```go verify
if resp.StopReason == skyl.StopMaxTokens {
	// Do not present this as an answer. Either raise MaxTokens and retry,
	// or tell the caller it was cut short.
	return fmt.Errorf("truncated at %d tokens", req.MaxTokens)
}
```

**`StopToolUse`** means the model wants a tool run and is waiting for you. It is
not an error, and `Text()` will often be empty — see
[The Tool Loop](/learn/the-tool-loop).

## Refusals

`StopRefusal` means the model or its safety classifiers declined.

```go verify
if resp.StopReason == skyl.StopRefusal {
	// Content may be empty or partial. Do NOT retry the same request —
	// the same prompt gets the same answer.
}
```

<Pitfall>

A refusal reaches you two different ways depending on whether it carried text.

- A refusal **with** text is returned normally, with `StopReason == StopRefusal`.
- A refusal with **no** content becomes an **error**: `ErrRefusal`.

So handling refusals properly means checking both the error and the stop reason.
Before this was fixed, an empty refusal was reported as success — a response
with no text and no error, which looked like a bug in your own code.

</Pitfall>

```go verify
resp, err := client.Complete(ctx, req)
switch {
case errors.Is(err, skyl.ErrRefusal):
	// Declined, with nothing to show.
case err != nil:
	return err
case resp.StopReason == skyl.StopRefusal:
	// Declined, but said something about why.
	fmt.Println(resp.Text())
}
```

## The provider-specific ones

<Pitfall>

**`StopStopSequence` only ever comes from Anthropic.**

OpenAI reports a stop-sequence hit as plain `stop`, which arrives as
`StopEndTurn`. Gemini reports `STOP`, likewise. So a branch on
`StopStopSequence` silently stops working when you switch providers.

If you need to know that a stop sequence fired, read `Response.Raw`, or check
whether the text ends where you expected.

</Pitfall>

And on **Gemini**, a response containing any function call reports
`StopToolUse` regardless of its actual `finishReason` — so a Gemini response can
be both truncated and reported as `tool_use`.

<DeepDive title="Why StopUnknown rather than a growing enum">

Providers add finish reasons regularly — `pause_turn`, `model_context_window_exceeded`,
`MALFORMED_FUNCTION_CALL`. If skyl minted a constant for each, every new
provider value would require a skyl release before you could branch on it, which
is the same failure mode as a curated model list.

`StopUnknown` plus `Raw` means an unmapped value is *readable* immediately, and
your `switch` has a `default` branch that is honest about not knowing rather
than one that misclassifies.

</DeepDive>

<Recap>

- `StopMaxTokens` means **truncated** — treat it as incomplete, never as an answer.
- `StopToolUse` means the model is waiting for you; `Text()` may be empty.
- A refusal with text is a `StopRefusal` response; one **without** text is an `ErrRefusal` error.
- **`StopStopSequence` is Anthropic-only** — the other providers report `stop`/`STOP`.
- On Gemini, any function call forces `StopToolUse` regardless of `finishReason`.
- Unmapped values become `StopUnknown` rather than a wrong guess; read `Raw`.

</Recap>

<Challenges>

<Challenge title="Write an exhaustive stop-reason switch">

Handle every stop reason in a way that never presents incomplete output as
complete.

<Hint>

The `default` branch matters as much as the named ones — `StopUnknown` is real
and you will hit it.

</Hint>

<Solution>

```go verify
switch resp.StopReason {
case skyl.StopEndTurn, skyl.StopStopSequence:
	return resp.Text(), nil
case skyl.StopMaxTokens:
	return "", fmt.Errorf("truncated at %d tokens; raise MaxTokens", req.MaxTokens)
case skyl.StopToolUse:
	return "", errToolCallsPending
case skyl.StopRefusal:
	return "", fmt.Errorf("the model declined: %s", resp.Text())
default:
	// StopUnknown, or something newer than this build. Be honest.
	log.Printf("unmapped stop reason; raw: %s", resp.Raw)
	return resp.Text(), nil
}
```

Grouping `StopStopSequence` with `StopEndTurn` is right for most callers: both
mean "the model finished deliberately". Splitting them only matters if you are
detecting the sequence itself, which is not portable anyway.

</Solution>

</Challenge>

</Challenges>
