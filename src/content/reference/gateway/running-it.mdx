---
title: Running the gateway
description: Starting the server, and what it refuses to start without.
---

<Intro>

The gateway is configured entirely by environment variables — there are no flags
and no config file. It refuses to start in two situations, both of which are
operator errors worth failing loudly on.

</Intro>

## Starting it

<TerminalBlock>{`export SKYL_AUTH_TOKEN=$(openssl rand -hex 32)   # required
export ANTHROPIC_API_KEY=sk-ant-...
export OPENAI_API_KEY=sk-...

go run github.com/BAGOMBEKA-JOB-DEV/skyl/gateway/cmd/skyl-gateway`}</TerminalBlock>

Providers are registered from whichever keys are present.

## What it refuses to start without

<Pitfall>

**No `SKYL_AUTH_TOKEN`, no start.** There is no flag to disable authentication —
an accidental open relay to billed endpoints must not be one environment
variable away.

**No providers registered, no start.** Starting with none would be a silent
no-op: a server answering 404 to every model request, which looks like a routing
bug rather than a missing key.

</Pitfall>

Both are returned as errors with readable messages rather than panics, because
both are operator configuration problems:

<ConsoleBlock>{`gateway: an auth token is required; refusing to start an open relay to paid APIs
gateway: no providers registered; set at least one provider API key`}</ConsoleBlock>

A `SKYL_DEFAULT_PROVIDER` naming an unregistered provider is also a startup
error, rather than a 404 discovered later.

## With no credentials at all

The sandbox stands in for a provider, so you can run the whole stack for free:

<TerminalBlock>{`# Terminal 1
go run github.com/BAGOMBEKA-JOB-DEV/skyl/cmd/skyl-sandbox

# Terminal 2
export SKYL_AUTH_TOKEN=local-dev-token
export SKYL_COMPAT_BASE_URL=http://127.0.0.1:8099/compat/v1
export SKYL_COMPAT_API_KEY=sandbox-key
export SKYL_COMPAT_NAME=sandbox
go run github.com/BAGOMBEKA-JOB-DEV/skyl/gateway/cmd/skyl-gateway`}</TerminalBlock>

Then:

<TerminalBlock>{`curl -sS localhost:8080/v1/providers -H "Authorization: Bearer local-dev-token"`}</TerminalBlock>

<ConsoleBlock>{`{"providers":["sandbox"]}`}</ConsoleBlock>

## In a container

The published image is `gcr.io/distroless/static:nonroot` with a statically
linked binary: no shell, no package manager, configuration entirely from the
environment, logs to stdout.

<TerminalBlock>docker compose up --build</TerminalBlock>

## Verifying it works

<TerminalBlock>{`curl -sS localhost:8080/v1/chat \\
  -H "Authorization: Bearer $SKYL_AUTH_TOKEN" \\
  -H 'Content-Type: application/json' \\
  -d '{
    "provider": "openai",
    "model": "gpt-5.6",
    "max_tokens": 64,
    "messages": [{"role": "user", "text": "Hello"}]
  }'`}</TerminalBlock>

Note `"text"`, not `"content"` — see the
[wire format](/reference/gateway/chat).

## Graceful shutdown

On `SIGTERM` the server **drains**: `/readyz` starts failing so a load balancer
pulls the instance, in-flight requests are allowed to finish, and only then does
the process exit. That matters more here than in most services, because an
in-flight request is a paid generation you have already been charged for.

## Troubleshooting

<Trouble problem="It exits immediately with no obvious error">

Check stderr for one of the two startup errors above. Both are deliberate
refusals, not crashes.

</Trouble>

<Trouble problem="404 on a provider I set a key for">

The variable name must match exactly: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`,
`GEMINI_API_KEY`. For a compatible host, `SKYL_COMPAT_BASE_URL` is the variable
that triggers registration.

</Trouble>

<Trouble problem="401 on every request">

The header must be `Authorization: Bearer <token>`, matching `SKYL_AUTH_TOKEN`
exactly. Comparison is constant-time, so a wrong token is indistinguishable from
a missing one by timing.

</Trouble>
