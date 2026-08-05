import type { GoField, GoSymbol } from '@/types';

/**
 * Every exported symbol in the core skyl module.
 *
 * Signatures transcribed from the Go source. This index drives the Reference
 * sidebar, the package overview tables, and the symbol autolinker — so a symbol
 * added here appears everywhere at once.
 */
export const coreSymbols: GoSymbol[] = [
  // ------------------------------------------------------------------ client
  {
    name: 'New',
    kind: 'func',
    module: 'skyl',
    signature: 'func New(p Provider, opts ...Option) *Client',
    summary: 'Returns a Client that dispatches to p. Panics if p is nil.',
    href: '/reference/skyl/new',
  },
  {
    name: 'Client',
    kind: 'type',
    module: 'skyl',
    signature: 'type Client struct{ ... }',
    summary:
      'Wraps a Provider with validation, retry with jittered backoff, per-attempt timeouts and hooks.',
    href: '/reference/skyl/client',
  },
  {
    name: 'Client.Complete',
    kind: 'method',
    module: 'skyl',
    signature: 'func (c *Client) Complete(ctx context.Context, req *Request) (*Response, error)',
    summary: 'Runs a request to completion, retrying retryable failures.',
    href: '/reference/skyl/client-complete',
  },
  {
    name: 'Client.Stream',
    kind: 'method',
    module: 'skyl',
    signature: 'func (c *Client) Stream(ctx context.Context, req *Request) (Stream, error)',
    summary: 'Runs a request, returning events as the model produces them. Only the handshake is retried.',
    href: '/reference/skyl/client-stream',
  },
  {
    name: 'Client.Models',
    kind: 'method',
    module: 'skyl',
    signature: 'func (c *Client) Models(ctx context.Context) ([]ModelInfo, error)',
    summary: 'Lists the models the provider currently offers, queried live.',
    href: '/reference/skyl/client-models',
  },
  {
    name: 'Client.Provider',
    kind: 'method',
    module: 'skyl',
    signature: 'func (c *Client) Provider() Provider',
    summary: 'Returns the underlying provider, for callers who want to bypass retry and validation.',
    href: '/reference/skyl/client-provider',
  },

  // ----------------------------------------------------------------- options
  {
    name: 'Option',
    kind: 'type',
    module: 'skyl',
    signature: 'type Option func(*Client)',
    summary: 'Configures a Client. Options are applied in order.',
    href: '/reference/skyl/option',
  },
  {
    name: 'WithMaxRetries',
    kind: 'option',
    module: 'skyl',
    signature: 'func WithMaxRetries(n int) Option',
    summary: 'Sets how many times a retryable failure is retried. Default 3; zero disables retries.',
    href: '/reference/skyl/with-max-retries',
  },
  {
    name: 'WithRetryDelay',
    kind: 'option',
    module: 'skyl',
    signature: 'func WithRetryDelay(base, max time.Duration) Option',
    summary: 'Sets the backoff bounds. Defaults 500ms and 30s, sampled with full jitter.',
    href: '/reference/skyl/with-retry-delay',
  },
  {
    name: 'WithRetryAfterCap',
    kind: 'option',
    module: 'skyl',
    signature: 'func WithRetryAfterCap(d time.Duration) Option',
    summary: "Bounds how long a provider's own Retry-After hint may delay a retry. Default 5 minutes.",
    href: '/reference/skyl/with-retry-after-cap',
  },
  {
    name: 'WithTimeout',
    kind: 'option',
    module: 'skyl',
    signature: 'func WithTimeout(d time.Duration) Option',
    summary: 'Bounds a single attempt — not the whole retry sequence. Default 10 minutes.',
    href: '/reference/skyl/with-timeout',
  },
  {
    name: 'WithHook',
    kind: 'option',
    module: 'skyl',
    signature: 'func WithHook(h Hook) Option',
    summary: 'Registers an observer for completed attempts. Hooks accumulate.',
    href: '/reference/skyl/with-hook',
  },

  // ----------------------------------------------------------------- request
  {
    name: 'Request',
    kind: 'type',
    module: 'skyl',
    signature: 'type Request struct{ ... }',
    summary: 'A provider-agnostic model call. The same Request can be sent to any provider.',
    href: '/reference/skyl/request',
  },
  {
    name: 'Request.Validate',
    kind: 'method',
    module: 'skyl',
    signature: 'func (r *Request) Validate() error',
    summary: 'Reports whether the request is well-formed, so a malformed one fails without a round trip.',
    href: '/reference/skyl/request-validate',
  },
  {
    name: 'Tool',
    kind: 'type',
    module: 'skyl',
    signature: 'type Tool struct{ Name, Description string; Parameters map[string]any }',
    summary: 'Describes a function the model may ask to invoke.',
    href: '/reference/skyl/tool',
  },
  {
    name: 'ToolChoice',
    kind: 'type',
    module: 'skyl',
    signature: 'type ToolChoice struct{ Mode ToolChoiceMode; Name string }',
    summary: "Constrains the model's use of tools: auto, none, required, or a named tool.",
    href: '/reference/skyl/tool-choice',
  },
  {
    name: 'Thinking',
    kind: 'type',
    module: 'skyl',
    signature: 'type Thinking struct{ Enabled bool; Effort Effort }',
    summary:
      'Requests that the model reason before answering. Support varies more than any other field.',
    href: '/reference/skyl/thinking',
  },
  {
    name: 'Effort',
    kind: 'type',
    module: 'skyl',
    signature: 'type Effort string',
    summary: 'Hints how much reasoning to spend: low, medium, high, max. A hint, not a contract.',
    href: '/reference/skyl/effort',
  },

  // ---------------------------------------------------------------- response
  {
    name: 'Response',
    kind: 'type',
    module: 'skyl',
    signature: 'type Response struct{ ... }',
    summary: 'A provider-agnostic model reply, always carrying the untouched provider body in Raw.',
    href: '/reference/skyl/response',
  },
  {
    name: 'Response.Text',
    kind: 'method',
    module: 'skyl',
    signature: 'func (r *Response) Text() string',
    summary: "The response's text content. Shorthand for Response.Message.Text().",
    href: '/reference/skyl/response-text',
  },
  {
    name: 'Response.ToolCalls',
    kind: 'method',
    module: 'skyl',
    signature: 'func (r *Response) ToolCalls() []ToolCall',
    summary: 'The tool calls the model requested, in order. Returns nil when there were none.',
    href: '/reference/skyl/response-toolcalls',
  },
  {
    name: 'Usage',
    kind: 'type',
    module: 'skyl',
    signature: 'type Usage struct{ InputTokens, OutputTokens, CacheReadTokens, CacheWriteTokens int }',
    summary:
      'Token consumption, normalised: InputTokens includes cached tokens, which the cache fields break down.',
    href: '/reference/skyl/usage',
  },
  {
    name: 'StopReason',
    kind: 'type',
    module: 'skyl',
    signature: 'type StopReason string',
    summary: 'Why the model stopped generating.',
    href: '/reference/skyl/stop-reason',
  },
  {
    name: 'ModelInfo',
    kind: 'type',
    module: 'skyl',
    signature: 'type ModelInfo struct{ ... }',
    summary: 'Describes a model a provider offers. Fields beyond ID are best-effort.',
    href: '/reference/skyl/model-info',
  },

  // ----------------------------------------------------------------- message
  {
    name: 'Message',
    kind: 'type',
    module: 'skyl',
    signature: 'type Message struct{ Role Role; Parts []Part }',
    summary: 'One turn in a conversation: a role and its ordered content.',
    href: '/reference/skyl/message',
  },
  {
    name: 'Role',
    kind: 'type',
    module: 'skyl',
    signature: 'type Role string',
    summary: 'Who produced a Message: user, assistant, or tool. There is deliberately no system role.',
    href: '/reference/skyl/role',
  },
  {
    name: 'Part',
    kind: 'interface',
    module: 'skyl',
    signature: 'type Part interface{ isPart() }',
    summary:
      'One element of a message’s content. A closed interface — only skyl can implement it.',
    href: '/reference/skyl/part',
  },
  {
    name: 'Text',
    kind: 'type',
    module: 'skyl',
    signature: 'type Text struct{ Text string }',
    summary: 'A run of plain text.',
    href: '/reference/skyl/text',
  },
  {
    name: 'Image',
    kind: 'type',
    module: 'skyl',
    signature: 'type Image struct{ MediaType string; Data []byte; URL string }',
    summary: 'An image supplied to the model. Provide exactly one of Data or URL.',
    href: '/reference/skyl/image',
  },
  {
    name: 'ToolCall',
    kind: 'type',
    module: 'skyl',
    signature: 'type ToolCall struct{ ID, Name string; Arguments json.RawMessage }',
    summary: "The model's request to invoke a tool.",
    href: '/reference/skyl/tool-call',
  },
  {
    name: 'ToolResult',
    kind: 'type',
    module: 'skyl',
    signature: 'type ToolResult struct{ CallID, Content string; IsError bool }',
    summary: 'Carries the outcome of a tool invocation back to the model.',
    href: '/reference/skyl/tool-result',
  },
  {
    name: 'UserText',
    kind: 'func',
    module: 'skyl',
    signature: 'func UserText(text string) Message',
    summary: 'A user message containing a single run of text.',
    href: '/reference/skyl/user-text',
  },
  {
    name: 'AssistantText',
    kind: 'func',
    module: 'skyl',
    signature: 'func AssistantText(text string) Message',
    summary: 'An assistant message containing a single run of text, for replaying prior turns.',
    href: '/reference/skyl/assistant-text',
  },
  {
    name: 'UserImage',
    kind: 'func',
    module: 'skyl',
    signature: 'func UserImage(mediaType string, data []byte, caption string) Message',
    summary: 'A user message carrying an image and an optional caption.',
    href: '/reference/skyl/user-image',
  },
  {
    name: 'ToolResultMessage',
    kind: 'func',
    module: 'skyl',
    signature: 'func ToolResultMessage(callID, content string) Message',
    summary: 'A tool message answering the call identified by callID.',
    href: '/reference/skyl/tool-result-message',
  },
  {
    name: 'ToolErrorMessage',
    kind: 'func',
    module: 'skyl',
    signature: 'func ToolErrorMessage(callID, content string) Message',
    summary: 'ToolResultMessage for a tool that failed.',
    href: '/reference/skyl/tool-error-message',
  },

  // ------------------------------------------------------------------ stream
  {
    name: 'Stream',
    kind: 'interface',
    module: 'skyl',
    signature: 'type Stream interface{ Next() bool; Event() StreamEvent; Err() error; Close() error }',
    summary: 'Delivers a response incrementally. A pull iterator, not a channel.',
    href: '/reference/skyl/stream',
  },
  {
    name: 'StreamEvent',
    kind: 'type',
    module: 'skyl',
    signature: 'type StreamEvent struct{ ... }',
    summary: 'One incremental update from a streaming response.',
    href: '/reference/skyl/stream-event',
  },
  {
    name: 'EventType',
    kind: 'type',
    module: 'skyl',
    signature: 'type EventType string',
    summary: 'What a StreamEvent carries: text_delta, thinking_delta, tool_call, or done.',
    href: '/reference/skyl/event-type',
  },
  {
    name: 'CollectStream',
    kind: 'func',
    module: 'skyl',
    signature: 'func CollectStream(s Stream, provider, model string) (*Response, error)',
    summary: 'Drains a stream into a single Response. Always closes the stream.',
    href: '/reference/skyl/collect-stream',
  },

  // ---------------------------------------------------------------- provider
  {
    name: 'Provider',
    kind: 'interface',
    module: 'skyl',
    signature: 'type Provider interface{ Name() string; Complete(...); Stream(...); Models(...) }',
    summary: 'The seam between skyl and a model vendor. Deliberately four methods.',
    href: '/reference/skyl/provider',
  },
  {
    name: 'Hook',
    kind: 'type',
    module: 'skyl',
    signature: 'type Hook func(ctx context.Context, ev HookEvent)',
    summary: 'Observes attempts. Runs synchronously on the calling goroutine.',
    href: '/reference/skyl/hook',
  },
  {
    name: 'HookEvent',
    kind: 'type',
    module: 'skyl',
    signature: 'type HookEvent struct{ ... }',
    summary: 'Describes one completed attempt against a provider.',
    href: '/reference/skyl/hook-event',
  },
];

/** The error-handling surface, documented as its own reference group. */
export const errorSymbols: GoSymbol[] = [
  {
    name: 'Sentinel errors',
    kind: 'var',
    module: 'skyl',
    signature: 'var ErrAuth, ErrRateLimit, ErrNotFound, ErrBadRequest, ErrServer, ErrUnsupported, ErrRefusal, ErrStreamClosed error',
    summary: 'What went wrong, independent of provider. Branch on these with errors.Is.',
    href: '/reference/skyl/errors/sentinels',
  },
  {
    name: 'Error',
    kind: 'type',
    module: 'skyl',
    signature: 'type Error struct{ Provider string; StatusCode int; Message string; Kind error; RetryAfter time.Duration; Body string }',
    summary: 'A provider failure with enough context to act on. Recovered with errors.As.',
    href: '/reference/skyl/errors/error',
  },
  {
    name: 'Error.Retryable',
    kind: 'method',
    module: 'skyl',
    signature: 'func (e *Error) Retryable() bool',
    summary: 'Reports whether retrying could plausibly succeed.',
    href: '/reference/skyl/errors/retryable',
  },
  {
    name: 'Error.Unwrap',
    kind: 'method',
    module: 'skyl',
    signature: 'func (e *Error) Unwrap() []error',
    summary:
      'Returns the sentinel and the underlying cause, so errors.Is matches both a skyl sentinel and a wrapped standard error.',
    href: '/reference/skyl/errors/unwrap',
  },
  {
    name: 'NewError',
    kind: 'func',
    module: 'skyl',
    signature: 'func NewError(provider string, status int, kind error, message string, body []byte) *Error',
    summary: 'Builds a classified provider error. Adapters use it so every failure has the same shape.',
    href: '/reference/skyl/errors/new-error',
  },
  {
    name: 'ClassifyStatus',
    kind: 'func',
    module: 'skyl',
    signature: 'func ClassifyStatus(status int) error',
    summary: 'Maps an HTTP status code onto a skyl sentinel.',
    href: '/reference/skyl/errors/classify-status',
  },
  {
    name: 'ParseRetryAfter',
    kind: 'func',
    module: 'skyl',
    signature: 'func ParseRetryAfter(v string) time.Duration',
    summary: 'Interprets a Retry-After header, in either the seconds or the HTTP-date form.',
    href: '/reference/skyl/errors/parse-retry-after',
  },
  {
    name: 'Unsupportedf',
    kind: 'func',
    module: 'skyl',
    signature: 'func Unsupportedf(provider, format string, args ...any) error',
    summary: 'Builds an ErrUnsupported naming exactly what could not be represented.',
    href: '/reference/skyl/errors/unsupportedf',
  },
];

/** Every symbol on the site, for the autolinker and the search index. */
export const allSymbols: GoSymbol[] = [...coreSymbols, ...errorSymbols];

export function findSymbol(name: string): GoSymbol | undefined {
  return allSymbols.find((s) => s.name === name);
}

// ---------------------------------------------------------------------------
// Struct field tables.
// ---------------------------------------------------------------------------

export const requestFields: GoField[] = [
  {
    name: 'Model',
    type: 'string',
    description:
      "The provider's model identifier, passed through untouched. skyl never validates it against " +
      'a list, so a model released after your skyl build works immediately — and a typo surfaces ' +
      "as the provider's own not-found error rather than a local one.",
    zeroValue: 'rejected by Validate: the model is required',
  },
  {
    name: 'System',
    type: 'string',
    description:
      'The system prompt. Adapters place it where the provider expects — a top-level field for ' +
      'Anthropic, a leading message for OpenAI, systemInstruction for Gemini.',
    zeroValue: 'no system prompt is sent',
  },
  {
    name: 'Messages',
    type: '[]Message',
    description:
      'The conversation so far. skyl does not police role ordering: providers disagree about what ' +
      'is legal, and rejecting a shape one vendor accepts would be skyl deciding something it has ' +
      'no business deciding.',
    zeroValue: 'rejected by Validate: at least one message is required',
  },
  {
    name: 'MaxTokens',
    type: 'int',
    description: 'Caps the response length.',
    zeroValue:
      "the provider's default — which for Anthropic is an error, so skyl supplies 4096 there. " +
      'A negative value is rejected by Validate.',
  },
  {
    name: 'Temperature',
    type: '*float64',
    description:
      'Sampling temperature. A non-nil value is always sent: several current reasoning models ' +
      'reject it outright, and skyl does not second-guess that, because silently dropping a field ' +
      'you set is worse than the provider’s own error.',
    zeroValue: "nil means the provider's default; leave it nil unless you mean it",
  },
  {
    name: 'TopP',
    type: '*float64',
    description: 'Nucleus sampling. Same always-sent semantics as Temperature.',
    zeroValue: "nil means the provider's default",
  },
  {
    name: 'Stop',
    type: '[]string',
    description: 'Sequences that end generation.',
    zeroValue: 'no stop sequences',
  },
  {
    name: 'Tools',
    type: '[]Tool',
    description: 'Tools the model may call. A tool with no name is rejected by Validate.',
    zeroValue: 'no tools offered',
  },
  {
    name: 'ToolChoice',
    type: '*ToolChoice',
    description:
      'Constrains whether and how the model may call tools: auto, none, required, or a named ' +
      'tool. All four modes are mapped on all four adapters.',
    zeroValue: 'nil means ToolChoiceAuto',
  },
  {
    name: 'Thinking',
    type: '*Thinking',
    description:
      'Requests reasoning. A nil pointer and a zero value mean different things: nil is "provider ' +
      'default", &Thinking{} is "explicitly off".',
    zeroValue: "nil means the provider's default",
  },
  {
    name: 'ProviderOptions',
    type: 'map[string]any',
    description:
      'An escape hatch: arbitrary vendor-specific fields merged into the outbound payload, ' +
      'overriding anything skyl set. skyl does not validate the contents — that is the point.',
    zeroValue: 'nothing extra is sent',
  },
];

export const responseFields: GoField[] = [
  {
    name: 'ID',
    type: 'string',
    description:
      "The provider's identifier for this response, when it supplies one. It is what a provider's " +
      'support team will ask you for.',
    zeroValue: 'the provider gave no ID',
  },
  {
    name: 'Provider',
    type: 'string',
    description: 'The adapter that produced this response, for example "anthropic".',
  },
  {
    name: 'Model',
    type: 'string',
    description:
      'The model that actually served the request, read from the response rather than echoed from ' +
      'the request — providers can and do serve a different model than the one asked for.',
  },
  {
    name: 'Message',
    type: 'Message',
    description:
      "The assistant's turn. Append it to your conversation before sending tool results; every " +
      'provider rejects a tool result that does not follow the call it answers.',
  },
  {
    name: 'StopReason',
    type: 'StopReason',
    description: 'Why generation ended.',
    zeroValue: 'StopUnknown means the provider reported something skyl does not model',
  },
  {
    name: 'Usage',
    type: 'Usage',
    description: 'Token consumption. Zero means "not reported", not "zero tokens".',
  },
  {
    name: 'Raw',
    type: 'json.RawMessage',
    description:
      "The provider's untouched response body. Always populated, so skyl's abstraction is never " +
      'the reason you cannot ship.',
  },
];

export const usageFields: GoField[] = [
  {
    name: 'InputTokens',
    type: 'int',
    description:
      'Every token of input, **including** any served from or written to a cache. This is what you ' +
      'are billed for.',
    zeroValue: 'not reported',
  },
  {
    name: 'OutputTokens',
    type: 'int',
    description:
      'Every token the model generated. Reasoning tokens are inside this figure — except on ' +
      'Gemini, where they are excluded entirely and this under-reports.',
    zeroValue: 'not reported',
  },
  {
    name: 'CacheReadTokens',
    type: 'int',
    description:
      'Tokens served from a prompt cache, usually at a large discount. Part of InputTokens, not ' +
      'additional to it — so this is how much of your bill was discounted.',
    zeroValue: 'not reported',
  },
  {
    name: 'CacheWriteTokens',
    type: 'int',
    description:
      'Tokens written to a prompt cache, usually at a premium. Part of InputTokens. Only Anthropic ' +
      'reports this; elsewhere it is always zero.',
    zeroValue: 'not reported',
  },
];

export const hookEventFields: GoField[] = [
  {
    name: 'Provider',
    type: 'string',
    description: 'The adapter that was called.',
  },
  {
    name: 'Model',
    type: 'string',
    description: 'The model that was *asked for*. See ResponseModel for the one that answered.',
  },
  {
    name: 'Operation',
    type: 'string',
    description: 'One of complete, stream, stream_end, or models.',
  },
  {
    name: 'Attempt',
    type: 'int',
    description: 'The zero-based retry attempt this event reports.',
  },
  {
    name: 'Duration',
    type: 'time.Duration',
    description:
      'How long the attempt took. For stream that is the handshake alone; for stream_end it is the ' +
      'whole stream, handshake included.',
  },
  {
    name: 'Err',
    type: 'error',
    description: "The attempt's error, or nil. A non-nil Err on a non-final attempt was retried.",
  },
  {
    name: 'Usage',
    type: 'Usage',
    description:
      'Token consumption. Populated for successful complete calls, and for stream_end when the ' +
      'stream ran to completion.',
  },
  {
    name: 'ResponseID',
    type: 'string',
    description: "The provider's identifier for the response, when it gave one.",
  },
  {
    name: 'ResponseModel',
    type: 'string',
    description: 'The model that actually served the request.',
  },
  {
    name: 'StopReason',
    type: 'StopReason',
    description: 'Why generation ended, for complete and a completed stream_end.',
  },
  {
    name: 'Completed',
    type: 'bool',
    description:
      'Whether a stream ran to its terminal event. Meaningful only for stream_end. False means the ' +
      'caller closed the stream early — those tokens were still generated and still billed, which ' +
      'is why the event fires anyway.',
  },
  {
    name: 'Request',
    type: '*Request',
    description:
      'The request that produced this event. **It carries the prompt.** Anything a hook does with ' +
      'it is a decision about user data: logging it verbatim ships conversation content wherever ' +
      'the logs go. Treat it as read-only; skyl reuses it across retries.',
  },
];

export const errorFields: GoField[] = [
  {
    name: 'Provider',
    type: 'string',
    description: 'The adapter that produced the failure.',
  },
  {
    name: 'StatusCode',
    type: 'int',
    description: 'The HTTP status, or 0 for transport-level failures.',
    zeroValue: 'a transport failure — a dial timeout, a reset connection',
  },
  {
    name: 'Message',
    type: 'string',
    description: "The provider's explanation, when it gave one.",
  },
  {
    name: 'Kind',
    type: 'error',
    description: 'The sentinel this failure classifies as. Unwrap returns it.',
  },
  {
    name: 'RetryAfter',
    type: 'time.Duration',
    description: 'How long the provider asked us to wait.',
    zeroValue: 'the provider did not say',
  },
  {
    name: 'Body',
    type: 'string',
    description:
      'The raw error payload, truncated at 2048 bytes. Useful when a provider reports something ' +
      'skyl does not model. An Error never contains credentials.',
  },
];

/** The stop reasons, and which provider values map onto each. */
export const stopReasons = [
  {
    constant: 'StopEndTurn',
    value: 'end_turn',
    meaning: 'The model finished naturally.',
    from: 'end_turn, stop, STOP',
  },
  {
    constant: 'StopMaxTokens',
    value: 'max_tokens',
    meaning: 'The output hit Request.MaxTokens. The response is truncated — treat it as incomplete.',
    from: 'max_tokens, length, MAX_TOKENS, model_context_window_exceeded',
  },
  {
    constant: 'StopToolUse',
    value: 'tool_use',
    meaning: 'The model wants a tool run. Execute the calls and send the results back.',
    from: 'tool_use, tool_calls, function_call',
  },
  {
    constant: 'StopStopSequence',
    value: 'stop_sequence',
    meaning:
      'A sequence from Request.Stop was produced. Only ever comes from Anthropic — OpenAI reports ' +
      'a stop-sequence hit as plain "stop", so it arrives as StopEndTurn.',
    from: 'stop_sequence (Anthropic only)',
  },
  {
    constant: 'StopRefusal',
    value: 'refusal',
    meaning:
      'The model or its safety classifiers declined. Content may be empty or partial; do not retry ' +
      'the same request.',
    from: 'refusal, content_filter, SAFETY, RECITATION, BLOCKLIST, PROHIBITED_CONTENT, SPII',
  },
  {
    constant: 'StopUnknown',
    value: 'unknown',
    meaning: 'The provider reported something skyl does not model. Read Response.Raw.',
    from: 'anything else, including pause_turn, OTHER, MALFORMED_FUNCTION_CALL',
  },
];

/** The stream event types. */
export const eventTypes = [
  {
    constant: 'EventTextDelta',
    value: 'text_delta',
    meaning: 'The next fragment of assistant text, in StreamEvent.Text. The event most callers want.',
  },
  {
    constant: 'EventThinkingDelta',
    value: 'thinking_delta',
    meaning:
      "A fragment of the model's reasoning, when the provider discloses it. Only Anthropic ever " +
      'emits this.',
  },
  {
    constant: 'EventToolCall',
    value: 'tool_call',
    meaning:
      "A completed tool call. skyl buffers partial arguments and emits this once, when the call's " +
      'JSON is whole — a half-parsed tool call is not actionable.',
  },
  {
    constant: 'EventDone',
    value: 'done',
    meaning: 'The final event of a successful stream, carrying Usage and StopReason.',
  },
];

/** The sentinel errors, with their retry semantics. */
export const sentinelErrors = [
  {
    name: 'ErrAuth',
    message: 'skyl: authentication failed',
    retried: false,
    meaning: 'The credential was missing, malformed, or rejected. The same key will fail again.',
  },
  {
    name: 'ErrRateLimit',
    message: 'skyl: rate limited',
    retried: true,
    meaning: 'The provider is throttling. Retried with backoff, honouring Retry-After.',
  },
  {
    name: 'ErrNotFound',
    message: 'skyl: not found',
    retried: false,
    meaning:
      'The model or endpoint does not exist for this account. Because model IDs pass through ' +
      'unvalidated, a typo arrives here rather than failing locally.',
  },
  {
    name: 'ErrBadRequest',
    message: 'skyl: invalid request',
    retried: false,
    meaning: 'The request was malformed. Often produced locally by Request.Validate.',
  },
  {
    name: 'ErrServer',
    message: 'skyl: provider server error',
    retried: true,
    meaning: 'The provider failed on its side. Retried with backoff.',
  },
  {
    name: 'ErrUnsupported',
    message: 'skyl: unsupported by this provider',
    retried: false,
    meaning:
      'This provider cannot express part of the request. Returned instead of silently dropping ' +
      'data, because a quietly discarded image looks like a model that ignored the question.',
  },
  {
    name: 'ErrRefusal',
    message: 'skyl: model declined the request',
    retried: false,
    meaning: 'The model or its safety classifiers declined. The same prompt gets the same answer.',
  },
  {
    name: 'ErrStreamClosed',
    message: 'skyl: stream is closed',
    retried: false,
    meaning: 'The stream was used after being closed.',
  },
];
