---
title: GET /v1/models
description: The live model list from a provider.
---

<Intro>

Queries the provider's real models endpoint, so the answer is never stale — it
is not the gateway's opinion, it is the provider's answer.

</Intro>

## Reference

<Signature>GET /v1/models?provider=NAME</Signature>

Requires `Authorization: Bearer <SKYL_AUTH_TOKEN>`. Returns
`application/json`.

<Parameters>

- **`provider`** (query) — which registered provider to ask. Defaults to
  `SKYL_DEFAULT_PROVIDER`.

</Parameters>

### Response — `ModelsResponse`

```json
{
  "provider": "anthropic",
  "models": [
    {
      "id": "claude-opus-5",
      "display_name": "Claude Opus 5",
      "context_window": 200000,
      "max_output_tokens": 64000
    }
  ]
}
```

<DataTable
  headers={['Field', 'JSON', 'Notes']}
  rows={[
    ['ID', <code key="a">id</code>, 'Always present. This is what goes in "model".'],
    ['DisplayName', <code key="b">display_name</code>, 'Omitted when the provider does not report it.'],
    ['ContextWindow', <code key="c">context_window</code>, 'Omitted when zero.'],
    ['MaxOutputTokens', <code key="d">max_output_tokens</code>, 'Omitted when zero.'],
  ]}
/>

<Caveats>

- **Only `id` is populated by every provider.** OpenAI's endpoint reports no
  display name, context window or output cap — the gap is upstream.
- This makes a **live upstream call**, so it is bounded by
  `SKYL_REQUEST_TIMEOUT` and counts against your provider rate limits. Do not
  call it per request.
- An unregistered provider name returns **404**.
- **On Gemini the list truncates silently beyond 1000 models**, because the
  adapter ignores `nextPageToken`.

</Caveats>

## Usage

<Recipe title="Listing a provider's models">

```bash
curl -sS "localhost:8080/v1/models?provider=openai" \
  -H "Authorization: Bearer $SKYL_AUTH_TOKEN"
```

</Recipe>

<Recipe title="Populating a picker at startup, not per request">

```js
// Cache it. This is a live upstream call against your rate limit.
const models = await fetch('/v1/models?provider=anthropic', {
  headers: { Authorization: `Bearer ${token}` },
}).then((r) => r.json());
```

</Recipe>

## Troubleshooting

<Trouble problem="404 with kind “not_found”">

The named provider is not registered on this gateway. Check `/v1/providers` for
what is.

</Trouble>

<Trouble problem="display_name and context_window are missing">

Omitted when the provider does not report them, which on OpenAI is always.

</Trouble>

<Trouble problem="This is slow">

It is a live call to the provider. Cache the result; the list changes on the
order of weeks.

</Trouble>
