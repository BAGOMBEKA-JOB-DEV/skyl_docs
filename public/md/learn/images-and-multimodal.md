---
title: Images and Multimodal
description: Two forms, three adapters, and the one that rejects URLs outright.
---

<Intro>

An image is a `Part`, so it sits in a message alongside text. There are two
forms — inline bytes or a URL — and which ones work depends on the provider.

</Intro>

<YouWillLearn>

- The two image forms, and which adapters accept each
- Why `Data` is raw bytes rather than base64
- What happens when you set both `Data` and `URL`
- How to detect an unsupported form before shipping

</YouWillLearn>

## Sending an image

The convenience constructor covers the usual case — an image plus a question:

```go verify
data, err := os.ReadFile("chart.png")
if err != nil {
	return err
}

resp, err := client.Complete(ctx, &skyl.Request{
	Model:     "claude-opus-5",
	MaxTokens: 1024,
	Messages: []skyl.Message{
		skyl.UserImage("image/png", data, "What trend does this chart show?"),
	},
})
```

`UserImage` builds a message with an `Image` part followed by a `Text` part.
Build it manually when you need a different order or several images.

```go
skyl.Message{
	Role: skyl.RoleUser,
	Parts: []skyl.Part{
		skyl.Text{Text: "Compare these two:"},
		skyl.Image{MediaType: "image/png", Data: before},
		skyl.Image{MediaType: "image/png", Data: after},
	},
}
```

## Raw bytes, not base64

```go
type Image struct {
	MediaType string  // required when Data is set
	Data      []byte  // RAW — the adapter encodes it
	URL       string
}
```

Each adapter encodes for its own wire format: Anthropic into a base64 `source`
block, the OpenAI-format adapters into a synthesised `data:` URI, Gemini into
`inlineData`. Encoding it yourself produces double-encoded content that the
model sees as noise.

`MediaType` is required whenever `Data` is set, and `Validate` enforces it —
none of the wire formats can carry bytes without a type.

## URLs

```go
skyl.Message{
	Role:  skyl.RoleUser,
	Parts: []skyl.Part{skyl.Image{URL: "https://example.com/chart.png"}},
}
```

<Pitfall>

**Gemini rejects this outright** with `ErrUnsupported`: *"Gemini requires inline
image data, not a URL"*. It is returned before any request is made, so it costs
you nothing — but it means a URL-based flow that works on Anthropic and OpenAI
fails entirely on Gemini.

If you support multiple providers, fetch the bytes yourself and send `Data`.
That form works everywhere.

</Pitfall>

## Setting both is a silent drop

```go
// Ambiguous. Validate accepts it; the adapters disagree about what it means.
skyl.Image{MediaType: "image/png", Data: data, URL: "https://…"}
```

<DataTable
  headers={['Adapter', 'What it drops']}
  rows={[
    ['anthropic', 'the URL'],
    ['gemini', 'the URL'],
    ['openai / openaicompat', 'the Data'],
  ]}
/>

Nothing tells you. This is entry 6 in the
[silently ignored list](/reference/provider/silently-ignored), and the defence
is to make the ambiguous value unconstructable in your own code — two
constructors instead of one struct literal.

## Images on assistant turns

`Image` on a `RoleAssistant` message is accepted by Anthropic and Gemini and
**rejected** by the OpenAI-format adapters with *"images are only supported on
user messages"*. In practice you rarely want this; it comes up when replaying a
conversation that a multimodal model produced.

## Detecting support before you ship

Because unsupported forms return `ErrUnsupported` *before* any network call, you
can probe cheaply:

```go verify
func supportsImageURLs(ctx context.Context, c *skyl.Client, model string) bool {
	_, err := c.Complete(ctx, &skyl.Request{
		Model:     model,
		MaxTokens: 1,
		Messages: []skyl.Message{{
			Role:  skyl.RoleUser,
			Parts: []skyl.Part{skyl.Image{URL: "https://example.com/x.png"}},
		}},
	})
	// ErrUnsupported is produced locally, so a false answer costs nothing.
	return !errors.Is(err, skyl.ErrUnsupported)
}
```

<DeepDive title="Why rejection beats silent conversion">

skyl could fetch the URL for you on Gemini and send the bytes. It deliberately
does not.

Fetching a URL from inside a library means making an outbound request the caller
did not ask for, to a host the caller did not vet, from a process that may sit
inside a network boundary — and then charging them for the tokens. It also
silently changes the failure mode: a 404 on the image becomes a model error
rather than a fetch error.

`ErrUnsupported` names the problem and hands the decision back. Three lines of
`http.Get` in your code is a better trade than a surprise egress in a library.

</DeepDive>

<Recap>

- Provide **exactly one** of `Data` or `URL`; setting both silently drops one.
- `Data` is raw bytes — the adapter does the base64 encoding.
- `MediaType` is required with `Data`, and `Validate` enforces it.
- **Gemini rejects URL images** with `ErrUnsupported`, before sending anything.
- Inline bytes are the portable form; use them if you target more than one provider.
- Images on assistant turns are rejected by the OpenAI-format adapters.

</Recap>

<Challenges>

<Challenge title="Write a portable image helper">

Write a function that takes either a URL or a file path and always produces an
image part that works on every adapter.

<Hint>

The portable form is inline bytes. `http.DetectContentType` can supply the media
type.

</Hint>

<Solution>

```go verify
func imagePart(ctx context.Context, src string) (skyl.Part, error) {
	var data []byte
	var err error

	if strings.HasPrefix(src, "http://") || strings.HasPrefix(src, "https://") {
		// Fetch it ourselves so Gemini gets inline data, and so the egress is
		// visible in our own code rather than hidden in a library.
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, src, nil)
		if err != nil {
			return nil, err
		}
		res, err := http.DefaultClient.Do(req)
		if err != nil {
			return nil, err
		}
		defer res.Body.Close()
		if res.StatusCode != http.StatusOK {
			return nil, fmt.Errorf("fetching %s: %s", src, res.Status)
		}
		data, err = io.ReadAll(res.Body)
		if err != nil {
			return nil, err
		}
	} else {
		data, err = os.ReadFile(src)
		if err != nil {
			return nil, err
		}
	}

	return skyl.Image{MediaType: http.DetectContentType(data), Data: data}, nil
}
```

Now the same call path works on all four adapters, and a broken URL is a fetch
error you can report precisely rather than a model error you have to guess at.

</Solution>

</Challenge>

</Challenges>
