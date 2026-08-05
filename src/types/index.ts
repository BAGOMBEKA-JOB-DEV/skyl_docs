/** Shared types for the data layer that drives every generated table on the site. */

/** The four adapters skyl ships. */
export type ProviderId = 'anthropic' | 'openai' | 'gemini' | 'openaicompat';

/**
 * How an adapter treats a given part of a request.
 *
 * The four states come from skyl's own feature matrix. `ignored` is the one
 * that matters: it means skyl accepts the field and then drops it, telling you
 * nothing.
 */
export type SupportState = 'mapped' | 'rejected' | 'ignored' | 'na';

/** One cell of the provider feature matrix. */
export interface MatrixCell {
  state: SupportState;
  /** The wire field it maps to, or the reason it is rejected/dropped. */
  detail?: string;
}

/** One row of the provider feature matrix. */
export interface MatrixRow {
  id: string;
  /** The skyl-side name, e.g. `Request.MaxTokens` or `ToolResult.IsError`. */
  feature: string;
  /** Which table this row belongs to. */
  group: MatrixGroup;
  note?: string;
  cells: Record<ProviderId, MatrixCell>;
}

export type MatrixGroup =
  | 'request'
  | 'thinking'
  | 'parts'
  | 'response'
  | 'usage'
  | 'streaming'
  | 'models';

/** A case where skyl accepts something and silently does not do it. */
export interface SilentlyIgnoredEntry {
  id: string;
  what: string;
  providers: ProviderId[] | 'all';
  why: string;
  workaround: string;
}

/** A functional option on a provider constructor. */
export interface ProviderOption {
  name: string;
  signature: string;
  description: string;
  default?: string;
}

/** One of skyl's four adapters. */
export interface ProviderInfo {
  id: ProviderId;
  /** The Go package name. */
  pkg: string;
  importPath: string;
  /** The value that appears in `Response.Provider` and in errors. */
  wireName: string;
  displayName: string;
  blurb: string;
  /** Whether it lives in the core module or its own. */
  module: 'core' | 'own';
  goVersion: string;
  envVar: string;
  constructor: string;
  reaches: string;
  options: ProviderOption[];
}

/** An OpenAI-compatible host reachable through `provider/openaicompat`. */
export interface CompatEndpoint {
  name: string;
  baseURL: string;
  /** Whether the host requires a credential. Local runtimes generally do not. */
  needsKey: boolean;
  note?: string;
}

/** An HTTP endpoint exposed by the gateway. */
export interface GatewayEndpoint {
  id: string;
  method: 'GET' | 'POST';
  path: string;
  summary: string;
  authenticated: boolean;
  /** The content type of a successful response. */
  produces: string;
}

/** One `SKYL_*` environment variable understood by the gateway. */
export interface GatewayEnvVar {
  name: string;
  group: 'server' | 'providers' | 'client' | 'hardening' | 'observability';
  default: string;
  required: boolean;
  description: string;
}

/** A field of a Go struct, for the reference tables. */
export interface GoField {
  name: string;
  type: string;
  /** The JSON tag, where the type crosses the wire. */
  json?: string;
  description: string;
  /** What happens when the field is left at its zero value. */
  zeroValue?: string;
}

/** An exported Go symbol documented on the site. */
export interface GoSymbol {
  name: string;
  kind: 'func' | 'method' | 'type' | 'interface' | 'const' | 'var' | 'option';
  module: string;
  signature: string;
  summary: string;
  /** The reference route, e.g. `/reference/skyl/new`. */
  href: string;
}
