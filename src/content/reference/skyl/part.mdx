---
title: Part
description: One element of a message's content. A closed interface.
---

<Intro>

`Part` is deliberately closed — it has an unexported marker method, so only skyl
can implement it. That constraint turns a class of runtime bug into a compile
error.

</Intro>

## Reference

<Signature>{`type Part interface {
	isPart()
}`}</Signature>

The four implementations:

<DataTable
  headers={['Type', 'Carries']}
  rows={[
    [<a key="a" href="/reference/skyl/text">Text</a>, 'A run of plain text'],
    [<a key="b" href="/reference/skyl/image">Image</a>, 'An image, as inline bytes or a URL'],
    [<a key="c" href="/reference/skyl/tool-call">ToolCall</a>, "The model's request to invoke a tool"],
    [<a key="d" href="/reference/skyl/tool-result">ToolResult</a>, 'The outcome of a tool invocation'],
  ]}
/>

<Caveats>

- **You cannot implement it.** The marker method is unexported.
- An adapter that cannot represent a part returns
  [`ErrUnsupported`](/reference/skyl/errors/sentinels) **naming the part**,
  before sending anything — rather than dropping it silently.
- Support varies by part **and** by the role of the message carrying it.
- Because it is an interface, `Message` does not round-trip through
  `encoding/json`. Persist your own shape.

</Caveats>

## Why closed

<DeepDive title="A compile error beats a production surprise">

An open interface would let you construct a part no adapter knows how to render.
Every adapter's type switch would hit its `default` and have to either drop it
silently or fail at runtime — a bug that appears in production, on one vendor
and not another, long after the code was written.

Closed means the compiler rejects it at the point you type it. The cost is that
adding a part type requires a change to skyl. The benefit is that every part you
*can* construct is one every adapter has a defined answer for, even if that
answer is a clean `ErrUnsupported`.

If you need something skyl does not model, `ProviderOptions` is the hatch.

</DeepDive>

## What each adapter accepts

<DataTable
  headers={['Part (role)', 'anthropic', 'openai / compat', 'gemini']}
  rows={[
    ['Text (user, assistant)', 'mapped', 'mapped', 'mapped'],
    ['Text (tool role)', 'becomes user content', <strong key="a">rejected</strong>, 'becomes user content'],
    ['Image URL (user)', 'mapped', 'mapped', <strong key="b">rejected</strong>],
    ['Image data (user)', 'mapped', 'mapped', 'mapped'],
    ['Image (assistant)', 'accepted', <strong key="c">rejected</strong>, 'accepted'],
    ['ToolCall (assistant)', 'mapped', 'mapped', 'mapped'],
    ['ToolCall (user)', 'accepted', <strong key="d">rejected</strong>, 'accepted'],
    ['ToolResult (tool role)', 'mapped', 'mapped', 'mapped'],
  ]}
/>

## Usage

<Recipe title="Switching over parts">

```go verify
for _, part := range resp.Message.Parts {
	switch p := part.(type) {
	case skyl.Text:
		fmt.Print(p.Text)
	case skyl.ToolCall:
		fmt.Printf("[calling %s]", p.Name)
	case skyl.Image:
		fmt.Print("[image]")
	case skyl.ToolResult:
		fmt.Printf("[result for %s]", p.CallID)
	}
}
```

Because the interface is closed, this switch is exhaustive by construction.

</Recipe>

<Recipe title="Handling an unsupported part">

```go verify
_, err := client.Complete(ctx, req)
if errors.Is(err, skyl.ErrUnsupported) {
	// e.g. "gemini: Gemini requires inline image data, not a URL"
	var e *skyl.Error
	if errors.As(err, &e) {
		return fmt.Errorf("this model (%s) cannot handle that input: %s", e.Provider, e.Message)
	}
}
```

</Recipe>

## Troubleshooting

<Trouble problem="I want to add an audio part">

You cannot — the interface is closed. Send it through
[`ProviderOptions`](/learn/provider-options), which is the hatch for anything
skyl does not model. If several vendors support it stably, that is a good issue
to open.

</Trouble>

<Trouble problem="ErrUnsupported naming a part">

The adapter cannot represent it. The message says exactly which part and why.
This is deliberate: a silently dropped image looks like a model that ignored
your question.

</Trouble>
