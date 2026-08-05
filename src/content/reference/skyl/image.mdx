---
title: Image
description: An image supplied to the model. Provide exactly one of Data or URL.
---

<Intro>

`Image` carries a picture as either inline bytes or a URL. Which forms work
depends on the provider, and one of them is rejected outright by Gemini.

</Intro>

## Reference

<Signature>{`type Image struct {
	MediaType string
	Data      []byte
	URL       string
}`}</Signature>

<Parameters>

- **`MediaType`** — the IANA media type, e.g. `"image/png"`. **Required when
  `Data` is set**, and enforced by `Validate`.
- **`Data`** — the **raw** image content. Not base64-encoded; the adapter does
  that.
- **`URL`** — a remotely hosted image.

</Parameters>

<Caveats>

- **Provide exactly one of `Data` or `URL`.** Setting both is accepted and one is
  **silently dropped** — Anthropic and Gemini drop the URL, the OpenAI-format
  adapters drop the data.
- **`Data` is raw bytes.** Encoding it yourself produces double-encoded content
  the model sees as noise.
- **Gemini rejects URL images** with `ErrUnsupported`, before any request is
  made. Inline bytes are the portable form.
- On an assistant message, the OpenAI-format adapters reject images entirely.
- `Validate` requires at least one of `Data`/`URL`, and `MediaType` whenever
  `Data` is present.

</Caveats>

## Usage

<Recipe title="Inline bytes, the portable form">

```go verify
data, err := os.ReadFile("chart.png")
if err != nil {
	return err
}
msg := skyl.UserImage("image/png", data, "What trend does this chart show?")
```

</Recipe>

<Recipe title="A URL, where supported">

```go
skyl.Message{
	Role:  skyl.RoleUser,
	Parts: []skyl.Part{skyl.Image{URL: "https://example.com/chart.png"}},
}
```

</Recipe>

<Recipe title="Making the ambiguous value unconstructable">

```go verify
// Two constructors cannot produce the both-set case that gets silently dropped.
func imageFromData(mediaType string, data []byte) skyl.Part {
	return skyl.Image{MediaType: mediaType, Data: data}
}
func imageFromURL(url string) skyl.Part { return skyl.Image{URL: url} }
```

</Recipe>

<Recipe title="Fetching a URL yourself for portability">

```go verify
// skyl deliberately will not fetch it for you: that would be an outbound
// request you did not ask for, to a host you did not vet.
res, err := http.Get(src)
if err != nil {
	return err
}
defer res.Body.Close()
data, err := io.ReadAll(res.Body)
if err != nil {
	return err
}
part := skyl.Image{MediaType: http.DetectContentType(data), Data: data}
```

</Recipe>

## Troubleshooting

<Trouble problem="ErrUnsupported: Gemini requires inline image data, not a URL">

Fetch the bytes yourself and send `Data`. That form works on all four adapters.

</Trouble>

<Trouble problem="The model sees garbage instead of my image">

You base64-encoded `Data` yourself. It takes raw bytes; the adapter encodes for
its own wire format.

</Trouble>

<Trouble problem="ErrBadRequest: image data needs a media type">

`MediaType` is required whenever `Data` is set — none of the wire formats can
carry bytes without a type.

</Trouble>

<Trouble problem="My URL was ignored">

You set `Data` as well. One of them is dropped, and which one depends on the
adapter. Set exactly one.

</Trouble>
