---
title: POST /v1/chat/stream
description: A completion streamed as Server-Sent Events.
---

<Intro>

Identical request body to [`/v1/chat`](/reference/gateway/chat), returning
`text/event-stream`. Flushed per event, with keep-alive frames, and the upstream
request is cancelled as soon as the client disconnects.

</Intro>

## Reference

<Signature>POST /v1/chat/stream</Signature>

Requires `Authorization: Bearer <SKYL_AUTH_TOKEN>`. Returns
`text/event-stream`.

The request body is exactly [`ChatRequest`](/reference/gateway/chat).

## The frame sequence

<ConsoleBlock>{`data: {"type":"text_delta","text":"Hello"}

data: {"type":"text_delta","text":"!"}

: keep-alive

data: {"type":"tool_call","tool_call":{"id":"c1","name":"get_weather","arguments":{"city":"Kampala"}}}

data: {"type":"done","stop_reason":"end_turn","usage":{"input_tokens":9,"output_tokens":8}}`}</ConsoleBlock>

<DataTable
  headers={['type', 'Carries']}
  rows={[
    [<code key="a">text_delta</code>, <code key="b">text</code>],
    [<code key="c">thinking_delta</code>, <span key="d"><code>text</code> — Anthropic only</span>],
    [<code key="e">tool_call</code>, <code key="f">tool_call</code>],
    [<code key="g">done</code>, <span key="h"><code>stop_reason</code>, <code>usage</code></span>],
  ]}
/>

<Caveats>

- **Keep-alive frames** are SSE comments (`: keep-alive`) written every
  `SKYL_HEARTBEAT_INTERVAL` (default 15s) on an idle stream, so proxies do not
  time the connection out mid-generation. A conforming SSE client ignores them.
- **`X-Accel-Buffering: no`** is set, so nginx and similar do not buffer the
  response into uselessness.
- **The upstream request is cancelled on client disconnect.** A client hanging
  up must not leave a paid request running.
- **Errors after the header are frames, not statuses.** Once the SSE header is
  written the status is fixed at 200 — a mid-stream failure arrives in the body.
- `X-Request-Id` is echoed on the response for correlation.

</Caveats>

## Usage

<Recipe title="curl">

```bash
curl -N -sS localhost:8080/v1/chat/stream \
  -H "Authorization: Bearer $SKYL_AUTH_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "provider": "openai",
    "model": "gpt-5.6",
    "max_tokens": 256,
    "messages": [{"role": "user", "text": "Count to five."}]
  }'
```

`-N` disables curl's own buffering; without it you see nothing until the end.

</Recipe>

<Recipe title="Browser EventSource is not enough">

```js
// EventSource cannot send a POST body or an Authorization header, so use fetch
// with a streaming reader instead.
const res = await fetch('/v1/chat/stream', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ model: 'gpt-5.6', max_tokens: 256,
    messages: [{ role: 'user', text: 'Hello' }] }),
});

const reader = res.body.getReader();
const decoder = new TextDecoder();
let buffer = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  buffer += decoder.decode(value, { stream: true });

  // Frames are separated by a blank line.
  const frames = buffer.split('\n\n');
  buffer = frames.pop() ?? '';

  for (const frame of frames) {
    if (frame.startsWith(':')) continue;          // keep-alive
    if (!frame.startsWith('data: ')) continue;
    const ev = JSON.parse(frame.slice(6));
    if (ev.type === 'text_delta') process(ev.text);
  }
}
```

</Recipe>

<Recipe title="Python">

```python
import json, httpx

with httpx.stream("POST", "http://localhost:8080/v1/chat/stream",
                  headers={"Authorization": f"Bearer {token}"},
                  json={"model": "gpt-5.6", "max_tokens": 256,
                        "messages": [{"role": "user", "text": "Hello"}]}) as r:
    r.raise_for_status()
    for line in r.iter_lines():
        if not line.startswith("data: "):
            continue                      # skips keep-alive comments too
        ev = json.loads(line[6:])
        if ev["type"] == "text_delta":
            print(ev["text"], end="", flush=True)
```

</Recipe>

## Errors

Failures **before** the stream starts use the same status codes as
[`/v1/chat`](/reference/gateway/chat#errors).

Failures **after** it starts cannot: the status is already 200. They arrive as a
frame in the body, so a client that only checks the HTTP status will miss them.

<Pitfall>

Treat a stream that ends without a `done` frame as **truncated**, not complete.
This is the HTTP-level equivalent of always checking `stream.Err()` in Go, and
it is just as easy to forget.

</Pitfall>

## Troubleshooting

<Trouble problem="Nothing arrives until the response is complete">

A proxy is buffering. The gateway sets `X-Accel-Buffering: no` for nginx; other
proxies may need their own configuration. With curl, pass `-N`.

</Trouble>

<Trouble problem="The connection drops after ~60 seconds while the model is thinking">

An idle-timeout in a proxy between you and the gateway. Lower
`SKYL_HEARTBEAT_INTERVAL` so keep-alive frames arrive more often.

</Trouble>

<Trouble problem="usage is zero in the done frame">

The upstream host did not report it. On OpenAI-family providers that means
`stream_options.include_usage` was not honoured.

</Trouble>

<Trouble problem="My client chokes on “: keep-alive”">

Those are SSE comment frames. Skip any line that does not begin with `data: `.

</Trouble>
