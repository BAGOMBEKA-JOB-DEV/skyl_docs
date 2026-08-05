---
title: Reading a Response
description: What comes back, what it means, and what it cost.
---

<Intro>

A `*skyl.Response` carries the assistant's turn, why generation stopped, what it
cost, and — always — the provider's untouched body. This chapter covers each,
including the parts where providers disagree and skyl has to normalise.

</Intro>

<YouWillLearn isChapter>

- Every field on `Response`, and which ones are always populated
- How to get text, tool calls, or both
- What each stop reason means and which are provider-specific
- Why cached tokens are a breakdown of your input, not an addition to it
- Why the model that answered may not be the one you asked for
- How to reach anything skyl does not model

</YouWillLearn>

## The response object

```go
resp, err := client.Complete(ctx, req)

resp.ID          // the provider's identifier, when it gives one
resp.Provider    // "anthropic"
resp.Model       // the model that ACTUALLY answered
resp.Message     // the assistant's turn, ready to append
resp.StopReason  // why generation ended
resp.Usage       // token consumption
resp.Raw         // the untouched provider body — ALWAYS populated
```

<LearnMore path="/learn/the-response-object">
Read **[The Response Object](/learn/the-response-object)** for every field in detail, including which are best-effort.
</LearnMore>

## Text and tool calls

<LearnMore path="/learn/text-and-tool-calls">
Read **[Text and Tool Calls](/learn/text-and-tool-calls)** for the difference between `Text()` and `Message.Parts`, and why reasoning content is not in either.
</LearnMore>

## Stop reasons

<StopReasonTable />

<LearnMore path="/learn/stop-reasons">
Read **[Stop Reasons](/learn/stop-reasons)** for the two that are effectively provider-specific, and how to handle a truncated answer.
</LearnMore>

## Token usage

<LearnMore path="/learn/token-usage">
Read **[Token Usage and Caching](/learn/token-usage)** — this is the page that stops your cost report being wrong by the size of your cache.
</LearnMore>

## Which model answered

<LearnMore path="/learn/which-model-answered">
Read **[Which Model Actually Answered](/learn/which-model-answered)** for why `resp.Model` is read from the response rather than echoed.
</LearnMore>

## Raw provider JSON

<LearnMore path="/learn/reading-raw-json">
Read **[Reading Raw Provider JSON](/learn/reading-raw-json)** for the escape hatch that means nothing a provider sends is ever lost.
</LearnMore>

<WhatsNext>

Start with [The Response Object](/learn/the-response-object). If you are chasing
a cost discrepancy, go straight to
[Token Usage and Caching](/learn/token-usage) — it is almost certainly the
inclusion semantics.

</WhatsNext>
