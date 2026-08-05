---
title: GET /v1/providers
description: The names of every registered provider.
---

<Intro>

Tells a client what it may ask for. Cheap — it reads the gateway's own
configuration and makes no upstream call.

</Intro>

## Reference

<Signature>GET /v1/providers</Signature>

Requires `Authorization: Bearer <SKYL_AUTH_TOKEN>`. Returns
`application/json`.

```json
{"default": "anthropic", "providers": ["anthropic", "openai"]}
```

<DataTable
  headers={['Field', 'Meaning']}
  rows={[
    [<code key="a">default</code>, <span key="b">The provider used when a request omits one — <code>SKYL_DEFAULT_PROVIDER</code>, or the alphabetically first name.</span>],
    [<code key="c">providers</code>, 'Every registered provider name, sorted.'],
  ]}
/>

<Caveats>

- Names are **sorted**, so the output is stable across restarts.
- **`default` tells you which provider a request with no `provider` field will
  reach.** Read it rather than assuming: it is the alphabetically first name
  unless an operator set `SKYL_DEFAULT_PROVIDER`.
- The list reflects which **API keys were present at startup**. A provider is
  registered for each key found; there is no runtime registration.
- **No upstream call.** Unlike `/v1/models`, this is free and safe to call
  often.

</Caveats>

## Usage

<Recipe title="Discovering what is available">

```bash
curl -sS localhost:8080/v1/providers \
  -H "Authorization: Bearer $SKYL_AUTH_TOKEN"
```

</Recipe>

<Recipe title="A startup sanity check">

```bash
# Fail a deploy if the provider you expect is not registered.
curl -sf localhost:8080/v1/providers -H "Authorization: Bearer $TOKEN" \
  | grep -q anthropic || { echo "anthropic not registered"; exit 1; }
```

</Recipe>

<Recipe title="A smoke test that also validates the token">

```bash
# 200 proves the gateway is up AND the token is right — more than /healthz,
# which is unauthenticated by design.
curl -sf -o /dev/null -w '%{http_code}\n' localhost:8080/v1/providers \
  -H "Authorization: Bearer $TOKEN"
```

</Recipe>

## Troubleshooting

<Trouble problem="An empty list">

Impossible — the gateway refuses to start with no providers registered. If you
see one, you are not talking to a skyl gateway.

</Trouble>

<Trouble problem="A provider I configured is missing">

Its key was not present at startup. Variable names must match exactly:
`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, and
`SKYL_COMPAT_BASE_URL` for a compatible host.

</Trouble>

<Trouble problem="The compatible provider is named “compat”">

That is the default. Set `SKYL_COMPAT_NAME`.

</Trouble>
