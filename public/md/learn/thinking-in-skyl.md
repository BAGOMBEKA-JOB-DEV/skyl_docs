---
title: Thinking in skyl
description: The mental model — a seam, a wrapper, and two escape hatches.
---

<Intro>

skyl is a small library, and almost all of it follows from three ideas. If you
hold these, the API stops needing to be memorised: you can usually guess where
something lives and be right.

</Intro>

<YouWillLearn>

- Why `Provider` is the seam, and why it has exactly four methods
- Why retry and validation live in `Client` rather than in each adapter
- Why a message is a list of parts rather than a string
- Why every abstraction here comes with an escape hatch

</YouWillLearn>

## 1. There is a seam, and it is four methods

Everything in skyl exists to serve one interface.

```go
type Provider interface {
	Name() string
	Complete(ctx context.Context, req *Request) (*Response, error)
	Stream(ctx context.Context, req *Request) (Stream, error)
	Models(ctx context.Context) ([]ModelInfo, error)
}
```

An adapter's whole job is translating a `*Request` into a vendor call, and the
vendor's reply back into a `*Response`. That is all. It does not retry, it does
not validate, it does not time out.

The interface is small on purpose. It is easy to implement — an adapter in your
own repository is a first-class citizen — easy to fake in tests, and easy to
wrap.

<DeepDive title="Why four methods and not two, or ten?">

Two would mean folding streaming into `Complete` with a flag, which makes the
return type dishonest: a streaming call cannot return a complete `*Response`.

Ten would mean modelling embeddings, moderation, image generation and fine-tuning
— each of which has a genuinely different shape, and several of which not every
vendor offers. An interface that half its implementations return
`ErrUnsupported` from is not an interface; it is a suggestion.

Four is the set every text-model vendor actually implements: complete, stream,
and tell me what you offer, plus a name to identify yourself in errors. Recorded
as [ADR-0002](/community/adr/0002-provider-interface).

</DeepDive>

## 2. Everything cross-cutting lives in Client

<ClientStackDiagram />

`Client` wraps a `Provider` and adds request validation, retry with jittered
backoff, per-attempt timeouts, and hooks.

Keeping those in `Client` rather than in each adapter means retry logic is
written and tested **once**, not once per vendor — and a new adapter, including
one you write, gets production-grade behaviour for free.

```go verify
// The provider knows how to talk to OpenAI. The client knows how to be
// reliable. Neither knows the other's job.
client := skyl.New(
	openai.New(key),
	skyl.WithMaxRetries(5),
	skyl.WithTimeout(90*time.Second),
)
```

If you want the raw provider without any of that, it is one call away:

```go verify
raw := client.Provider() // no retry, no validation, no hooks
```

## 3. A message is a list of parts

The hardest design problem in a multi-provider library is representing a
message, because vendors disagree. OpenAI historically used a flat `content`
string; Anthropic uses typed content blocks; Gemini uses `parts` under
`contents` and calls the assistant role `model`.

skyl models the **superset**:

```go
type Message struct {
	Role  Role
	Parts []Part
}
```

`Part` is a **closed** interface — it has an unexported marker method, so only
skyl can implement it. The four implementations are `Text`, `Image`, `ToolCall`
and `ToolResult`.

<DeepDive title="Why closed, and why that matters to you">

An open interface would let you construct a part that no adapter knows how to
render — turning a compile-time error into a runtime one, discovered in
production against one vendor and not another.

Closed means the compiler can tell you. The cost is that you cannot add a part
type without changing skyl; the benefit is that every part you *can* construct
is one every adapter has an answer for, even if that answer is a clean
`ErrUnsupported`.

</DeepDive>

Flattening to a simpler vendor shape is lossless for the common case and
explicit where it is not: an adapter that cannot represent a part returns
`ErrUnsupported` **naming the part**, rather than silently dropping it.

<Pitfall>

Silent data loss is the worst possible failure mode for a library like this. A
dropped image looks exactly like a model that ignored your question — and you
will spend an afternoon on the prompt before you suspect the transport.

skyl still has fourteen places where something is quietly dropped. They are all
[published, in one list](/reference/provider/silently-ignored), because a gap
you know about costs you minutes and a gap you do not costs you a day.

</Pitfall>

## 4. There is no system role

```go
req := &skyl.Request{
	System:   "You are a terse Go expert.",   // ← a field, not a message
	Messages: []skyl.Message{skyl.UserText("What is a nil map?")},
}
```

The roles are `user`, `assistant` and `tool`. System prompts live on
`Request.System` because providers place them in three different locations — a
top-level parameter for Anthropic, a leading message for OpenAI,
`systemInstruction` for Gemini. Making it a field means skyl can put it where
each provider expects, instead of you knowing which.

## 5. The abstraction is always escapable

Every abstraction over a fast-moving API is wrong somewhere. If skyl's `Request`
cannot express what you need, skyl must not be the reason you cannot ship.

Two hatches, always present:

```go verify
// Send something skyl does not model. Your values override anything skyl set.
req.ProviderOptions = map[string]any{"top_k": 40}

// Read something skyl does not model. Raw is ALWAYS populated.
var full map[string]any
json.Unmarshal(resp.Raw, &full)
```

You should never have to fork skyl to use a provider feature. If you do, that is
a bug worth reporting.

## 6. Model IDs are opaque strings

skyl ships no model constants and validates nothing against a list.

A curated enum guarantees that sooner or later skyl rejects a model you are
entitled to use, because it shipped last Tuesday and skyl has not cut a release.
Pass-through is correct forever. The trade is that a typo costs you a round trip
instead of a compile error.

<Recap>

- `Provider` is the seam: four methods, easy to implement yourself.
- `Client` owns everything cross-cutting, so it is written and tested once.
- A message is a role plus ordered parts; `Part` is closed so the compiler can help.
- System prompts are a `Request` field, not a role, because vendors place them differently.
- `ProviderOptions` and `Response.Raw` mean the abstraction never traps you.
- Model IDs pass straight through, so new models work the day they launch.

</Recap>

<Challenges>

<Challenge title="Find where a behaviour lives">

Without looking it up: if you want to change how long skyl waits before
retrying, is that a `Client` option or a provider option? What about supplying
your own `*http.Client`?

<Hint>

Ask which layer performs the action. Who does the waiting? Who does the HTTP?

</Hint>

<Solution>

**Backoff is a `Client` option** — `Client` runs the retry loop, so
`skyl.WithRetryDelay(base, max)` belongs there.

**The HTTP client is a *provider* option** — the adapter is what performs the
request, so it is `openai.WithHTTPClient(hc)`, `gemini.WithHTTPClient(hc)`, and
so on.

That rule generalises: if the behaviour is the same for every vendor, it is on
`Client`. If it is about how one vendor is reached, it is on the provider.

</Solution>

</Challenge>

<Challenge title="Explain the closed interface to a colleague">

A teammate asks why they cannot define their own `skyl.Part` implementation for
audio. What do you tell them, and what should they do instead?

<Hint>

The question is not "why won't you let me" but "what would break if you could".

</Hint>

<Solution>

If `Part` were open, you could construct an `AudioPart` and pass it to
`Complete`. Every adapter's `switch` over part types would hit its `default`
branch, and would have to either drop it silently or fail at runtime — a bug
that appears in production, on one vendor, long after the code was written.

Closed means the compiler rejects it immediately.

What to do instead: send it through `ProviderOptions`, which is exactly the
hatch for a feature skyl does not model. And if the vendor's audio support is
stable and several vendors offer it, that is a good issue to open — a new part
type is a change to skyl, which is the point.

</Solution>

</Challenge>

</Challenges>
