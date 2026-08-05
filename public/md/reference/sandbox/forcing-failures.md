---
title: Forcing failures
description: Three model IDs that make the sandbox fail on demand.
---

<Intro>

This is what you cannot get from a real provider. Three special model IDs turn
failure modes into one-line tests — including two that a status code
structurally cannot express.

</Intro>

## The fault models

<SandboxFaultTable />

<Caveats>

- `sandbox-status-<code>` accepts any status in **100–599**. Anything outside
  that range, or a non-numeric suffix, is treated as an ordinary model name and
  gets the usual not-found response.
- The `429` response also carries a **real `Retry-After` header**, so backoff's
  preference for the provider's own hint is covered.
- Errors are returned in **that provider's own error shape**, so classification
  is exercised rather than bypassed.

</Caveats>

## Why two stream faults exist

<DeepDive title="A status code cannot model a stream that dies halfway">

Once an SSE response has written its header, the HTTP status is **fixed**. A
stream that dies mid-generation is not a 500 — it is a 200 that stops producing
frames, or one that emits an error frame in the body.

That is a structurally different failure, and before `sandbox-stream-truncate`
and `sandbox-stream-error` existed, every adapter's mid-stream handling was
unreachable by any test.

The bug that hid there was real: a connection dropped mid-generation reaches EOF
with **no reader error**, so all three adapters emitted a clean terminal event
over a partial answer — a truncated response that looked complete.

</DeepDive>

## Usage

<Recipe title="Testing the retry path">

```go verify
client := skyl.New(p,
	skyl.WithMaxRetries(3),
	// Production defaults would make this test take 30 seconds.
	skyl.WithRetryDelay(time.Millisecond, 10*time.Millisecond),
	skyl.WithRetryAfterCap(50*time.Millisecond), // the 429 sends a real Retry-After
)

_, err := client.Complete(ctx, &skyl.Request{
	Model:     "sandbox-status-429",
	MaxTokens: 16,
	Messages:  []skyl.Message{skyl.UserText("hi")},
})

if !errors.Is(err, skyl.ErrRateLimit) {
	t.Fatalf("want ErrRateLimit, got %v", err)
}
```

</Recipe>

<Recipe title="Testing every classification">

```go verify
for status, want := range map[int]error{
	401: skyl.ErrAuth,
	404: skyl.ErrNotFound,
	429: skyl.ErrRateLimit,
	400: skyl.ErrBadRequest,
	503: skyl.ErrServer,
} {
	_, err := client.Complete(ctx, &skyl.Request{
		Model:     fmt.Sprintf("sandbox-status-%d", status),
		MaxTokens: 16,
		Messages:  []skyl.Message{skyl.UserText("hi")},
	})
	if !errors.Is(err, want) {
		t.Errorf("status %d: want %v, got %v", status, want, err)
	}
}
```

</Recipe>

<Recipe title="Catching a truncated stream">

```go verify
stream, err := client.Stream(ctx, &skyl.Request{
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
```

</Recipe>

<Recipe title="A mid-stream error frame">

```go verify
stream, err := client.Stream(ctx, &skyl.Request{
	Model:     "sandbox-stream-error",
	MaxTokens: 64,
	Messages:  []skyl.Message{skyl.UserText("hi")},
})
// The handshake succeeds — err is nil here. The failure arrives in the body,
// which is precisely what sandbox-status-NNN cannot model.
```

</Recipe>

## Troubleshooting

<Trouble problem="sandbox-status-99 returned a 404">

Only 100–599 are treated as status codes. Anything else is an ordinary model
name, and gets the not-found response.

</Trouble>

<Trouble problem="My retry test takes 30 seconds">

Shrink `WithRetryDelay` **and** `WithRetryAfterCap`. The 429 carries a real
`Retry-After`, and the default cap is five minutes.

</Trouble>

<Trouble problem="sandbox-stream-error returned no error from Stream()">

Correct. The handshake succeeded; the failure arrives as a frame. Check
`stream.Err()` after the loop.

</Trouble>
