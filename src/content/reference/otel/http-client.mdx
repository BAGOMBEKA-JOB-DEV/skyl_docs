---
title: otel.HTTPClient
description: Wraps a transport so trace context reaches the provider.
---

<Intro>

[`Hook`](/reference/otel/hook) produces spans and metrics for skyl's own
operations. `HTTPClient` adds the outbound HTTP request as a child span, and
propagates trace context to the provider.

</Intro>

## Reference

<Signature>func HTTPClient(base *http.Client) *http.Client</Signature>

<Parameters>

- **`base`** — the client to wrap. **Pass `nil`** to wrap
  `http.DefaultTransport`.

</Parameters>

<Returns>

An `*http.Client` whose transport injects trace context and records a span per
request.

</Returns>

<Caveats>

- It is a **provider** option target, not a client one — the adapter performs the
  request:
  `openai.New(key, openai.WithHTTPClient(otel.HTTPClient(nil)))`.
- **Do not set `http.Client.Timeout` on the client you pass in.** It bounds the
  entire request including body reading, which for a stream is the whole
  generation.
- It complements `Hook` rather than replacing it. Use both.
- Wrapping your own tuned client preserves your transport settings.

</Caveats>

## Usage

<Recipe title="The default transport">

```go verify
client := skyl.New(
	openai.New(key, openai.WithHTTPClient(otel.HTTPClient(nil))),
	otel.Hook(),
)
```

</Recipe>

<Recipe title="Wrapping a tuned client">

```go verify
hc := &http.Client{
	// No Timeout: it would sever streams. Bound the phases instead.
	Transport: &http.Transport{
		Proxy:                 http.ProxyFromEnvironment,
		DialContext:           (&net.Dialer{Timeout: 5 * time.Second}).DialContext,
		TLSHandshakeTimeout:   5 * time.Second,
		ResponseHeaderTimeout: 60 * time.Second,
		MaxIdleConnsPerHost:   20, // default is 2 — far too low for this traffic
	},
}

p := openai.New(key, openai.WithHTTPClient(otel.HTTPClient(hc)))
```

</Recipe>

<Recipe title="Across every provider">

```go verify
// Share one instrumented client so pooling works and every provider is traced.
traced := otel.HTTPClient(hc)

clients := map[string]*skyl.Client{
	"openai": skyl.New(openai.New(oaKey, openai.WithHTTPClient(traced)), otel.Hook()),
	"gemini": skyl.New(gemini.New(gKey, gemini.WithHTTPClient(traced)), otel.Hook()),
}
```

</Recipe>

## Troubleshooting

<Trouble problem="Provider calls do not appear as child spans">

You wired `Hook` but not `HTTPClient`. They do different jobs: the hook records
skyl's operation, the client records the HTTP request underneath it.

</Trouble>

<Trouble problem="My streams die after 30 seconds">

The client you passed in has a `Timeout` set. That bounds body reading, which
for a stream is the whole generation. Remove it.

</Trouble>

<Trouble problem="My transport settings disappeared">

Pass your client as `base` rather than `nil`. Passing `nil` wraps the default
transport and discards nothing — but it also uses none of your tuning.

</Trouble>
