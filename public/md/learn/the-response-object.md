---
title: The Response Object
description: Every field, and which ones you can rely on.
---

<Intro>

`Response` is deliberately small. Seven fields, two of which are guaranteed
populated on every adapter and every call, and five which are best-effort
because providers differ in what they disclose.

</Intro>

<YouWillLearn>

- What each field means and when it is empty
- Which fields are guaranteed and which are best-effort
- The two convenience methods, and when to bypass them

</YouWillLearn>

## The fields

<Fields of="response" />

## Always populated

**`Provider`** and **`Raw`**. Every adapter sets them on every successful call —
the first so an error or a metric can name its source, the second so skyl's
abstraction is never the reason you cannot ship.

`Message` is always present as a value, though it may have no parts if the model
produced nothing (a refusal, for instance).

## Best-effort

**`ID`** is empty when the provider gives none. It is the value a provider's
support team will ask you for, so log it when you have it.

**`Model`** is read from the *response*. See
[Which Model Actually Answered](/learn/which-model-answered).

**`StopReason`** falls back to `StopUnknown` rather than inventing a value.

**`Usage`** reports zero for anything a provider does not send. Zero means "not
reported", **not** "zero tokens" — a distinction that matters when you are
summing across providers.

## The convenience methods

```go verify
resp.Text()       // every Text part concatenated; other parts ignored
resp.ToolCalls()  // every ToolCall part, in order; nil when there are none
```

Both are nil-safe — calling them on a nil `*Response` returns the zero value
rather than panicking, so an error path that logs `resp.Text()` before checking
`err` does not crash.

`ToolCalls()` returning `nil` rather than an empty slice is deliberate: a plain
`range` over nil is safe, so the common case needs no length check.

<Pitfall>

`Text()` ignores everything that is not a `Text` part. If the model returned
*only* tool calls, `Text()` is the empty string — which looks exactly like a
model that failed to answer.

Always check `StopReason` before concluding an empty response is a problem:

```go verify
if resp.Text() == "" && resp.StopReason == skyl.StopToolUse {
	// Not a failure — the model wants a tool run.
}
```

</Pitfall>

## Streaming has no Response

`Client.Stream` returns a `Stream`, not a `*Response`, because there is no
single response body to hold. If you want one anyway,
`skyl.CollectStream(stream, provider, model)` assembles one from the events.

<DeepDive title="Why CollectStream's Response has no Raw">

It is assembled from events rather than from one provider body, so there is no
untouched payload to expose. `Raw` is left nil.

That is worth knowing before you build a code path that streams for latency and
then reads `Raw` for a field skyl does not model — those two requirements are in
tension, and you will need to accumulate `StreamEvent.Raw` yourself instead.

</DeepDive>

<Recap>

- `Provider` and `Raw` are populated on every adapter, every call.
- `ID`, `Model`, `StopReason` and `Usage` are best-effort; zero means "not reported".
- `Text()` and `ToolCalls()` are nil-safe; `ToolCalls()` returns nil so `range` is safe.
- An empty `Text()` with `StopToolUse` is normal, not a failure.
- A `Response` from `CollectStream` has no `Raw`, because it was assembled from events.

</Recap>

<Challenges>

<Challenge title="Write a safe response summariser">

Write a function that logs one line about any response, without panicking on a
nil response and without misreporting a tool-call turn as empty.

<Hint>

The methods are nil-safe. The trap is interpreting an empty `Text()`.

</Hint>

<Solution>

```go verify
func describe(resp *skyl.Response) string {
	if resp == nil {
		return "no response"
	}
	calls := len(resp.ToolCalls())
	switch {
	case calls > 0:
		return fmt.Sprintf("%s/%s: %d tool call(s), %s, %d tokens",
			resp.Provider, resp.Model, calls, resp.StopReason, resp.Usage.TotalTokens())
	case resp.Text() == "":
		return fmt.Sprintf("%s/%s: empty (%s)", resp.Provider, resp.Model, resp.StopReason)
	default:
		return fmt.Sprintf("%s/%s: %d chars, %s, %d tokens",
			resp.Provider, resp.Model, len(resp.Text()), resp.StopReason, resp.Usage.TotalTokens())
	}
}
```

Including `StopReason` in the empty case is what turns an unhelpful "empty" into
a diagnosis — `refusal` and `max_tokens` mean very different things.

</Solution>

</Challenge>

</Challenges>
