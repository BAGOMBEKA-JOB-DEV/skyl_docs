---
title: Releasing
description: The multi-module release process. The order is not optional.
---

<Intro>

skyl is four Go modules in one repository, and releasing them has an ordering
constraint that is easy to get wrong — and permanent when you do, because tags
on the module proxy are immutable.

</Intro>

## The modules and their tags

<DataTable
  headers={['Module', 'Import path', 'Tag']}
  rows={[
    ['library', <code key="a">github.com/BAGOMBEKA-JOB-DEV/skyl</code>, <code key="b">v0.1.0</code>],
    ['Anthropic adapter', <code key="c">…/skyl/provider/anthropic</code>, <code key="d">provider/anthropic/v0.1.0</code>],
    ['OpenTelemetry', <code key="e">…/skyl/otel</code>, <code key="f">otel/v0.1.0</code>],
    ['gateway', <code key="g">…/skyl/gateway</code>, <code key="h">gateway/v0.1.0</code>],
  ]}
/>

## Run the script

<TerminalBlock>scripts/release.sh vX.Y.Z</TerminalBlock>

It performs every `go.mod` rewrite and stops between modules so you can confirm
each tag landed. **It never tags and never pushes** — those remain deliberate
human actions.

## Why a subdirectory module needs a prefixed tag

Go finds a module in a subdirectory by looking for a tag whose **prefix is that
subdirectory**. `provider/anthropic/v0.1.0` publishes the adapter; a bare
`v0.1.0` publishes only the root module.

Tagging one does not tag the other, and the version numbers do not have to move
together — though keeping them aligned is far easier to reason about.

## Why `replace` must go

<DeepDive title="The replace is not what breaks an install — it is what hides the break">

Every module except the root carries a `replace` pointing at a sibling directory
so the repository builds during development.

**A `replace` directive is honoured only in the main module.** When somebody else
runs `go get`, *their* module is the main module, so ours is ignored entirely.

That means the `require` line is the only thing a consumer's build sees — and
while it says `v0.0.0`, the resolve fails against a version that will never
exist. The `replace` made it work locally, which is exactly why nobody noticed.

Locally the repository uses a **`go.work` workspace** instead, which Go never
consults when skyl is somebody's dependency. Unlike a `replace`, it cannot leak.

CI builds every module with **`GOWORK=off`** for the same reason: with the
workspace active, a broken `require` resolves from the local directory and
nobody notices until a user tries to install a published version.

</DeepDive>

## Why the order is not optional

Each module's `require` must point at a version that **already exists on the
proxy**. So:

1. Tag and push the **root** module first.
2. Rewrite the submodules' `require` to that version, drop their `replace`, tag
   and push each.

Reversing that publishes a module requiring a version that does not exist yet —
and since **tags on the module proxy are immutable**, the fix is a new version
rather than a corrected one.

## The CI guard

<Pitfall>

CI **refuses a tag** whose modules still carry a `replace` directive or a
`v0.0.0` require. Either one publishes a module nobody can install, and the
proxy will serve it forever.

This guard exists because it already happened: before it, the install command in
the README did not work for anyone outside the repository.

</Pitfall>

## The checklist

1. `CHANGELOG.md` — move *Unreleased* to the new version, with migration notes
   for anything breaking.
2. Confirm CI is green on `main`, including the sandbox suite.
3. Run `scripts/release.sh vX.Y.Z`.
4. Tag and push the root module. Wait for the proxy.
5. Tag and push each submodule, in the order the script prompts.
6. Verify from **outside** the repository:

<TerminalBlock>{`cd $(mktemp -d) && go mod init check
GOWORK=off go get github.com/BAGOMBEKA-JOB-DEV/skyl@vX.Y.Z
GOWORK=off go get github.com/BAGOMBEKA-JOB-DEV/skyl/provider/anthropic@vX.Y.Z`}</TerminalBlock>

`GOWORK=off` matters — without it you may be resolving from a local workspace
and proving nothing.

## Go version floors

CI builds each module against **its own floor**, so a `go` directive that drifts
from what the code needs fails the build rather than reaching a user. Since Go
1.21 the directive is a hard requirement, so a floor raised carelessly locks out
users for no reason.

<ModuleTable />

## After v1.0.0

The exported API is frozen. A breaking change needs a **major** version, which in
Go means a new import path — `.../skyl/v2` — and a directory or branch to match.
That cost is deliberate: it makes breaking an explicit act rather than an
oversight.

Additions are minor releases, fixes are patches, and both appear in the
changelog. See [Versions](/community/versions).
