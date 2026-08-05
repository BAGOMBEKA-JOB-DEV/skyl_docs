import type { Sidebar } from './types';

/**
 * The Reference track: one page per symbol, rigidly templated.
 *
 * Grouped by module rather than by topic, because skyl's module split is
 * load-bearing: a reader needs to know whether a symbol costs them a
 * dependency.
 */
export const sidebarReference: Sidebar = [
  {
    title: 'skyl@0.1.0',
    items: [
      { title: 'Overview', path: '/reference/skyl' },
      {
        title: 'Client',
        path: '/reference/skyl/client',
        children: [
          { title: 'New', path: '/reference/skyl/new' },
          { title: 'Client.Complete', path: '/reference/skyl/client-complete' },
          { title: 'Client.Stream', path: '/reference/skyl/client-stream' },
          { title: 'Client.Models', path: '/reference/skyl/client-models' },
          { title: 'Client.Provider', path: '/reference/skyl/client-provider' },
        ],
      },
      {
        title: 'Options',
        path: '/reference/skyl/option',
        children: [
          { title: 'WithMaxRetries', path: '/reference/skyl/with-max-retries' },
          { title: 'WithRetryDelay', path: '/reference/skyl/with-retry-delay' },
          { title: 'WithRetryAfterCap', path: '/reference/skyl/with-retry-after-cap' },
          { title: 'WithTimeout', path: '/reference/skyl/with-timeout' },
          { title: 'WithHook', path: '/reference/skyl/with-hook' },
        ],
      },
      {
        title: 'Requests',
        path: '/reference/skyl/request',
        children: [
          { title: 'Request.Validate', path: '/reference/skyl/request-validate' },
          { title: 'Tool', path: '/reference/skyl/tool' },
          { title: 'ToolChoice', path: '/reference/skyl/tool-choice' },
          { title: 'Thinking', path: '/reference/skyl/thinking' },
          { title: 'Effort', path: '/reference/skyl/effort' },
        ],
      },
      {
        title: 'Responses',
        path: '/reference/skyl/response',
        children: [
          { title: 'Response.Text', path: '/reference/skyl/response-text' },
          { title: 'Response.ToolCalls', path: '/reference/skyl/response-toolcalls' },
          { title: 'Usage', path: '/reference/skyl/usage' },
          { title: 'StopReason', path: '/reference/skyl/stop-reason' },
          { title: 'ModelInfo', path: '/reference/skyl/model-info' },
        ],
      },
      {
        title: 'Messages',
        path: '/reference/skyl/message',
        children: [
          { title: 'Role', path: '/reference/skyl/role' },
          { title: 'Part', path: '/reference/skyl/part' },
          { title: 'Text', path: '/reference/skyl/text' },
          { title: 'Image', path: '/reference/skyl/image' },
          { title: 'ToolCall', path: '/reference/skyl/tool-call' },
          { title: 'ToolResult', path: '/reference/skyl/tool-result' },
          { title: 'UserText', path: '/reference/skyl/user-text' },
          { title: 'AssistantText', path: '/reference/skyl/assistant-text' },
          { title: 'UserImage', path: '/reference/skyl/user-image' },
          { title: 'ToolResultMessage', path: '/reference/skyl/tool-result-message' },
          { title: 'ToolErrorMessage', path: '/reference/skyl/tool-error-message' },
        ],
      },
      {
        title: 'Streaming',
        path: '/reference/skyl/stream',
        children: [
          { title: 'StreamEvent', path: '/reference/skyl/stream-event' },
          { title: 'EventType', path: '/reference/skyl/event-type' },
          { title: 'CollectStream', path: '/reference/skyl/collect-stream' },
        ],
      },
      {
        title: 'Providers and hooks',
        path: '/reference/skyl/provider',
        children: [
          { title: 'Hook', path: '/reference/skyl/hook' },
          { title: 'HookEvent', path: '/reference/skyl/hook-event' },
        ],
      },
      {
        title: 'Errors',
        path: '/reference/skyl/errors',
        children: [
          { title: 'Sentinel errors', path: '/reference/skyl/errors/sentinels' },
          { title: 'Error', path: '/reference/skyl/errors/error' },
          { title: 'Error.Retryable', path: '/reference/skyl/errors/retryable' },
          { title: 'Error.Unwrap', path: '/reference/skyl/errors/unwrap' },
          { title: 'NewError', path: '/reference/skyl/errors/new-error' },
          { title: 'ClassifyStatus', path: '/reference/skyl/errors/classify-status' },
          { title: 'ParseRetryAfter', path: '/reference/skyl/errors/parse-retry-after' },
          { title: 'Unsupportedf', path: '/reference/skyl/errors/unsupportedf' },
        ],
      },
    ],
  },
  {
    title: 'provider',
    items: [
      { title: 'Overview', path: '/reference/provider' },
      { title: 'anthropic', path: '/reference/provider/anthropic', badge: 'own module' },
      { title: 'openai', path: '/reference/provider/openai' },
      { title: 'gemini', path: '/reference/provider/gemini' },
      { title: 'openaicompat', path: '/reference/provider/openaicompat' },
      { title: 'Compatible endpoints', path: '/reference/provider/compatible-endpoints' },
      { title: 'Feature matrix', path: '/reference/provider/feature-matrix' },
      { title: 'Silently ignored', path: '/reference/provider/silently-ignored' },
    ],
  },
  {
    title: 'gateway',
    items: [
      { title: 'Overview', path: '/reference/gateway' },
      { title: 'Running it', path: '/reference/gateway/running-it' },
      { title: 'Configuration', path: '/reference/gateway/configuration' },
      { title: 'POST /v1/chat', path: '/reference/gateway/chat' },
      { title: 'POST /v1/chat/stream', path: '/reference/gateway/chat-stream' },
      { title: 'GET /v1/models', path: '/reference/gateway/models' },
      { title: 'GET /v1/providers', path: '/reference/gateway/providers' },
      { title: 'Health and metrics', path: '/reference/gateway/health-and-metrics' },
      { title: 'Security and deployment', path: '/reference/gateway/security' },
    ],
  },
  {
    title: 'otel',
    items: [
      { title: 'Overview', path: '/reference/otel' },
      { title: 'Hook', path: '/reference/otel/hook' },
      { title: 'HTTPClient', path: '/reference/otel/http-client' },
      { title: 'Spans and metrics', path: '/reference/otel/spans-and-metrics' },
    ],
  },
  {
    title: 'Rules of skyl',
    items: [
      { title: 'Overview', path: '/reference/rules' },
      { title: 'Model IDs are pass-through', path: '/reference/rules/model-ids-are-pass-through' },
      { title: 'The abstraction must be escapable', path: '/reference/rules/escapable' },
      { title: 'Never silently drop data', path: '/reference/rules/never-drop-data' },
      { title: 'Dependencies are a tax', path: '/reference/rules/dependencies-are-a-tax' },
    ],
  },
  {
    title: 'Sandbox',
    items: [
      { title: 'Overview', path: '/reference/sandbox' },
      { title: 'Running it', path: '/reference/sandbox/running-it' },
      { title: 'Forcing failures', path: '/reference/sandbox/forcing-failures' },
      { title: 'The three test suites', path: '/reference/sandbox/test-suites' },
    ],
  },
];
