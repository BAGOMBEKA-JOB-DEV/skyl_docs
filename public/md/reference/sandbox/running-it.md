---
title: Running the sandbox
description: Flags, mounts, credentials, and wiring each adapter.
---

<Intro>

One command, four wire protocols, no credentials. The sandbox binds to loopback
by default because it is not a security boundary.

</Intro>

## Reference

<TerminalBlock>go run ./cmd/skyl-sandbox [-addr host:port] [-api-key KEY]</TerminalBlock>

<DataTable
  headers={['Flag', 'Default', 'Purpose']}
  rows={[
    [<code key="a">-addr</code>, <code key="b">127.0.0.1:8099</code>, 'Listen address. Loopback by default, deliberately.'],
    [<code key="c">-api-key</code>, <code key="d">sandbox-key</code>, 'The credential every mount accepts.'],
  ]}
/>

Pass `-addr 127.0.0.1:0` to let the OS choose a free port — which is what you
want when starting it from tests, so parallel packages cannot collide.

## The mounts

<SandboxMountTable />

Each mount checks the header its real counterpart uses, so the adapters'
credential handling is genuinely exercised rather than bypassed. The
OpenAI-compatible mount also accepts **no credential at all**, because that is
how Ollama, LM Studio and llama.cpp behave.

## Wiring each adapter

<ProviderTabs>

```go verify
p := anthropic.New("sandbox-key",
	anthropic.WithBaseURL("http://127.0.0.1:8099/anthropic"))
// models: claude-opus-5, claude-sonnet-5, claude-haiku-4-5
```

```go verify
p := openai.New("sandbox-key",
	openai.WithBaseURL("http://127.0.0.1:8099/openai/v1"))
// models: gpt-5.6, gpt-5.4-nano
```

```go verify
p := gemini.New("sandbox-key",
	gemini.WithBaseURL("http://127.0.0.1:8099/gemini/v1beta"))
// models: gemini-3.6-flash, gemini-3.6-pro
```

```go verify
p := openaicompat.New(
	openaicompat.WithBaseURL("http://127.0.0.1:8099/compat/v1"),
	openaicompat.WithName("sandbox"),
)
// models: gpt-5.6, gpt-5.4-nano
```

</ProviderTabs>

## The model catalogue

Each mount serves a small fixed list and rejects anything else with that
provider's own 404.

<Note>

That is deliberate. skyl passes model IDs through unvalidated, so the provider's
not-found error is the only thing standing between a typo and an unactionable
failure — and a sandbox that accepted every string would never exercise it.

</Note>

## Starting it from tests

```go verify
func startSandbox(t *testing.T) string {
	t.Helper()

	// :0 asks the OS for a free port, so parallel packages cannot collide.
	cmd := exec.Command("go", "run",
		"github.com/BAGOMBEKA-JOB-DEV/skyl/cmd/skyl-sandbox", "-addr", "127.0.0.1:0")
	stderr, err := cmd.StderrPipe()
	if err != nil {
		t.Fatal(err)
	}
	if err := cmd.Start(); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = cmd.Process.Kill() })

	sc := bufio.NewScanner(stderr)
	for sc.Scan() {
		if addr := parseAddr(sc.Text()); addr != "" {
			return addr
		}
	}
	t.Fatal("sandbox did not report a listen address")
	return ""
}
```

## Troubleshooting

<Trouble problem="404 on a model I expected">

The catalogue is deliberately small. Use one of the IDs listed above, or a
`sandbox-*` fault model.

</Trouble>

<Trouble problem="401 from a mount">

Each mount checks the header its real counterpart uses — `x-api-key`,
`Authorization: Bearer`, `x-goog-api-key`. If you built the provider by hand,
check you are using the matching adapter for the mount.

</Trouble>

<Trouble problem="Can I run it on 0.0.0.0?">

You can, with `-addr`. Do not. It authenticates nothing meaningfully, and
loopback is the default for that reason.

</Trouble>
