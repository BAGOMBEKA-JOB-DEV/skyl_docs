---
title: provider/gemini
description: Gemini, native. Handles the structural differences so your Request does not have to.
---

<Intro>

Gemini's API is shaped differently from the others — `contents` rather than
`messages`, a `model` role rather than `assistant`, `systemInstruction` rather
than a system message. The adapter absorbs all of that.

</Intro>

## Reference

<Signature>func New(apiKey string, opts ...Option) *Provider</Signature>

<Parameters>

- **`apiKey`** — sent as the `x-goog-api-key` header.
- **`opts`** — functional options, applied in order.

</Parameters>

<ProviderOptionTable provider="gemini" />

<Caveats>

- **`Model` goes in the URL path**, not the request body — a structural
  difference the adapter hides.
- **URL images are rejected** with `ErrUnsupported`: *"Gemini requires inline
  image data, not a URL"*. Inline bytes are the portable form.
- **`ToolCall.ID` is set to the function name**, because Gemini issues no call
  IDs. Two parallel calls to the same tool are indistinguishable by ID — pair by
  **position**.
- **`ToolResult.IsError` is dropped entirely.** The signal never reaches the
  wire, so the model cannot tell a tool failed.
- **`OutputTokens` under-reports.** `thoughtsTokenCount` is excluded from
  `candidatesTokenCount`, so reasoning tokens are billed but not counted.
- **Any function call forces `StopToolUse`** regardless of the real
  `finishReason` — so a response can be both truncated and reported as
  `tool_use`.
- **Model listing ignores `nextPageToken`**; beyond 1000 models the list is
  silently truncated.
- **`ProviderOptions` is a shallow top-level merge**, and `generationConfig` is
  the object people most often destroy with it.

</Caveats>

## What only this adapter does

`Request.Thinking` maps **completely** here, including `&Thinking{Enabled:
false}` as a zero budget — which neither Anthropic (no effort field) nor OpenAI
(ignores it) can do.

<DataTable
  headers={['Thinking value', 'Wire budget']}
  rows={[
    ['{Enabled: false}', '0'],
    ['{Enabled: true}, no effort', '-1 (model decides)'],
    ['Effort: low', '1024'],
    ['Effort: medium', '8192'],
    ['Effort: high', '16384'],
    ['Effort: max', '24576'],
  ]}
/>

## Usage

<Recipe title="Constructing">

```go verify
client := skyl.New(gemini.New(os.Getenv("GEMINI_API_KEY")))
```

</Recipe>

<Recipe title="Portable images">

```go verify
// Fetch the bytes yourself: the URL form is rejected here.
data, err := os.ReadFile("chart.png")
if err != nil {
	return err
}
msg := skyl.UserImage("image/png", data, "What does this show?")
```

</Recipe>

<Recipe title="Accurate token counts">

```go verify
var raw struct {
	UsageMetadata struct {
		ThoughtsTokenCount int `json:"thoughtsTokenCount"`
	} `json:"usageMetadata"`
}
if err := json.Unmarshal(resp.Raw, &raw); err == nil {
	billed := resp.Usage.OutputTokens + raw.UsageMetadata.ThoughtsTokenCount
	_ = billed
}
```

</Recipe>

<Recipe title="Setting a seed without destroying generationConfig">

```go verify
gen := map[string]any{"seed": 7}
// The merge is shallow, so restate everything skyl would have set.
if req.MaxTokens > 0 {
	gen["maxOutputTokens"] = req.MaxTokens
}
if req.Temperature != nil {
	gen["temperature"] = *req.Temperature
}
if len(req.Stop) > 0 {
	gen["stopSequences"] = req.Stop
}
req.ProviderOptions = map[string]any{"generationConfig": gen}
```

</Recipe>

## Troubleshooting

<Trouble problem="ErrUnsupported on an image">

You sent a URL. Fetch the bytes and send `Data`.

</Trouble>

<Trouble problem="The model ignored that a tool failed">

`IsError` never reaches the wire here. Put the failure in the result text.

</Trouble>

<Trouble problem="Parallel calls to the same tool got mixed up">

`ToolCall.ID` is the function name here, so both calls share an ID. Pair results
by position rather than by ID.

</Trouble>

<Trouble problem="My cost report is lower than the invoice">

`OutputTokens` excludes reasoning tokens on Gemini. Add `thoughtsTokenCount`
from `Raw`.

</Trouble>

<Trouble problem="Enabling thought output produced confusing answers">

Thought text arrives as an ordinary `Text` part and is **indistinguishable from
the answer**, so `resp.Text()` contains the scratchpad. Parse `Raw` and filter
by the thought flag if you enable it.

</Trouble>

<ValidationSnapshot />
