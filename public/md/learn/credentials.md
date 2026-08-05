---
title: Credentials and Environment
description: skyl reads no environment variables of its own, which makes credential handling entirely yours.
---

<Intro>

skyl has no configuration layer. It never reads `OPENAI_API_KEY`, never looks
for a config file, and never caches a credential globally. You pass a key to a
provider constructor, and that is the entire contract.

</Intro>

<YouWillLearn>

- Why skyl takes credentials as arguments rather than reading the environment
- Where a key travels once you hand it over, and where it never appears
- How to rotate a credential without restarting
- What appears in an error, a log line, and a span

</YouWillLearn>

## The contract

```go verify
p := openai.New(os.Getenv("OPENAI_API_KEY"))
```

`os.Getenv` is *your* call, in *your* code. skyl received a string.

<DeepDive title="Why this matters more than it looks">

A library that reads the environment behind your back has decided three things
for you: that the credential lives in the environment, that it is
process-global, and that it is read at a moment you did not pick.

Each of those breaks a real deployment. Fetching from a secret manager breaks
the first. Running two accounts in one process breaks the second. Rotating
without a restart breaks the third.

Taking the key as an argument costs one line and keeps all three yours. The
gateway *does* read the environment — but the gateway is a program, and that is
the layer where the decision belongs.

</DeepDive>

## Where the key goes

Once you pass it in, the credential is stored on the provider value and used to
set exactly one request header:

<DataTable
  headers={['Adapter', 'Header']}
  rows={[
    ['anthropic', <code key="a">x-api-key</code>],
    ['openai', <code key="b">Authorization: Bearer …</code>],
    ['gemini', <code key="c">x-goog-api-key</code>],
    ['openaicompat', <code key="d">Authorization: Bearer … (omitted when no key is set)</code>],
  ]}
/>

It is not written to disk, not logged, and not placed in any error.

## Where it never appears

skyl's engineering rules make this an explicit commitment rather than an
accident:

- **`*skyl.Error` never contains credentials.** It carries the provider name,
  status code, message, retry-after hint, and up to 2 KB of the provider's error
  body — never a header.
- **The `otel` module records no prompt content and no credentials.** Only the
  shape of the request: model, sampling parameters, token counts.
- **The gateway logs method, path, status, duration and request ID only** —
  never headers, never bodies.

<Pitfall>

The one place you can leak a credential is a hook you write yourself.
`HookEvent.Request` carries the full prompt, and if you log it verbatim you ship
conversation content wherever your logs go.

```go
// DON'T: this puts every user's prompt in your log aggregator.
skyl.WithHook(func(_ context.Context, ev skyl.HookEvent) {
	log.Printf("request: %+v", ev.Request)
})
```

Log the shape, not the content:

```go verify
skyl.WithHook(func(_ context.Context, ev skyl.HookEvent) {
	log.Printf("%s %s attempt=%d dur=%s in=%d out=%d err=%v",
		ev.Provider, ev.Operation, ev.Attempt, ev.Duration,
		ev.Usage.InputTokens, ev.Usage.OutputTokens, ev.Err)
})
```

</Pitfall>

## Rotation

Because the key is captured at construction, rotating it means constructing a
new provider. That is cheap — it allocates a struct — but you should reuse the
underlying `*http.Client` so you do not throw away the connection pool.

```go verify
type Rotating struct {
	mu     sync.RWMutex
	client *skyl.Client
	hc     *http.Client // shared across rotations, so pooling survives
}

func (r *Rotating) Rotate(key string) {
	c := skyl.New(openai.New(key, openai.WithHTTPClient(r.hc)))
	r.mu.Lock()
	r.client = c
	r.mu.Unlock()
}

func (r *Rotating) Client() *skyl.Client {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.client
}
```

In-flight requests finish against the old credential; new ones use the new key.

## Validating at startup

skyl will not notice a missing key until the first request, which may be well
after startup and in front of a user. Check it yourself:

```go verify
key := os.Getenv("OPENAI_API_KEY")
if key == "" {
	return fmt.Errorf("OPENAI_API_KEY is not set")
}
```

A *wrong* key is a different matter — only the provider can tell you that, and
it arrives as `ErrAuth`, which skyl never retries because the same key will fail
again.

## Local runtimes need none

Ollama, LM Studio and llama.cpp authenticate nothing. Omit the option entirely
rather than passing an empty string:

```go verify
p := openaicompat.New(
	openaicompat.WithBaseURL("http://localhost:11434/v1"),
	openaicompat.WithName("ollama"),
	// no WithAPIKey — no Authorization header is sent at all
)
```

<Recap>

- skyl reads no environment variables; you pass the key to the constructor.
- The credential sets one header and is never logged, stored, or placed in an error.
- `*skyl.Error` and the `otel` module are documented never to carry credentials or prompts.
- **A hook you write is the one place you can leak a prompt** — log shape, not content.
- Rotate by constructing a new provider, sharing the `*http.Client` to keep pooling.
- Validate presence at startup; a wrong key surfaces as `ErrAuth`, which is never retried.

</Recap>

<Challenges>

<Challenge title="Audit a hook for leaks">

Which of these two hooks is safe to ship to a third-party logging service?

```go
// A
skyl.WithHook(func(_ context.Context, ev skyl.HookEvent) {
	metrics.Observe(ev.Provider, ev.Model, ev.Duration, ev.Usage.TotalTokens())
})

// B
skyl.WithHook(func(_ context.Context, ev skyl.HookEvent) {
	if ev.Err != nil {
		log.Printf("failed: %v (request %+v)", ev.Err, ev.Request)
	}
})
```

<Hint>

One of them only touches metadata. Look at what `HookEvent.Request` contains.

</Hint>

<Solution>

**A is safe.** Provider name, model, duration and token counts are metadata —
no conversation content.

**B leaks.** `ev.Request` carries `Messages`, which is the user's prompt.
Worse, it only fires on failure, so it will look fine in testing and start
shipping prompts the first time a provider has a bad day.

The fix keeps the diagnostic value without the content:

```go verify
skyl.WithHook(func(_ context.Context, ev skyl.HookEvent) {
	if ev.Err != nil {
		log.Printf("failed: provider=%s model=%s attempt=%d msgs=%d err=%v",
			ev.Provider, ev.Model, ev.Attempt, len(ev.Request.Messages), ev.Err)
	}
})
```

Message *count* is often enough to debug, and carries nothing private.

</Solution>

</Challenge>

</Challenges>
