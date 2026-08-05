/**
 * Site-wide constants.
 *
 * Everything here that describes skyl itself — the version, the module paths,
 * the Go floors — is duplicated from the Go repository. When skyl releases,
 * this file is the single place that changes.
 */

/**
 * The origin the site is served from.
 *
 * It is the canonical URL in `sitemap.xml` and `robots.txt`, the `metadataBase`
 * every relative link resolves against, and the `og:url` on every page — so a
 * wrong value is wrong in four places at once, none of them visible while
 * browsing locally. That is exactly how a deploy once shipped with
 * `http://localhost:3000` as its canonical origin.
 *
 * Resolution order, first match wins:
 *
 *   1. `SITE_URL`                        — explicit; a custom domain
 *   2. `VERCEL_PROJECT_PRODUCTION_URL`   — the project's stable production host
 *   3. `VERCEL_URL`                      — this specific deployment
 *   4. localhost                          — local dev and a bare `npm run build`
 *
 * Vercel supplies its two without a scheme, so they are prefixed. Deriving the
 * origin from the platform means a correct deploy needs no configuration, while
 * an explicit `SITE_URL` still wins when a real domain arrives.
 */
function resolveSiteURL(): string {
  const explicit = process.env['SITE_URL'];
  if (explicit) return explicit.replace(/\/$/, '');

  const host = process.env['VERCEL_PROJECT_PRODUCTION_URL'] ?? process.env['VERCEL_URL'];
  if (host) return `https://${host.replace(/^https?:\/\//, '').replace(/\/$/, '')}`;

  return 'http://localhost:3000';
}

const siteURL = resolveSiteURL();

export const siteConfig = {
  name: 'skyl',
  tagline: 'One Go interface for every AI model',
  description:
    // 400+ is the figure skyl's own README publishes. Keep the two in step: this
    // string is the og:description and Twitter card on all 165 pages, so a
    // number invented here would outrank the source everywhere it is shared.
    'skyl is a small, dependency-light Go library that lets you talk to Claude, GPT, ' +
    'Gemini, and 400+ other models through a single, stable interface — then ' +
    'switch between them by changing one string.',
  url: siteURL,
  repo: 'https://github.com/BAGOMBEKA-JOB-DEV/skyl',
  docsRepo: 'https://github.com/BAGOMBEKA-JOB-DEV/skyl_docs',
  license: 'Apache-2.0',
} as const;

/**
 * The skyl version this documentation describes.
 *
 * Rendered in the header badge, so a reader always knows which version they are
 * reading. skyl is pre-v1: breaking changes may land in minor releases.
 */
export const skylVersion = '0.1.0';

/** skyl has not yet cut a tagged release. */
export const isPreRelease = true;

/**
 * The Go modules that make up skyl.
 *
 * The split is load-bearing: the core module has zero external dependencies and
 * a Go 1.22 floor, while the adapters that wrap vendor SDKs carry both those
 * SDKs' dependencies and their higher Go requirements. See ADR-0003, ADR-0006
 * and ADR-0007.
 */
export const modules = [
  {
    id: 'skyl',
    label: 'skyl',
    importPath: 'github.com/BAGOMBEKA-JOB-DEV/skyl',
    goVersion: '1.22',
    dependencies: 'none',
    note: 'The core library. Zero external dependencies.',
  },
  {
    id: 'anthropic',
    label: 'provider/anthropic',
    importPath: 'github.com/BAGOMBEKA-JOB-DEV/skyl/provider/anthropic',
    goVersion: '1.24',
    dependencies: 'anthropic-sdk-go',
    note: 'A separate module, because the official SDK brings a dozen transitive dependencies.',
  },
  {
    id: 'gateway',
    label: 'gateway',
    importPath: 'github.com/BAGOMBEKA-JOB-DEV/skyl/gateway',
    goVersion: '1.25',
    dependencies: 'go-chi/chi, skyl/otel',
    note: 'The optional HTTP service. Importing the core library never pulls in chi.',
  },
  {
    id: 'otel',
    label: 'otel',
    importPath: 'github.com/BAGOMBEKA-JOB-DEV/skyl/otel',
    goVersion: '1.25',
    dependencies: 'go.opentelemetry.io/otel',
    note: 'OpenTelemetry instrumentation. Nobody who does not want it pays for it.',
  },
] as const;

/**
 * Top-level navigation.
 *
 * Every href here is asserted to resolve by scripts/check-links.mjs — this item
 * set once shipped a Blog link to a page that did not exist, and the checker
 * exempted it rather than verifying it.
 */
export const topNav = [
  { label: 'Learn', href: '/learn' },
  { label: 'Reference', href: '/reference/skyl' },
  { label: 'Community', href: '/community' },
  { label: 'Blog', href: '/blog' },
] as const;

/** The sandbox's defaults, used throughout the "run it without a key" path. */
export const sandbox = {
  addr: '127.0.0.1:8099',
  apiKey: 'sandbox-key',
  mounts: {
    anthropic: 'http://127.0.0.1:8099/anthropic',
    openai: 'http://127.0.0.1:8099/openai/v1',
    gemini: 'http://127.0.0.1:8099/gemini/v1beta',
    openaicompat: 'http://127.0.0.1:8099/compat/v1',
  },
} as const;

export type ModuleId = (typeof modules)[number]['id'];
