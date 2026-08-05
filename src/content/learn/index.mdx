---
title: Quick Start
description: An introduction to 80% of the skyl you will use on a daily basis.
---

<Intro>

Welcome to the skyl documentation. This page gives you an introduction to most
of the skyl you will use day to day. skyl is a Go library that puts one
interface in front of every AI model — you write your integration once, and
change models by changing a string.

</Intro>

<YouWillLearn>

- How to make a completion request and read the answer
- How to switch providers by changing one line
- How to stream a response token by token
- How to let the model call your code
- How to handle failure without writing a retry loop
- How to run all of it with no API key at all

</YouWillLearn>

## Installing skyl

The core library has **zero external dependencies** and needs Go 1.22 or later.

<TerminalBlock>go get github.com/BAGOMBEKA-JOB-DEV/skyl</TerminalBlock>

That gets you the `openai`, `gemini`, and `openaicompat` adapters. Anthropic
lives in its own module, because it is built on the official Anthropic SDK and
that brings a dozen transitive dependencies nobody else should have to carry:

<TerminalBlock>go get github.com/BAGOMBEKA-JOB-DEV/skyl/provider/anthropic</TerminalBlock>

<Note>

The module split is not cosmetic. `go get` on the core library pulls in neither
chi nor any vendor SDK, so importing skyl imposes no dependency graph on your
security scanners or your upgrade schedule. See [Installation](/learn/installation).

</Note>

## Your first call

A skyl program has three parts: build a provider, wrap it in a client, send a
request.

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
		Messages: []skyl.Message{
			skyl.UserText("Explain Go channels in two sentences."),
		},
	})
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(resp.Text())
	fmt.Printf("%d in / %d out\n", resp.Usage.InputTokens, resp.Usage.OutputTokens)
}
```

`skyl.New` wraps a provider with everything a production caller needs —
validation, retry with jittered backoff, per-attempt timeouts, and hooks — so
that behaviour is written and tested once rather than once per vendor.

## Switching providers

The only line that changes is the constructor. Everything below the seam is
identical, which is the entire point of the library.

<ProviderTabs>

```go
client := skyl.New(anthropic.New(os.Getenv("ANTHROPIC_API_KEY")))
```

```go
client := skyl.New(openai.New(os.Getenv("OPENAI_API_KEY")))
```

```go
client := skyl.New(gemini.New(os.Getenv("GEMINI_API_KEY")))
```

```go
client := skyl.New(openaicompat.New(
	openaicompat.WithBaseURL("http://localhost:11434/v1"),
	openaicompat.WithName("ollama"),
))
```

</ProviderTabs>

Because `Provider` is an ordinary Go interface, choosing one at runtime is
ordinary Go:

```go verify
func pick(name string) (skyl.Provider, error) {
	switch name {
	case "anthropic":
		return anthropic.New(os.Getenv("ANTHROPIC_API_KEY")), nil
	case "openai":
		return openai.New(os.Getenv("OPENAI_API_KEY")), nil
	case "gemini":
		return gemini.New(os.Getenv("GEMINI_API_KEY")), nil
	default:
		return nil, fmt.Errorf("unknown provider %q", name)
	}
}
```

<LearnMore path="/learn/choosing-a-provider">

Read **[Choosing a Provider](/learn/choosing-a-provider)** to learn when a
native adapter earns its place and when `openaicompat` is the better answer.

</LearnMore>

## Model IDs are just strings

skyl ships no model-name constants and never validates a model against a list.

```go
Model: "claude-opus-5"   // works the day it launches
Model: "gpt-5.6"
Model: "gemini-3.6-flash"
```

This is the most consequential decision in the project. A curated enum
guarantees that sooner or later skyl rejects a model you are entitled to use,
because the model shipped last Tuesday and skyl has not cut a release.

<Pitfall>

The trade is real and you should know it: because nothing is validated locally,
a **typo reaches the provider**. It comes back as `ErrNotFound` after a round
trip rather than as a compile error. That is the price of never blocking you
from a model.

</Pitfall>

## Streaming

`Stream` is a pull iterator rather than a channel, so it composes with `defer`
and with an early `return` the way a Go programmer expects.

```go verify
stream, err := client.Stream(ctx, req)
if err != nil {
	log.Fatal(err)
}
defer stream.Close()

for stream.Next() {
	if ev := stream.Event(); ev.Type == skyl.EventTextDelta {
		fmt.Print(ev.Text)
	}
}

// Always check Err after the loop: Next returning false means either the
// stream finished or it failed, and only Err tells them apart.
if err := stream.Err(); err != nil {
	log.Fatal(err)
}
```

<DeepDive title="Why a pull iterator and not a channel?">

A channel looks more idiomatic here, but it makes two things awkward. You need
a *second* channel for errors, and closing cleanly on an early return is easy
to get wrong — which is exactly how you leak a goroutine per abandoned request.

With the iterator, `defer stream.Close()` is the whole story. The reader
goroutine is tied to the request context, so no stream can leak, and that is
enforced by a goroutine-leak test rather than by convention.

</DeepDive>

## Tool calling

Declare a tool, and the model may ask you to run it. Execute the call, append
the result, and call again.

```go
req := &skyl.Request{
	Model:    "claude-opus-5",
	Messages: []skyl.Message{skyl.UserText("What's the weather in Kampala?")},
	Tools: []skyl.Tool{{
		Name:        "get_weather",
		Description: "Get the current weather for a city.",
		Parameters: map[string]any{
			"type": "object",
			"properties": map[string]any{
				"city": map[string]any{"type": "string"},
			},
			"required": []string{"city"},
		},
	}},
}

resp, err := client.Complete(ctx, req)
if err != nil {
	log.Fatal(err)
}

for _, call := range resp.ToolCalls() {
	result := runTool(call.Name, call.Arguments)

	req.Messages = append(req.Messages,
		resp.Message,                                  // the assistant's turn
		skyl.ToolResultMessage(call.ID, result),       // your answer to it
	)
}

final, err := client.Complete(ctx, req) // loop until no tool calls remain
```

Appending `resp.Message` is not optional. Every provider rejects a tool result
that does not follow the call it answers, which is why `Response.Message` exists
in the shape a request takes.

<LearnMore path="/learn/tool-calling">

Read **[Tool Calling](/learn/tool-calling)** for schemas, `ToolChoice`, parallel
calls, and how to tell the model that a tool failed.

</LearnMore>

## Handling failure

Errors are classified, so you branch on the classification rather than on
message text — providers reword their messages, and string matching breaks
silently when they do.

```go verify
resp, err := client.Complete(ctx, req)
switch {
case err == nil:
	// ok
case errors.Is(err, skyl.ErrRateLimit):
	// The Client already retried with backoff; this means it kept failing.
case errors.Is(err, skyl.ErrAuth):
	log.Fatal("bad API key")
case errors.Is(err, skyl.ErrNotFound):
	log.Fatal("no such model for this provider")
}
```

For detail, unwrap to `*skyl.Error`:

```go verify
var e *skyl.Error
if errors.As(err, &e) {
	log.Printf("%s returned %d: %s", e.Provider, e.StatusCode, e.Message)
}
```

Rate limits, server errors, and connection failures are retried with
exponential backoff and full jitter, honouring `Retry-After`. Authentication
failures, malformed requests, missing models, and refusals are **never** retried
— doing so burns quota to receive the same answer.

## Running it without an API key

You do not need a credential to work through this documentation. skyl ships a
sandbox that speaks all four providers' wire protocols locally.

<TerminalBlock>go run ./cmd/skyl-sandbox</TerminalBlock>

<ConsoleBlock>{`skyl sandbox listening on http://127.0.0.1:8099
  api key       sandbox-key
  anthropic     http://127.0.0.1:8099/anthropic
  openai        http://127.0.0.1:8099/openai/v1
  gemini        http://127.0.0.1:8099/gemini/v1beta
  openaicompat  http://127.0.0.1:8099/compat/v1`}</ConsoleBlock>

Point any adapter at a mount and it behaves as it would against the real host:

```go verify
p := openai.New("sandbox-key",
	openai.WithBaseURL("http://127.0.0.1:8099/openai/v1"))

resp, err := skyl.New(p).Complete(ctx, &skyl.Request{
	Model:    "gpt-5.6",
	Messages: []skyl.Message{skyl.UserText("What is the capital of France?")},
})
// resp.Text() == "Paris"
```

<Note>

The sandbox is a development tool, not evidence of correctness. It was written
from the same provider documentation as the adapters, so if a field name is
wrong, both are wrong in the same way. See [Running Without an API
Key](/learn/without-an-api-key).

</Note>

## Two escape hatches

Every abstraction over a fast-moving API is wrong somewhere, so skyl is never
the last word.

**Send something skyl does not model:**

```go
req.ProviderOptions = map[string]any{"top_k": 40}
```

**Read something skyl does not model:**

```go
var full map[string]any
json.Unmarshal(resp.Raw, &full) // the untouched provider JSON
```

`Response.Raw` is *always* populated. You should never have to fork skyl to use
a provider feature.

<Recap>

- `skyl.New(provider)` wraps any provider with validation, retry, timeouts and hooks.
- Switching vendors is one constructor; everything below the seam is identical.
- Model IDs are opaque strings — new models work immediately, and typos surface as `ErrNotFound`.
- `Stream` is a pull iterator: `defer stream.Close()`, then always check `stream.Err()`.
- Tool calling is a loop — append `resp.Message`, then the tool result, then call again.
- Branch on error sentinels with `errors.Is`, never on message text.
- `ProviderOptions` and `Response.Raw` mean skyl is never the reason you cannot ship.
- The sandbox runs every example here with no credential and no cost.

</Recap>

## Next steps

Head to [Installation](/learn/installation) to set up a project properly, or
straight to [Thinking in skyl](/learn/thinking-in-skyl) if you would rather
understand the design before writing code. If you learn by building, the
[Streaming Chat CLI tutorial](/learn/tutorial-chat-cli) walks you through a real
program end to end.
