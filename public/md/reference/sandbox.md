---
title: The sandbox
description: A local server speaking every provider's wire protocol. No credentials, no cost.
---

<Intro>

`skyl-sandbox` serves all four providers' wire protocols locally. It is what
makes "run every example in this documentation without an API key" a real
promise rather than a marketing line.

</Intro>

## Running it

<TerminalBlock>go run ./cmd/skyl-sandbox</TerminalBlock>

<ConsoleBlock>{`skyl sandbox listening on http://127.0.0.1:8099
  api key       sandbox-key
  anthropic     http://127.0.0.1:8099/anthropic
  openai        http://127.0.0.1:8099/openai/v1
  gemini        http://127.0.0.1:8099/gemini/v1beta
  openaicompat  http://127.0.0.1:8099/compat/v1`}</ConsoleBlock>

## What it is for

**Developing without a key.** Build and run your integration before you have
provisioned anything, and without a real credential sitting in a development
environment.

**Testing what a unit test cannot reach.** Every adapter unit test uses an
in-process fake. That covers the mapping and skips the socket — and a surprising
amount lives on the socket: chunked SSE arriving in pieces, connection reuse,
status codes, `Retry-After`, cancellation landing mid-backoff.

## What it is not

<Pitfall>

**It is not evidence that skyl talks to real providers correctly.**

The sandbox was written from the same provider documentation as the adapters. If
skyl has a field name wrong, the sandbox almost certainly has it wrong in
exactly the same way, and both agree while both are wrong. **No amount of
sandbox testing removes this.**

There is also no model. Replies come from a lookup table and token counts are
word counts — enough to prove usage is parsed and carried, useless for reasoning
about cost or quality.

</Pitfall>

## Pages

<CardGrid>
<YouWillLearnCard title="Running it" path="/reference/sandbox/running-it">Flags, mounts, credentials, and wiring each adapter.</YouWillLearnCard>
<YouWillLearnCard title="Forcing failures" path="/reference/sandbox/forcing-failures">Three model IDs that make it fail on demand.</YouWillLearnCard>
<YouWillLearnCard title="The three test suites" path="/reference/sandbox/test-suites">And the gap between the second and the third.</YouWillLearnCard>
</CardGrid>

<Pitfall>

**This is a development tool.** It authenticates nothing meaningfully, and it
binds to loopback by default for that reason. Do not expose it to a network you
do not control.

</Pitfall>
