---
title: Escape Hatches
description: skyl must never be the reason you cannot ship.
---

<Intro>

Every abstraction over a fast-moving API is wrong somewhere. skyl's answer is to
be escapable in every direction — you can send fields it does not model, read
fields it does not parse, replace the transport, observe every attempt, write
your own adapter, or bypass the client entirely.

</Intro>

<YouWillLearn isChapter>

- How to send a vendor field skyl has no equivalent for
- How to read a response field skyl does not parse
- How to supply your own `*http.Client`
- How to observe every attempt without touching your call sites
- How to implement `Provider` yourself, in your own repository
- How to skip `Client` when you want the raw provider

</YouWillLearn>

## Provider options

```go verify
req.ProviderOptions = map[string]any{"top_k": 40}
```

Your keys are merged into the outbound payload, overriding anything skyl set.

<LearnMore path="/learn/provider-options">
Read **[Provider Options](/learn/provider-options)** — the merge is shallow on three of four adapters, and that will bite you.
</LearnMore>

## Raw responses

```go verify
var full map[string]any
json.Unmarshal(resp.Raw, &full)
```

<LearnMore path="/learn/raw-responses">
Read **[Raw Responses](/learn/raw-responses)** for what is guaranteed and what streaming changes.
</LearnMore>

## Your own HTTP client

<LearnMore path="/learn/custom-http-client">
Read **[Custom HTTP Client](/learn/custom-http-client)** for proxies, transport timeouts, mTLS, and trace propagation.
</LearnMore>

## Hooks

<LearnMore path="/learn/hooks">
Read **[Hooks](/learn/hooks)** for the four operations, and the one field that will leak your users' prompts if you log it.
</LearnMore>

## Your own provider

<LearnMore path="/learn/writing-your-own-provider">
Read **[Writing Your Own Provider](/learn/writing-your-own-provider)** — four methods, and you inherit retry, hooks and the gateway for free.
</LearnMore>

## Bypassing the client

<LearnMore path="/learn/bypassing-the-client">
Read **[Bypassing the Client](/learn/bypassing-the-client)** for when you want the provider without validation or retry.
</LearnMore>

<WhatsNext>

Start with [Provider Options](/learn/provider-options) — it is the hatch you
will reach for first. If you are here because a vendor feature is missing, that
page and [Raw Responses](/learn/raw-responses) between them cover almost every
case.

</WhatsNext>
