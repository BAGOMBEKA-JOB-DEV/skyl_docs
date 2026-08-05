---
title: StopReason
description: Why the model stopped generating.
---

<Intro>

Six values, of which two need explicit handling and one is effectively
provider-specific. Adapters map vendor values onto these and fall back to
`StopUnknown` rather than inventing a new one.

</Intro>

## Reference

<Signature>type StopReason string</Signature>

<StopReasonTable />

<Caveats>

- **`StopMaxTokens` means the response is truncated.** Treat it as incomplete,
  not as a short answer.
- **`StopStopSequence` only ever comes from Anthropic.** OpenAI reports a
  stop-sequence hit as plain `stop`, so it arrives as `StopEndTurn`; Gemini
  reports `STOP`.
- **On Gemini, any response containing a function call reports `StopToolUse`**
  regardless of its actual `finishReason` — so a Gemini response can be both
  truncated and reported as `tool_use`.
- A refusal **with** text arrives here as `StopRefusal`; one **without** text is
  an `ErrRefusal` error instead. Handle both.
- Unmapped values become `StopUnknown`; the original is in `Response.Raw`.

</Caveats>

## Usage

<Recipe title="An exhaustive switch">

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
	// StopUnknown, or something newer than this build. Be honest about it.
	log.Printf("unmapped stop reason; raw: %s", resp.Raw)
	return resp.Text(), nil
}
```

</Recipe>

<Recipe title="Detecting a stop sequence portably">

```go verify
// StopStopSequence is Anthropic-only, so fall back to reading Raw.
var raw struct {
	StopSequence string `json:"stop_sequence"`
}
_ = json.Unmarshal(resp.Raw, &raw)
```

</Recipe>

## Troubleshooting

<Trouble problem="Answers are cut off mid-sentence">

`StopMaxTokens`. Raise `MaxTokens`; retrying unchanged gives the same result.

</Trouble>

<Trouble problem="My StopStopSequence branch stopped firing after switching provider">

Expected. Only Anthropic reports it. Read `Raw`, or check whether the text ends
where you expected.

</Trouble>

<Trouble problem="I got StopUnknown">

The provider reported something skyl does not model — `pause_turn`,
`MALFORMED_FUNCTION_CALL`, or something newer. `Raw` has the original value.
This is deliberate: minting a constant per vendor value would require a skyl
release before you could branch on it.

</Trouble>
