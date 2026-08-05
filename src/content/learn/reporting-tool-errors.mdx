---
title: Reporting Tool Errors
description: IsError reaches the model faithfully on exactly one adapter.
---

<Intro>

Tools fail. Telling the model so is what lets it adapt instead of building on a
result that is not there — and this is one of the places where skyl's
abstraction is genuinely lossy, on three adapters out of four.

</Intro>

<YouWillLearn>

- How to report a failure with `ToolErrorMessage`
- Where the `IsError` flag is lost, and what that means
- The portable way to tell the model something went wrong
- Why you should not just return an empty result

</YouWillLearn>

## The intended way

```go verify
result, err := runTool(call)
if err != nil {
	req.Messages = append(req.Messages,
		skyl.ToolErrorMessage(call.ID, err.Error()))
} else {
	req.Messages = append(req.Messages,
		skyl.ToolResultMessage(call.ID, result))
}
```

`ToolErrorMessage` is `ToolResultMessage` with `IsError: true`.

## Where the flag goes

<DataTable
  headers={['Adapter', 'What reaches the model']}
  rows={[
    ['anthropic', <span key="a">A real <code>is_error</code> boolean — the flag arrives intact.</span>],
    ['openai / openaicompat', <span key="b"><strong>Lossy.</strong> Prefixes <code>&quot;error: &quot;</code> to the content — and <strong>drops the flag entirely when the content is empty</strong>.</span>],
    ['gemini', <span key="c"><strong>Dropped.</strong> Never reaches the wire at all.</span>],
  ]}
/>

<Pitfall>

**On Gemini the signal never arrives.** A failed tool is indistinguishable from
a successful one that happened to return that text.

This is entry 3 in the [silently ignored list](/reference/provider/silently-ignored),
and it is the one most likely to cause a real problem: a model that thinks a
tool succeeded will confidently build an answer on top of nothing.

</Pitfall>

## The portable way

Put the failure **in the text**, where every provider carries it faithfully:

```go verify
func toolResult(call skyl.ToolCall, out string, err error) skyl.Message {
	if err != nil {
		// The prose is the signal. IsError is a bonus where it works.
		return skyl.ToolErrorMessage(call.ID,
			fmt.Sprintf("ERROR: %s failed: %v. Do not retry; tell the user the "+
				"data is unavailable.", call.Name, err))
	}
	return skyl.ToolResultMessage(call.ID, out)
}
```

Three things that text does, which the boolean alone cannot:

- **Names the tool**, so a turn with several calls is unambiguous.
- **Says what to do next** — "do not retry" prevents the loop where the model
  keeps calling a tool that will keep failing.
- **Works on all four adapters**, because it is just content.

Keep `ToolErrorMessage` as well. On Anthropic you get both signals; elsewhere you
lose nothing.

## Never return empty

<Pitfall>

Returning an empty string for a failed tool is the worst option available.

On OpenAI and openaicompat, an empty content **drops the error flag entirely** —
so the model receives a successful tool result containing nothing, and will
usually either hallucinate a plausible value or say the tool returned no data
when in fact it errored.

Always return text.

</Pitfall>

## Errors the model should not see

Not every failure belongs in the conversation. A credential problem or a
programming error is yours to fix, not the model's to work around:

```go verify
result, err := runTool(call)
switch {
case errors.Is(err, errNotConfigured), errors.Is(err, errBug):
	// Fail the request. The model cannot help with this, and telling it
	// invites a confidently wrong answer built on an apology.
	return nil, fmt.Errorf("tool %s: %w", call.Name, err)
case err != nil:
	// A genuine runtime failure the model can adapt to.
	msgs = append(msgs, toolResult(call, "", err))
default:
	msgs = append(msgs, toolResult(call, result, nil))
}
```

<DeepDive title="Why does skyl not normalise this itself?">

It could prefix `"error: "` on Gemini too, and make all four behave alike.

It does not, because that would be skyl putting words into a conversation the
caller owns. The prefix the OpenAI adapters add is already a compromise — it
exists because the wire format has no other place to put the flag — and
extending that invention to a provider that simply has no such concept would
mean skyl silently editing your tool output on one adapter and not another.

Publishing the gap and letting you write the sentence you want is the honest
trade. It is the same reasoning as
[not fetching image URLs for you](/learn/images-and-multimodal).

</DeepDive>

<Recap>

- `ToolErrorMessage` sets `IsError`; `ToolResultMessage` does not.
- The flag arrives intact **only on Anthropic**.
- OpenAI-family adapters prefix `"error: "` and drop the flag when content is empty.
- **Gemini drops it entirely** — the model cannot tell the tool failed.
- Put the failure in the text, name the tool, and say what to do next.
- Never return an empty result for a failure; it erases the signal completely.

</Recap>

<Challenges>

<Challenge title="Stop a retry loop caused by a failing tool">

A tool is down, and the model keeps calling it. Write the error text that stops
the loop.

<Hint>

The model is retrying because nothing told it not to. Say so explicitly, and say
what to do instead.

</Hint>

<Solution>

```go verify
skyl.ToolErrorMessage(call.ID,
	"ERROR: get_weather is unavailable (HTTP 503). This is a persistent outage — "+
		"do not call get_weather again in this conversation. Answer using what you "+
		"already know, and tell the user that live weather data is unavailable.")
```

Three instructions in one message: what failed, not to retry, and what to do
instead. Compare it to `"503"`, which tells the model nothing and reads exactly
like a transient failure worth retrying.

This is prompt engineering rather than API usage — but it is the part of tool
calling that actually determines whether your loop terminates.

</Solution>

</Challenge>

</Challenges>
