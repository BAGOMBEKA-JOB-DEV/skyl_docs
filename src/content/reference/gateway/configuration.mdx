---
title: Gateway configuration
description: Every SKYL_* variable, with defaults and validation rules.
---

<Intro>

Everything is an environment variable. There are no flags and no config file —
which makes the gateway trivially deployable in a container and keeps its whole
configuration surface visible in one place.

</Intro>

## Server

<GatewayEnvTable group="server" />

## Providers

<GatewayEnvTable group="providers" />

A provider is registered for each key present, so an operator controls the
provider set purely through the environment. `SKYL_COMPAT_BASE_URL` is the
variable that **triggers** registration of a compatible host; the other two
refine it.

## Client behaviour

These are passed through to `skyl.Option` on every provider client, so an
operator can see and change them — previously they were fixed at their defaults
with no way to do either.

<GatewayEnvTable group="client" />

<Note>

`SKYL_ATTEMPT_TIMEOUT` bounds **one attempt**; `SKYL_REQUEST_TIMEOUT` bounds the
whole upstream request from the handler. They are different numbers doing
different jobs — see [WithTimeout](/reference/skyl/with-timeout).

</Note>

## Hardening

<GatewayEnvTable group="hardening" />

<Pitfall>

**Set `SKYL_MAX_CONCURRENT`.** An unbounded gateway converts a traffic spike
into a provider rate-limit incident — and then into a 429 for every caller,
including the ones that would have succeeded.

**Leave `SKYL_ALLOWED_ORIGINS` unset** unless a browser calls the gateway
directly. That means shipping a token to the browser, which is a decision worth
making deliberately.

</Pitfall>

`SKYL_AUTH_TOKENS` takes `label:token,label:token`. The **label** appears in
logs and metrics; the token never does. That is what makes rotation possible
without downtime — add a new token, migrate callers, remove the old one.

## Observability

<GatewayEnvTable group="observability" />

Enabling metrics installs the telemetry hook on **every** provider client, so
the metrics cover all providers rather than whichever one happened to be wired
first.

## Validation

Every parse error names its variable:

<ConsoleBlock>SKYL_REQUEST_TIMEOUT: time: invalid duration "12x"</ConsoleBlock>

Without that, an operator sees `invalid duration "12x"` with nothing to say
which of a dozen settings is wrong, on a process that has already refused to
start.

## Usage

<Recipe title="A production configuration">

```bash
SKYL_ADDR=:8080
SKYL_AUTH_TOKEN=<32 random bytes, hex>
SKYL_AUTH_TOKENS=rotating:<second token>
SKYL_MAX_CONCURRENT=64
SKYL_REQUEST_TIMEOUT=120s
SKYL_ATTEMPT_TIMEOUT=60s
SKYL_MAX_RETRIES=3
SKYL_METRICS=true

ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
SKYL_DEFAULT_PROVIDER=anthropic
```

</Recipe>

<Recipe title="Local development against the sandbox">

```bash
SKYL_AUTH_TOKEN=local-dev-token
SKYL_COMPAT_BASE_URL=http://127.0.0.1:8099/compat/v1
SKYL_COMPAT_API_KEY=sandbox-key
SKYL_COMPAT_NAME=sandbox
SKYL_INCLUDE_RAW=true
```

</Recipe>

## Troubleshooting

<Trouble problem="The process refuses to start and names a variable">

A parse error. The message includes the variable name and the underlying reason
— that naming is deliberate, because a bare parse error on startup is otherwise
unactionable.

</Trouble>

<Trouble problem="Retries seem to ignore my settings">

`SKYL_MAX_RETRIES` and friends apply to the **upstream** client. They are
bounded by `SKYL_REQUEST_TIMEOUT`, so a short request timeout will cut a retry
sequence short regardless of the retry count.

</Trouble>

<Trouble problem="raw is missing from responses">

`SKYL_INCLUDE_RAW` defaults to **false**. Unlike the library, where `Raw` is
always populated, the gateway omits it by default because the body crosses a
network boundary and can echo request content back to a caller who should not
see it.

</Trouble>
