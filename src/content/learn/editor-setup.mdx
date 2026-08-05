---
title: Editor Setup
description: The tooling that catches skyl mistakes before you run anything.
---

<Intro>

skyl leans on Go's type system, so a correctly configured editor catches most
mistakes as you type. Three checks in particular pay for themselves.

</Intro>

<YouWillLearn>

- Which language server and linters to run
- The two `go vet` checks that catch the most common skyl mistakes
- Why an unchecked `stream.Err()` is worth a lint rule of its own

</YouWillLearn>

## Language server

`gopls` is the only requirement, and every mainstream editor uses it.

<TerminalBlock>go install golang.org/x/tools/gopls@latest</TerminalBlock>

Because `Part` is a closed interface, gopls will complete the four
implementations — `Text`, `Image`, `ToolCall`, `ToolResult` — and reject
anything else at the point you type it, rather than at runtime.

## Vet and staticcheck

<TerminalBlock>{`go vet ./...
go install honnef.co/go/tools/cmd/staticcheck@latest && staticcheck ./...`}</TerminalBlock>

Two checks matter most for skyl code:

**`lostcancel`** catches a `context.WithTimeout` whose `cancel` is never called.
Since you bound a whole retry sequence with your own context, this is code you
will write often.

```go
// vet: the cancel function is not used on all paths
ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
resp, err := client.Complete(ctx, req)   // ← missing defer cancel()
```

**`errcheck`** (in staticcheck) catches an ignored `stream.Close()`.

<Pitfall>

The single most common skyl mistake is forgetting `stream.Err()` after the loop.

```go
for stream.Next() {
	// ...
}
// ← nothing here
```

`Next()` returning `false` means the stream **either finished or failed**, and
only `Err()` tells them apart. Without the check, a truncated response is
indistinguishable from a complete one — you get a short answer and no
indication that anything went wrong.

No standard linter catches this, because `Err()` returning a value you discard
is legal Go. It is worth a code-review habit, or a custom `ruleguard` rule.

</Pitfall>

## golangci-lint

If you already run it, the configuration skyl itself uses is a reasonable
starting point — `errcheck`, `govet`, `staticcheck`, `ineffassign`,
`unconvert`, and `bodyclose`.

```yaml title=".golangci.yml"
linters:
  enable:
    - errcheck
    - govet
    - staticcheck
    - ineffassign
    - unconvert
    - bodyclose
```

`bodyclose` is worth calling out: if you supply your own `*http.Client` via
`openai.WithHTTPClient` and wrap its transport, this catches a response body you
forgot to close in that wrapper.

<DeepDive title="Why skyl needs no code generation or build tags in your project">

Some SDKs require a generation step for typed model constants or for tool
schemas. skyl deliberately has neither: model IDs are opaque strings, and tool
parameters are a `map[string]any` holding JSON Schema.

That means no `go:generate` line, no generated file to keep in sync, and no
build tag. The build tags you will see (`sandbox`, `integration`) belong to
skyl's *own* test suite, not to code that imports it.

</DeepDive>

<Recap>

- `gopls` alone gives you completion over the closed `Part` interface.
- `go vet`'s `lostcancel` catches the missing `defer cancel()` you will write often.
- `staticcheck` catches an ignored `stream.Close()`.
- **No linter catches a missing `stream.Err()`** — make it a review habit.
- skyl requires no code generation and no build tags in your project.

</Recap>

<Challenges>

<Challenge title="Write the review checklist">

Your team is adopting skyl. Write the four-line checklist a reviewer should
apply to any diff that touches it.

<Hint>

Think about the failure modes that are silent rather than loud.

</Hint>

<Solution>

1. Is `stream.Err()` checked after every `for stream.Next()` loop?
2. Is `defer stream.Close()` present on every stream?
3. Are errors branched on with `errors.Is` against a sentinel, never on message text?
4. Is the client constructed once and reused, not per request?

Every one of these is a mistake that compiles, passes tests against a fake, and
fails quietly in production — which is exactly the kind a checklist is for.

</Solution>

</Challenge>

</Challenges>
