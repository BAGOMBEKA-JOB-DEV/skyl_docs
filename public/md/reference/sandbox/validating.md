---
title: Validating against real providers
description: The one check the rest of the suite structurally cannot perform — and only you can run it.
---

<Intro>

Every fake in the skyl repository — the sandbox, the unit-test fixtures, the
contract suite — was written from the same provider documentation as the adapter
it exercises. If a field name is wrong, the fake is wrong in exactly the same
way, the two agree with each other, and CI stays green. **Only a real call
settles it**, and that needs your own credentials.

</Intro>

<Unvalidated />

## What it costs

Roughly **$0.05–0.50 per provider** for a full pass, and the largest factor is
the model you choose rather than the number of calls.

The suite runs **8 checks per provider**, all with small prompts and low
`MaxTokens`. One is two-turn, so budget **9 upstream requests** per provider.
Gemini's free tier covers the whole run.

<Note>

**Pick a cheap model.** The suite asserts on transport behaviour, not on answer
quality — a small model proves the mapping exactly as well as a large one.

The defaults are already small (`gpt-5.4-nano`, `gemini-3.6-flash`,
`claude-haiku-4-5`). Override with `SKYL_TEST_OPENAI_MODEL`,
`SKYL_TEST_GEMINI_MODEL` and `SKYL_TEST_ANTHROPIC_MODEL`.

</Note>

## Running it

<TerminalBlock>{`export GOTOOLCHAIN=go1.26.0

# Whichever you have. Absent keys skip cleanly rather than failing.
export OPENAI_API_KEY=...
export GEMINI_API_KEY=...
export ANTHROPIC_API_KEY=...

# openai, gemini and openaicompat live in the root module.
go test -tags=integration -v -run TestLive ./provider/

# provider/anthropic is its own module.
cd provider/anthropic && go test -tags=integration -v -run TestLive ./...`}</TerminalBlock>

`openaicompat` defaults to a local Ollama at `http://localhost:11434/v1` and is
skipped unless you set a key. To run it against Ollama, vLLM, OpenRouter, Groq —
anything OpenAI-shaped:

<TerminalBlock>{`SKYL_TEST_COMPAT_KEY=local \\
SKYL_TEST_COMPAT_BASE_URL=http://localhost:11434/v1 \\
SKYL_TEST_COMPAT_MODEL=llama3.3 \\
  go test -tags=integration -run TestLiveOpenAICompat ./provider/`}</TerminalBlock>

<Pitfall>

Run all of this **before** cutting a release tag. A tag on the module proxy is
permanent, and a wrong field name should never appear in a published version.

</Pitfall>

## Recording cassettes

A **separate** run from the live suite — a different, untagged test that records
rather than asserts:

<TerminalBlock>{`SKYL_RECORD=1 OPENAI_API_KEY=... GEMINI_API_KEY=... \\
  go test -count=1 -run Cassette ./provider/`}</TerminalBlock>

It captures each exchange into `testdata/cassettes/`, so **one paid run produces
fixtures that replay free forever**. Recording currently covers **openai and
gemini** only.

Credentials are scrubbed from headers on write — `Authorization`, `X-Api-Key`,
`x-goog-api-key`, `OpenAI-Organization`, `OpenAI-Project` — and a test walks
every committed cassette looking for credential-shaped strings.

<Pitfall>

**Scrubbing covers headers, not bodies.** A credential pasted into a prompt or
into `ProviderOptions` is recorded verbatim. Record with throwaway prompts, and
read a cassette before committing it.

</Pitfall>

Replay tests are untagged, so committed cassettes begin asserting in ordinary CI
immediately. That is the point: it converts a one-off paid run into a permanent
regression guard.

## What each check proves

<DataTable
  headers={['Check', 'What only a real call can tell you']}
  rows={[
    [<code key="a">models</code>, 'Discovery works against the real endpoint. skyl has no hardcoded model list, so this *is* the model list.'],
    [<code key="b">complete</code>, 'The request maps, the response parses, usage is non-zero, and the stop reason is one skyl knows.'],
    [<code key="c">stream</code>, "SSE framing survives a real network — chunked, split across packets, at the provider's own cadence."],
    [<code key="d">rejects a bogus model</code>, 'A typo classifies as ErrNotFound/ErrBadRequest rather than something unactionable. Pass-through model IDs are only defensible if this holds.'],
    [<code key="e">tool call</code>, 'The JSON Schema we send is one the provider accepts, the call ID is populated, and arguments parse. A schema a fake accepts and a provider rejects is invisible offline.'],
    [<code key="f">tool round trip</code>, "The two-turn path: replaying the provider's own assistant message and answering it. Message ordering, role naming and tool-result encoding all have to be right at once — and the adapters differ most here."],
    [<code key="g">streamed tool call</code>, 'Argument fragments reassemble into valid JSON when fragmented the way a real provider fragments them, not the way the sandbox does.'],
    [<code key="h">stops at max tokens</code>, 'Truncation reports StopMaxTokens. A truncated answer reported as complete is silent data loss. Also asserts the cache-token inclusion rule on Usage.'],
  ]}
/>

## Reading a failure

Not every red run is an adapter bug. Triage in this order.

### Provider-side, not your problem

Retry once before investigating: `ErrRateLimit` (429), `ErrServer` (5xx), or a
timeout on a loaded endpoint.

### A model behaviour, not a mapping bug

- **`tool call` fails with "no tool call returned despite ToolChoiceRequired"** —
  some models comply poorly with forced tool use. Try a different model before
  suspecting the adapter.
- **`tool round trip` skips** — the first turn produced no call, so there was
  nothing to answer. Same cause.
- **`stops at max tokens` reports `end_turn`** — check the model actually had
  more to say. `MaxTokens: 8` on a terse model can legitimately complete.

### A real adapter bug — what the run is for

- **400 on the tool-call check.** The schema sent is malformed for that
  provider. **This is the single most likely genuine finding.**
- **`ToolCall.Arguments is not valid JSON`** on the streaming check. Fragment
  accumulation is wrong against real fragmentation.
- **`StopReason` is `unknown`.** The provider reported something not in skyl's
  map — the mapping table needs the new value.
- **`Usage` entirely zero.** Token accounting is not being parsed; the field
  names moved.
- **400 on the round trip.** Tool-result encoding or message ordering is wrong.
  Compare `Response.Raw` from the first turn against what was replayed.
- **`CacheReadTokens exceeds InputTokens`.** The provider's cache semantics are
  not what [`Usage`](/reference/skyl/usage)'s normalisation assumes.

For any of these, [`Response.Raw`](/reference/skyl/response) holds the
provider's untouched body and is the fastest way to see what actually arrived.

## After a green run

1. **Commit any cassettes recorded**, having read them.
2. **Update the status section of `README.md`** — which currently says no adapter
   has spoken to a real provider — naming which adapters and which models were
   validated, and when.
3. **Then, and only then, cut the release tags.** See
   [Releasing](/community/releasing).

If it did not go green, that is the run doing its job. Fix what it found and go
again — the finding was always there, it was just invisible.
