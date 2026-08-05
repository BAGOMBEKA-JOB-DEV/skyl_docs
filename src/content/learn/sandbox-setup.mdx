---
title: Sandbox Setup
description: Wire every adapter at a local server so your development loop costs nothing.
---

<Intro>

A development loop that bills a real account per iteration changes how you work
— you test less, and you test the failure paths least of all. This page wires
the sandbox into a project so that running locally costs nothing and failure
modes are reproducible on demand.

</Intro>

<YouWillLearn>

- How to make the sandbox the default in development, safely
- How to run it from your tests, on a random port
- How to reproduce a 429, a truncated stream, and a mid-stream error deliberately
- Why the model catalogue is deliberately small

</YouWillLearn>

## A sandbox constructor

Add a third mode alongside production and local, so the switch is explicit:

```go title="internal/ai/sandbox.go" verify
// Sandbox points every client at the local wire-protocol server. It needs no
// credential and costs nothing per call.
func Sandbox() Clients {
	c := skyl.New(openai.New("sandbox-key",
		openai.WithBaseURL("http://127.0.0.1:8099/openai/v1")))
	return Clients{Fast: c, Smart: c}
}
```

<Pitfall>

Make the sandbox an *explicit* mode, never a silent fallback when a key is
missing. A service that quietly answers from a lookup table because
`OPENAI_API_KEY` was unset in production is far worse than one that refuses to
start.

</Pitfall>

## Running it from tests

For integration tests, start the sandbox as a subprocess on a port the OS picks,
so parallel test runs do not collide:

```go title="internal/ai/ai_test.go" verify
func startSandbox(t *testing.T) string {
	t.Helper()

	// :0 asks the OS for a free port, so parallel packages cannot collide.
	cmd := exec.Command("go", "run",
		"github.com/BAGOMBEKA-JOB-DEV/skyl/cmd/skyl-sandbox", "-addr", "127.0.0.1:0")
	stderr, err := cmd.StderrPipe()
	if err != nil {
		t.Fatal(err)
	}
	if err := cmd.Start(); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = cmd.Process.Kill() })

	// The banner reports the address it actually bound.
	sc := bufio.NewScanner(stderr)
	for sc.Scan() {
		if addr := parseAddr(sc.Text()); addr != "" {
			return addr
		}
	}
	t.Fatal("sandbox did not report a listen address")
	return ""
}
```

## Reproducing failures

This is what the sandbox is really for. Three model IDs turn a failure mode into
a one-line test.

<SandboxFaultTable />

A rate-limit test that runs in milliseconds:

```go verify
func TestRetriesRateLimits(t *testing.T) {
	client := skyl.New(providerAt(startSandbox(t)),
		skyl.WithMaxRetries(2),
		// Production defaults are 500ms/30s. In a test, that is 30 seconds of
		// nothing; shrink them so the retry path stays cheap to assert.
		skyl.WithRetryDelay(time.Millisecond, 5*time.Millisecond),
	)

	_, err := client.Complete(context.Background(), &skyl.Request{
		Model:     "sandbox-status-429",
		MaxTokens: 16,
		Messages:  []skyl.Message{skyl.UserText("hi")},
	})

	if !errors.Is(err, skyl.ErrRateLimit) {
		t.Fatalf("want ErrRateLimit, got %v", err)
	}
}
```

And a truncation test, which is the one nobody writes until it bites them:

```go verify
func TestDetectsTruncatedStream(t *testing.T) {
	stream, err := client.Stream(context.Background(), &skyl.Request{
		Model:     "sandbox-stream-truncate",
		MaxTokens: 64,
		Messages:  []skyl.Message{skyl.UserText("count to ten")},
	})
	if err != nil {
		t.Fatal(err)
	}
	defer stream.Close()

	for stream.Next() {
		_ = stream.Event()
	}

	// The whole point: a stream that stopped early must not look successful.
	if stream.Err() == nil {
		t.Fatal("truncated stream reported success")
	}
}
```

## The model catalogue

<SandboxMountTable />

Anything outside these lists gets that provider's own 404.

<DeepDive title="Why not accept every model string?">

Because skyl passes model IDs through unvalidated, the provider's not-found
error is the only thing standing between a typo and an unactionable failure. A
sandbox that accepted every string would never exercise that path — and the
first time anyone saw it would be against a real provider, with a real bill for
the round trip.

The same reasoning explains the `-api-key` flag. Each mount checks the header
its real counterpart uses, so an adapter that sets the wrong header fails here
rather than in production.

</DeepDive>

## What it does not give you

There is no model. Replies come from a lookup table, and token counts are word
counts — enough to prove that usage is parsed and carried, useless for reasoning
about cost or quality. And because the sandbox was written from the same
provider documentation as the adapters, it cannot prove a field name is right.

<Recap>

- Add `Sandbox()` as an explicit mode; never fall back to it when a key is missing.
- Start it on `127.0.0.1:0` in tests so parallel runs cannot collide.
- `sandbox-status-NNN`, `sandbox-stream-truncate` and `sandbox-stream-error` make failures reproducible.
- Shrink `WithRetryDelay` in tests — the production defaults make a retry test take 30 seconds.
- The catalogue is small so the not-found path stays reachable.
- It proves the stack, not the field names. Only `-tags=integration` does that.

</Recap>

<Challenges>

<Challenge title="Test the abandoned-stream accounting">

A stream the caller gives up on still generated — and still billed — tokens.
Show that a `stream_end` hook event fires even when you `Close()` early.

<Hint>

`HookEvent.Completed` distinguishes a stream that reached its terminal event
from one that was abandoned.

</Hint>

<Solution>

```go verify
var ended skyl.HookEvent
client := skyl.New(p, skyl.WithHook(func(_ context.Context, ev skyl.HookEvent) {
	if ev.Operation == skyl.OpStreamEnd {
		ended = ev
	}
}))

stream, _ := client.Stream(ctx, req)
stream.Next()          // read exactly one event…
_ = stream.Close()     // …then walk away

fmt.Println(ended.Operation, ended.Completed) // stream_end false
```

`Completed` is `false`, which is the signal that this was an abandonment rather
than a finished stream. The event fires anyway because those tokens were
generated and billed regardless — reporting nothing would make that spend
invisible.

</Solution>

</Challenge>

</Challenges>
