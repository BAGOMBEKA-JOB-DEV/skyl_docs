---
title: Custom HTTP Client
description: Proxies, transport timeouts, mTLS, and trace propagation.
---

<Intro>

The `*http.Client` is a **provider** option, not a client option — because the
adapter is what performs the request. That one line is where proxies, transport
tuning, mTLS and trace propagation all attach.

</Intro>

<YouWillLearn>

- Why it is a provider option
- How to tune the transport for LLM traffic specifically
- How to route through a corporate proxy or use mTLS
- Why you should not set `http.Client.Timeout`

</YouWillLearn>

## Setting one

```go verify
hc := &http.Client{
	Transport: &http.Transport{
		MaxIdleConns:        100,
		MaxIdleConnsPerHost: 20,
		IdleConnTimeout:     90 * time.Second,
	},
}

p := openai.New(key, openai.WithHTTPClient(hc))
```

Every adapter has the option: `anthropic.WithHTTPClient`,
`openai.WithHTTPClient`, `gemini.WithHTTPClient`,
`openaicompat.WithHTTPClient`.

<Note>

The rule for finding anything in skyl: if the behaviour is the same for every
vendor, it is a `Client` option. If it is about *how one vendor is reached*, it
is a provider option. HTTP is the latter.

</Note>

## Do not set Client.Timeout

<Pitfall>

`http.Client.Timeout` bounds the **entire** request including reading the body —
which, for a stream, is the whole generation.

Setting it to anything sane for a normal API call will sever your streams
mid-answer. Use `skyl.WithTimeout` for the per-attempt bound and a context
deadline for the call, both of which understand the difference.

```go
// DON'T: this kills every stream after 30 seconds.
hc := &http.Client{Timeout: 30 * time.Second}
```

</Pitfall>

Bound the parts that should be bounded, on the transport:

```go verify
hc := &http.Client{
	Transport: &http.Transport{
		// These bound connection setup, not the response body — so a long
		// generation is unaffected while a dead host still fails fast.
		DialContext:           (&net.Dialer{Timeout: 5 * time.Second}).DialContext,
		TLSHandshakeTimeout:   5 * time.Second,
		ResponseHeaderTimeout: 30 * time.Second,
		ExpectContinueTimeout: 1 * time.Second,
	},
}
```

`ResponseHeaderTimeout` is the useful one for streaming: it bounds how long the
provider may take to *start* responding, without bounding how long it takes to
finish.

## Connection pooling

LLM traffic is a small number of hosts with long-lived requests, which is not
what Go's defaults are tuned for. `MaxIdleConnsPerHost` defaults to **2**, so a
service making concurrent calls to one provider will churn connections and pay
TLS handshakes repeatedly.

```go
Transport: &http.Transport{
	MaxIdleConnsPerHost: 20,   // default is 2 — far too low for this traffic
	MaxIdleConns:        100,
	IdleConnTimeout:     90 * time.Second,
}
```

Share one `*http.Client` across every provider you construct. That is what makes
pooling work, and it is why the credential-rotation example keeps the HTTP
client while replacing the provider.

## A proxy

```go verify
proxyURL, err := url.Parse("http://proxy.internal:3128")
if err != nil {
	return err
}
hc := &http.Client{Transport: &http.Transport{Proxy: http.ProxyURL(proxyURL)}}
```

Or `http.ProxyFromEnvironment` to honour `HTTPS_PROXY`, which is usually what an
operator expects.

## mTLS

```go verify
cert, err := tls.LoadX509KeyPair("client.crt", "client.key")
if err != nil {
	return err
}
hc := &http.Client{
	Transport: &http.Transport{
		TLSClientConfig: &tls.Config{
			Certificates: []tls.Certificate{cert},
			MinVersion:   tls.VersionTLS12,
		},
	},
}
```

<Note>

Remember that a rejected certificate is **never retried** — it is a
misconfiguration, not a blip, and retrying would spend the whole budget to
receive the same answer while delaying the error you need to see.

</Note>

## Trace propagation

The `otel` module wraps a transport for you:

```go verify
p := openai.New(key, openai.WithHTTPClient(otel.HTTPClient(nil)))
client := skyl.New(p, otel.Hook())
```

`otel.Hook()` produces the spans and metrics; `otel.HTTPClient` puts the trace
context on the outbound request so the provider call appears as a child span.
Passing `nil` wraps `http.DefaultTransport`; pass your own client to wrap that
instead.

## Recording traffic

A custom transport is also how you inspect what skyl sends — useful when
migrating from a vendor SDK and wanting to prove the bytes did not change:

```go verify
type logging struct{ base http.RoundTripper }

func (l logging) RoundTrip(req *http.Request) (*http.Response, error) {
	// Never log the Authorization header.
	log.Printf("%s %s", req.Method, req.URL.Path)
	return l.base.RoundTrip(req)
}
```

<Recap>

- The HTTP client is a **provider** option, because the adapter performs the request.
- **Never set `http.Client.Timeout`** — it bounds body reading and will sever streams.
- Bound `DialContext`, `TLSHandshakeTimeout` and `ResponseHeaderTimeout` instead.
- Raise `MaxIdleConnsPerHost` from its default of 2; LLM traffic hits few hosts hard.
- Share one `*http.Client` across providers so pooling actually happens.
- `otel.HTTPClient(nil)` adds trace propagation; `otel.Hook()` adds spans and metrics.

</Recap>

<Challenges>

<Challenge title="Build a transport tuned for streaming">

Configure a client that fails fast on a dead host but never interrupts a long
generation.

<Hint>

Separate connection-establishment timeouts from body-reading ones. Only the
former should be bounded here.

</Hint>

<Solution>

```go verify
func streamingClient() *http.Client {
	return &http.Client{
		// Deliberately no Timeout: it would bound body reading, which for a
		// stream is the entire generation.
		Transport: &http.Transport{
			Proxy:                 http.ProxyFromEnvironment,
			DialContext:           (&net.Dialer{Timeout: 5 * time.Second, KeepAlive: 30 * time.Second}).DialContext,
			TLSHandshakeTimeout:   5 * time.Second,
			ResponseHeaderTimeout: 60 * time.Second, // time to FIRST byte only
			ExpectContinueTimeout: 1 * time.Second,
			MaxIdleConns:          100,
			MaxIdleConnsPerHost:   20,
			IdleConnTimeout:       90 * time.Second,
			ForceAttemptHTTP2:     true,
		},
	}
}
```

`ResponseHeaderTimeout` of 60 seconds is the judgement call: it is long enough
for a reasoning model to start thinking, and short enough that a black-holed
connection does not consume your whole request budget.

</Solution>

</Challenge>

</Challenges>
