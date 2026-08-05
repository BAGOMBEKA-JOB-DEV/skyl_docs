---
title: Calling the gateway from another language
description: Complete Python and TypeScript clients — auth, completion, streaming, and the tool loop.
---

<Intro>

The gateway exists so that services which are not written in Go can reach the
same models through the same interface. This page is one complete client in each
language: authentication, a completion, streaming, the tool-calling loop, and
error handling.

</Intro>

<Note>

**If you are writing Go, do not use the gateway.** Import
[the library](/reference/skyl) directly — an extra network hop buys you nothing.
The gateway earns its place when several services, in several languages, need
model access through one audited egress point.

</Note>

## What you need

The gateway speaks ordinary JSON over HTTP. There is no SDK to install in any
language, and there never will be — the wire format *is* the interface.

<LanguageTabs only={['curl', 'python', 'typescript']}>

```bash
export SKYL_URL=http://localhost:8080
export SKYL_TOKEN=your-gateway-token
```

```python verify
import os

BASE = os.environ.get("SKYL_URL", "http://localhost:8080")
TOKEN = os.environ["SKYL_TOKEN"]
HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}
```

```ts verify
const BASE = process.env.SKYL_URL ?? 'http://localhost:8080';
const TOKEN = process.env.SKYL_TOKEN!;
const HEADERS = {
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
};
```

</LanguageTabs>

<Pitfall>

The token authenticates **you to the gateway**. It is not a provider key — those
live only on the gateway, which is the point. Never ship a provider credential
to a client.

</Pitfall>

## A completion

<LanguageTabs>

```bash
curl -sS "$SKYL_URL/v1/chat" \
  -H "Authorization: Bearer $SKYL_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "provider": "anthropic",
    "model": "claude-opus-5",
    "max_tokens": 512,
    "messages": [{"role": "user", "text": "Explain Go channels in two sentences."}]
  }'
```

```python verify
import httpx

r = httpx.post(f"{BASE}/v1/chat", headers=HEADERS, timeout=120.0, json={
    "provider": "anthropic",
    "model": "claude-opus-5",
    "max_tokens": 512,
    "messages": [{"role": "user", "text": "Explain Go channels in two sentences."}],
})
r.raise_for_status()
body = r.json()

print(body["text"])
print(body["usage"]["input_tokens"], "in /", body["usage"]["output_tokens"], "out")
```

```ts verify
const res = await fetch(`${BASE}/v1/chat`, {
  method: 'POST',
  headers: HEADERS,
  body: JSON.stringify({
    provider: 'anthropic',
    model: 'claude-opus-5',
    max_tokens: 512,
    messages: [{ role: 'user', text: 'Explain Go channels in two sentences.' }],
  }),
});
if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
const body = await res.json();

console.log(body.text);
console.log(body.usage.input_tokens, 'in /', body.usage.output_tokens, 'out');
```

</LanguageTabs>

`text` is every text part concatenated — the convenience field for the common
case. `message` carries the assistant's full turn, which you need for tools.

<Note>

**`role` plus `text` is the shorthand.** A turn that is one run of text can use
it instead of the typed `content` array. Anything richer — an image, a tool call,
a tool result — needs `content`. Both shapes are documented on
[POST /v1/chat](/reference/gateway/chat).

</Note>

## Streaming

`POST /v1/chat/stream` returns `text/event-stream`. Each frame is one JSON
object on a `data:` line, and the connection carries periodic keep-alive
comments that you must skip.

<LanguageTabs>

```bash
curl -N -sS "$SKYL_URL/v1/chat/stream" \
  -H "Authorization: Bearer $SKYL_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"model":"gpt-5.6","max_tokens":256,
       "messages":[{"role":"user","text":"Count to five."}]}'
```

```python verify
import json
import httpx

with httpx.stream("POST", f"{BASE}/v1/chat/stream", headers=HEADERS, timeout=None, json={
    "model": "gpt-5.6",
    "max_tokens": 256,
    "messages": [{"role": "user", "text": "Count to five."}],
}) as r:
    r.raise_for_status()
    for line in r.iter_lines():
        if not line.startswith("data: "):
            continue                      # skips keep-alive comment frames
        event = json.loads(line[6:])
        if event["type"] == "text_delta":
            print(event["text"], end="", flush=True)
        elif event["type"] == "done":
            print()
            print("usage:", event.get("usage"))
```

```ts verify
const res = await fetch(`${BASE}/v1/chat/stream`, {
  method: 'POST',
  headers: HEADERS,
  body: JSON.stringify({
    model: 'gpt-5.6',
    max_tokens: 256,
    messages: [{ role: 'user', text: 'Count to five.' }],
  }),
});
if (!res.ok || !res.body) throw new Error(`stream failed: ${res.status}`);

const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
let buffer = '';

for (;;) {
  const { value, done } = await reader.read();
  if (done) break;
  buffer += value;

  // Frames are newline-delimited, but a chunk can split one in half.
  const lines = buffer.split('\n');
  buffer = lines.pop() ?? '';

  for (const line of lines) {
    if (!line.startsWith('data: ')) continue; // skips keep-alive comments
    const event = JSON.parse(line.slice(6));
    if (event.type === 'text_delta') process.stdout.write(event.text);
    if (event.type === 'done') console.log('\nusage:', event.usage);
  }
}
```

</LanguageTabs>

<Pitfall>

**Buffer across chunks.** A network chunk can split an SSE frame in half, so
parsing each chunk independently drops text intermittently — and only under load,
which makes it a miserable bug to find. The TypeScript example keeps a `buffer`
and only parses complete lines; `httpx`'s `iter_lines` does this for you.

</Pitfall>

## The tool loop

This is the part worth reading closely. The gateway returns the assistant's turn
in `message`, **in the same shape a request takes**, so you send it straight
back followed by your results.

<LanguageTabs only={['python', 'typescript']}>

```python verify
def run_tool(name, arguments):
    if name == "get_weather":
        return f"22C and sunny in {arguments['city']}"
    return f"ERROR: no such tool {name}"


messages = [{"role": "user", "text": "What's the weather in Kampala?"}]
tools = [{
    "name": "get_weather",
    "description": "Get the current weather for a city. Call this whenever the "
                   "user asks about weather in a named place.",
    "parameters": {
        "type": "object",
        "properties": {"city": {"type": "string"}},
        "required": ["city"],
    },
}]

for _ in range(5):                       # bounded: a model can loop forever
    r = httpx.post(f"{BASE}/v1/chat", headers=HEADERS, timeout=120.0, json={
        "model": "claude-opus-5",
        "max_tokens": 512,
        "messages": messages,
        "tools": tools,
    })
    r.raise_for_status()
    body = r.json()

    calls = body.get("tool_calls") or []
    if not calls:
        print(body["text"])
        break

    # The assistant's turn must be replayed BEFORE any result: every provider
    # rejects a tool result that does not follow the call it answers.
    messages.append(body["message"])

    # And every call must be answered, or the whole turn is invalid.
    for call in calls:
        messages.append({
            "role": "tool",
            "content": [{
                "type": "tool_result",
                "tool_call_id": call["id"],
                "content": run_tool(call["name"], call["arguments"]),
            }],
        })
```

```ts verify
function runTool(name: string, args: Record<string, string>): string {
  if (name === 'get_weather') return `22C and sunny in ${args['city']}`;
  return `ERROR: no such tool ${name}`;
}

const messages: unknown[] = [{ role: 'user', text: "What's the weather in Kampala?" }];
const tools = [{
  name: 'get_weather',
  description:
    'Get the current weather for a city. Call this whenever the user asks ' +
    'about weather in a named place.',
  parameters: {
    type: 'object',
    properties: { city: { type: 'string' } },
    required: ['city'],
  },
}];

for (let round = 0; round < 5; round++) {   // bounded: a model can loop forever
  const res = await fetch(`${BASE}/v1/chat`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      model: 'claude-opus-5',
      max_tokens: 512,
      messages,
      tools,
    }),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  const body = await res.json();

  const calls = body.tool_calls ?? [];
  if (calls.length === 0) {
    console.log(body.text);
    break;
  }

  // The assistant's turn must be replayed BEFORE any result: every provider
  // rejects a tool result that does not follow the call it answers.
  messages.push(body.message);

  // And every call must be answered, or the whole turn is invalid.
  for (const call of calls) {
    messages.push({
      role: 'tool',
      content: [{
        type: 'tool_result',
        tool_call_id: call.id,
        content: runTool(call.name, call.arguments),
      }],
    });
  }
}
```

</LanguageTabs>

<Pitfall>

Three rules, each of which produces a 400 when broken:

1. **Append `message` before any result.** Not a reconstruction of it — the
   object the gateway returned, verbatim.
2. **Answer every call.** A call left unanswered invalidates the turn, and it is
   much harder to spot than an error result.
3. **Bound the loop.** A tool returning something the model cannot use will make
   it ask again, indefinitely, billing you each round.

</Pitfall>

## Errors

Every failure returns JSON with a stable, machine-readable `kind`, so you branch
on that rather than parsing prose.

<GatewayStatusTable />

<LanguageTabs only={['python', 'typescript']}>

```python verify
r = httpx.post(f"{BASE}/v1/chat", headers=HEADERS, timeout=120.0, json=payload)

if r.status_code >= 400:
    err = r.json()
    kind = err.get("kind", "unknown")
    if kind == "rate_limit":
        pass      # the gateway already retried upstream; shed load here
    elif kind == "refusal":
        pass      # never retry: the same prompt gets the same answer
    elif kind == "auth":
        pass      # a 502 means the GATEWAY's provider key was rejected, not yours
    raise RuntimeError(f"{kind}: {err.get('error')}")
```

```ts verify
const res = await fetch(`${BASE}/v1/chat`, {
  method: 'POST',
  headers: HEADERS,
  body: JSON.stringify(payload),
});

if (!res.ok) {
  const err = await res.json();
  switch (err.kind) {
    case 'rate_limit':
      break;   // the gateway already retried upstream; shed load here
    case 'refusal':
      break;   // never retry: the same prompt gets the same answer
    case 'auth':
      break;   // a 502 means the GATEWAY's provider key was rejected, not yours
  }
  throw new Error(`${err.kind}: ${err.error}`);
}
```

</LanguageTabs>

<Note>

**`auth` arrives as 502, not 401.** The caller's token was fine and the
*gateway's* provider credential was not, so a 401 would wrongly tell your client
to re-authenticate. A 401 from this API means your bearer token is wrong. See
[Security and deployment](/reference/gateway/security).

</Note>

## What you give up

The gateway exposes the wire format, not the Go library, so a few things do not
cross the boundary:

- **`Response.Raw`** is omitted unless the operator sets `SKYL_INCLUDE_RAW`,
  because a provider's untouched body can echo request content back to a caller.
- **Hooks** are a library concept. The gateway's own `/metrics` covers
  observability instead.
- **Client tuning** — retries, timeouts — is the operator's, set through
  [environment variables](/reference/gateway/configuration), not per request.

Everything else is the same interface described throughout this documentation.
