---
title: POST /v1/chat
description: A completion. Returns the assistant turn in the same shape a request takes.
---

<Intro>

The completion endpoint. Its response carries `message` — the assistant's turn in
the same shape a request takes — which is what makes a tool-calling loop
expressible over HTTP.

</Intro>

## Reference

<Signature>POST /v1/chat</Signature>

Requires `Authorization: Bearer <SKYL_AUTH_TOKEN>`. Returns
`application/json`.

<Pitfall>

**`DisallowUnknownFields` is on.** An unrecognised field is a **400**, not a
silent ignore — so a newer client against an older gateway fails loudly.
Upgrade gateways first.

</Pitfall>

### Request body — `ChatRequest`

<Fields of="chatRequest" />

### `ChatMessage`

<Fields of="chatMessage" />

Use `text` for a plain turn and `content` for anything typed. Do not set both.

### `ChatPart`

<Fields of="chatPart" />

### Response body — `ChatResponse`

<Fields of="chatResponse" />

## Usage

<Recipe title="A simple completion">

```bash
curl -sS localhost:8080/v1/chat \
  -H "Authorization: Bearer $SKYL_AUTH_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "provider": "anthropic",
    "model": "claude-opus-5",
    "max_tokens": 512,
    "messages": [{"role": "user", "text": "Hello"}]
  }'
```

```json
{
  "id": "msg_01...",
  "provider": "anthropic",
  "model": "claude-opus-5",
  "text": "Hello! How can I help?",
  "message": {
    "role": "assistant",
    "content": [{"type": "text", "text": "Hello! How can I help?"}]
  },
  "stop_reason": "end_turn",
  "usage": {"input_tokens": 9, "output_tokens": 8}
}
```

</Recipe>

<Recipe title="A system prompt and history">

```json
{
  "provider": "openai",
  "model": "gpt-5.6",
  "system": "You are a terse Go expert.",
  "max_tokens": 256,
  "messages": [
    {"role": "user", "text": "What is a nil map?"},
    {"role": "assistant", "text": "A map that is declared but not allocated."},
    {"role": "user", "text": "Can I read from one?"}
  ]
}
```

</Recipe>

<Recipe title="A tool-calling round trip">

Declare the tool and send the turn:

```json
{
  "provider": "anthropic",
  "model": "claude-opus-5",
  "max_tokens": 512,
  "messages": [{"role": "user", "text": "Weather in Kampala?"}],
  "tools": [{
    "name": "get_weather",
    "description": "Get the current weather for a city.",
    "parameters": {
      "type": "object",
      "properties": {"city": {"type": "string"}},
      "required": ["city"]
    }
  }]
}
```

The response carries the calls **and** the replayable turn:

```json
{
  "stop_reason": "tool_use",
  "message": {
    "role": "assistant",
    "content": [{"type": "tool_call", "id": "c1", "name": "get_weather",
                 "arguments": {"city": "Kampala"}}]
  },
  "tool_calls": [{"id": "c1", "name": "get_weather", "arguments": {"city": "Kampala"}}]
}
```

Send `message` back verbatim, then the result:

```json
{
  "messages": [
    {"role": "user", "text": "Weather in Kampala?"},
    {"role": "assistant", "content": [{"type": "tool_call", "id": "c1",
      "name": "get_weather", "arguments": {"city": "Kampala"}}]},
    {"role": "tool", "content": [{"type": "tool_result", "tool_call_id": "c1",
      "content": "22C and sunny"}]}
  ]
}
```

Echoing `message` back is exactly why it exists: every provider rejects a tool
result that does not follow the call it answers.

</Recipe>

<Recipe title="An image">

```json
{
  "messages": [{
    "role": "user",
    "content": [
      {"type": "image", "media_type": "image/png", "data": "<base64>"},
      {"type": "text", "text": "What does this chart show?"}
    ]
  }]
}
```

Over HTTP, `data` **is** base64 — unlike the Go API, where `Image.Data` is raw
bytes.

</Recipe>

## Errors

<GatewayStatusTable />

And before any upstream call happens:

<GatewayLocalStatusTable />

<Pitfall>

**`ErrAuth` becomes 502, not 401.** The caller's token was fine and the
*gateway's* provider credential was not — returning 401 would tell a client to
re-authenticate when the actual fix is an operator rotating a key. The 401 is
reserved for a caller presenting a bad gateway token.

</Pitfall>

The provider's raw error body is **never forwarded**: it can echo request
content back to a caller who should not see it.

## Troubleshooting

<Trouble problem="400 on a request that used to work">

The wire format changed: `"content": "hi"` became `"text": "hi"`, and
`DisallowUnknownFields` is on. Update the client.

</Trouble>

<Trouble problem="502 with kind “auth”">

The gateway's own provider key was rejected. This is an operator problem, not a
caller one — check the `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` in the gateway's
environment.

</Trouble>

<Trouble problem="raw is missing">

`SKYL_INCLUDE_RAW` defaults to false, because the body crosses a trust boundary.

</Trouble>

<Trouble problem="422 with kind “refusal”">

The model or its classifiers declined. The request was well-formed and
understood — do not retry it unchanged.

</Trouble>
