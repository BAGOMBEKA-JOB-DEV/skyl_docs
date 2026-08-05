import Link from 'next/link';
import type { Metadata } from 'next';
import { ProviderSwap } from '@/components/home/provider-swap';
import { SiteFooter } from '@/components/layout/page-chrome';
import { compatEndpoints, providers } from '@/data/providers';
import { siteConfig, skylVersion } from '@/config/site';

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
};

/** The six claims the README makes, each one checkable against the code. */
const FEATURES = [
  {
    title: 'Provider-agnostic',
    body: 'One Request and Response shape across every vendor. Your application code never learns a vendor’s JSON.',
  },
  {
    title: 'Zero-day model support',
    body: 'Model IDs are pass-through strings. A model released this morning works this morning, with no skyl release.',
  },
  {
    title: 'No lock-in',
    body: 'Every response carries Raw — the untouched provider JSON — so skyl’s abstraction is never the reason you cannot ship.',
  },
  {
    title: 'Streaming that works',
    body: 'A pull iterator with proper context cancellation, verified by a goroutine-leak test rather than by convention.',
  },
  {
    title: 'Honest errors',
    body: 'Typed and classified, so you branch with errors.Is instead of matching on message text that vendors reword.',
  },
  {
    title: 'Small surface',
    body: 'The core module has zero external dependencies. No router, no logger, no framework imposed on you.',
  },
];

export default function HomePage() {
  return (
    <>
      <main id="main-content">
        {/* ---------------------------------------------------------- hero */}
        <section className="mx-auto max-w-5xl px-6 pb-16 pt-20 text-center sm:pt-28">
          <p
            className="mb-5 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
            style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
          >
            v{skylVersion} · Apache 2.0 · Go 1.22+
          </p>

          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">skyl</h1>

          <p className="mx-auto mt-5 max-w-2xl text-xl text-[var(--fg-muted)] sm:text-2xl">
            One Go interface for every AI model.
          </p>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[var(--fg-muted)]">
            Talk to Claude, GPT, Gemini, and hundreds of other models through a single, stable
            interface — then switch between them by changing one string.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/learn"
              className="rounded-full px-7 py-3 text-base font-semibold no-underline transition-opacity hover:opacity-90"
              style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
            >
              Learn skyl
            </Link>
            <Link
              href="/reference/skyl"
              className="rounded-full border px-7 py-3 text-base font-semibold no-underline transition-colors hover:border-[var(--accent)]"
            >
              API Reference
            </Link>
          </div>

          <div className="mx-auto mt-14 max-w-2xl">
            <ProviderSwap />
            <p className="mt-3 text-sm text-[var(--fg-muted)]">
              The highlighted line is the only one that changes.
            </p>
          </div>
        </section>

        {/* ------------------------------------------------------- features */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="mb-3 text-center text-3xl font-bold">Why skyl</h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-[var(--fg-muted)]">
            Integrating an AI model into a Go service means writing the same 400 lines every time:
            request mapping, SSE parsing, retry with jitter, rate-limit backoff, token accounting,
            error classification. skyl does that once, properly, with tests.
          </p>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border p-6"
                style={{ background: 'var(--bg-elevated)', boxShadow: 'var(--shadow-card)' }}
              >
                <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                <p className="text-[0.95rem] leading-7 text-[var(--fg-muted)]">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------ providers */}
        <section className="border-y py-16" style={{ background: 'var(--bg-subtle)' }}>
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="mb-3 text-center text-3xl font-bold">Every model, one interface</h2>
            <p className="mx-auto mb-12 max-w-2xl text-center text-[var(--fg-muted)]">
              Three native adapters for full vendor fidelity, and one generic adapter that reaches
              the long tail of hosts speaking OpenAI&rsquo;s wire format.
            </p>

            <div className="grid gap-5 md:grid-cols-2">
              {providers.map((p) => (
                <Link
                  key={p.id}
                  href={`/reference/provider/${p.pkg}`}
                  className="rounded-xl border p-6 no-underline transition-colors hover:border-[var(--accent)]"
                  style={{ background: 'var(--bg)' }}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <code className="text-sm font-semibold text-[var(--accent)]">
                      provider/{p.pkg}
                    </code>
                    {p.module === 'own' ? (
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                        style={{ background: 'var(--warn-bg)', color: 'var(--warn)' }}
                      >
                        own module
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[0.95rem] leading-7 text-[var(--fg-muted)]">{p.blurb}</p>
                  <p className="mt-3 text-sm text-[var(--fg-subtle)]">{p.reaches}</p>
                </Link>
              ))}
            </div>

            <p className="mt-8 text-center text-sm text-[var(--fg-muted)]">
              <Link href="/reference/provider/compatible-endpoints" className="text-[var(--accent)]">
                {compatEndpoints.length} verified compatible endpoints
              </Link>{' '}
              — including Ollama, vLLM and LM Studio, which need no credential at all.
            </p>
          </div>
        </section>

        {/* -------------------------------------------------------- sandbox */}
        <section className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="mb-3 text-3xl font-bold">Try it without an API key</h2>
          <p className="mx-auto mb-8 max-w-2xl text-[var(--fg-muted)]">
            skyl ships a sandbox that speaks all four providers&rsquo; wire protocols locally. Every
            example in this documentation runs against it — no signup, no credential, no cost.
          </p>
          <pre
            className="mx-auto max-w-md overflow-x-auto rounded-xl border px-5 py-4 text-left font-mono text-sm"
            style={{ background: 'var(--bg-inset)' }}
          >
            <code>go run ./cmd/skyl-sandbox</code>
          </pre>
          <p className="mt-6">
            <Link href="/learn/without-an-api-key" className="font-semibold text-[var(--accent)]">
              Read the no-API-key guide →
            </Link>
          </p>
        </section>

        {/* --------------------------------------------------------- status */}
        <section className="mx-auto max-w-3xl px-6 pb-16">
          <div
            className="rounded-xl border-l-4 px-6 py-5"
            style={{ borderLeftColor: 'var(--warn)', background: 'var(--warn-bg)' }}
          >
            <h2 className="mb-2 text-lg font-bold" style={{ color: 'var(--warn)' }}>
              Status: pre-v1, and not yet validated against live provider APIs
            </h2>
            <p className="text-[0.95rem] leading-7">
              Everything here is implemented, unit-tested, contract-tested, exercised end to end
              over real sockets, and CI-green — but every fake in the test suite was written from
              the same provider documentation as the adapter it tests. If a field name is wrong,
              the fake is wrong in the same way and both stay green. No adapter has yet made a call
              to a real provider.{' '}
              <strong>Treat it as ready to evaluate, not ready to depend on in production.</strong>
            </p>
            <p className="mt-3 text-[0.95rem]">
              <Link href="/community/roadmap" className="font-semibold">
                What stands between this and production use →
              </Link>
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
