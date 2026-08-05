---
title: Request.Validate
description: Reports whether the request is well-formed, before any round trip.
---

<Intro>

`Validate` is what makes a malformed request fail locally instead of costing a
network call. [`Client`](/reference/skyl/client) calls it before dispatching, so
you rarely call it yourself — but it is exported, and useful at a CLI boundary.

</Intro>

## Reference

<Signature>func (r *Request) Validate() error</Signature>

<Returns>

`nil` when well-formed. Otherwise an error wrapping
[`ErrBadRequest`](/reference/skyl/errors/sentinels), with a message naming the
exact problem and, where relevant, the message and part index.

</Returns>

<Caveats>

- **It is nil-safe**: `(*Request)(nil).Validate()` returns
  `"skyl: invalid request: nil request"` rather than panicking.
- It validates **structure**, not semantics. The model string, the tool schema
  and role ordering are all deliberately unchecked.
- Adapters may impose further requirements and reject things `Validate` accepts —
  an image URL on Gemini, for instance, which fails with `ErrUnsupported`.

</Caveats>

## What it rejects

<DataTable
  headers={['Condition', 'Message']}
  rows={[
    ['nil request', 'nil request'],
    ['empty Model', 'model is required'],
    ['empty Messages', 'at least one message is required'],
    ['negative MaxTokens', 'max tokens must not be negative'],
    ['unknown Role', 'message N has invalid role "x"'],
    ['a message with no parts', 'message N has no parts'],
    ['a nil part', 'message N part M is nil'],
    ['an unknown part type', 'message N part M has unknown type T'],
    ['Image with neither Data nor URL', 'image needs data or a URL'],
    ['Image with Data but no MediaType', 'image data needs a media type'],
    ['ToolCall missing ID or Name', 'tool call needs an ID and a name'],
    ['ToolResult missing CallID', 'tool result needs a call ID'],
    ['a Tool with no name', 'tool N has no name'],
    ['an unknown ToolChoice mode', 'unknown tool choice mode "x"'],
    ['ToolChoiceSpecific with no Name', 'tool choice "tool" requires a name'],
  ]}
/>

## What it deliberately does not check

**The model string.** Validating it would eventually reject a model you are
entitled to use. See [ADR-0004](/community/adr/0004-model-ids-are-pass-through).

**Role ordering.** Providers disagree about what is legal — a leading assistant
turn, two user turns in a row — and rejecting a shape one vendor accepts would
be skyl deciding something it has no business deciding.

**The tool schema.** JSON Schema is large and versioned, and providers accept
different subsets. An invalid schema comes back as the provider's own 400, which
is more specific than anything skyl could say.

**An `Image` with both `Data` and `URL`.** Ambiguous, but not structurally
invalid — so it is accepted, and one of them is silently dropped by the adapter.

## Usage

<Recipe title="Failing fast at a CLI boundary">

```go verify
if err := req.Validate(); err != nil {
	// Reject at parse time rather than after constructing a client.
	return fmt.Errorf("your request is not well-formed: %w", err)
}
```

</Recipe>

<Recipe title="Testing what it catches">

```go verify
err := (&skyl.Request{Model: "", Messages: nil}).Validate()

fmt.Println(errors.Is(err, skyl.ErrBadRequest)) // true
fmt.Println(err)                                // skyl: invalid request: model is required
```

</Recipe>

## Troubleshooting

<Trouble problem="My request passed Validate and the provider still rejected it">

Expected. `Validate` checks structure; the provider checks semantics. An unknown
model, an invalid tool schema, or a role ordering that vendor dislikes all pass
locally and fail upstream — with a message more specific than skyl could give.

</Trouble>

<Trouble problem="I want to reject an image with both Data and URL">

`Validate` will not, because it is ambiguous rather than invalid. Constrain it at
your own boundary — two constructors instead of one struct literal:

```go verify
func imageFromData(mediaType string, data []byte) skyl.Part {
	return skyl.Image{MediaType: mediaType, Data: data}
}
func imageFromURL(url string) skyl.Part { return skyl.Image{URL: url} }
```

</Trouble>
