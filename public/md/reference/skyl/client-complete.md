---
title: Client.Complete
description: Runs a request to completion, retrying retryable failures.
---

<Intro>

`Complete` is the non-streaming API. It validates locally, dispatches to the
provider, retries the failures worth retrying, and returns one
[`Response`](/reference/skyl/response).

</Intro>

## Reference

<Signature>func (c *Client) Complete(ctx context.Context, req *Request) (*Response, error)</Signature>

<Parameters>

- **`ctx`** — bounds the **whole call**, including every retry and every backoff
  delay between them. Cancelling it stops retrying immediately, even mid-backoff.
- **`req`** — the request. Validated before anything is sent.

</Parameters>

<Returns>

A `*Response` and a nil error on success. On failure, a nil response and an
error wrapping one of the
[sentinels](/reference/skyl/errors/sentinels) — recoverable as
[`*skyl.Error`](/reference/skyl/errors/error) with `errors.As`.

When retries are exhausted, the error is wrapped:
`skyl: giving up after 4 attempts: …`. The sentinel survives the wrapping.

</Returns>

<Caveats>

- **`req.Validate()` runs first**, so a malformed request fails locally with
  [`ErrBadRequest`](/reference/skyl/errors/sentinels) and costs no round trip.
- The model string is **not** validated. A typo reaches the provider and returns
  `ErrNotFound`.
- [`WithTimeout`](/reference/skyl/with-timeout) bounds **one attempt**, not the
  sequence. Bound the sequence with `ctx`.
- A hook fires **once per attempt**, including retried ones.
- `req` is **reused across retries** — do not mutate it from another goroutine.

</Caveats>

## Usage

<Recipe title="A basic call">

```go verify
resp, err := client.Complete(ctx, &skyl.Request{
	Model:     "gpt-5.6",
	MaxTokens: 1024,
	Messages:  []skyl.Message{skyl.UserText("Explain Go channels in two sentences.")},
})
if err != nil {
	return err
}
fmt.Println(resp.Text())
```

</Recipe>

<Recipe title="Bounding the whole call">

```go verify
// WithTimeout bounds an attempt; this bounds everything.
ctx, cancel := context.WithTimeout(ctx, 2*time.Minute)
defer cancel()

resp, err := client.Complete(ctx, req)
```

</Recipe>

<Recipe title="Branching on failure">

```go verify
resp, err := client.Complete(ctx, req)
switch {
case err == nil:
case errors.Is(err, skyl.ErrRateLimit):
	// Already retried with backoff; it kept failing. Shed load.
case errors.Is(err, skyl.ErrRefusal):
	// Never retried — the same prompt gets the same answer.
case errors.Is(err, context.DeadlineExceeded):
	// Works because *Error wraps its cause as well as its sentinel.
default:
	return err
}
```

</Recipe>

<Recipe title="A tool loop">

```go verify
for round := 0; round < 5; round++ {
	resp, err := client.Complete(ctx, req)
	if err != nil {
		return nil, err
	}
	calls := resp.ToolCalls()
	if len(calls) == 0 {
		return resp, nil
	}
	// The assistant turn must precede any result, on every provider.
	req.Messages = append(req.Messages, resp.Message)
	for _, call := range calls {
		req.Messages = append(req.Messages, skyl.ToolResultMessage(call.ID, run(call)))
	}
}
return nil, errors.New("gave up after 5 tool rounds")
```

</Recipe>

## Troubleshooting

<Trouble problem="I get ErrBadRequest without any network call">

That is [`Request.Validate`](/reference/skyl/request-validate) doing its job.
The message names the problem — a missing model, an empty message list, a tool
with no name. Fix the request; retrying will not help.

</Trouble>

<Trouble problem="resp.Text() is empty but there was no error">

Check `resp.StopReason`. `StopToolUse` means the model wants a tool run and
produced no prose — normal, not a failure. `StopRefusal` means it declined but
said nothing.

```go verify
if resp.Text() == "" && resp.StopReason == skyl.StopToolUse {
	// Expected: run the calls in resp.ToolCalls().
}
```

</Trouble>

<Trouble problem="The answer is cut off mid-sentence">

`resp.StopReason == skyl.StopMaxTokens` means you hit the cap and the response
is **truncated**. Raise `MaxTokens`; retrying unchanged produces the same
result.

</Trouble>

<Trouble problem="It retried something that could never succeed">

It should not have. Only rate limits, server errors and transport failures are
retried. If you saw retries on an auth failure or a malformed request, check
whether the adapter classified it correctly — an unclassified error with
`StatusCode == 0` is treated as retryable, and a provider returning a transport
error for a permanent failure would land there.

</Trouble>
