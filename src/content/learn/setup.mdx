---
title: Setup
description: Editor, credentials, and a development loop that costs nothing.
---

<Intro>

skyl needs no configuration file, no init call, and no code generation. The
setup worth doing is about your environment rather than the library: catching
mistakes in the editor, keeping credentials out of your repository, and being
able to iterate without spending money.

</Intro>

<YouWillLearn>

- The editor tooling that catches skyl mistakes before you run anything
- Where credentials should live, and where they must not
- A development loop that costs nothing per iteration
- How to structure a project that uses more than one provider

</YouWillLearn>

## A project from scratch

<TerminalBlock>{`mkdir myapp && cd myapp
go mod init example.com/myapp
go get github.com/BAGOMBEKA-JOB-DEV/skyl`}</TerminalBlock>

That is the whole setup. skyl has no `skyl.Init()`, no config struct to fill in,
and no global state — a `*Client` is an ordinary value you construct and pass
around.

## The three things worth configuring

Read the pages below in order; each is short.

<CardGrid>

<YouWillLearnCard title="Editor Setup" path="/learn/editor-setup">
gopls, staticcheck, and the two vet checks that catch the most common skyl mistakes.
</YouWillLearnCard>

<YouWillLearnCard title="Credentials and Environment" path="/learn/credentials">
skyl reads no environment variables of its own — which makes credential handling entirely yours.
</YouWillLearnCard>

<YouWillLearnCard title="Sandbox Setup" path="/learn/sandbox-setup">
Wire every adapter at a local server so your development loop costs nothing.
</YouWillLearnCard>

</CardGrid>

## Structuring a project

The shape that scales is a small package that owns provider construction, so
the rest of your code depends on `*skyl.Client` and never on a vendor package.

```go title="internal/ai/ai.go" verify
// Package ai owns every decision about which model serves which workload.
package ai

import (
	"fmt"
	"os"
	"time"

	"github.com/BAGOMBEKA-JOB-DEV/skyl"
	"github.com/BAGOMBEKA-JOB-DEV/skyl/provider/openai"
	"github.com/BAGOMBEKA-JOB-DEV/skyl/provider/openaicompat"
)

type Clients struct {
	// Fast serves classification and extraction: high volume, low stakes.
	Fast *skyl.Client
	// Smart serves reasoning: low volume, worth the money.
	Smart *skyl.Client
}

func New() (Clients, error) {
	key := os.Getenv("OPENAI_API_KEY")
	if key == "" {
		return Clients{}, fmt.Errorf("ai: OPENAI_API_KEY is not set")
	}

	opts := []skyl.Option{
		skyl.WithMaxRetries(4),
		skyl.WithTimeout(2 * time.Minute),
	}

	return Clients{
		Fast:  skyl.New(openai.New(key), opts...),
		Smart: skyl.New(openai.New(key), opts...),
	}, nil
}

// Local swaps every client onto a local runtime, for development.
func Local() Clients {
	p := openaicompat.New(
		openaicompat.WithBaseURL("http://localhost:11434/v1"),
		openaicompat.WithName("ollama"),
	)
	c := skyl.New(p)
	return Clients{Fast: c, Smart: c}
}
```

Two things this buys you. Your handlers take a `*skyl.Client` and cannot
accidentally couple to OpenAI. And `Local()` makes "develop against a local
model" a one-line change rather than a second code path that is always slightly
under-tested.

<Pitfall>

Do not construct a client per request. A `*skyl.Client` is **safe for concurrent
use** and holds no per-request state, and the `*http.Client` underneath it is
what gives you connection pooling. Building a new one each time throws that away
and opens a fresh TLS connection per call.

</Pitfall>

## Failing fast on missing configuration

Because skyl reads no environment itself, a missing key is not an error until
the first request — which might be minutes after startup, in front of a user.
Check at construction instead, as `New` above does.

<DeepDive title="Why skyl does not read the environment for you">

A library that reads `OPENAI_API_KEY` behind your back has made three decisions
on your behalf: that the credential lives in the environment, that it is
process-global, and that it is read at a time you did not choose.

That breaks the moment you fetch credentials from a secret manager, rotate them
without restarting, or run two accounts in one process. Taking the key as an
argument costs you one line and keeps all three decisions yours.

The gateway does read the environment — but the gateway is a *program*, and a
program is exactly the layer where that decision belongs.

</DeepDive>

## Testing your integration

`Provider` is an interface, so a fake is a struct with four methods and needs no
mocking framework:

```go title="internal/ai/fake_test.go" verify
type fakeProvider struct{ text string }

func (fakeProvider) Name() string { return "fake" }

func (p fakeProvider) Complete(context.Context, *skyl.Request) (*skyl.Response, error) {
	return &skyl.Response{
		Provider:   "fake",
		Model:      "fake-model",
		Message:    skyl.Message{Role: skyl.RoleAssistant, Parts: []skyl.Part{skyl.Text{Text: p.text}}},
		StopReason: skyl.StopEndTurn,
		Usage:      skyl.Usage{InputTokens: 8, OutputTokens: 3},
		Raw:        json.RawMessage(`{}`),
	}, nil
}

func (fakeProvider) Stream(context.Context, *skyl.Request) (skyl.Stream, error) {
	return nil, skyl.ErrUnsupported
}

func (fakeProvider) Models(context.Context) ([]skyl.ModelInfo, error) {
	return nil, skyl.ErrUnsupported
}
```

Wrap it in a real `skyl.New(...)` and your test exercises the actual validation
and retry code, not a mock of it. For anything that needs real HTTP — SSE
arriving in chunks, cancellation landing mid-backoff — use
[the sandbox](/learn/sandbox-setup) instead.

<Recap>

- There is no setup step: `go get` and construct a client.
- Own provider construction in one package so your code depends on `*skyl.Client`.
- Construct clients **once** — they are concurrency-safe and pool connections.
- Validate credentials at startup, because skyl will not notice until the first call.
- A fake `Provider` is four methods and needs no mocking library.

</Recap>

<Challenges>

<Challenge title="Make the local path impossible to forget">

Extend the `ai` package so the choice between real and local is driven by one
environment variable, and an unknown value is a startup error rather than a
silent default.

<Hint>

Return an error for anything you do not recognise. A `default:` branch that
silently picks production is how a developer ends up billing a real account
from their laptop.

</Hint>

<Solution>

```go
func FromEnv() (Clients, error) {
	switch mode := os.Getenv("AI_MODE"); mode {
	case "", "production":
		return New()
	case "local":
		return Local(), nil
	case "sandbox":
		return Sandbox(), nil
	default:
		return Clients{}, fmt.Errorf("ai: unknown AI_MODE %q", mode)
	}
}
```

Empty defaults to production because that is the safe failure for a deployed
service — but a *typo* like `AI_MODE=locl` is rejected loudly instead of
quietly billing you.

</Solution>

</Challenge>

</Challenges>
