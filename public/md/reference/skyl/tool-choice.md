---
title: ToolChoice
description: Constrains whether and how the model may call tools.
---

<Intro>

`ToolChoice` is one of the few parts of skyl where all four adapters support
everything. Four modes, all mapped everywhere.

</Intro>

## Reference

<Signature>{`type ToolChoice struct {
	Mode ToolChoiceMode
	Name string
}`}</Signature>

<DataTable
  headers={['Mode', 'Value', 'Effect']}
  rows={[
    [<code key="a">ToolChoiceAuto</code>, 'auto', 'The model decides. The default.'],
    [<code key="b">ToolChoiceNone</code>, 'none', 'Tools are offered but must not be called this turn.'],
    [<code key="c">ToolChoiceRequired</code>, 'required', 'At least one call is forced.'],
    [<code key="d">ToolChoiceSpecific</code>, 'tool', <span key="e">A named tool is forced. <code>Name</code> is required.</span>],
  ]}
/>

<Caveats>

- **Nil means `ToolChoiceAuto`** — you rarely need to set it.
- **`Name` is required for `ToolChoiceSpecific`** and rejected locally otherwise:
  `tool choice "tool" requires a name`.
- `Name` is **ignored** in every other mode.
- An unknown mode is rejected by `Validate` with `ErrBadRequest`.
- With `Required`, still check the call list — compatible hosts implement
  OpenAI's *format* without always implementing its *semantics*.

</Caveats>

## Usage

<Recipe title="Forcing a final answer">

```go verify
// The cleanest way to end a tool loop: stop offering the option.
req.ToolChoice = &skyl.ToolChoice{Mode: skyl.ToolChoiceNone}
```

</Recipe>

<Recipe title="Structured output, portably">

```go
req.Tools = []skyl.Tool{extract}
req.ToolChoice = &skyl.ToolChoice{Mode: skyl.ToolChoiceSpecific, Name: "record_invoice"}

resp, err := client.Complete(ctx, req)
if err != nil {
	return err
}
calls := resp.ToolCalls()
if len(calls) == 0 {
	return errors.New("no extraction produced")
}
return json.Unmarshal(calls[0].Arguments, &invoice)
```

A forced tool call gives you structured output using machinery every provider
implements identically — unlike the native JSON modes, which differ in dialect,
guarantees and model coverage.

</Recipe>

<Recipe title="Verifying Required was honoured">

```go verify
if len(resp.ToolCalls()) == 0 {
	return fmt.Errorf("%s returned no tool call despite tool_choice=required", resp.Provider)
}
```

</Recipe>

## Troubleshooting

<Trouble problem="ErrBadRequest: tool choice “tool” requires a name">

`ToolChoiceSpecific` needs `Name` set to the tool you want forced.

</Trouble>

<Trouble problem="Setting Name with Auto did nothing">

Expected — `Name` is only read in `ToolChoiceSpecific` mode.

</Trouble>

<Trouble problem="Required produced only text on a compatible host">

Some OpenAI-compatible hosts accept `tool_choice` without enforcing it. Check
the call list and treat an empty one as an error from that host.

</Trouble>
