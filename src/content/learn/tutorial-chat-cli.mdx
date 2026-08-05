---
title: "Tutorial: A Streaming Chat CLI"
description: Build a real terminal chat client end to end, with no API key.
---

<Intro>

This tutorial builds a working chat program: multi-turn conversation, streamed
output, a tool the model can call, graceful cancellation, and token accounting.
It runs entirely against the local sandbox, so it costs nothing — and switching
it to a real provider at the end is one line.

</Intro>

<YouWillLearn>

- How to keep conversation state across turns
- How to stream tokens to a terminal as they arrive
- How to run a tool loop until the model is done
- How to cancel cleanly on Ctrl-C without leaking a stream
- How to report what the conversation cost

</YouWillLearn>

## Setup

<TerminalBlock>{`mkdir skylchat && cd skylchat
go mod init example.com/skylchat
go get github.com/BAGOMBEKA-JOB-DEV/skyl`}</TerminalBlock>

In a second terminal, start the sandbox and leave it running:

<TerminalBlock>go run github.com/BAGOMBEKA-JOB-DEV/skyl/cmd/skyl-sandbox</TerminalBlock>

## Step 1: one turn

Start with the smallest thing that works.

```go title="main.go" verify
package main

import (
	"bufio"
	"context"
	"fmt"
	"log"
	"os"

	"github.com/BAGOMBEKA-JOB-DEV/skyl"
	"github.com/BAGOMBEKA-JOB-DEV/skyl/provider/openai"
)

func main() {
	client := skyl.New(openai.New("sandbox-key",
		openai.WithBaseURL("http://127.0.0.1:8099/openai/v1")))

	in := bufio.NewScanner(os.Stdin)
	fmt.Print("you> ")
	if !in.Scan() {
		return
	}

	resp, err := client.Complete(context.Background(), &skyl.Request{
		Model:     "gpt-5.6",
		MaxTokens: 512,
		Messages:  []skyl.Message{skyl.UserText(in.Text())},
	})
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("bot>", resp.Text())
}
```

<TerminalBlock>go run .</TerminalBlock>

## Step 2: remember the conversation

A conversation is just a growing `[]skyl.Message`. Append the user's turn, then
append the assistant's — `Response.Message` is already in the right shape.

```go title="main.go" verify
func main() {
	client := skyl.New(openai.New("sandbox-key",
		openai.WithBaseURL("http://127.0.0.1:8099/openai/v1")))

	req := &skyl.Request{
		Model:     "gpt-5.6",
		MaxTokens: 512,
		System:    "You are a concise assistant. Answer in at most three sentences.",
	}

	in := bufio.NewScanner(os.Stdin)
	for {
		fmt.Print("\nyou> ")
		if !in.Scan() || in.Text() == "" {
			return
		}

		req.Messages = append(req.Messages, skyl.UserText(in.Text()))

		resp, err := client.Complete(context.Background(), req)
		if err != nil {
			log.Fatal(err)
		}

		fmt.Println("bot>", resp.Text())

		// Append the assistant's turn so the next request has full context.
		req.Messages = append(req.Messages, resp.Message)
	}
}
```

<Pitfall>

Forgetting to append `resp.Message` is the classic bug here. The program still
runs — but the model has no memory, and every turn looks like the first. It is
worth writing a test for.

</Pitfall>

## Step 3: stream it

Waiting for a whole paragraph before seeing anything feels broken. Swap
`Complete` for `Stream` and print deltas as they arrive.

```go title="chat.go" verify
func turn(ctx context.Context, client *skyl.Client, req *skyl.Request) error {
	stream, err := client.Stream(ctx, req)
	if err != nil {
		return err
	}
	defer stream.Close()

	fmt.Print("bot> ")
	var reply strings.Builder

	for stream.Next() {
		ev := stream.Event()
		if ev.Type == skyl.EventTextDelta {
			fmt.Print(ev.Text)
			reply.WriteString(ev.Text)
		}
	}
	fmt.Println()

	// Next() returning false means the stream finished OR failed. Only Err
	// distinguishes them — without this check a truncated answer looks whole.
	if err := stream.Err(); err != nil {
		return err
	}

	req.Messages = append(req.Messages, skyl.AssistantText(reply.String()))
	return nil
}
```

Note that we accumulate the text ourselves so we can append the assistant turn.
`Response.Message` does not exist on a stream — there is no single response
body, only events.

<DeepDive title="Why not use CollectStream here?">

`skyl.CollectStream(stream, provider, model)` drains a stream into one
`*Response`, which would let you reuse the non-streaming code path. It is the
right tool when you want streaming's early first byte without handling events —
a progress spinner, or a timeout guard on a long generation.

It is the wrong tool here, because the entire point of this step is printing
each delta as it arrives. `CollectStream` returns only when the stream is
finished.

</DeepDive>

## Step 4: let the model call a tool

Declare a tool, run it when asked, and loop until the model stops asking.

```go title="tools.go"
var weatherTool = skyl.Tool{
	Name: "get_weather",
	// Be prescriptive about WHEN to call it, not only what it does — trigger
	// conditions measurably improve tool selection.
	Description: "Get the current weather for a city. Call this whenever the user asks about weather, temperature, or conditions in a named place.",
	Parameters: map[string]any{
		"type": "object",
		"properties": map[string]any{
			"city": map[string]any{
				"type":        "string",
				"description": "The city name, e.g. \"Kampala\".",
			},
		},
		"required": []string{"city"},
	},
}

func runTool(call skyl.ToolCall) string {
	var args struct {
		City string `json:"city"`
	}
	if err := json.Unmarshal(call.Arguments, &args); err != nil {
		return "ERROR: could not parse arguments: " + err.Error()
	}
	// A real implementation would call a weather API here.
	return fmt.Sprintf("22C and sunny in %s", args.City)
}
```

The loop. It is bounded, because a model that keeps asking for tools forever
must not spin your program forever:

```go title="chat.go"
const maxToolRounds = 5

func complete(ctx context.Context, client *skyl.Client, req *skyl.Request) (*skyl.Response, error) {
	for round := 0; round < maxToolRounds; round++ {
		resp, err := client.Complete(ctx, req)
		if err != nil {
			return nil, err
		}

		calls := resp.ToolCalls()
		if len(calls) == 0 {
			return resp, nil
		}

		// The assistant's turn must be appended before any result, because
		// every provider rejects a tool result that does not follow its call.
		req.Messages = append(req.Messages, resp.Message)
		for _, call := range calls {
			req.Messages = append(req.Messages,
				skyl.ToolResultMessage(call.ID, runTool(call)))
		}
	}
	return nil, fmt.Errorf("gave up after %d tool rounds", maxToolRounds)
}
```

## Step 5: cancel cleanly

Ctrl-C should stop generation immediately and not leave a request running that
you are still paying for.

```go title="main.go" verify
ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
defer stop()
```

Pass that `ctx` to every call. A stream is bound to the context it was opened
with, so cancelling it terminates the reader — and `defer stream.Close()` makes
the release prompt rather than eventual.

```go
if err := turn(ctx, client, req); err != nil {
	if errors.Is(err, context.Canceled) {
		fmt.Println("\ncancelled")
		return
	}
	log.Fatal(err)
}
```

`errors.Is(err, context.Canceled)` works through `*skyl.Error` because it
wraps its underlying cause as well as its sentinel.

## Step 6: report the cost

Accumulate usage with `Usage.Add`, and print it on exit.

```go title="chat.go"
var total skyl.Usage

// Inside the stream loop:
if ev.Type == skyl.EventDone && ev.Usage != nil {
	total = total.Add(*ev.Usage)
}

// On exit:
fmt.Printf("\n%d in / %d out / %d total tokens",
	total.InputTokens, total.OutputTokens, total.TotalTokens())
if total.CacheReadTokens > 0 {
	fmt.Printf(" (%d served from cache)", total.CacheReadTokens)
}
```

<Note>

`InputTokens` is the total input **including** anything served from cache;
`CacheReadTokens` is a breakdown of it, not an addition. So `TotalTokens()` is
simply input plus output, and `CacheReadTokens` tells you how much of your bill
was discounted. See [Token Usage and Caching](/learn/token-usage).

</Note>

## Step 7: point it at a real provider

One line:

```go verify
// Was: openai.New("sandbox-key", openai.WithBaseURL("http://127.0.0.1:8099/openai/v1"))
client := skyl.New(openai.New(os.Getenv("OPENAI_API_KEY")))
```

Or a different vendor entirely, changing the model string to match:

<ProviderTabs>

```go verify
client := skyl.New(anthropic.New(os.Getenv("ANTHROPIC_API_KEY")))
// req.Model = "claude-opus-5"
```

```go verify
client := skyl.New(openai.New(os.Getenv("OPENAI_API_KEY")))
// req.Model = "gpt-5.6"
```

```go verify
client := skyl.New(gemini.New(os.Getenv("GEMINI_API_KEY")))
// req.Model = "gemini-3.6-flash"
```

```go verify
client := skyl.New(openaicompat.New(
	openaicompat.WithBaseURL("http://localhost:11434/v1"),
	openaicompat.WithName("ollama"),
))
// req.Model = "llama3.3"
```

</ProviderTabs>

Nothing else in the program changes. The conversation handling, the streaming
loop, the tool loop, the cancellation and the accounting are all provider-
agnostic — which is the whole reason skyl exists.

<Recap>

- A conversation is a growing `[]skyl.Message`; append **both** turns each round.
- Streaming means accumulating the reply yourself, since there is no single response body.
- Always `defer stream.Close()` and always check `stream.Err()` after the loop.
- A tool loop must be **bounded** — append `resp.Message` before any tool result.
- `signal.NotifyContext` plus a context-bound stream gives you clean Ctrl-C.
- `Usage.Add` accumulates across turns; cache figures break `InputTokens` down rather than adding to it.
- Switching to a real provider is one constructor and a model string.

</Recap>

<Challenges>

<Challenge title="Handle a refusal without crashing">

Right now a refusal is treated as any other error and calls `log.Fatal`. Make
the program print a message and continue the conversation instead.

<Hint>

`ErrRefusal` is never retried, because the same prompt gets the same answer. But
it is not fatal to your program.

</Hint>

<Solution>

```go
if err := turn(ctx, client, req); err != nil {
	switch {
	case errors.Is(err, context.Canceled):
		fmt.Println("\ncancelled")
		return
	case errors.Is(err, skyl.ErrRefusal):
		fmt.Println("bot> (declined to answer that)")
		// Drop the user turn that caused it, so the next request is not
		// permanently poisoned by a message the model will keep refusing.
		req.Messages = req.Messages[:len(req.Messages)-1]
		continue
	default:
		log.Fatal(err)
	}
}
```

Trimming the offending turn matters: leaving it in means every subsequent
request replays it, and the model refuses again.

</Solution>

</Challenge>

<Challenge title="Show tool calls as they stream">

In streaming mode the tool loop above does not run, because `turn` only handles
text deltas. Extend it to collect `EventToolCall` events.

<Hint>

skyl buffers partial tool arguments and emits `EventToolCall` **once**, when the
call's JSON is whole. You never have to reassemble fragments yourself.

</Hint>

<Solution>

```go verify
var calls []skyl.ToolCall

for stream.Next() {
	ev := stream.Event()
	switch ev.Type {
	case skyl.EventTextDelta:
		fmt.Print(ev.Text)
		reply.WriteString(ev.Text)
	case skyl.EventToolCall:
		if ev.ToolCall != nil {
			fmt.Printf("\n  [calling %s]\n", ev.ToolCall.Name)
			calls = append(calls, *ev.ToolCall)
		}
	}
}
if err := stream.Err(); err != nil {
	return err
}
```

Then rebuild the assistant turn from both the text and the calls before
appending the tool results:

```go verify
parts := []skyl.Part{}
if reply.Len() > 0 {
	parts = append(parts, skyl.Text{Text: reply.String()})
}
for _, c := range calls {
	parts = append(parts, c)
}
req.Messages = append(req.Messages, skyl.Message{Role: skyl.RoleAssistant, Parts: parts})
```

This is exactly what `skyl.CollectStream` does internally, so if you do not need
the deltas, use that instead.

</Solution>

</Challenge>

</Challenges>
