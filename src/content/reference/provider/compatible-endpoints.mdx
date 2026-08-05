---
title: Compatible endpoints
description: Verified base URLs for hosts that speak OpenAI's wire format.
---

<Intro>

Every host below is reachable through
[`provider/openaicompat`](/reference/provider/openaicompat) with one constructor
and no skyl code. Four of them run on your own machine.

</Intro>

## The endpoints

<CompatEndpointTable />

<Caveats>

- **These implement OpenAI's *format*, not necessarily its *features*.** Tool
  calling, streaming and multimodal support vary by host **and** by model.
- The four with no key are local runtimes. **Omit `WithAPIKey` entirely** rather
  than passing an empty string.
- Base URLs change. If one stops working, check the vendor's documentation —
  skyl does not validate them, so a wrong URL surfaces as that host's own error.
- Always set `WithName`, or every host reports the same label.

</Caveats>

## Usage

<Recipe title="Any hosted endpoint">

```go verify
p := openaicompat.New(
	openaicompat.WithBaseURL("https://api.deepseek.com/v1"),
	openaicompat.WithAPIKey(os.Getenv("DEEPSEEK_API_KEY")),
	openaicompat.WithName("deepseek"),
)
```

</Recipe>

<Recipe title="A registry of hosts">

```go
type host struct {
	name    string
	baseURL string
	envKey  string // empty for local runtimes
}

var hosts = []host{
	{"groq", "https://api.groq.com/openai/v1", "GROQ_API_KEY"},
	{"deepseek", "https://api.deepseek.com/v1", "DEEPSEEK_API_KEY"},
	{"ollama", "http://localhost:11434/v1", ""},
}

func build(h host) skyl.Provider {
	opts := []openaicompat.Option{
		openaicompat.WithBaseURL(h.baseURL),
		openaicompat.WithName(h.name),
	}
	if h.envKey != "" {
		opts = append(opts, openaicompat.WithAPIKey(os.Getenv(h.envKey)))
	}
	return openaicompat.New(opts...)
}
```

</Recipe>

<Recipe title="Discovering what a host offers">

```go verify
// The answer comes from the host, live — so it is never stale, and it is the
// only reliable way to know what a compatible endpoint actually serves.
models, err := client.Models(ctx)
if err != nil {
	return err
}
for _, m := range models {
	fmt.Println(m.ID)
}
```

</Recipe>

## Local runtimes

Ollama, vLLM, LM Studio and llama.cpp all run on your own hardware and
authenticate nothing. This is the case that makes "develop against a local
model, deploy against a frontier one" a configuration change rather than two
code paths.

```go verify
func local() skyl.Provider {
	return openaicompat.New(
		openaicompat.WithBaseURL("http://localhost:11434/v1"),
		openaicompat.WithName("ollama"),
	)
}
```

## Troubleshooting

<Trouble problem="A 404 on every request">

Check the base URL includes the version segment. Most of these need `/v1`;
Perplexity does not.

</Trouble>

<Trouble problem="An unexpected 401 against a local runtime">

You passed `WithAPIKey("")`, which still sends an `Authorization` header. Omit
the option entirely.

</Trouble>

<Trouble problem="Model listing returns nothing useful">

Coverage is host-dependent. OpenRouter supplies display names and context
windows; most others supply only IDs. `ModelInfo.Raw` has whatever they sent.

</Trouble>
