import type { MatrixRow, SilentlyIgnoredEntry } from '@/types';

/**
 * The provider feature matrix.
 *
 * Transcribed from `docs/feature-matrix.md` in the skyl repository, which was
 * itself written by reading the adapters. Publishing the gaps is the point: a
 * matrix that lists only the green cells is exactly what skyl's own design
 * principles reject.
 *
 * `openai` and `openaicompat` share one implementation (`internal/oai`), so
 * their cells are identical except where noted on the comparison page.
 */
export const matrixRows: MatrixRow[] = [
  // ---------------------------------------------------------------- request
  {
    id: 'model',
    feature: 'Request.Model',
    group: 'request',
    cells: {
      anthropic: { state: 'mapped', detail: 'model' },
      openai: { state: 'mapped', detail: 'model' },
      gemini: { state: 'mapped', detail: 'in the URL path, not the body' },
      openaicompat: { state: 'mapped', detail: 'model' },
    },
  },
  {
    id: 'system',
    feature: 'Request.System',
    group: 'request',
    note: 'Providers place the system prompt in three different locations; this is why skyl gives it a dedicated field instead of a role.',
    cells: {
      anthropic: { state: 'mapped', detail: 'top-level system' },
      openai: { state: 'mapped', detail: 'leading system message' },
      gemini: { state: 'mapped', detail: 'systemInstruction' },
      openaicompat: { state: 'mapped', detail: 'leading system message' },
    },
  },
  {
    id: 'messages',
    feature: 'Request.Messages',
    group: 'request',
    cells: {
      anthropic: { state: 'mapped', detail: 'messages' },
      openai: { state: 'mapped', detail: 'messages' },
      gemini: { state: 'mapped', detail: 'contents' },
      openaicompat: { state: 'mapped', detail: 'messages' },
    },
  },
  {
    id: 'max-tokens',
    feature: 'Request.MaxTokens',
    group: 'request',
    note: 'Anthropic is the only adapter that substitutes a default: its API requires the field, so skyl supplies 4096 rather than failing a request every other provider would accept.',
    cells: {
      anthropic: { state: 'mapped', detail: 'max_tokens — defaults to 4096 when unset' },
      openai: { state: 'mapped', detail: 'max_completion_tokens, omitted when 0' },
      gemini: {
        state: 'mapped',
        detail: 'generationConfig.maxOutputTokens, omitted when 0',
      },
      openaicompat: { state: 'mapped', detail: 'max_tokens, omitted when 0' },
    },
  },
  {
    id: 'temperature',
    feature: 'Request.Temperature',
    group: 'request',
    cells: {
      anthropic: { state: 'mapped', detail: 'temperature' },
      openai: { state: 'mapped', detail: 'temperature' },
      gemini: { state: 'mapped', detail: 'generationConfig.temperature' },
      openaicompat: { state: 'mapped', detail: 'temperature' },
    },
  },
  {
    id: 'top-p',
    feature: 'Request.TopP',
    group: 'request',
    cells: {
      anthropic: { state: 'mapped', detail: 'top_p' },
      openai: { state: 'mapped', detail: 'top_p' },
      gemini: { state: 'mapped', detail: 'generationConfig.topP' },
      openaicompat: { state: 'mapped', detail: 'top_p' },
    },
  },
  {
    id: 'stop',
    feature: 'Request.Stop',
    group: 'request',
    cells: {
      anthropic: { state: 'mapped', detail: 'stop_sequences' },
      openai: { state: 'mapped', detail: 'stop' },
      gemini: { state: 'mapped', detail: 'generationConfig.stopSequences' },
      openaicompat: { state: 'mapped', detail: 'stop' },
    },
  },
  {
    id: 'tools',
    feature: 'Request.Tools',
    group: 'request',
    note: 'Only Anthropic reconstructs the schema rather than passing it through verbatim.',
    cells: {
      anthropic: { state: 'mapped', detail: 'schema rebuilt — see tool schemas' },
      openai: { state: 'mapped', detail: 'parameters verbatim' },
      gemini: { state: 'mapped', detail: 'functionDeclarations, verbatim' },
      openaicompat: { state: 'mapped', detail: 'parameters verbatim' },
    },
  },
  {
    id: 'tool-choice',
    feature: 'Request.ToolChoice',
    group: 'request',
    cells: {
      anthropic: { state: 'mapped', detail: 'all four modes' },
      openai: { state: 'mapped', detail: 'all four modes' },
      gemini: { state: 'mapped', detail: 'all four modes' },
      openaicompat: { state: 'mapped', detail: 'all four modes' },
    },
  },
  {
    id: 'thinking-field',
    feature: 'Request.Thinking',
    group: 'request',
    note: 'The least uniform field in the library. See the dedicated Thinking table.',
    cells: {
      anthropic: { state: 'ignored', detail: 'partly — Effort is dropped' },
      openai: { state: 'ignored', detail: 'mostly — ignored unless Enabled and Effort are both set' },
      gemini: { state: 'mapped', detail: 'fully, including a zero budget' },
      openaicompat: { state: 'ignored', detail: 'mostly — same as openai' },
    },
  },
  {
    id: 'provider-options',
    feature: 'Request.ProviderOptions',
    group: 'request',
    note: 'Two different mechanisms. Anthropic sets by JSON path; the others shallow-merge, which will destroy sibling keys of any object you replace.',
    cells: {
      anthropic: { state: 'mapped', detail: 'JSON-path set' },
      openai: { state: 'mapped', detail: 'shallow merge' },
      gemini: { state: 'mapped', detail: 'shallow merge' },
      openaicompat: { state: 'mapped', detail: 'shallow merge' },
    },
  },

  // --------------------------------------------------------------- thinking
  {
    id: 'thinking-nil',
    feature: 'Thinking: nil',
    group: 'thinking',
    cells: {
      anthropic: { state: 'na', detail: 'nothing sent' },
      openai: { state: 'na', detail: 'nothing sent' },
      gemini: { state: 'na', detail: 'nothing sent' },
      openaicompat: { state: 'na', detail: 'nothing sent' },
    },
  },
  {
    id: 'thinking-on',
    feature: 'Thinking: {Enabled: true}, no effort',
    group: 'thinking',
    cells: {
      anthropic: { state: 'mapped', detail: 'thinking: {type: adaptive}' },
      openai: { state: 'ignored', detail: 'ignored entirely' },
      gemini: { state: 'mapped', detail: 'budget -1 (model decides)' },
      openaicompat: { state: 'ignored', detail: 'ignored entirely' },
    },
  },
  {
    id: 'thinking-off',
    feature: 'Thinking: {Enabled: false}',
    group: 'thinking',
    note: 'On OpenAI an explicit "off" does nothing. If you are turning reasoning off to control cost, it will not work there.',
    cells: {
      anthropic: { state: 'mapped', detail: 'thinking: {type: disabled}' },
      openai: { state: 'ignored', detail: 'ignored entirely' },
      gemini: { state: 'mapped', detail: 'budget 0' },
      openaicompat: { state: 'ignored', detail: 'ignored entirely' },
    },
  },
  {
    id: 'thinking-low',
    feature: 'Thinking: {Enabled: true, Effort: low}',
    group: 'thinking',
    cells: {
      anthropic: { state: 'ignored', detail: 'effort ignored, adaptive sent' },
      openai: { state: 'mapped', detail: 'reasoning_effort: low' },
      gemini: { state: 'mapped', detail: 'budget 1024' },
      openaicompat: { state: 'mapped', detail: 'reasoning_effort: low' },
    },
  },
  {
    id: 'thinking-medium',
    feature: 'Thinking: … Effort: medium',
    group: 'thinking',
    cells: {
      anthropic: { state: 'ignored', detail: 'effort ignored' },
      openai: { state: 'mapped', detail: 'reasoning_effort: medium' },
      gemini: { state: 'mapped', detail: 'budget 8192' },
      openaicompat: { state: 'mapped', detail: 'reasoning_effort: medium' },
    },
  },
  {
    id: 'thinking-high',
    feature: 'Thinking: … Effort: high',
    group: 'thinking',
    cells: {
      anthropic: { state: 'ignored', detail: 'effort ignored' },
      openai: { state: 'mapped', detail: 'reasoning_effort: high' },
      gemini: { state: 'mapped', detail: 'budget 16384' },
      openaicompat: { state: 'mapped', detail: 'reasoning_effort: high' },
    },
  },
  {
    id: 'thinking-max',
    feature: 'Thinking: … Effort: max',
    group: 'thinking',
    note: 'OpenAI does not define a "max" reasoning effort, so expect a 400.',
    cells: {
      anthropic: { state: 'ignored', detail: 'effort ignored' },
      openai: { state: 'mapped', detail: 'sent as max — OpenAI does not define this value' },
      gemini: { state: 'mapped', detail: 'budget 24576' },
      openaicompat: { state: 'mapped', detail: 'sent as max' },
    },
  },

  // ------------------------------------------------------------------ parts
  {
    id: 'text-user',
    feature: 'Text (user, assistant)',
    group: 'parts',
    cells: {
      anthropic: { state: 'mapped' },
      openai: { state: 'mapped' },
      gemini: { state: 'mapped' },
      openaicompat: { state: 'mapped' },
    },
  },
  {
    id: 'text-tool',
    feature: 'Text (tool role)',
    group: 'parts',
    cells: {
      anthropic: { state: 'mapped', detail: 'becomes user content' },
      openai: { state: 'rejected', detail: 'tool messages may only contain tool results' },
      gemini: { state: 'mapped', detail: 'becomes user content' },
      openaicompat: { state: 'rejected', detail: 'tool messages may only contain tool results' },
    },
  },
  {
    id: 'image-url',
    feature: 'Image URL (user)',
    group: 'parts',
    cells: {
      anthropic: { state: 'mapped', detail: 'source.type: url' },
      openai: { state: 'mapped', detail: 'image_url.url' },
      gemini: { state: 'rejected', detail: 'Gemini requires inline image data, not a URL' },
      openaicompat: { state: 'mapped', detail: 'image_url.url' },
    },
  },
  {
    id: 'image-data',
    feature: 'Image data (user)',
    group: 'parts',
    cells: {
      anthropic: { state: 'mapped', detail: 'base64 source' },
      openai: { state: 'mapped', detail: 'synthesised data: URI' },
      gemini: { state: 'mapped', detail: 'inlineData' },
      openaicompat: { state: 'mapped', detail: 'synthesised data: URI' },
    },
  },
  {
    id: 'image-assistant',
    feature: 'Image (assistant)',
    group: 'parts',
    cells: {
      anthropic: { state: 'mapped', detail: 'accepted — the API may not' },
      openai: { state: 'rejected', detail: 'images are only supported on user messages' },
      gemini: { state: 'mapped', detail: 'accepted' },
      openaicompat: { state: 'rejected', detail: 'images are only supported on user messages' },
    },
  },
  {
    id: 'toolcall-assistant',
    feature: 'ToolCall (assistant)',
    group: 'parts',
    cells: {
      anthropic: {
        state: 'mapped',
        detail: 'tool_use — arguments validated as JSON, rejected if malformed',
      },
      openai: { state: 'mapped', detail: 'tool_calls, arguments opaque' },
      gemini: { state: 'mapped', detail: 'functionCall, arguments opaque' },
      openaicompat: { state: 'mapped', detail: 'tool_calls, arguments opaque' },
    },
  },
  {
    id: 'toolcall-user',
    feature: 'ToolCall (user)',
    group: 'parts',
    cells: {
      anthropic: { state: 'mapped', detail: 'accepted' },
      openai: { state: 'rejected', detail: 'tool calls are only supported on assistant messages' },
      gemini: { state: 'mapped', detail: 'accepted' },
      openaicompat: {
        state: 'rejected',
        detail: 'tool calls are only supported on assistant messages',
      },
    },
  },
  {
    id: 'toolresult',
    feature: 'ToolResult (tool role)',
    group: 'parts',
    cells: {
      anthropic: { state: 'mapped', detail: 'tool_result in a user turn' },
      openai: { state: 'mapped', detail: 'tool role + tool_call_id' },
      gemini: { state: 'mapped', detail: 'functionResponse in a user turn' },
      openaicompat: { state: 'mapped', detail: 'tool role + tool_call_id' },
    },
  },
  {
    id: 'toolresult-iserror',
    feature: 'ToolResult.IsError',
    group: 'parts',
    note: 'The one to watch. Its whole purpose is telling the model a tool failed so it can adapt instead of building on a result that is not there. On Gemini that signal never arrives.',
    cells: {
      anthropic: { state: 'mapped', detail: 'real is_error boolean' },
      openai: {
        state: 'ignored',
        detail: 'lossy — prefixes "error: ", and drops the flag entirely when content is empty',
      },
      gemini: { state: 'ignored', detail: 'dropped — never reaches the wire' },
      openaicompat: { state: 'ignored', detail: 'lossy — same as openai' },
    },
  },
  {
    id: 'image-both',
    feature: 'Image with both URL and Data set',
    group: 'parts',
    cells: {
      anthropic: { state: 'ignored', detail: 'URL dropped' },
      openai: { state: 'ignored', detail: 'Data dropped' },
      gemini: { state: 'ignored', detail: 'URL dropped' },
      openaicompat: { state: 'ignored', detail: 'Data dropped' },
    },
  },

  // --------------------------------------------------------------- response
  {
    id: 'resp-text',
    feature: 'Response text',
    group: 'response',
    cells: {
      anthropic: { state: 'mapped' },
      openai: { state: 'mapped', detail: 'handles string and block-array shapes' },
      gemini: { state: 'mapped' },
      openaicompat: { state: 'mapped', detail: 'handles string and block-array shapes' },
    },
  },
  {
    id: 'resp-toolcalls',
    feature: 'Response tool calls',
    group: 'response',
    cells: {
      anthropic: { state: 'mapped' },
      openai: { state: 'mapped' },
      gemini: {
        state: 'mapped',
        detail: 'ToolCall.ID is set to the function name — Gemini issues no call IDs',
      },
      openaicompat: { state: 'mapped' },
    },
  },
  {
    id: 'resp-id',
    feature: 'Response.ID',
    group: 'response',
    cells: {
      anthropic: { state: 'mapped' },
      openai: { state: 'mapped' },
      gemini: { state: 'mapped', detail: 'responseId when present' },
      openaicompat: { state: 'mapped' },
    },
  },
  {
    id: 'resp-model',
    feature: 'Response.Model',
    group: 'response',
    cells: {
      anthropic: { state: 'mapped', detail: 'from the response' },
      openai: { state: 'mapped', detail: 'from the response' },
      gemini: { state: 'mapped', detail: 'modelVersion' },
      openaicompat: { state: 'mapped', detail: 'from the response' },
    },
  },
  {
    id: 'resp-raw',
    feature: 'Response.Raw',
    group: 'response',
    cells: {
      anthropic: { state: 'mapped', detail: 'always' },
      openai: { state: 'mapped', detail: 'always' },
      gemini: { state: 'mapped', detail: 'always' },
      openaicompat: { state: 'mapped', detail: 'always' },
    },
  },
  {
    id: 'resp-reasoning',
    feature: 'Reasoning / thinking text',
    group: 'response',
    note: 'Discarded by all four adapters. It remains in Response.Raw. On Gemini specifically, if you enable thought output through ProviderOptions the thought text arrives as an ordinary Text part and is indistinguishable from the answer.',
    cells: {
      anthropic: { state: 'ignored', detail: 'dropped' },
      openai: { state: 'ignored', detail: 'dropped' },
      gemini: { state: 'ignored', detail: 'dropped, and indistinguishable if re-enabled' },
      openaicompat: { state: 'ignored', detail: 'dropped' },
    },
  },
  {
    id: 'resp-refusal',
    feature: 'Refusals',
    group: 'response',
    cells: {
      anthropic: { state: 'mapped', detail: 'returned as StopRefusal' },
      openai: { state: 'mapped', detail: 'empty refusal becomes ErrRefusal' },
      gemini: { state: 'mapped', detail: 'blocked prompt becomes ErrRefusal' },
      openaicompat: { state: 'mapped', detail: 'empty refusal becomes ErrRefusal' },
    },
  },

  // ------------------------------------------------------------------ usage
  {
    id: 'usage-input',
    feature: 'Usage.InputTokens',
    group: 'usage',
    note: 'Providers disagree on the wire, so the adapters normalise: InputTokens is always the total input including cache.',
    cells: {
      anthropic: { state: 'mapped', detail: 'cache added in by the adapter' },
      openai: { state: 'mapped', detail: 'copied — cache is already inside the prompt count' },
      gemini: { state: 'mapped', detail: 'copied — cache is already inside the prompt count' },
      openaicompat: { state: 'mapped', detail: 'copied' },
    },
  },
  {
    id: 'usage-cache-read',
    feature: 'Usage.CacheReadTokens',
    group: 'usage',
    cells: {
      anthropic: { state: 'mapped' },
      openai: { state: 'mapped' },
      gemini: { state: 'mapped' },
      openaicompat: { state: 'mapped' },
    },
  },
  {
    id: 'usage-cache-write',
    feature: 'Usage.CacheWriteTokens',
    group: 'usage',
    note: 'Anthropic is the only source. The other wire formats have no such field.',
    cells: {
      anthropic: { state: 'mapped' },
      openai: { state: 'ignored', detail: 'always 0 — no wire field' },
      gemini: { state: 'ignored', detail: 'always 0 — no wire field' },
      openaicompat: { state: 'ignored', detail: 'always 0 — no wire field' },
    },
  },
  {
    id: 'usage-reasoning',
    feature: 'Reasoning-token counts',
    group: 'usage',
    note: "On Gemini, thoughtsTokenCount is excluded from candidatesTokenCount, so OutputTokens under-reports what you are billed.",
    cells: {
      anthropic: { state: 'ignored', detail: 'not surfaced — inside OutputTokens' },
      openai: { state: 'ignored', detail: 'not surfaced — inside OutputTokens' },
      gemini: { state: 'ignored', detail: 'not surfaced, and not counted' },
      openaicompat: { state: 'ignored', detail: 'not surfaced — inside OutputTokens' },
    },
  },

  // -------------------------------------------------------------- streaming
  {
    id: 'stream-text',
    feature: 'Text deltas',
    group: 'streaming',
    cells: {
      anthropic: { state: 'mapped' },
      openai: { state: 'mapped' },
      gemini: { state: 'mapped' },
      openaicompat: { state: 'mapped' },
    },
  },
  {
    id: 'stream-thinking',
    feature: 'Thinking deltas (EventThinkingDelta)',
    group: 'streaming',
    note: 'Anthropic is the only adapter that ever emits these.',
    cells: {
      anthropic: { state: 'mapped', detail: 'the only adapter that emits these' },
      openai: { state: 'ignored', detail: 'never emitted' },
      gemini: { state: 'ignored', detail: 'never emitted' },
      openaicompat: { state: 'ignored', detail: 'never emitted' },
    },
  },
  {
    id: 'stream-tools',
    feature: 'Streaming tool calls',
    group: 'streaming',
    cells: {
      anthropic: { state: 'mapped', detail: 'buffered, emitted whole' },
      openai: { state: 'mapped', detail: 'accumulated across frames by index' },
      gemini: { state: 'mapped', detail: 'arrive whole' },
      openaicompat: { state: 'mapped', detail: 'accumulated across frames by index' },
    },
  },
  {
    id: 'stream-done',
    feature: 'Terminal EventDone',
    group: 'streaming',
    cells: {
      anthropic: { state: 'mapped' },
      openai: { state: 'mapped' },
      gemini: { state: 'mapped' },
      openaicompat: { state: 'mapped' },
    },
  },
  {
    id: 'stream-usage',
    feature: 'Usage on the terminal event',
    group: 'streaming',
    cells: {
      anthropic: { state: 'mapped' },
      openai: {
        state: 'mapped',
        detail: 'needs the host to honour stream_options.include_usage; zero if it does not',
      },
      gemini: { state: 'mapped' },
      openaicompat: {
        state: 'mapped',
        detail: 'needs the host to honour stream_options.include_usage',
      },
    },
  },
  {
    id: 'stream-truncation',
    feature: 'Truncation detected',
    group: 'streaming',
    note: 'A stream that ends without its terminal signal is reported as an error on all three, rather than looking like a complete short answer.',
    cells: {
      anthropic: { state: 'mapped' },
      openai: { state: 'mapped' },
      gemini: { state: 'mapped' },
      openaicompat: { state: 'mapped' },
    },
  },
  {
    id: 'stream-errors',
    feature: 'Mid-stream errors surfaced',
    group: 'streaming',
    cells: {
      anthropic: { state: 'mapped' },
      openai: { state: 'mapped' },
      gemini: { state: 'mapped' },
      openaicompat: { state: 'mapped' },
    },
  },
  {
    id: 'stream-raw',
    feature: 'StreamEvent.Raw',
    group: 'streaming',
    cells: {
      anthropic: { state: 'ignored', detail: 'never populated' },
      openai: { state: 'mapped', detail: 'text deltas only' },
      gemini: { state: 'mapped', detail: 'text and tool-call events' },
      openaicompat: { state: 'mapped', detail: 'text deltas only' },
    },
  },

  // ----------------------------------------------------------------- models
  {
    id: 'models-id',
    feature: 'ModelInfo.ID / Provider / Raw',
    group: 'models',
    cells: {
      anthropic: { state: 'mapped' },
      openai: { state: 'mapped' },
      gemini: { state: 'mapped' },
      openaicompat: { state: 'mapped' },
    },
  },
  {
    id: 'models-display',
    feature: 'ModelInfo.DisplayName',
    group: 'models',
    cells: {
      anthropic: { state: 'mapped' },
      openai: { state: 'ignored', detail: "empty — OpenAI's response has no such field" },
      gemini: { state: 'mapped' },
      openaicompat: { state: 'mapped', detail: 'host-dependent (OpenRouter supplies it)' },
    },
  },
  {
    id: 'models-context',
    feature: 'ModelInfo.ContextWindow',
    group: 'models',
    cells: {
      anthropic: { state: 'mapped' },
      openai: { state: 'ignored', detail: 'empty' },
      gemini: { state: 'mapped' },
      openaicompat: { state: 'mapped', detail: 'host-dependent' },
    },
  },
  {
    id: 'models-maxout',
    feature: 'ModelInfo.MaxOutputTokens',
    group: 'models',
    cells: {
      anthropic: { state: 'mapped' },
      openai: { state: 'ignored', detail: 'never set' },
      gemini: { state: 'mapped' },
      openaicompat: { state: 'ignored', detail: 'never set' },
    },
  },
  {
    id: 'models-pagination',
    feature: 'Pagination beyond 1000 models',
    group: 'models',
    cells: {
      anthropic: { state: 'na' },
      openai: { state: 'na' },
      gemini: { state: 'ignored', detail: 'nextPageToken ignored; the list is silently truncated' },
      openaicompat: { state: 'na' },
    },
  },
];

/** Human labels for each group, used as table captions. */
export const matrixGroupLabels: Record<MatrixRow['group'], string> = {
  request: 'Request fields',
  thinking: 'Thinking',
  parts: 'Message parts',
  response: 'Responses',
  usage: 'Usage',
  streaming: 'Streaming',
  models: 'Model listing',
};

/**
 * Every case where skyl accepts something and does not do it.
 *
 * This is the list that costs you an afternoon, so it gets its own page.
 */
export const silentlyIgnored: SilentlyIgnoredEntry[] = [
  {
    id: 'thinking-effort-anthropic',
    what: 'Thinking.Effort',
    providers: ['anthropic'],
    why: "The SDK's adaptive thinking config has no budget or effort field, so there is nothing to map it onto.",
    workaround: 'Set thinking.budget_tokens through ProviderOptions, which Anthropic applies by JSON path.',
  },
  {
    id: 'thinking-openai',
    what: 'Thinking entirely, unless Enabled and Effort are both set',
    providers: ['openai', 'openaicompat'],
    why: 'The adapter maps Effort onto reasoning_effort and has nothing to send when Effort is empty. So an explicit "off" does nothing.',
    workaround: 'Send reasoning_effort yourself through ProviderOptions.',
  },
  {
    id: 'iserror',
    what: 'ToolResult.IsError',
    providers: ['gemini', 'openai', 'openaicompat'],
    why: 'Gemini has no wire field for it at all. The OpenAI-format adapters prefix "error: " to the content, and drop the flag entirely when the content is empty.',
    workaround: 'Put the failure in the result text itself so the model can read it.',
  },
  {
    id: 'schema-type',
    what: "A tool schema's top-level type, coerced to object",
    providers: ['anthropic'],
    why: "The SDK's typed schema struct forces the root type. A schema whose root is anything else is silently coerced.",
    workaround: 'Wrap a non-object schema in an object with a single property.',
  },
  {
    id: 'schema-required',
    what: "Non-string entries in a tool's required array",
    providers: ['anthropic'],
    why: 'The adapter reads required as a list of strings and discards anything else.',
    workaround: 'Keep required a plain array of strings, which is what JSON Schema specifies anyway.',
  },
  {
    id: 'image-both-set',
    what: 'Image.URL when Data is also set, or Image.Data when URL is also set',
    providers: 'all',
    why: 'Each adapter picks the form its provider prefers and drops the other.',
    workaround: 'Set exactly one of Data or URL, which is what the field documentation asks for.',
  },
  {
    id: 'gemini-pagination',
    what: 'nextPageToken on model listing beyond 1000 entries',
    providers: ['gemini'],
    why: 'The adapter does not follow the pagination cursor.',
    workaround: "Call Gemini's models endpoint directly if you need the full list.",
  },
  {
    id: 'nameless-toolcall',
    what: 'Streaming tool calls whose name never arrived',
    providers: ['openai', 'openaicompat'],
    why: 'A call accumulated across frames with no name cannot be dispatched, so it is discarded.',
    workaround: 'Read StreamEvent.Raw if you need to see the malformed frames.',
  },
  {
    id: 'non-text-blocks',
    what: 'Non-text blocks in a response content array',
    providers: ['openai', 'openaicompat'],
    why: 'The adapter extracts text blocks and ignores other block types.',
    workaround: 'Read Response.Raw.',
  },
  {
    id: 'reasoning-content',
    what: 'Reasoning/thinking content in non-streaming responses',
    providers: 'all',
    why: 'skyl models an answer, not a transcript of how it was reached. The content stays in Response.Raw.',
    workaround: 'Parse Response.Raw, or stream and read EventThinkingDelta (Anthropic only).',
  },
  {
    id: 'reasoning-tokens',
    what: 'Reasoning-token counts',
    providers: 'all',
    why: 'Usage has no field for them; they sit inside OutputTokens — except on Gemini, where they are excluded entirely.',
    workaround: 'Read the provider counters from Response.Raw for accurate cost accounting.',
  },
  {
    id: 'done-raw',
    what: 'StreamEvent.Raw on the terminal EventDone',
    providers: 'all',
    why: 'The terminal event is assembled by skyl rather than copied from one provider frame.',
    workaround: 'Accumulate the Raw payloads of the preceding events.',
  },
  {
    id: 'cache-write',
    what: 'Usage.CacheWriteTokens',
    providers: ['openai', 'gemini', 'openaicompat'],
    why: 'Only Anthropic reports a cache-write counter on the wire.',
    workaround: 'None. Treat a zero as "not reported", not as "zero tokens".',
  },
  {
    id: 'provideroptions-siblings',
    what: 'Sibling keys of any object a ProviderOptions top-level key replaces',
    providers: ['openai', 'gemini', 'openaicompat'],
    why: 'These adapters shallow-merge, so setting generationConfig replaces the whole object — destroying maxOutputTokens, temperature, topP, stopSequences and thinkingConfig.',
    workaround: 'Restate the whole object, including everything skyl would have set.',
  },
];
