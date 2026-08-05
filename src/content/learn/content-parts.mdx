---
title: Content Parts
description: The four implementations, and why the Part interface is closed.
---

<Intro>

`Part` is the element type of a message's content. It has exactly four
implementations, and the interface is closed so that only skyl can add a fifth.
That constraint is the point.

</Intro>

<YouWillLearn>

- The four part types and when each appears
- Why a closed interface turns a runtime bug into a compile error
- Which parts each adapter accepts, and on which roles
- What happens when an adapter cannot represent a part

</YouWillLearn>

## The interface

```go
type Part interface {
	isPart()
}
```

The marker method is unexported, so no package outside skyl can satisfy it. The
implementations are `Text`, `Image`, `ToolCall` and `ToolResult`.

<DeepDive title="Why closed?">

An open interface would let you construct a part no adapter knows how to render.
Every adapter's type switch would hit its `default` branch and have to either
drop it silently or fail at runtime — a bug that appears in production, against
one vendor and not another, long after the code was written.

Closed means the compiler rejects it at the point you type it. The cost is that
adding a part type requires a change to skyl. The benefit is that every part you
*can* construct is one every adapter has a defined answer for, even if that
answer is a clean `ErrUnsupported`.

</DeepDive>

## Text

```go
type Text struct{ Text string }
```

A run of plain text. `Message.Text()` concatenates every `Text` part and ignores
the others.

## Image

```go
type Image struct {
	MediaType string  // required when Data is set, e.g. "image/png"
	Data      []byte  // raw, NOT base64-encoded
	URL       string  // a remotely hosted image
}
```

Provide **exactly one** of `Data` or `URL`.

<Pitfall>

Setting both is accepted and then one of them is silently dropped — and which
one depends on the adapter. Anthropic and Gemini drop the URL; the OpenAI-format
adapters drop the data. Nothing tells you.

`Validate` only checks that *at least* one is present, because "both" is not
structurally invalid, merely ambiguous.

</Pitfall>

`Data` is raw bytes. The adapters base64-encode it themselves — Anthropic into a
`source` block, the OpenAI-format adapters into a synthesised `data:` URI,
Gemini into `inlineData`. Encoding it yourself produces double-encoded garbage.

## ToolCall

```go
type ToolCall struct {
	ID        string
	Name      string
	Arguments json.RawMessage
}
```

The model's request to invoke a tool. `Arguments` is raw JSON because skyl
cannot know your tool's schema — you unmarshal it into your own type.

`ID` correlates the call with its result. On Gemini there are no call IDs on the
wire, so the adapter sets `ID` to the **function name** — which means two
parallel calls to the same tool are indistinguishable there.

## ToolResult

```go
type ToolResult struct {
	CallID  string
	Content string
	IsError bool
}
```

`CallID` must match the `ToolCall.ID` it answers. Every provider rejects a tool
result that does not follow its call.

<Pitfall>

`IsError` reaches the model faithfully **only on Anthropic**, where it becomes a
real `is_error` boolean. The OpenAI-format adapters prefix `"error: "` to the
content and drop the flag entirely when the content is empty. Gemini drops it
completely — the signal never reaches the wire.

If you need the model to know a tool failed, say so in the text:
`"ERROR: the weather service returned 503."`

</Pitfall>

## What each adapter accepts

Support varies by part *and* by the role of the message carrying it.

<DataTable
  headers={['Part (role)', 'anthropic', 'openai / compat', 'gemini']}
  rows={[
    ['Text (user, assistant)', 'mapped', 'mapped', 'mapped'],
    ['Text (tool role)', 'becomes user content', 'rejected', 'becomes user content'],
    ['Image URL (user)', 'mapped', 'mapped', 'rejected — needs inline data'],
    ['Image data (user)', 'mapped', 'mapped', 'mapped'],
    ['Image (assistant)', 'accepted', 'rejected', 'accepted'],
    ['ToolCall (assistant)', 'mapped', 'mapped', 'mapped'],
    ['ToolCall (user)', 'accepted', 'rejected', 'accepted'],
    ['ToolResult (tool role)', 'mapped', 'mapped', 'mapped'],
  ]}
/>

"Rejected" means `ErrUnsupported`, returned **before** any request is made, with
a message naming exactly what could not be represented:

```go verify
_, err := client.Complete(ctx, req)
if errors.Is(err, skyl.ErrUnsupported) {
	// e.g. "gemini: Gemini requires inline image data, not a URL"
	log.Println(err)
}
```

That is the whole design principle in one behaviour: skyl would rather tell you
it cannot do something than do something else quietly.

<Recap>

- Four parts: `Text`, `Image`, `ToolCall`, `ToolResult`. The interface is closed.
- Closed means an unrenderable part is a compile error, not a production surprise.
- `Image` takes **exactly one** of `Data` or `URL`; setting both silently drops one.
- `Image.Data` is raw bytes — the adapter does the base64 encoding.
- `ToolResult.IsError` only reaches the model faithfully on Anthropic.
- An adapter that cannot represent a part returns `ErrUnsupported` naming it, before sending anything.

</Recap>

<Challenges>

<Challenge title="Make the image ambiguity impossible">

Write a constructor that makes it structurally impossible to set both `Data` and
`URL`.

<Hint>

Two functions beat one function with two optional fields.

</Hint>

<Solution>

```go verify
func imageFromData(mediaType string, data []byte) skyl.Part {
	return skyl.Image{MediaType: mediaType, Data: data}
}

func imageFromURL(url string) skyl.Part {
	return skyl.Image{URL: url}
}
```

Neither can produce the ambiguous value, so the silent-drop case cannot arise in
your codebase. This is the general shape of defending against a documented
`⚠️` row: constrain it at your boundary.

</Solution>

</Challenge>

<Challenge title="Report an unsupported part usefully">

Turn an `ErrUnsupported` into a message a user of your application can act on.

<Hint>

`*skyl.Error` carries the provider name and the specific message.

</Hint>

<Solution>

```go verify
var e *skyl.Error
if errors.As(err, &e) && errors.Is(err, skyl.ErrUnsupported) {
	return fmt.Errorf("this model (%s) cannot handle that input: %s", e.Provider, e.Message)
}
```

Because the adapter names the part, the message is specific enough to be shown
to a user — "cannot handle that input: Gemini requires inline image data, not a
URL" tells them to upload the file instead of pasting a link.

</Solution>

</Challenge>

</Challenges>
