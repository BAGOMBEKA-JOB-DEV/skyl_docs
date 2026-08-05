---
title: UserImage
description: A user message carrying an image and an optional caption.
---

<Intro>

The convenience constructor for the common multimodal case: a picture plus a
question about it.

</Intro>

## Reference

<Signature>func UserImage(mediaType string, data []byte, caption string) Message</Signature>

<Parameters>

- **`mediaType`** — the IANA media type, e.g. `"image/png"`. Required.
- **`data`** — the **raw** image bytes. Not base64-encoded.
- **`caption`** — optional text. Omitted from the message entirely when empty.

</Parameters>

<Returns>

A user message with an [`Image`](/reference/skyl/image) part, followed by a
`Text` part when `caption` is non-empty.

</Returns>

<Caveats>

- It always produces the **inline-bytes** form, which is the portable one —
  Gemini rejects URL images.
- The image comes **first**, then the caption. Build the message directly if you
  need the other order or several images.
- `data` is raw. Encoding it yourself produces double-encoded content.

</Caveats>

## Usage

<Recipe title="An image with a question">

```go verify
data, err := os.ReadFile("chart.png")
if err != nil {
	return err
}

resp, err := client.Complete(ctx, &skyl.Request{
	Model:     "claude-opus-5",
	MaxTokens: 1024,
	Messages:  []skyl.Message{skyl.UserImage("image/png", data, "What trend does this show?")},
})
```

</Recipe>

<Recipe title="Several images, built directly">

```go
skyl.Message{
	Role: skyl.RoleUser,
	Parts: []skyl.Part{
		skyl.Text{Text: "Compare these:"},
		skyl.Image{MediaType: "image/png", Data: before},
		skyl.Image{MediaType: "image/png", Data: after},
	},
}
```

</Recipe>

<Recipe title="Detecting the media type">

```go verify
part := skyl.UserImage(http.DetectContentType(data), data, "Describe this.")
```

</Recipe>

## Troubleshooting

<Trouble problem="ErrBadRequest: image data needs a media type">

You passed an empty `mediaType`. Use `http.DetectContentType(data)` if you do
not know it.

</Trouble>

<Trouble problem="I want to send a URL instead">

Build the message directly with `skyl.Image{URL: ...}` — but note Gemini rejects
that form. Fetching the bytes yourself is portable.

</Trouble>
