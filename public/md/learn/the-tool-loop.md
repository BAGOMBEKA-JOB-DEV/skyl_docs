---
title: The Tool Loop
description: Append the assistant turn first, and bound the loop.
---

<Intro>

Tool calling is a loop that runs until the model stops asking. Two things make
it work: appending messages in the right order, and refusing to loop forever.

</Intro>

<YouWillLearn>

- The complete loop, bounded
- Why `resp.Message` must be appended before any result
- How to handle several calls in one turn
- What to do when the loop does not terminate

</YouWillLearn>

## The loop

```go title="loop.go"
const maxToolRounds = 5

func complete(ctx context.Context, client *skyl.Client, req *skyl.Request) (*skyl.Response, error) {
	for round := 0; round < maxToolRounds; round++ {
		resp, err := client.Complete(ctx, req)
		if err != nil {
			return nil, err
		}

		calls := resp.ToolCalls()
		if len(calls) == 0 {
			return resp, nil // the model is done
		}

		// The assistant's turn goes first, once, even for several calls.
		req.Messages = append(req.Messages, resp.Message)

		// Then one tool message per call.
		for _, call := range calls {
			req.Messages = append(req.Messages,
				skyl.ToolResultMessage(call.ID, run(call)))
		}
	}
	return nil, fmt.Errorf("gave up after %d tool rounds", maxToolRounds)
}
```

## Ordering is not optional

<Pitfall>

**Every provider rejects a tool result that does not follow the call it
answers.** Appending the result without first appending `resp.Message` produces
a 400, on all four adapters, every time.

That is why `Response.Message` exists in the same shape a request takes — so it
can be appended and replayed verbatim, with no translation.

</Pitfall>

And append `resp.Message` itself, not a reconstruction:

```go
// DON'T: AssistantText keeps the prose and silently drops the tool calls,
// so the result you append next has nothing to answer.
req.Messages = append(req.Messages, skyl.AssistantText(resp.Text()))
```

## Several calls in one turn

Append the assistant turn **once**, then one tool message per call. The loop
above already does this correctly — note that `resp.Message` is outside the
inner `for`.

Each `ToolResultMessage` carries its own `CallID`, which is how the provider
pairs them.

## Bounding the loop

<DeepDive title="Why an unbounded tool loop is a real risk">

A model that keeps asking for tools is not hypothetical. The usual cause is a
tool returning something the model cannot use — an error string it does not
understand, or an empty result it reads as "try again with different arguments".

Unbounded, that is a loop that bills you per iteration until something else
breaks. Five rounds is a reasonable default: legitimate multi-step tool use
rarely exceeds three, and hitting the bound is a strong signal to go and look at
what your tool is returning.

Make the error say so, rather than just "too many rounds" — the log line is the
only clue anyone will have.

</DeepDive>

## Streaming

There is no `Response.Message` on a stream, so you rebuild the assistant turn
from the events you saw. See
[Streaming Tool Calls](/learn/streaming-tool-calls), or use
`skyl.CollectStream`, which does the assembly for you.

## Detecting the end

`resp.ToolCalls()` returning empty is the terminating condition. You can also
check `resp.StopReason == skyl.StopToolUse`, but the call list is more direct —
and on Gemini, any response containing a function call reports `StopToolUse`
regardless of its actual `finishReason`, so the stop reason is the less reliable
signal there.

<Recap>

- Loop until `resp.ToolCalls()` is empty, with a hard bound.
- **Append `resp.Message` before any tool result** — every provider requires it.
- Append it once per turn, then one tool message per call.
- Never reconstruct the turn with `AssistantText`; it drops the calls.
- Bound the loop at ~5 rounds and make the error explain what to look at.
- Prefer the empty call list over `StopToolUse` as the terminating check.

</Recap>

<Challenges>

<Challenge title="Make the ordering mistake impossible">

Wrap the append sequence so a caller cannot get it wrong.

<Hint>

One function that takes the response and the results, and does both appends in
the right order.

</Hint>

<Solution>

```go verify
// applyToolResults appends the assistant turn and the results in the only
// order every provider accepts.
func applyToolResults(req *skyl.Request, resp *skyl.Response, results map[string]string) {
	req.Messages = append(req.Messages, resp.Message)
	for _, call := range resp.ToolCalls() {
		out, ok := results[call.ID]
		if !ok {
			// A call with no result is worse than an error result: the
			// provider will reject the turn for an unanswered call.
			out = "ERROR: no result was produced for this call"
		}
		req.Messages = append(req.Messages, skyl.ToolResultMessage(call.ID, out))
	}
}
```

The missing-result branch matters. Silently skipping a call leaves the provider
with a call that has no answer, which is the same 400 as the ordering mistake —
and much harder to spot.

</Solution>

</Challenge>

<Challenge title="Report a runaway loop usefully">

Hitting the round limit should tell you which tool is misbehaving.

<Hint>

Track which tools were called each round.

</Hint>

<Solution>

```go verify
var history []string
for round := 0; round < maxToolRounds; round++ {
	// …
	for _, call := range calls {
		history = append(history, call.Name)
	}
}
return nil, fmt.Errorf("gave up after %d tool rounds; call sequence was %v — "+
	"check what these tools return", maxToolRounds, history)
```

A sequence like `[get_weather get_weather get_weather]` tells you immediately
that the tool's output is not usable by the model, which is a different fix from
a genuine multi-step task that needed six rounds.

</Solution>

</Challenge>

</Challenges>
