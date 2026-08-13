# Security policy

## Reporting a vulnerability

**Do not open a public issue for a security vulnerability.**

Report it privately through
[GitHub Security Advisories](https://github.com/BAGOMBEKA-JOB-DEV/skyl_docs/security/advisories/new)
on this repository.

### What to expect, and the honest limit

- **Acknowledgement within 3 working days.**
- **An assessment within 10 working days.**
- **Disclosure once a fix is released**, or after 90 days, whichever comes first.

There is **one maintainer**, and no rota covering illness or holiday. If a
report goes unanswered past 10 working days, treat that as the process having
failed rather than the report being dismissed, and disclose on whatever timeline
you judge right.

## What belongs here

This is a **static documentation site**. It has no server, no database, no
authentication and no user input: `npm run build` produces a static export in
`out/` that is served as files. That removes most of the surface a web
application normally has.

Report **here**:

- a supply-chain problem in the dependency tree — this is the real risk, given
  the size of the npm graph behind Next.js
- a build-time issue: a script or GitHub workflow that could be made to run
  untrusted code or leak a token
- content that leaks something it should not — a real API key in an example, an
  internal hostname, a credential in a screenshot

Report in **[skyl](https://github.com/BAGOMBEKA-JOB-DEV/skyl/security/policy)**
anything about the library or gateway themselves. A wrong code sample here is a
documentation bug; the same flaw in the library is a security issue there.

Report in
**[skyl_infrastructure](https://github.com/BAGOMBEKA-JOB-DEV/skyl_infrastructure/security/policy)**
anything about deploying the gateway.

### Documentation that is wrong about security *is* a security issue

If a page here tells you to do something unsafe — disable TLS verification, put
a key somewhere it should not go, run the gateway without authentication — that
is worth reporting privately even though it is "only docs". Someone will copy
it.

## Snippets are compiled, not proofread

`npm run check:snippets` extracts every Go block marked `verify`, assembles each
into its own package against a real skyl checkout, and type-checks it. So a
sample cannot silently drift from the library's actual API.

It checks that code **compiles**, not that it is **safe**. A snippet can be
perfectly valid Go and still be poor advice.

## Credentials

No credential belongs in this repository, including in an example. Examples use
obvious placeholders (`sk-ant-...`), and the sandbox exists precisely so the
documentation can show working code with no key at all.

If you believe a real key has been committed here, report it privately using the
advisory link above and **do not** open a PR removing it — a PR is public and
points straight at the secret. Rotate it first; assume anything pushed to a
public repository is already compromised.

## Supported versions

The `main` branch, as deployed. The site is not released or versioned.
