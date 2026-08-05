---
title: Installation
description: go get, the four-module split, and which Go version each part needs.
---

<Intro>

skyl is four Go modules in one repository. Which ones you install determines
what dependencies you inherit, so this page is worth two minutes even though the
command is one line.

</Intro>

<YouWillLearn>

- Which module to install, and what each one costs you
- Why the Anthropic adapter is a separate `go get`
- The Go version floor for each module, and why they differ
- How to verify the install without an API key

</YouWillLearn>

## The core library

<TerminalBlock>go get github.com/BAGOMBEKA-JOB-DEV/skyl</TerminalBlock>

That gives you the `Client`, the conversation model, streaming, the error
surface, and three of the four adapters — `openai`, `gemini`, and
`openaicompat`.

It requires **Go 1.22 or later**, and it has **zero external dependencies**.
Not "few". None. `go.mod` has no `require` block for anything outside the
standard library.

<DeepDive title="Why zero dependencies is a feature and not a boast">

Every dependency in a library is imposed on everyone who imports it, forever —
including their security scanners, their upgrade schedule, and their
vulnerability triage rota. A logging framework you chose in 2024 becomes a CVE
someone else has to respond to in 2027.

skyl's engineering rules make this concrete: the core module takes only what it
genuinely needs, and it turns out a well-written HTTP client needs nothing.
`net/http` and `encoding/json` are enough.

The consequence you can see: `go get` on skyl adds one line to your `go.sum`
tree instead of forty.

</DeepDive>

## The Anthropic adapter

Claude support is a **separate module**, and you install it explicitly:

<TerminalBlock>go get github.com/BAGOMBEKA-JOB-DEV/skyl/provider/anthropic</TerminalBlock>

It requires **Go 1.24 or later**.

The reason is the one above, applied honestly. This adapter is built on the
official `anthropic-sdk-go`, which brings roughly a dozen transitive
dependencies and sets its own Go floor. Putting it in the core module would
charge every skyl user — including people who only ever call Gemini — for a
vendor SDK they never touch.

<Note>

This is recorded as [ADR-0006](/community/adr/0006-anthropic-adapter-is-its-own-module).
The other three adapters are written directly against `net/http`, which is why
they can live in the core module.

</Note>

## The optional extras

Two more modules exist. You install them only if you want what they do.

<ModuleTable />

**`gateway`** exposes skyl over HTTP so non-Go services can reach models through
one audited egress point. **`otel`** turns skyl's hook events into
OpenTelemetry spans and metrics. Both are separate modules for the same reason
as Anthropic: chi and the OpenTelemetry SDK are real dependency graphs, and
someone importing a library should get a library.

<TerminalBlock>{`go get github.com/BAGOMBEKA-JOB-DEV/skyl/gateway
go get github.com/BAGOMBEKA-JOB-DEV/skyl/otel`}</TerminalBlock>

## Which Go version do I need?

The floors differ, and they are not arbitrary — since Go 1.21 the `go`
directive is a hard requirement rather than a suggestion, so each module
declares the floor its dependencies actually set.

<DataTable
  headers={['If you install…', 'You need']}
  rows={[
    ['just the core library', <strong key="a">Go 1.22</strong>],
    ['core + provider/anthropic', <strong key="b">Go 1.24</strong>],
    ['core + gateway or otel', <strong key="c">Go 1.25</strong>],
  ]}
/>

Check yours:

<TerminalBlock>go version</TerminalBlock>

<Pitfall>

If you are on Go 1.22 or 1.23 and add `provider/anthropic`, the build fails with
a message about the `go` directive rather than about skyl. That is Go's own
check, not skyl's — but the fix is to upgrade Go, not to downgrade the adapter.

</Pitfall>

## Verifying the install

You do not need a credential to check that it works. Run the sandbox in one
terminal:

<TerminalBlock>go run github.com/BAGOMBEKA-JOB-DEV/skyl/cmd/skyl-sandbox</TerminalBlock>

Then run this program:

```go title="verify/main.go" verify
package main

import (
	"context"
	"fmt"
	"log"

	"github.com/BAGOMBEKA-JOB-DEV/skyl"
	"github.com/BAGOMBEKA-JOB-DEV/skyl/provider/openai"
)

func main() {
	client := skyl.New(openai.New("sandbox-key",
		openai.WithBaseURL("http://127.0.0.1:8099/openai/v1")))

	resp, err := client.Complete(context.Background(), &skyl.Request{
		Model:     "gpt-5.6",
		MaxTokens: 64,
		Messages:  []skyl.Message{skyl.UserText("What is the capital of France?")},
	})
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(resp.Text())
}
```

<ConsoleBlock>Paris</ConsoleBlock>

If that prints, your install is correct and your adapter is wired properly —
without spending anything or provisioning a key.

## Adding a real credential

When you are ready, set the environment variable for whichever provider you
plan to use:

<TerminalBlock>{`export ANTHROPIC_API_KEY=sk-ant-...
export OPENAI_API_KEY=sk-...
export GEMINI_API_KEY=...`}</TerminalBlock>

skyl never reads these itself — it has no configuration layer and no
environment-variable convention. You pass the key to the provider constructor,
which means the key's lifetime and source are entirely yours to control. See
[Credentials and Environment](/learn/credentials).

<Recap>

- `go get github.com/BAGOMBEKA-JOB-DEV/skyl` — core library, Go 1.22, **zero dependencies**.
- `provider/anthropic` is a **separate module** needing Go 1.24, because it wraps the official SDK.
- `openai`, `gemini` and `openaicompat` ship inside the core module and cost you nothing.
- `gateway` and `otel` are optional modules requiring Go 1.25.
- The sandbox lets you verify the install with no API key and no cost.
- skyl reads no environment variables of its own; you pass credentials to the constructor.

</Recap>

<Challenges>

<Challenge title="Prove the dependency claim">

After `go get github.com/BAGOMBEKA-JOB-DEV/skyl`, confirm for yourself that the
core module pulls in nothing external.

<Hint>

`go list` can print a module's requirements without you reading `go.mod`.

</Hint>

<Solution>

```bash
go list -m all | grep -v '^github.com/BAGOMBEKA-JOB-DEV/skyl'
```

In a project whose only dependency is skyl, this prints your own module and
nothing else. Add `provider/anthropic` and run it again to see the difference —
that difference is exactly what [ADR-0006](/community/adr/0006-anthropic-adapter-is-its-own-module)
is protecting you from.

</Solution>

</Challenge>

<Challenge title="Point the verifier at a different sandbox mount">

The program above talks to the `openai` mount. Change it to use the `gemini`
adapter against the Gemini mount instead.

<Hint>

Each mount has its own base URL and its own model catalogue. The sandbox serves
`gemini-3.6-flash`, not `gpt-5.6`.

</Hint>

<Solution>

```go verify
client := skyl.New(gemini.New("sandbox-key",
	gemini.WithBaseURL("http://127.0.0.1:8099/gemini/v1beta")))

resp, err := client.Complete(context.Background(), &skyl.Request{
	Model:     "gemini-3.6-flash",
	MaxTokens: 64,
	Messages:  []skyl.Message{skyl.UserText("What is the capital of France?")},
})
```

Note that only the constructor and the model string changed — the `Request`,
the call, and the response handling are identical. That is the whole argument
for skyl in four lines.

</Solution>

</Challenge>

</Challenges>
