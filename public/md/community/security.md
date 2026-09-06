---
title: Security Policy
description: Reporting a vulnerability, and the commitments skyl makes about credentials.
---

<Intro>

skyl handles credentials for paid APIs and transports user conversations. Both
make it worth a careful look — and worth a clear channel for telling the
maintainers when something is wrong.

</Intro>

## Reporting a vulnerability

**Please do not open a public issue.** Use GitHub's private vulnerability
reporting on the [skyl repository](https://github.com/BAGOMBEKA-JOB-DEV/skyl),
which creates a private advisory visible only to maintainers.

Include what you would want to receive: the version, the module, a reproduction,
and what an attacker gains. A proof of concept is more useful than a
description.

## Supported versions

**v1.x is supported.** Fixes land on `main`, ship in the next release, and are
backported to the current minor series. v0.1.0 is superseded — upgrading breaks
no API, so there is no cost to moving off it. There are no maintained backport
branches beyond the current minor. See [Versions](/community/versions).

## What skyl commits to

These are enforced by tests, not by intent:

<DataTable
  headers={['Commitment', 'How it is enforced']}
  rows={[
    ['Errors never contain credentials', 'A test asserts it. Error.Body is truncated at 2 KB and never includes headers.'],
    ['The library logs nothing', 'It has no logger and takes no logging dependency.'],
    ['Committed test fixtures contain no credentials', 'A test walks every fixture looking for credential-shaped strings.'],
    ['The gateway refuses to start without auth', 'There is no flag to disable it.'],
    ['Token comparison is constant-time', <code key="a">subtle.ConstantTimeCompare</code>],
    ['otel records no prompt content', 'Only model, sampling parameters and token counts.'],
    ['Provider error bodies are not forwarded by the gateway', 'They can echo request content to a caller who should not see it.'],
  ]}
/>

## Supply chain

The repository runs, on every change or on a schedule:

- **`govulncheck`** — known vulnerabilities in dependencies and the toolchain.
- **CodeQL** — static analysis.
- **OpenSSF Scorecard** — supply-chain posture.
- **Dependabot** — dependency updates.
- **Digest-pinned GitHub Actions** — a tag cannot be moved under you.
- **SBOM and signed build provenance** on release.
- **DCO enforcement** — every commit is signed off.

The **zero-dependency core module** is itself a supply-chain decision: there is
no third-party code in the library's own dependency graph to be compromised.

## Deployment guidance

**Run the gateway on a private network.** It is an internal service. If it must
face the internet, put a reverse proxy with TLS and rate limiting in front, and
read [Security and deployment](/reference/gateway/security).

**Never expose the sandbox.** It authenticates nothing meaningfully and binds to
loopback for that reason.

**Rotate gateway tokens routinely.** `SKYL_AUTH_TOKENS` exists so you can do it
without downtime.

## What is not a vulnerability

- **Prompt injection.** skyl transports; it does not sanitise. See the
  [Threat Model](/community/threat-model).
- **A model producing harmful output.** Refusals are surfaced, not enforced.
- **An authenticated gateway caller spending money.** That is what the token
  grants. Issue one per caller and revoke individually.
- **The Anthropic SDK's fingerprinting headers.** Documented in
  [Data Handling](/community/data-handling); skyl cannot remove them.

## See also

- [Data Handling](/community/data-handling) — what leaves your process.
- [Threat Model](/community/threat-model) — boundaries and blast radius.
