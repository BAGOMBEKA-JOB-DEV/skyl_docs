import type { Sidebar } from './types';

/**
 * The Learn track: narrative, progressive, read in order.
 *
 * A GET STARTED section, then chapters that each open with an overview page and
 * expand into focused child pages.
 */
export const sidebarLearn: Sidebar = [
  {
    title: 'Get started',
    items: [
      {
        title: 'Quick Start',
        path: '/learn',
        description: 'An introduction to 80% of the skyl you will use daily.',
        children: [
          {
            title: 'Tutorial: A Streaming Chat CLI',
            path: '/learn/tutorial-chat-cli',
            description: 'Build a real terminal chat client, end to end, with no API key.',
          },
          {
            title: 'Thinking in skyl',
            path: '/learn/thinking-in-skyl',
            description: 'The mental model: a seam, a wrapper, and two escape hatches.',
          },
        ],
      },
      {
        title: 'Installation',
        path: '/learn/installation',
        description: 'go get, the module split, and which Go version you need.',
        children: [
          {
            title: 'Choosing a Provider',
            path: '/learn/choosing-a-provider',
            description: 'Native adapter or the compatible one, and how to decide.',
          },
          {
            title: 'Running Without an API Key',
            path: '/learn/without-an-api-key',
            description: 'The sandbox speaks every wire protocol locally, for free.',
          },
          {
            title: 'Adding skyl to an Existing Project',
            path: '/learn/adding-to-an-existing-project',
            description: 'Introducing skyl beside a vendor SDK you already use.',
          },
        ],
      },
      {
        title: 'Setup',
        path: '/learn/setup',
        description: 'Editor, credentials, and a development loop that costs nothing.',
        children: [
          {
            title: 'Editor Setup',
            path: '/learn/editor-setup',
            description: 'gopls, staticcheck, and the settings that catch skyl mistakes early.',
          },
          {
            title: 'Credentials and Environment',
            path: '/learn/credentials',
            description: 'Where keys should live, and where they must not.',
          },
          {
            title: 'Sandbox Setup',
            path: '/learn/sandbox-setup',
            description: 'Wiring each adapter at the sandbox, and forcing failures on demand.',
          },
        ],
      },
    ],
  },
  {
    title: 'Learn skyl',
    items: [
      {
        title: 'Describing a Request',
        path: '/learn/describing-a-request',
        description: 'Everything that goes into a call, and what each provider does with it.',
        children: [
          { title: 'Your First Call', path: '/learn/your-first-call' },
          { title: 'Messages and Roles', path: '/learn/messages-and-roles' },
          { title: 'Content Parts', path: '/learn/content-parts' },
          { title: 'System Prompts', path: '/learn/system-prompts' },
          { title: 'Multi-Turn Conversations', path: '/learn/multi-turn-conversations' },
          { title: 'Images and Multimodal', path: '/learn/images-and-multimodal' },
          { title: 'Sampling Parameters', path: '/learn/sampling-parameters' },
          { title: 'Model IDs Are Just Strings', path: '/learn/model-ids' },
        ],
      },
      {
        title: 'Reading a Response',
        path: '/learn/reading-a-response',
        description: 'What comes back, what it means, and what it costs.',
        children: [
          { title: 'The Response Object', path: '/learn/the-response-object' },
          { title: 'Text and Tool Calls', path: '/learn/text-and-tool-calls' },
          { title: 'Stop Reasons', path: '/learn/stop-reasons' },
          { title: 'Token Usage and Caching', path: '/learn/token-usage' },
          { title: 'Which Model Actually Answered', path: '/learn/which-model-answered' },
          { title: 'Reading Raw Provider JSON', path: '/learn/reading-raw-json' },
        ],
      },
      {
        title: 'Streaming',
        path: '/learn/streaming',
        description: 'A pull iterator that composes with defer, and never leaks a goroutine.',
        children: [
          { title: 'Your First Stream', path: '/learn/your-first-stream' },
          { title: 'Stream Events', path: '/learn/stream-events' },
          { title: 'Collecting a Stream', path: '/learn/collecting-a-stream' },
          { title: 'Cancellation and Cleanup', path: '/learn/cancellation-and-cleanup' },
          { title: 'Streaming Tool Calls', path: '/learn/streaming-tool-calls' },
          { title: 'Truncated Streams', path: '/learn/truncated-streams' },
        ],
      },
      {
        title: 'Tool Calling',
        path: '/learn/tool-calling',
        description: 'Letting the model run your code, and getting the results back safely.',
        children: [
          { title: 'Declaring Tools', path: '/learn/declaring-tools' },
          { title: 'Tool Schemas', path: '/learn/tool-schemas' },
          { title: 'The Tool Loop', path: '/learn/the-tool-loop' },
          { title: 'Tool Choice', path: '/learn/tool-choice' },
          { title: 'Reporting Tool Errors', path: '/learn/reporting-tool-errors' },
          { title: 'Parallel Tool Calls', path: '/learn/parallel-tool-calls' },
        ],
      },
      {
        title: 'Handling Failure',
        path: '/learn/handling-failure',
        description: 'Classified errors, jittered backoff, and knowing what never to retry.',
        children: [
          { title: 'Error Classification', path: '/learn/error-classification' },
          { title: 'Retries and Backoff', path: '/learn/retries-and-backoff' },
          { title: 'Timeouts and Cancellation', path: '/learn/timeouts-and-cancellation' },
          { title: 'Rate Limits and Retry-After', path: '/learn/rate-limits' },
          { title: 'Refusals', path: '/learn/refusals' },
          { title: 'What Is Never Retried', path: '/learn/never-retried' },
        ],
      },
      {
        title: 'Escape Hatches',
        path: '/learn/escape-hatches',
        description: 'skyl must never be the reason you cannot ship.',
        children: [
          { title: 'Provider Options', path: '/learn/provider-options' },
          { title: 'Raw Responses', path: '/learn/raw-responses' },
          { title: 'Custom HTTP Client', path: '/learn/custom-http-client' },
          { title: 'Hooks', path: '/learn/hooks' },
          { title: 'Writing Your Own Provider', path: '/learn/writing-your-own-provider' },
          { title: 'Bypassing the Client', path: '/learn/bypassing-the-client' },
        ],
      },
    ],
  },
];
