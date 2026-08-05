---
title: System Prompts
description: A field, not a role — and where each adapter puts it.
---

<Intro>

`Request.System` is a plain string field. That looks like a small decision and
is actually the reason your prompt works identically on three vendors that place
it in three different places.

</Intro>

<YouWillLearn>

- Where each adapter puts the system prompt on the wire
- Why it is a field rather than a role
- How it interacts with token accounting and caching
- What to do when a provider wants several system blocks

</YouWillLearn>

## Setting one

```go verify
req := &skyl.Request{
	Model:  "claude-opus-5",
	System: "You are a terse Go expert. Answer in at most one sentence, and prefer standard-library solutions.",
	Messages: []skyl.Message{skyl.UserText("How do I copy a map?")},
}
```

## Where it lands

<DataTable
  headers={['Adapter', 'Wire location']}
  rows={[
    ['anthropic', <code key="a">system</code>],
    ['openai / openaicompat', <span key="b">a leading <code>system</code> message</span>],
    ['gemini', <code key="c">systemInstruction</code>],
  ]}
/>

All three are `✅ mapped` in the [feature matrix](/reference/provider/feature-matrix)
— this is one of the fields where skyl genuinely hides a real difference at no
cost.

<DeepDive title="Why not model it as a role?">

Two reasons.

The first is placement. If `system` were a role, skyl would have to decide what
a system message *in the middle* of a conversation means. Anthropic has no such
concept — there is one `system` parameter, not a message stream. Gemini is the
same. So skyl would have to either concatenate mid-conversation system messages
into the top-level field (surprising) or reject them (arbitrary).

The second is that a field cannot be misordered. A role can appear anywhere, and
"a system message after three user turns" behaves differently on every vendor. A
field has exactly one meaning.

The cost is that you cannot express OpenAI's `developer` role separately from
`system`. If you need that, `ProviderOptions` reaches it.

</DeepDive>

## Token accounting

The system prompt counts toward `Usage.InputTokens` on every provider — it is
input like any other. That matters when it is long: a 2,000-token system prompt
on a high-volume classifier is 2,000 tokens *per call*.

This is exactly what prompt caching is for. On Anthropic, mark it cacheable
through `ProviderOptions`:

```go verify
req.ProviderOptions = map[string]any{
	// Anthropic applies options by JSON path, so this sets one nested field
	// without disturbing its siblings.
	"system.0.cache_control": map[string]any{"type": "ephemeral"},
}
```

Then `Usage.CacheReadTokens` tells you how much of `InputTokens` was served at a
discount. Remember that cache figures are a *breakdown of* `InputTokens`, not an
addition to it — see [Token Usage](/learn/token-usage).

<Pitfall>

That JSON-path form works **only on Anthropic**. On `openai`, `gemini` and
`openaicompat`, `ProviderOptions` is a shallow top-level merge, so a key
containing a dot is sent literally as a key with a dot in it — which the
provider will not understand.

</Pitfall>

## Several system blocks

Some providers accept a list of system blocks so parts of it can be cached
independently. skyl models one string, because that is what all three have in
common. To reach the list form, restate it through `ProviderOptions`:

```go verify
// Anthropic: replace the whole system field with a block list.
req.System = "" // avoid sending it twice
req.ProviderOptions = map[string]any{
	"system": []map[string]any{
		{"type": "text", "text": stableInstructions, "cache_control": map[string]any{"type": "ephemeral"}},
		{"type": "text", "text": perRequestContext},
	},
}
```

Clear `Request.System` when you do this, or you will send both and get whichever
the provider prefers.

## Empty is fine

Leaving `System` empty sends no system prompt at all — not an empty one. That
distinction matters on providers that treat an empty system string as a real
instruction to be terse.

<Recap>

- `System` is a field, so skyl can place it where each of three vendors expects.
- It counts toward `InputTokens` on every provider, every call.
- Prompt caching is reachable through `ProviderOptions`, and only Anthropic supports JSON-path options.
- The multi-block form requires clearing `Request.System` to avoid sending it twice.
- Empty means "no system prompt", not "an empty one".

</Recap>

<Challenges>

<Challenge title="Measure what your system prompt costs">

Report how many of your input tokens are the system prompt, across a run.

<Hint>

Send the same conversation twice — once with the system prompt and once
without — and compare `InputTokens`.

</Hint>

<Solution>

```go verify
with, err := client.Complete(ctx, req)
if err != nil {
	return err
}

bare := *req
bare.System = ""
without, err := client.Complete(ctx, &bare)
if err != nil {
	return err
}

fmt.Printf("system prompt costs ~%d tokens per call\n",
	with.Usage.InputTokens-without.Usage.InputTokens)
```

Multiply by your call volume. On a classifier doing a million calls a day, a
system prompt you never re-read is a line item.

</Solution>

</Challenge>

</Challenges>
