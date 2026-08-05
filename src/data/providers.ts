import type { CompatEndpoint, ProviderInfo } from '@/types';

/**
 * skyl's four adapters.
 *
 * Signatures transcribed from the provider packages. `openai` and
 * `openaicompat` share one implementation (`internal/oai`), so their behaviour
 * is byte-identical except for the five differences documented on the
 * comparison page.
 */
export const providers: ProviderInfo[] = [
  {
    id: 'anthropic',
    pkg: 'anthropic',
    importPath: 'github.com/BAGOMBEKA-JOB-DEV/skyl/provider/anthropic',
    wireName: 'anthropic',
    displayName: 'Anthropic',
    blurb:
      'Claude, native. A separate module, because it is built on the official Anthropic SDK ' +
      'and that brings a dozen transitive dependencies nobody else should pay for.',
    module: 'own',
    goVersion: '1.24',
    envVar: 'ANTHROPIC_API_KEY',
    constructor: 'func New(apiKey string, opts ...Option) *Provider',
    reaches: 'Claude Opus 5, Fable 5, Sonnet 5, Haiku 4.5, and the 4.x family',
    options: [
      {
        name: 'WithBaseURL',
        signature: 'func WithBaseURL(url string) Option',
        description:
          'Overrides the API host. Point it at the sandbox to develop without a credential.',
        default: "Anthropic's own host",
      },
      {
        name: 'WithHTTPClient',
        signature: 'func WithHTTPClient(hc *http.Client) Option',
        description:
          'Supplies the *http.Client used for every request. This is where you set transport ' +
          'timeouts, proxies, or OpenTelemetry trace propagation.',
        default: 'http.DefaultClient',
      },
      {
        name: 'WithHeader',
        signature: 'func WithHeader(key, value string) Option',
        description:
          'Adds a fixed header to every request — beta feature flags, for instance. Headers are ' +
          'set at construction; ProviderOptions never sets headers on any adapter.',
      },
    ],
  },
  {
    id: 'openai',
    pkg: 'openai',
    importPath: 'github.com/BAGOMBEKA-JOB-DEV/skyl/provider/openai',
    wireName: 'openai',
    displayName: 'OpenAI',
    blurb: 'GPT, native. Ships inside the core module, so it costs you no dependencies.',
    module: 'core',
    goVersion: '1.22',
    envVar: 'OPENAI_API_KEY',
    constructor: 'func New(apiKey string, opts ...Option) *Provider',
    reaches: 'GPT-5.6 (Sol, Terra, Luna), GPT-5.5, GPT-5.4 nano, the o-series, and gpt-oss',
    options: [
      {
        name: 'WithBaseURL',
        signature: 'func WithBaseURL(url string) Option',
        description: 'Overrides the API host — an Azure deployment, a proxy, or the sandbox.',
        default: "OpenAI's own host",
      },
      {
        name: 'WithHTTPClient',
        signature: 'func WithHTTPClient(hc *http.Client) Option',
        description: 'Supplies the *http.Client used for every request.',
        default: 'http.DefaultClient',
      },
      {
        name: 'WithOrganization',
        signature: 'func WithOrganization(org string) Option',
        description: 'Sets the OpenAI-Organization header, for accounts that bill per org.',
      },
      {
        name: 'WithProject',
        signature: 'func WithProject(project string) Option',
        description: 'Sets the OpenAI-Project header.',
      },
      {
        name: 'WithMaxTokensField',
        signature: 'func WithMaxTokensField(field string) Option',
        description:
          'Chooses which wire field carries Request.MaxTokens. OpenAI renamed max_tokens to ' +
          'max_completion_tokens; a host that has not followed needs the old name.',
        default: 'max_completion_tokens',
      },
    ],
  },
  {
    id: 'gemini',
    pkg: 'gemini',
    importPath: 'github.com/BAGOMBEKA-JOB-DEV/skyl/provider/gemini',
    wireName: 'gemini',
    displayName: 'Google Gemini',
    blurb:
      'Gemini, native. Handles Gemini’s structural differences — contents/parts, the "model" ' +
      'role in place of "assistant", and systemInstruction — so your Request does not have to.',
    module: 'core',
    goVersion: '1.22',
    envVar: 'GEMINI_API_KEY',
    constructor: 'func New(apiKey string, opts ...Option) *Provider',
    reaches: 'Gemini 3.6 Flash, 3.5/3.1 Flash-Lite, and 3 Pro',
    options: [
      {
        name: 'WithBaseURL',
        signature: 'func WithBaseURL(u string) Option',
        description: 'Overrides the API host.',
        default: 'generativelanguage.googleapis.com',
      },
      {
        name: 'WithHTTPClient',
        signature: 'func WithHTTPClient(hc *http.Client) Option',
        description: 'Supplies the *http.Client used for every request.',
        default: 'http.DefaultClient',
      },
    ],
  },
  {
    id: 'openaicompat',
    pkg: 'openaicompat',
    importPath: 'github.com/BAGOMBEKA-JOB-DEV/skyl/provider/openaicompat',
    wireName: 'openai-compatible',
    displayName: 'OpenAI-compatible',
    blurb:
      'One adapter, configured per host, reaching the long tail of vendors that speak ' +
      "OpenAI's wire format — including local runtimes that need no credential at all.",
    module: 'core',
    goVersion: '1.22',
    envVar: '(per host)',
    constructor: 'func New(opts ...Option) *Provider',
    reaches: '~18 hosts including xAI, DeepSeek, Groq, OpenRouter, Ollama, vLLM and LM Studio',
    options: [
      {
        name: 'WithBaseURL',
        signature: 'func WithBaseURL(url string) Option',
        description:
          'The host to talk to. Required — New panics without it, because there is no sensible ' +
          'default for "some OpenAI-shaped endpoint".',
      },
      {
        name: 'WithAPIKey',
        signature: 'func WithAPIKey(key string) Option',
        description:
          'The credential. Optional: omit it for Ollama, LM Studio and llama.cpp, which ' +
          'authenticate nothing.',
      },
      {
        name: 'WithName',
        signature: 'func WithName(name string) Option',
        description:
          'The name that appears in Response.Provider, in errors, and in hook events. Set it, ' +
          'or every host in your fleet reports the same anonymous label.',
        default: 'openai-compatible',
      },
      {
        name: 'WithHTTPClient',
        signature: 'func WithHTTPClient(hc *http.Client) Option',
        description: 'Supplies the *http.Client used for every request.',
        default: 'http.DefaultClient',
      },
      {
        name: 'WithHeader',
        signature: 'func WithHeader(key, value string) Option',
        description:
          'Adds a fixed header — OpenRouter’s HTTP-Referer and X-Title, for instance.',
      },
      {
        name: 'WithMaxTokensField',
        signature: 'func WithMaxTokensField(field string) Option',
        description: 'Chooses which wire field carries Request.MaxTokens.',
        default: 'max_tokens',
      },
    ],
  },
];

export function getProvider(id: ProviderInfo['id']): ProviderInfo {
  const found = providers.find((p) => p.id === id);
  if (!found) throw new Error(`unknown provider: ${id}`);
  return found;
}

/**
 * Verified base URLs for hosts that speak OpenAI's wire format.
 *
 * These endpoints implement OpenAI's *format*, not necessarily its *features*:
 * tool calling, streaming and multimodal support vary by host and by model.
 */
export const compatEndpoints: CompatEndpoint[] = [
  { name: 'xAI (Grok)', baseURL: 'https://api.x.ai/v1', needsKey: true },
  { name: 'DeepSeek', baseURL: 'https://api.deepseek.com/v1', needsKey: true },
  { name: 'Mistral', baseURL: 'https://api.mistral.ai/v1', needsKey: true },
  { name: 'Groq', baseURL: 'https://api.groq.com/openai/v1', needsKey: true },
  { name: 'Together', baseURL: 'https://api.together.xyz/v1', needsKey: true },
  { name: 'Fireworks', baseURL: 'https://api.fireworks.ai/inference/v1', needsKey: true },
  {
    name: 'OpenRouter',
    baseURL: 'https://openrouter.ai/api/v1',
    needsKey: true,
    note: 'Brokers 300+ models on its own, and supplies DisplayName and ContextWindow on model listing.',
  },
  { name: 'Perplexity', baseURL: 'https://api.perplexity.ai', needsKey: true },
  { name: 'Cerebras', baseURL: 'https://api.cerebras.ai/v1', needsKey: true },
  { name: 'DeepInfra', baseURL: 'https://api.deepinfra.com/v1/openai', needsKey: true },
  {
    name: 'Qwen / DashScope',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    needsKey: true,
  },
  { name: 'Moonshot (Kimi)', baseURL: 'https://api.moonshot.cn/v1', needsKey: true },
  { name: 'Z.ai (GLM)', baseURL: 'https://open.bigmodel.cn/api/paas/v4', needsKey: true },
  { name: 'Nvidia NIM', baseURL: 'https://integrate.api.nvidia.com/v1', needsKey: true },
  {
    name: 'Ollama',
    baseURL: 'http://localhost:11434/v1',
    needsKey: false,
    note: 'Local. Needs no credential — omit WithAPIKey entirely.',
  },
  {
    name: 'vLLM',
    baseURL: 'http://localhost:8000/v1',
    needsKey: false,
    note: 'Self-hosted. Returns content as an array of blocks on some builds, which skyl handles.',
  },
  { name: 'LM Studio', baseURL: 'http://localhost:1234/v1', needsKey: false, note: 'Local.' },
  { name: 'llama.cpp', baseURL: 'http://localhost:8080/v1', needsKey: false, note: 'Local.' },
];

/** The five differences between `provider/openai` and `provider/openaicompat`. */
export const openaiVsCompat = [
  {
    aspect: 'Output-cap field',
    openai: 'max_completion_tokens',
    compat: 'max_tokens',
  },
  {
    aspect: 'Provider name in responses, errors and hooks',
    openai: 'openai',
    compat: 'openai-compatible, or whatever WithName says',
  },
  {
    aspect: 'Base URL',
    openai: "defaults to OpenAI's host",
    compat: 'required — New panics without it',
  },
  {
    aspect: 'API key',
    openai: 'positional argument',
    compat: 'optional — omit it for Ollama, LM Studio, llama.cpp',
  },
  {
    aspect: 'Extra headers',
    openai: 'WithOrganization, WithProject',
    compat: 'generic WithHeader',
  },
];
