import type { GatewayEndpoint, GatewayEnvVar, GoField } from '@/types';

/**
 * The gateway's HTTP surface.
 *
 * Transcribed from `gateway/server.go` and `gateway/api.go`, not from
 * `docs/gateway.md` — that file still documents the pre-0.1.0 wire format,
 * where a message's content was a bare string. The server now uses typed parts
 * and rejects unknown fields, so the older shape returns 400.
 */
export const gatewayEndpoints: GatewayEndpoint[] = [
  {
    id: 'healthz',
    method: 'GET',
    path: '/healthz',
    summary: 'Liveness. Returns 200 as long as the process is running.',
    authenticated: false,
    produces: 'text/plain',
  },
  {
    id: 'readyz',
    method: 'GET',
    path: '/readyz',
    summary:
      'Readiness. Distinct from liveness: it reports whether the server is accepting traffic, ' +
      'so a draining instance can be pulled from a load balancer before it stops.',
    authenticated: false,
    produces: 'text/plain',
  },
  {
    id: 'metrics',
    method: 'GET',
    path: '/metrics',
    summary: 'Prometheus metrics. Served only when SKYL_METRICS is enabled.',
    authenticated: false,
    produces: 'text/plain; version=0.0.4',
  },
  {
    id: 'providers',
    method: 'GET',
    path: '/v1/providers',
    summary: 'The names of every registered provider, so a client can discover what it may ask for.',
    authenticated: true,
    produces: 'application/json',
  },
  {
    id: 'models',
    method: 'GET',
    path: '/v1/models',
    summary:
      'The live model list from a provider, queried upstream rather than served from a ' +
      'compiled-in table. Takes ?provider=NAME.',
    authenticated: true,
    produces: 'application/json',
  },
  {
    id: 'chat',
    method: 'POST',
    path: '/v1/chat',
    summary: 'A completion. The response carries the assistant turn in the same shape a request takes.',
    authenticated: true,
    produces: 'application/json',
  },
  {
    id: 'chat-stream',
    method: 'POST',
    path: '/v1/chat/stream',
    summary:
      'A completion, streamed as Server-Sent Events. Flushed per event, with keep-alive frames, ' +
      'and the upstream request is cancelled as soon as the client disconnects.',
    authenticated: true,
    produces: 'text/event-stream',
  },
];

/**
 * Every `SKYL_*` variable the gateway reads.
 *
 * Everything is an environment variable; there are no flags and no config file.
 * Defaults are the ones applied in `NewServer` and `ConfigFromEnv`.
 */
export const gatewayEnvVars: GatewayEnvVar[] = [
  {
    name: 'SKYL_ADDR',
    group: 'server',
    default: ':8080',
    required: false,
    description: 'The listen address.',
  },
  {
    name: 'SKYL_AUTH_TOKEN',
    group: 'server',
    default: '—',
    required: true,
    description:
      'The bearer token callers must present. There is no flag to disable authentication: the ' +
      'server refuses to start without this, because an accidental open relay to billed ' +
      'endpoints must not be one environment variable away.',
  },
  {
    name: 'SKYL_AUTH_TOKENS',
    group: 'hardening',
    default: '—',
    required: false,
    description:
      'Additional labelled tokens, as "label:token,label:token". The label appears in logs and ' +
      'metrics; the token never does. This is what makes rotation possible without downtime.',
  },
  {
    name: 'SKYL_DEFAULT_PROVIDER',
    group: 'server',
    default: 'the alphabetically first registered provider',
    required: false,
    description:
      'The provider used when a request omits one. Naming a provider that is not registered is ' +
      'a startup error, not a runtime surprise.',
  },
  {
    name: 'SKYL_REQUEST_TIMEOUT',
    group: 'server',
    default: '120s',
    required: false,
    description:
      'Bounds a single upstream request. Applied inside each handler rather than at the router, ' +
      'so a streaming response is not severed mid-generation.',
  },
  {
    name: 'SKYL_INCLUDE_RAW',
    group: 'server',
    default: 'false',
    required: false,
    description:
      "Includes the provider's untouched response body in the `raw` field. Off by default: raw " +
      'bodies can echo request content.',
  },
  {
    name: 'ANTHROPIC_API_KEY',
    group: 'providers',
    default: '—',
    required: false,
    description: 'Registers the anthropic provider when present.',
  },
  {
    name: 'OPENAI_API_KEY',
    group: 'providers',
    default: '—',
    required: false,
    description: 'Registers the openai provider when present.',
  },
  {
    name: 'GEMINI_API_KEY',
    group: 'providers',
    default: '—',
    required: false,
    description: 'Registers the gemini provider when present.',
  },
  {
    name: 'SKYL_COMPAT_BASE_URL',
    group: 'providers',
    default: '—',
    required: false,
    description:
      'Registers an OpenAI-compatible provider pointed at this host. This is the variable that ' +
      'triggers registration; the other two refine it.',
  },
  {
    name: 'SKYL_COMPAT_NAME',
    group: 'providers',
    default: 'compat',
    required: false,
    description: 'The name the compatible provider is registered under.',
  },
  {
    name: 'SKYL_COMPAT_API_KEY',
    group: 'providers',
    default: '—',
    required: false,
    description: 'The credential for the compatible host. Omit it for Ollama, vLLM or LM Studio.',
  },
  {
    name: 'SKYL_MAX_RETRIES',
    group: 'client',
    default: '3',
    required: false,
    description: 'Passed through to skyl.WithMaxRetries on every provider client.',
  },
  {
    name: 'SKYL_RETRY_BASE_DELAY',
    group: 'client',
    default: '500ms',
    required: false,
    description: 'The base of the exponential backoff, via skyl.WithRetryDelay.',
  },
  {
    name: 'SKYL_RETRY_MAX_DELAY',
    group: 'client',
    default: '30s',
    required: false,
    description: "The ceiling on skyl's computed backoff, via skyl.WithRetryDelay.",
  },
  {
    name: 'SKYL_RETRY_AFTER_CAP',
    group: 'client',
    default: '5m',
    required: false,
    description:
      "Bounds how long a provider's own Retry-After hint may delay a retry. Separate from the " +
      'backoff ceiling, because a provider asking for 60 seconds is a normal rate-limit window ' +
      'while one asking for an hour should not wedge the caller.',
  },
  {
    name: 'SKYL_ATTEMPT_TIMEOUT',
    group: 'client',
    default: '10m',
    required: false,
    description:
      'Bounds a single attempt, via skyl.WithTimeout. Per attempt, not per call — the retry ' +
      'sequence as a whole is bounded by SKYL_REQUEST_TIMEOUT.',
  },
  {
    name: 'SKYL_MAX_CONCURRENT',
    group: 'hardening',
    default: 'unlimited',
    required: false,
    description:
      'Caps in-flight requests using chi’s Throttle middleware. Set it: an unbounded gateway ' +
      'converts a traffic spike into a provider rate-limit incident.',
  },
  {
    name: 'SKYL_ALLOWED_ORIGINS',
    group: 'hardening',
    default: 'CORS disabled',
    required: false,
    description:
      'A comma-separated allow-list of browser origins. Leave it unset unless a browser calls ' +
      'the gateway directly — which means shipping a token to the browser, so think first.',
  },
  {
    name: 'SKYL_HEARTBEAT_INTERVAL',
    group: 'hardening',
    default: '15s',
    required: false,
    description:
      'How often an SSE keep-alive frame is written on an idle stream, so proxies do not time ' +
      'the connection out mid-generation.',
  },
  {
    name: 'SKYL_METRICS',
    group: 'observability',
    default: 'false',
    required: false,
    description:
      'Enables /metrics and installs the telemetry hook on every provider client, so the ' +
      'metrics cover all providers rather than whichever one happened to be wired first.',
  },
];

/** The middleware stack, outermost first. */
export const gatewayMiddleware = [
  {
    name: 'RequestID',
    detail: 'A correlation ID per request, echoed back as X-Request-Id.',
  },
  {
    name: 'Recoverer',
    detail: 'A panicking handler returns 500 rather than killing the process.',
  },
  {
    name: 'Structured logging (log/slog)',
    detail:
      'Method, path, status, duration and request ID only — never headers, never bodies. ' +
      'The caller label from SKYL_AUTH_TOKENS is included; the token itself is not.',
  },
  {
    name: 'CORS',
    detail: 'Only when SKYL_ALLOWED_ORIGINS is set.',
  },
  {
    name: 'Bearer authentication',
    detail:
      'Constant-time comparison via subtle.ConstantTimeCompare. Skipped only for /healthz, ' +
      '/readyz and /metrics.',
  },
  {
    name: 'Throttle',
    detail: 'Only when SKYL_MAX_CONCURRENT is set.',
  },
];

/** `ChatRequest` — the body of POST /v1/chat and POST /v1/chat/stream. */
export const chatRequestFields: GoField[] = [
  {
    name: 'Provider',
    type: 'string',
    json: 'provider',
    description: 'Which registered provider to use.',
    zeroValue: 'the gateway’s default provider',
  },
  {
    name: 'Model',
    type: 'string',
    json: 'model',
    description: 'The provider’s model identifier, passed through untouched.',
    zeroValue: 'rejected — the model is required',
  },
  {
    name: 'System',
    type: 'string',
    json: 'system',
    description: 'The system prompt. The gateway places it where each provider expects.',
    zeroValue: 'no system prompt',
  },
  {
    name: 'Messages',
    type: '[]ChatMessage',
    json: 'messages',
    description: 'The conversation so far. Must not be empty.',
    zeroValue: 'rejected',
  },
  {
    name: 'MaxTokens',
    type: 'int',
    json: 'max_tokens',
    description: 'Caps the response length.',
    zeroValue: "the provider's default, which for Anthropic means skyl supplies 4096",
  },
  {
    name: 'Temperature',
    type: '*float64',
    json: 'temperature',
    description: 'Sampling temperature. Sent only when present.',
    zeroValue: 'omitted',
  },
  {
    name: 'TopP',
    type: '*float64',
    json: 'top_p',
    description: 'Nucleus sampling. Sent only when present.',
    zeroValue: 'omitted',
  },
  {
    name: 'Stop',
    type: '[]string',
    json: 'stop',
    description: 'Sequences that end generation.',
    zeroValue: 'none',
  },
  {
    name: 'Tools',
    type: '[]ChatTool',
    json: 'tools',
    description: 'Tools the model may call.',
    zeroValue: 'no tools offered',
  },
  {
    name: 'ToolChoice',
    type: '*ChatToolChoice',
    json: 'tool_choice',
    description: 'Constrains tool use: auto, none, required, or a named tool.',
    zeroValue: 'auto',
  },
  {
    name: 'Thinking',
    type: '*ChatThinking',
    json: 'thinking',
    description: 'Requests reasoning. Support varies sharply by provider.',
    zeroValue: "the provider's default",
  },
  {
    name: 'ProviderOptions',
    type: 'map[string]any',
    json: 'provider_options',
    description:
      'Vendor-specific fields merged into the outbound payload, overriding anything skyl set.',
    zeroValue: 'nothing extra sent',
  },
];

/** `ChatMessage` — one turn, in the same shape on the way in and the way out. */
export const chatMessageFields: GoField[] = [
  {
    name: 'Role',
    type: 'string',
    json: 'role',
    description: 'One of user, assistant, or tool.',
  },
  {
    name: 'Text',
    type: 'string',
    json: 'text',
    description:
      'Shorthand for a turn whose content is a single run of text. Use it instead of Content ' +
      'for the common case.',
    zeroValue: 'no shorthand text; Content is used',
  },
  {
    name: 'Content',
    type: '[]ChatPart',
    json: 'content',
    description:
      'Typed content parts. This is what makes a tool-calling loop expressible: an assistant ' +
      'turn containing tool calls can be sent back verbatim.',
    zeroValue: 'no parts; Text is used',
  },
];

/** `ChatPart` — one element of a message's content. */
export const chatPartFields: GoField[] = [
  {
    name: 'Type',
    type: 'string',
    json: 'type',
    description: 'One of text, image, tool_call, or tool_result.',
  },
  { name: 'Text', type: 'string', json: 'text', description: 'For type: text.' },
  {
    name: 'MediaType',
    type: 'string',
    json: 'media_type',
    description: 'For type: image with inline data — the IANA media type, e.g. image/png.',
  },
  {
    name: 'Data',
    type: 'string',
    json: 'data',
    description: 'For type: image — base64-encoded image content.',
  },
  {
    name: 'URL',
    type: 'string',
    json: 'url',
    description: 'For type: image — a remotely hosted image. Gemini rejects this form.',
  },
  {
    name: 'ID',
    type: 'string',
    json: 'id',
    description: 'For type: tool_call — the call identifier the provider generated.',
  },
  {
    name: 'Name',
    type: 'string',
    json: 'name',
    description: 'For type: tool_call — the tool the model wants to run.',
  },
  {
    name: 'Arguments',
    type: 'json.RawMessage',
    json: 'arguments',
    description: 'For type: tool_call — the JSON object the model produced.',
  },
  {
    name: 'ToolCallID',
    type: 'string',
    json: 'tool_call_id',
    description: 'For type: tool_result — must match the tool_call it answers.',
  },
  {
    name: 'Content',
    type: 'string',
    json: 'content',
    description: "For type: tool_result — the tool's output, rendered as text.",
  },
  {
    name: 'IsError',
    type: 'bool',
    json: 'is_error',
    description:
      'For type: tool_result — reports that the tool failed. Reaches the model faithfully only ' +
      'on Anthropic.',
  },
];

/** `ChatResponse` — the body of a successful POST /v1/chat. */
export const chatResponseFields: GoField[] = [
  { name: 'ID', type: 'string', json: 'id', description: "The provider's response identifier." },
  {
    name: 'Provider',
    type: 'string',
    json: 'provider',
    description: 'The adapter that produced this response.',
  },
  {
    name: 'Model',
    type: 'string',
    json: 'model',
    description:
      'The model that actually served the request, read from the response rather than echoed.',
  },
  {
    name: 'Text',
    type: 'string',
    json: 'text',
    description: 'Every text part concatenated — the convenience field for the common case.',
  },
  {
    name: 'Message',
    type: 'ChatMessage',
    json: 'message',
    description:
      "The assistant's turn, in the same shape a request takes, so it can be appended to your " +
      'conversation and replayed verbatim. This is what makes the tool loop work over HTTP.',
  },
  {
    name: 'StopReason',
    type: 'string',
    json: 'stop_reason',
    description: 'Why generation ended.',
  },
  {
    name: 'ToolCalls',
    type: '[]ChatToolCall',
    json: 'tool_calls',
    description: 'The tool calls the model requested, lifted out of Message for convenience.',
  },
  { name: 'Usage', type: 'ChatUsage', json: 'usage', description: 'Token consumption.' },
  {
    name: 'Raw',
    type: 'json.RawMessage',
    json: 'raw',
    description: "The provider's untouched body. Present only when SKYL_INCLUDE_RAW is on.",
  },
];

/**
 * How an upstream skyl error maps onto an HTTP status and a machine-readable
 * `kind`.
 *
 * The one to read twice is `ErrAuth`. It becomes **502, not 401** — because the
 * caller's token was fine and *ours* was not. Returning 401 would tell a client
 * to re-authenticate, when the actual fix is an operator rotating a provider
 * key. The 401 in this table's place is reserved for a caller presenting a bad
 * gateway token, which is a different failure entirely.
 *
 * The provider's raw body is never forwarded: it can echo request content back
 * to a caller who should not see it.
 */
export const gatewayStatusMap = [
  {
    sentinel: 'ErrAuth',
    status: 502,
    kind: 'auth',
    note: "The gateway's own provider credential was rejected. Not 401 — the caller did nothing wrong.",
  },
  {
    sentinel: 'ErrRateLimit',
    status: 429,
    kind: 'rate_limit',
    note: 'Returned only after skyl exhausted its retries upstream.',
  },
  {
    sentinel: 'ErrNotFound',
    status: 404,
    kind: 'not_found',
    note: 'No such model for this account — usually a typo, since model IDs are not validated.',
  },
  {
    sentinel: 'ErrBadRequest',
    status: 400,
    kind: 'bad_request',
    note: 'Malformed request, caught by local validation or by the provider.',
  },
  {
    sentinel: 'ErrUnsupported',
    status: 400,
    kind: 'unsupported',
    note: 'The provider cannot express part of the request — an image URL on Gemini, say.',
  },
  {
    sentinel: 'ErrRefusal',
    status: 422,
    kind: 'refusal',
    note: 'The model or its safety classifiers declined. Do not retry the same request.',
  },
  {
    sentinel: 'ErrServer',
    status: 502,
    kind: 'server',
    note: 'The provider failed on its side.',
  },
  {
    sentinel: '(anything else)',
    status: 502,
    kind: 'unknown',
    note: 'The default. 502 is the fallback for an unclassified upstream failure.',
  },
];

/** Statuses the gateway itself returns, before any upstream call happens. */
export const gatewayLocalStatusMap = [
  {
    status: 401,
    kind: 'auth',
    note: 'The caller presented a missing or wrong bearer token.',
  },
  {
    status: 400,
    kind: 'bad_request',
    note:
      'Invalid JSON, or an unknown field. DisallowUnknownFields is on, so a newer client against ' +
      'an older gateway gets a 400 rather than a silent ignore — upgrade gateways first.',
  },
  {
    status: 404,
    kind: 'not_found',
    note: 'The named provider is not registered on this gateway.',
  },
];
