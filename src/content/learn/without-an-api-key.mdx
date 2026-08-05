---
title: Running Without an API Key
description: The sandbox speaks all four providers' wire protocols locally, for free.
---

<Intro>

You can work through every page of this documentation without a credential.
skyl ships `skyl-sandbox`, a local server that speaks Anthropic's Messages API,
OpenAI's chat-completions API, Gemini's `generateContent`, and the
OpenAI-compatible shape — all at once, with no network and no cost.

</Intro>

<YouWillLearn>

- How to start the sandbox and point an adapter at it
- Which models each mount serves, and why the list is short on purpose
- How to force a 429, a truncated stream, or a mid-stream error on demand
- What the sandbox proves — and the much more important thing it does not

</YouWillLearn>

## Starting it

<TerminalBlock>go run ./cmd/skyl-sandbox</TerminalBlock>

<ConsoleBlock>{`skyl sandbox listening on http://127.0.0.1:8099
  api key       sandbox-key
  anthropic     http://127.0.0.1:8099/anthropic
  openai        http://127.0.0.1:8099/openai/v1
  gemini        http://127.0.0.1:8099/gemini/v1beta
  openaicompat  http://127.0.0.1:8099/compat/v1`}</ConsoleBlock>

It binds to loopback by default. That is a deliberate choice, not a default
nobody thought about — the sandbox authenticates nothing meaningfully, so it
must not be reachable from a network you do not control.

## Pointing an adapter at it

Every adapter takes a `WithBaseURL` option. Set it to the matching mount and
the adapter behaves exactly as it would against the real host.

<ProviderTabs>

```go verify
p := anthropic.New("sandbox-key",
	anthropic.WithBaseURL("http://127.0.0.1:8099/anthropic"))

resp, err := skyl.New(p).Complete(ctx, &skyl.Request{
	Model:     "claude-opus-5",
	MaxTokens: 64,
	Messages:  []skyl.Message{skyl.UserText("What is the capital of France?")},
})
```

```go verify
p := openai.New("sandbox-key",
	openai.WithBaseURL("http://127.0.0.1:8099/openai/v1"))

resp, err := skyl.New(p).Complete(ctx, &skyl.Request{
	Model:     "gpt-5.6",
	MaxTokens: 64,
	Messages:  []skyl.Message{skyl.UserText("What is the capital of France?")},
})
```

```go verify
p := gemini.New("sandbox-key",
	gemini.WithBaseURL("http://127.0.0.1:8099/gemini/v1beta"))

resp, err := skyl.New(p).Complete(ctx, &skyl.Request{
	Model:     "gemini-3.6-flash",
	MaxTokens: 64,
	Messages:  []skyl.Message{skyl.UserText("What is the capital of France?")},
})
```

```go verify
// The compat mount also accepts no credential at all, because that is how
// Ollama, LM Studio and llama.cpp behave.
p := openaicompat.New(
	openaicompat.WithBaseURL("http://127.0.0.1:8099/compat/v1"),
	openaicompat.WithName("sandbox"),
)

resp, err := skyl.New(p).Complete(ctx, &skyl.Request{
	Model:     "gpt-5.6",
	MaxTokens: 64,
	Messages:  []skyl.Message{skyl.UserText("What is the capital of France?")},
})
```

</ProviderTabs>

Each mount checks the header its real counterpart uses — `x-api-key` for
Anthropic, `Authorization: Bearer` for OpenAI, `x-goog-api-key` for Gemini — so
the adapters' credential handling is genuinely exercised rather than bypassed.

## The mounts

<SandboxMountTable />

The model catalogue is short, and anything outside it gets that provider's own
404. That is deliberate: skyl passes model IDs through unvalidated, so the
provider's not-found error is the only thing standing between a typo and an
unactionable failure. A sandbox that accepted every string would never exercise
that path.

## Forcing failures

This is the part you cannot get from a real provider on demand. Three special
model IDs make the sandbox fail in specific ways.

<SandboxFaultTable />

So you can test your rate-limit handling in a unit test:

```go verify
_, err := client.Complete(ctx, &skyl.Request{
	Model:     "sandbox-status-429",
	MaxTokens: 64,
	Messages:  []skyl.Message{skyl.UserText("hi")},
})

if !errors.Is(err, skyl.ErrRateLimit) {
	t.Fatalf("expected a rate limit, got %v", err)
}
```

The `429` response also carries a `Retry-After` header, so skyl's preference for
the provider's own hint over its computed backoff is covered too.

<DeepDive title="Why sandbox-status-NNN cannot model a mid-stream failure">

Once an SSE response has written its header, the HTTP status is fixed. A stream
that dies halfway through is *not* a 500 — it is a 200 that stops producing
frames, or one that emits an error frame in the body.

That is a structurally different failure, and before
`sandbox-stream-truncate` and `sandbox-stream-error` existed, every adapter's
mid-stream error handling was unreachable by any test. A connection dropped
mid-generation reaches EOF with no reader error, so all three adapters used to
emit a clean terminal event over a partial answer — a truncated response that
looked complete.

</DeepDive>

## What the sandbox does not prove

<Pitfall>

**The sandbox is not evidence that skyl talks to real providers correctly.**

It was written from the same provider documentation as the adapters. If skyl
has a field name wrong, the sandbox almost certainly has it wrong in exactly the
same way, and both agree while both are wrong. No amount of sandbox testing
removes this.

</Pitfall>

There is also no model here. Replies come from a lookup table and token counts
are word counts — enough to prove that usage is parsed and carried, useless for
reasoning about cost or quality.

Only the live suite settles the question, and it needs your own key:

<TerminalBlock>{`export ANTHROPIC_API_KEY=... OPENAI_API_KEY=... GEMINI_API_KEY=...
go test -tags=integration -v -run TestLive ./provider/`}</TerminalBlock>

Absent keys skip cleanly rather than failing, so you can run it with whichever
you have. See
[Validating against real providers](/reference/sandbox/validating).

## The three suites

<TestSuiteTable />

The first two are the ladder CI climbs. The third is the one only you can run,
and it is the one that decides whether skyl is ready to depend on.

<Recap>

- `go run ./cmd/skyl-sandbox` serves all four wire protocols on `127.0.0.1:8099`.
- Point any adapter at a mount with `WithBaseURL`; the default key is `sandbox-key`.
- Each mount checks the auth header its real counterpart uses, so credential handling is exercised.
- `sandbox-status-NNN`, `sandbox-stream-truncate` and `sandbox-stream-error` force failures on demand.
- The model catalogue is deliberately small so the not-found path stays reachable.
- It proves the stack works over real sockets. It **cannot** prove the field names are right.

</Recap>

<Challenges>

<Challenge title="Prove that retries actually happen">

Use the sandbox to show that `Client` retries a 429 rather than failing
immediately — and count the attempts.

<Hint>

A hook fires once per attempt, including retried ones. `HookEvent.Attempt` is
zero-based.

</Hint>

<Solution>

```go verify
var attempts int
client := skyl.New(p,
	skyl.WithMaxRetries(3),
	skyl.WithRetryDelay(time.Millisecond, 10*time.Millisecond),
	skyl.WithHook(func(_ context.Context, ev skyl.HookEvent) {
		attempts++
	}),
)

_, err := client.Complete(ctx, &skyl.Request{
	Model:     "sandbox-status-429",
	MaxTokens: 16,
	Messages:  []skyl.Message{skyl.UserText("hi")},
})

fmt.Println(attempts, errors.Is(err, skyl.ErrRateLimit)) // 4 true
```

Four attempts: the original plus three retries. Shortening the delays keeps the
test fast — the defaults are 500ms and 30s, which are right for production and
wrong for a test.

</Solution>

</Challenge>

<Challenge title="Catch a truncated stream">

Show that a stream cut short is reported as an error rather than as a short but
complete answer.

<Hint>

`Next()` returning `false` means the stream either finished or failed. Only
`Err()` distinguishes them — which is exactly the bug this fault model exists to
catch.

</Hint>

<Solution>

```go verify
stream, err := client.Stream(ctx, &skyl.Request{
	Model:     "sandbox-stream-truncate",
	MaxTokens: 64,
	Messages:  []skyl.Message{skyl.UserText("count to ten")},
})
if err != nil {
	log.Fatal(err)
}
defer stream.Close()

var got string
for stream.Next() {
	if ev := stream.Event(); ev.Type == skyl.EventTextDelta {
		got += ev.Text
	}
}

// The text read so far is still delivered — but Err is non-nil, so you know
// not to treat it as the whole answer.
fmt.Println(got)
fmt.Println(stream.Err()) // stream ended without a terminal event; the response is truncated
```

If you skip the `stream.Err()` check, this failure is invisible. That is why
every streaming example on this site ends with it.

</Solution>

</Challenge>

</Challenges>
