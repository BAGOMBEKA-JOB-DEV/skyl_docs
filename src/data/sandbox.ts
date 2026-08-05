/**
 * The local sandbox: a server speaking every provider's wire protocol, with no
 * credentials and no cost.
 *
 * It is what makes "run every example on this site without an API key" a real
 * promise rather than a marketing line. Transcribed from `docs/sandbox.md` and
 * `internal/sandbox/`.
 */

export const sandboxMounts = [
  {
    provider: 'anthropic',
    url: 'http://127.0.0.1:8099/anthropic',
    authHeader: 'x-api-key',
    models: ['claude-opus-5', 'claude-sonnet-5', 'claude-haiku-4-5'],
  },
  {
    provider: 'openai',
    url: 'http://127.0.0.1:8099/openai/v1',
    authHeader: 'Authorization: Bearer',
    models: ['gpt-5.6', 'gpt-5.4-nano'],
  },
  {
    provider: 'gemini',
    url: 'http://127.0.0.1:8099/gemini/v1beta',
    authHeader: 'x-goog-api-key',
    models: ['gemini-3.6-flash', 'gemini-3.6-pro'],
  },
  {
    provider: 'openaicompat',
    url: 'http://127.0.0.1:8099/compat/v1',
    authHeader: 'Authorization: Bearer (or none)',
    models: ['gpt-5.6', 'gpt-5.4-nano'],
  },
];

/**
 * Model IDs that make the sandbox fail on purpose.
 *
 * These exist because the failure paths are the hardest thing to exercise: you
 * cannot wait for a provider to rate-limit you on demand, and a status fixed
 * before the SSE header is written cannot model a stream that dies halfway.
 */
export const sandboxFaults = [
  {
    model: 'sandbox-status-<code>',
    effect: "Returns that HTTP status in the provider's own error shape.",
    exercises:
      'Error classification and the retry loop. 429 also carries a Retry-After header, so ' +
      "backoff's preference for the provider's own hint is covered.",
    example: 'sandbox-status-429 → errors.Is(err, skyl.ErrRateLimit)',
  },
  {
    model: 'sandbox-stream-truncate',
    effect: 'Ends the stream mid-generation with no terminal event.',
    exercises:
      'Truncation detection. A connection dropped mid-generation reaches EOF with no reader ' +
      'error, so without this check a partial answer looks like a complete one.',
    example: 'stream.Err() reports the response is truncated',
  },
  {
    model: 'sandbox-stream-error',
    effect: 'Emits an error frame after the stream has started.',
    exercises:
      'Mid-stream error handling — structurally unreachable via sandbox-status-NNN, since the ' +
      'status is fixed once the SSE header is written.',
    example: 'stream.Err() returns a classified provider error',
  },
];

/** The three test suites, and the gap between the second and the third. */
export const testSuites = [
  {
    command: 'go test ./...',
    needs: 'nothing',
    inCI: true,
    proves: 'Mapping logic, in process.',
  },
  {
    command: 'go test -tags=sandbox ./...',
    needs: 'nothing',
    inCI: true,
    proves: 'The full stack over real sockets — chunked SSE, connection reuse, status codes, cancellation landing mid-backoff.',
  },
  {
    command: 'go test -tags=integration ./...',
    needs: 'real API keys, money',
    inCI: false,
    proves: 'That the field names are actually right. This is the one only you can run.',
  },
];
