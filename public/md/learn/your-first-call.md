---
title: Your First Call
description: What Complete validates before it sends anything, and what comes back.
---

<Intro>

`Client.Complete` is the whole non-streaming API. This page walks through one
call in detail: what is required, what is checked locally, and what the response
carries.

</Intro>

<YouWillLearn>

- The three fields a request needs
- What `Validate` rejects before any network call happens
- What `Complete` does that a raw provider call would not
- How to read the answer, the cost, and why generation stopped

</YouWillLearn>

## The smallest working program

```go title="main.go" verify
package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/BAGOMBEKA-JOB-DEV/skyl"
	"github.com/BAGOMBEKA-JOB-DEV/skyl/provider/openai"
)

func main() {
	client := skyl.New(openai.New(os.Getenv("OPENAI_API_KEY")))

	resp, err := client.Complete(context.Background(), &skyl.Request{
		Model:     "gpt-5.6",
		MaxTokens: 1024,
		Messages:  []skyl.Message{skyl.UserText("Explain Go channels in two sentences.")},
	})
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(resp.Text())
	fmt.Printf("%d in / %d out\n", resp.Usage.InputTokens, resp.Usage.OutputTokens)
}
```

## What is required

Only two fields are structurally required: `Model` and at least one message.

```go verify
err := (&skyl.Request{Model: "", Messages: nil}).Validate()

fmt.Println(errors.Is(err, skyl.ErrBadRequest)) // true
fmt.Println(err)                                // skyl: invalid request: model is required
```

`MaxTokens` is not required by skyl — but it is required by Anthropic's API, so
the Anthropic adapter supplies **4096** when you leave it zero rather than
failing a request every other provider would accept. Set it explicitly if you
care about the cap.

## What is checked locally

`Complete` calls `Request.Validate()` before dispatching, so a malformed request
fails without costing a round trip. It rejects:

<DataTable
  headers={['Condition', 'Message']}
  rows={[
    ['nil request', 'nil request'],
    ['empty Model', 'model is required'],
    ['empty Messages', 'at least one message is required'],
    ['negative MaxTokens', 'max tokens must not be negative'],
    ['unknown Role', 'message N has invalid role "x"'],
    ['a message with no parts', 'message N has no parts'],
    ['an Image with neither Data nor URL', 'image needs data or a URL'],
    ['an Image with Data but no MediaType', 'image data needs a media type'],
    ['a ToolCall missing ID or Name', 'tool call needs an ID and a name'],
    ['a ToolResult missing CallID', 'tool result needs a call ID'],
    ['a Tool with no name', 'tool N has no name'],
    ['ToolChoiceSpecific with no Name', 'tool choice "tool" requires a name'],
  ]}
/>

Every one of these wraps `ErrBadRequest`, so `errors.Is(err, skyl.ErrBadRequest)`
catches all of them.

<Pitfall>

Notice what is **not** checked: the model string. skyl never validates a model
against a list, so a typo reaches the provider and comes back as `ErrNotFound`
after a round trip. That is the deliberate price of never blocking you from a
model that shipped after your skyl build. See [Model IDs](/learn/model-ids).

</Pitfall>

## What Complete adds

Calling the provider directly would work. `Complete` adds four things on top:

1. **Validation**, as above.
2. **Retry with jittered backoff** for rate limits, server errors and connection
   failures — and *only* those.
3. **A per-attempt timeout**, 10 minutes by default, because reasoning models
   legitimately take minutes on hard problems.
4. **Hook events**, one per attempt including retried ones.

<DeepDive title="Why the timeout is per attempt and not per call">

If the timeout bounded the whole retry sequence, then a request that failed
twice would have less time left for its third attempt than its first — so the
attempt most likely to be starved is the one you most want to succeed.

Bounding each attempt separately keeps them comparable. To bound the sequence as
a whole, use the context you pass in:

```go verify
ctx, cancel := context.WithTimeout(ctx, 2*time.Minute)
defer cancel()
resp, err := client.Complete(ctx, req)
```

That is the one number that means "give up entirely", and it belongs to you
rather than to the library.

</DeepDive>

## What comes back

```go verify
resp, err := client.Complete(ctx, req)
if err != nil {
	return err
}

fmt.Println(resp.Text())        // every Text part, concatenated
fmt.Println(resp.Provider)      // "openai"
fmt.Println(resp.Model)         // the model that ACTUALLY served it
fmt.Println(resp.StopReason)    // end_turn, max_tokens, tool_use, refusal…
fmt.Println(resp.Usage.TotalTokens())
```

Two of those are worth pausing on.

`resp.Model` is read from the **response**, not echoed from your request.
Providers can and do serve a different model than the one asked for — an alias
resolving to a dated snapshot, or a capacity fallback — and knowing which one
answered is what makes a cost report accurate.

`resp.Raw` is the provider's untouched body, and is **always** populated. Nothing
the provider sent is ever lost, only unmodelled.

<Recap>

- `Model` and at least one message are required; everything else has a sensible zero.
- `Validate` runs locally and rejects twelve shapes, all wrapping `ErrBadRequest`.
- The model string is deliberately **not** validated — a typo costs a round trip.
- `Complete` adds validation, retry, a per-attempt timeout, and hook events.
- Bound the whole sequence with your own context; `WithTimeout` bounds one attempt.
- `resp.Model` is the model that answered, which may differ from the one you asked for.

</Recap>

<Challenges>

<Challenge title="Fail fast on a bad request">

Write a helper that validates a request and returns a friendly error before any
network call, so a CLI can report the problem immediately.

<Hint>

`Validate` is exported and safe to call yourself.

</Hint>

<Solution>

```go verify
func check(req *skyl.Request) error {
	if err := req.Validate(); err != nil {
		return fmt.Errorf("your request is not well-formed: %w", err)
	}
	return nil
}
```

`Complete` calls `Validate` anyway, so this buys you nothing at runtime — but it
lets a CLI reject bad input at parse time rather than after constructing a
client, which is a better experience.

</Solution>

</Challenge>

<Challenge title="Detect a silent model substitution">

Log a warning when the provider serves a different model than the one requested.

<Hint>

Compare the request's model with `resp.Model`. Remember aliases legitimately
resolve to dated snapshots.

</Hint>

<Solution>

```go verify
if resp.Model != "" && resp.Model != req.Model {
	log.Printf("note: asked for %q, served by %q", req.Model, resp.Model)
}
```

Use `log`, not an error. Substitution is usually benign — `gpt-5.6` resolving to
`gpt-5.6-2026-07-09` — but when you are comparing cost or quality across a
fleet, knowing which snapshot answered is the difference between a real number
and a guess.

</Solution>

</Challenge>

</Challenges>
