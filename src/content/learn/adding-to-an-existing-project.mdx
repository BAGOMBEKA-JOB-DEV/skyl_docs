---
title: Adding skyl to an Existing Project
description: Introducing skyl beside a vendor SDK you already use, without a rewrite.
---

<Intro>

You probably already have a working integration against one vendor's SDK. You do
not have to replace it in one commit — skyl can sit beside it, take one call
path, and prove itself before it takes the rest.

</Intro>

<YouWillLearn>

- How to migrate one call path at a time
- How your existing vendor SDK maps onto `Request` and `Response`
- How to keep a vendor feature that skyl does not model
- How to verify the migration produced identical requests

</YouWillLearn>

## Start with one call

Pick your least critical model call — a summariser, a classifier, something
whose output you can eyeball. Convert only that.

Before, using a vendor SDK directly:

```go
resp, err := oaClient.Chat.Completions.New(ctx, openai.ChatCompletionNewParams{
	Model:     "gpt-5.6",
	MaxTokens: openai.Int(512),
	Messages: []openai.ChatCompletionMessageParamUnion{
		openai.SystemMessage("Summarise in one sentence."),
		openai.UserMessage(article),
	},
})
text := resp.Choices[0].Message.Content
```

After:

```go verify
resp, err := client.Complete(ctx, &skyl.Request{
	Model:     "gpt-5.6",
	MaxTokens: 512,
	System:    "Summarise in one sentence.",
	Messages:  []skyl.Message{skyl.UserText(article)},
})
text := resp.Text()
```

Two differences worth noticing. The system prompt moved from a message to a
**field**, because providers place it differently and skyl puts it where each
one expects. And there is no `Choices[0]` — skyl does not model multiple
completions, because the overwhelming majority of callers want one and the ones
who do not can read `Response.Raw`.

## The mapping

<DataTable
  headers={['Vendor concept', 'skyl']}
  rows={[
    ['System / developer message', <code key="a">Request.System</code>],
    ['messages / contents', <code key="b">Request.Messages</code>],
    ['content string', <code key="c">skyl.UserText(...)</code>],
    ['content blocks / parts', <code key="d">Message.Parts</code>],
    ['max_tokens / maxOutputTokens', <code key="e">Request.MaxTokens</code>],
    ['tools / functionDeclarations', <code key="f">Request.Tools</code>],
    ['tool_choice', <code key="g">Request.ToolChoice</code>],
    ['finish_reason / stop_reason', <code key="h">Response.StopReason</code>],
    ['usage', <code key="i">Response.Usage</code>],
    ['the whole response body', <code key="j">Response.Raw</code>],
  ]}
/>

## Keeping a feature skyl does not model

This is the usual reason a migration stalls, and it should not stall it. If you
were setting a vendor field skyl has no equivalent for, send it through the
escape hatch:

```go verify
req := &skyl.Request{
	Model:     "gpt-5.6",
	MaxTokens: 512,
	Messages:  []skyl.Message{skyl.UserText(article)},
	ProviderOptions: map[string]any{
		"seed":            7,
		"presence_penalty": 0.4,
	},
}
```

Your keys are merged over the payload skyl built, so you win.

<Pitfall>

On `openai`, `gemini` and `openaicompat` the merge is **shallow and top-level**.
Setting a nested object replaces the whole thing:

```go
// DON'T: this destroys maxOutputTokens, temperature, topP, stopSequences
// and thinkingConfig, because it replaces the entire object.
ProviderOptions: map[string]any{
	"generationConfig": map[string]any{"seed": 7},
}
```

You must restate every sibling key skyl would have set. Anthropic is the
exception — it applies options by JSON path, so `"thinking.budget_tokens": 4096`
works there and nowhere else. See
[Provider Options](/learn/provider-options).

</Pitfall>

And if you were reading a response field skyl does not model:

```go verify
var full struct {
	SystemFingerprint string `json:"system_fingerprint"`
}
if err := json.Unmarshal(resp.Raw, &full); err != nil {
	return err
}
```

`Response.Raw` is always populated, on every adapter, on every call.

## Verifying the migration

The most convincing check is that the bytes on the wire did not change. Point
both the old and new code at a local recording proxy, or diff the requests with
a custom transport:

```go verify
// A transport that copies every outbound body to a file, so the pre- and
// post-migration requests can be diffed byte for byte.
type recording struct {
	base http.RoundTripper
	out  io.Writer
}

func (r recording) RoundTrip(req *http.Request) (*http.Response, error) {
	if req.Body != nil {
		body, err := io.ReadAll(req.Body)
		if err != nil {
			return nil, err
		}
		_, _ = r.out.Write(append(body, '\n'))
		req.Body = io.NopCloser(bytes.NewReader(body))
	}
	return r.base.RoundTrip(req)
}
```

Wire it in with the provider's HTTP-client option:

```go
p := openai.New(key, openai.WithHTTPClient(&http.Client{
	Transport: recording{base: http.DefaultTransport, out: f},
}))
```

<DeepDive title="What you gain, concretely, from the migration">

It is worth being specific rather than assuming the abstraction pays for itself.

You delete your retry loop, and get exponential backoff with **full jitter** —
which matters because a fleet retrying on a fixed schedule reconverges into a
thundering herd against a provider that is already struggling.

You delete your error handling and get classification: `errors.Is(err,
skyl.ErrRateLimit)` instead of matching on message text that vendors reword.

You delete your SSE parser and get a stream that cannot leak a goroutine, and
that reports truncation rather than presenting a partial answer as complete.

And you get the option to change vendor later without touching any of the code
that builds prompts.

</DeepDive>

## What to migrate last

Leave anything using a vendor-specific feature heavily — extended thinking with
a precise token budget, prompt caching with explicit breakpoints — until you
have read the [feature matrix](/reference/provider/feature-matrix) row for it.
Some of those are `ProviderOptions` one-liners; a couple are genuinely lossy
today, and it is better to know which before you commit.

<Recap>

- Migrate one call path at a time; skyl coexists with a vendor SDK fine.
- The system prompt becomes a **field**, and there is no `Choices[0]`.
- `ProviderOptions` carries anything skyl does not model — but the merge is shallow on three of four adapters.
- `Response.Raw` is always populated, so no response field is ever lost.
- Verify by diffing outbound bodies through a recording transport.
- Check the feature matrix before migrating a call that leans on a vendor-specific feature.

</Recap>

<Challenges>

<Challenge title="Port a tool-calling loop">

Your existing code appends the assistant message and tool output using vendor
types. What is the skyl equivalent, and what is the one thing you must not
forget?

<Hint>

Every provider rejects a tool result that does not follow the call it answers.

</Hint>

<Solution>

```go verify
resp, err := client.Complete(ctx, req)
if err != nil {
	return err
}

for _, call := range resp.ToolCalls() {
	out := run(call.Name, call.Arguments)
	req.Messages = append(req.Messages,
		resp.Message,                             // ← the assistant's turn, first
		skyl.ToolResultMessage(call.ID, out),     // ← then your answer
	)
}
```

The thing you must not forget is appending `resp.Message` **before** the result.
That is why `Response.Message` exists in the same shape a request takes — so it
can be replayed verbatim.

If you have several calls in one turn, append `resp.Message` once and then one
tool message per call.

</Solution>

</Challenge>

</Challenges>
