---
title: Parallel Tool Calls
description: Running several concurrently, and why Gemini makes pairing harder.
---

<Intro>

A model can request several tools in one turn. Running them concurrently is
ordinary Go — the only subtlety is pairing results back to calls, which is
harder on one provider than the others.

</Intro>

<YouWillLearn>

- How several calls arrive in one turn
- How to run them concurrently and collect the results
- Why pairing by ID does not work on Gemini
- How to bound concurrency so a model cannot fan you out

</YouWillLearn>

## Several calls, one turn

```go verify
resp, err := client.Complete(ctx, req)
if err != nil {
	return err
}

calls := resp.ToolCalls()   // may hold more than one
```

The order is the order the model produced them, which is occasionally
meaningful — a model that says "first look up A, then B" expects them in that
sequence.

## Running them concurrently

```go title="parallel.go" verify
func runAll(ctx context.Context, calls []skyl.ToolCall) []string {
	results := make([]string, len(calls))

	// Bound concurrency: a model can request many calls at once, and an
	// unbounded fan-out turns that into a self-inflicted load spike.
	sem := make(chan struct{}, 4)
	var wg sync.WaitGroup

	for i, call := range calls {
		wg.Add(1)
		go func(i int, call skyl.ToolCall) {
			defer wg.Done()
			select {
			case sem <- struct{}{}:
				defer func() { <-sem }()
			case <-ctx.Done():
				results[i] = "ERROR: cancelled before the tool ran"
				return
			}
			results[i] = run(ctx, call)
		}(i, call)
	}
	wg.Wait()
	return results
}
```

Writing into a pre-sized slice by index needs no mutex — each goroutine owns one
element — and it preserves the model's ordering for free.

## Appending the results

Append the assistant turn once, then one tool message per call, in order:

```go verify
req.Messages = append(req.Messages, resp.Message)
for i, call := range calls {
	req.Messages = append(req.Messages,
		skyl.ToolResultMessage(call.ID, results[i]))
}
```

<Pitfall>

Every call must get a result. A call left unanswered makes the whole turn
invalid on every provider — so if a tool panics or you skip one, send an error
message rather than nothing.

</Pitfall>

## Pairing on Gemini

<Pitfall>

**Gemini issues no call IDs.** The adapter sets `ToolCall.ID` to the **function
name** instead.

So two parallel calls to the *same* tool arrive with identical IDs, and pairing
results by ID is ambiguous. Pair by **position** instead — which is what the
loop above does, since it indexes `results` alongside `calls`.

</Pitfall>

If you have code that builds a `map[string]string` keyed by call ID, it silently
collapses two same-tool calls into one on Gemini:

```go
// DON'T on Gemini: two get_weather calls overwrite each other.
results := map[string]string{}
for _, call := range calls {
	results[call.ID] = run(call)
}
```

The index-based form has no such problem and works everywhere.

## Bounding the fan-out

<DeepDive title="Why the semaphore is not optional">

The number of tool calls in a turn is chosen by the model, not by you. A model
that decides to look up twenty cities produces twenty concurrent goroutines,
each making an outbound HTTP request — from a handler that may already be one of
hundreds in flight.

That is a load spike your own service inflicts on itself, triggered by model
output you do not control. Treating model output as untrusted input applies to
its *shape* as much as its content.

Four is a reasonable default. If your tools are cheap and local, raise it; if
they call a rate-limited third party, lower it.

</DeepDive>

## Streaming

Parallel calls arrive as separate `EventToolCall` events, each emitted once its
arguments are whole. Collect them and run them after the stream completes — you
cannot start work mid-stream and still rebuild the assistant turn correctly.

<Recap>

- Several calls can arrive in one turn, in the order the model produced them.
- Run them concurrently, writing into a pre-sized slice by index — no mutex needed.
- Append `resp.Message` once, then one result per call, in order.
- **Every call must get a result**, even a failure — an unanswered call invalidates the turn.
- **On Gemini, `ToolCall.ID` is the function name** — pair by position, never by ID.
- Bound the fan-out: the model chooses how many calls, not you.

</Recap>

<Challenges>

<Challenge title="Make the Gemini pairing bug impossible">

Write a result collector that is correct on all four adapters, including two
concurrent calls to the same tool on Gemini.

<Hint>

The safe key is the index, not the ID. But you still need the ID when you append.

</Hint>

<Solution>

```go
type pending struct {
	call   skyl.ToolCall
	result string
}

func collect(ctx context.Context, calls []skyl.ToolCall) []pending {
	out := make([]pending, len(calls))
	var wg sync.WaitGroup

	for i, call := range calls {
		out[i].call = call
		wg.Add(1)
		go func(i int, call skyl.ToolCall) {
			defer wg.Done()
			out[i].result = run(ctx, call)
		}(i, call)
	}
	wg.Wait()
	return out
}

// Appending keeps the pairing implicit in the slice order.
for _, p := range collect(ctx, calls) {
	req.Messages = append(req.Messages,
		skyl.ToolResultMessage(p.call.ID, p.result))
}
```

Carrying the call alongside its result means you never need a lookup, so the
ambiguous ID is never used as a key. It is a smaller change than it looks and it
removes an entire class of provider-specific bug.

</Solution>

</Challenge>

</Challenges>
