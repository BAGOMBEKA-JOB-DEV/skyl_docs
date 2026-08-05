import Link from 'next/link';
import {
  chatMessageFields,
  chatPartFields,
  chatRequestFields,
  chatResponseFields,
  gatewayEndpoints,
  gatewayEnvVars,
  gatewayLocalStatusMap,
  gatewayMiddleware,
  gatewayStatusMap,
} from '@/data/gateway';
import { silentlyIgnored } from '@/data/feature-matrix';
import { compatEndpoints, openaiVsCompat, providers } from '@/data/providers';
import { sandboxFaults, sandboxMounts, testSuites } from '@/data/sandbox';
import {
  errorFields,
  eventTypes,
  hookEventFields,
  requestFields,
  responseFields,
  sentinelErrors,
  stopReasons,
  usageFields,
} from '@/data/api-symbols';
import { modules } from '@/config/site';
import { blogPosts, formatPostDate } from '@/data/blog';
import { DataTable, FieldTable } from './reference';

/**
 * Views over `src/data`.
 *
 * Every table on the site renders through one of these. A page never
 * hand-writes a grid, so a fact corrected in the data layer is corrected
 * everywhere it appears — which is the only way ~160 pages stay true.
 */

const FIELD_TABLES = {
  request: requestFields,
  response: responseFields,
  usage: usageFields,
  hookEvent: hookEventFields,
  error: errorFields,
  chatRequest: chatRequestFields,
  chatMessage: chatMessageFields,
  chatPart: chatPartFields,
  chatResponse: chatResponseFields,
} as const;

export function Fields({ of }: { of: keyof typeof FIELD_TABLES }) {
  const wire = of.startsWith('chat');
  return <FieldTable fields={[...FIELD_TABLES[of]]} showJson={wire} />;
}

export function ModuleTable() {
  return (
    <DataTable
      headers={['Module', 'Import path', 'Go', 'Dependencies']}
      rows={modules.map((m) => [
        <span key="l" className="font-mono text-[0.85rem] font-semibold">
          {m.label}
        </span>,
        <code key="p" className="text-[0.8rem]">
          {m.importPath}
        </code>,
        m.goVersion,
        <span key="d">
          {m.dependencies}
          <span className="mt-1 block text-[0.8rem] text-[var(--fg-subtle)]">{m.note}</span>
        </span>,
      ])}
    />
  );
}

export function StopReasonTable() {
  return (
    <DataTable
      headers={['Constant', 'Value', 'Meaning', 'Provider values']}
      rows={stopReasons.map((s) => [
        <code key="c">{s.constant}</code>,
        <code key="v">{s.value}</code>,
        s.meaning,
        <span key="f" className="text-[0.85rem] text-[var(--fg-subtle)]">
          {s.from}
        </span>,
      ])}
    />
  );
}

export function EventTypeTable() {
  return (
    <DataTable
      headers={['Constant', 'Value', 'Meaning']}
      rows={eventTypes.map((e) => [
        <code key="c">{e.constant}</code>,
        <code key="v">{e.value}</code>,
        e.meaning,
      ])}
    />
  );
}

export function SentinelTable() {
  return (
    <DataTable
      headers={['Sentinel', 'Message', 'Retried?', 'Meaning']}
      rows={sentinelErrors.map((e) => [
        <code key="n">{e.name}</code>,
        <span key="m" className="font-mono text-[0.8rem] text-[var(--fg-subtle)]">
          {e.message}
        </span>,
        <span key="r" style={{ color: e.retried ? 'var(--recap)' : 'var(--pitfall)' }}>
          {e.retried ? 'Yes' : 'Never'}
        </span>,
        e.meaning,
      ])}
    />
  );
}

export function ProviderTable() {
  return (
    <DataTable
      headers={['Adapter', 'Module', 'Go', 'Reaches']}
      rows={providers.map((p) => [
        <Link key="l" href={`/reference/provider/${p.pkg}`} className="font-mono text-[0.85rem]">
          provider/{p.pkg}
        </Link>,
        p.module === 'own' ? 'its own' : 'core',
        p.goVersion,
        p.reaches,
      ])}
    />
  );
}

export function ProviderOptionTable({ provider }: { provider: string }) {
  const p = providers.find((x) => x.pkg === provider);
  if (!p) throw new Error(`unknown provider package: ${provider}`);
  return (
    <DataTable
      headers={['Option', 'Signature', 'Default', 'Description']}
      rows={p.options.map((o) => [
        <code key="n">{o.name}</code>,
        <code key="s" className="text-[0.78rem]">
          {o.signature}
        </code>,
        <span key="d" className="text-[0.85rem] text-[var(--fg-subtle)]">
          {o.default ?? '—'}
        </span>,
        o.description,
      ])}
    />
  );
}

export function CompatEndpointTable() {
  return (
    <DataTable
      headers={['Host', 'Base URL', 'Key?', 'Notes']}
      rows={compatEndpoints.map((e) => [
        e.name,
        <code key="u" className="text-[0.8rem]">
          {e.baseURL}
        </code>,
        e.needsKey ? 'Required' : 'None',
        e.note ?? '',
      ])}
    />
  );
}

export function OpenAIVsCompatTable() {
  return (
    <DataTable
      headers={['', 'openai', 'openaicompat']}
      rows={openaiVsCompat.map((r) => [<strong key="a">{r.aspect}</strong>, r.openai, r.compat])}
    />
  );
}

export function SilentlyIgnoredList() {
  return (
    <div className="my-6 space-y-4">
      {silentlyIgnored.map((e, i) => (
        <article
          key={e.id}
          id={e.id}
          className="rounded-xl border-l-4 px-5 py-4"
          style={{ borderLeftColor: 'var(--warn)', background: 'var(--bg-elevated)' }}
        >
          <h3 className="!mt-0 !mb-2 text-base font-semibold">
            <span className="mr-2 text-[var(--fg-subtle)]">{i + 1}.</span>
            {e.what}
          </h3>
          <p className="!my-1 text-sm">
            <span className="font-semibold text-[var(--fg-muted)]">Affects: </span>
            <span className="font-mono text-[0.85rem]">
              {e.providers === 'all' ? 'all four adapters' : e.providers.join(', ')}
            </span>
          </p>
          <p className="!my-1 text-sm leading-6">
            <span className="font-semibold text-[var(--fg-muted)]">Why: </span>
            {e.why}
          </p>
          <p className="!my-1 text-sm leading-6">
            <span className="font-semibold text-[var(--fg-muted)]">Reach it anyway: </span>
            {e.workaround}
          </p>
        </article>
      ))}
    </div>
  );
}

export function GatewayEndpointTable() {
  return (
    <DataTable
      headers={['Method', 'Path', 'Auth', 'Purpose']}
      rows={gatewayEndpoints.map((e) => [
        <code key="m" className="font-semibold">
          {e.method}
        </code>,
        <code key="p">{e.path}</code>,
        e.authenticated ? 'Bearer' : 'None',
        e.summary,
      ])}
    />
  );
}

export function GatewayEnvTable({ group }: { group?: string }) {
  const rows = group ? gatewayEnvVars.filter((v) => v.group === group) : gatewayEnvVars;
  return (
    <DataTable
      headers={['Variable', 'Default', 'Description']}
      rows={rows.map((v) => [
        <span key="n">
          <code className="font-semibold">{v.name}</code>
          {v.required ? (
            <span
              className="ml-2 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase"
              style={{ background: 'var(--pitfall-bg)', color: 'var(--pitfall)' }}
            >
              Required
            </span>
          ) : null}
        </span>,
        <code key="d" className="text-[0.8rem] text-[var(--fg-subtle)]">
          {v.default}
        </code>,
        v.description,
      ])}
    />
  );
}

export function GatewayMiddlewareList() {
  return (
    <ol className="my-6 space-y-2">
      {gatewayMiddleware.map((m, i) => (
        <li key={m.name} className="flex gap-3">
          <span className="font-mono text-sm text-[var(--fg-subtle)]">{i + 1}.</span>
          <span>
            <strong className="font-mono text-[0.9rem]">{m.name}</strong>
            <span className="block text-[0.9rem] leading-6 text-[var(--fg-muted)]">{m.detail}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

export function GatewayStatusTable() {
  return (
    <DataTable
      headers={['skyl error', 'HTTP', 'kind', 'Note']}
      rows={gatewayStatusMap.map((r) => [
        <code key="s">{r.sentinel}</code>,
        <strong key="h">{r.status}</strong>,
        <code key="k" className="text-[0.8rem]">
          {r.kind}
        </code>,
        r.note,
      ])}
    />
  );
}

export function GatewayLocalStatusTable() {
  return (
    <DataTable
      headers={['HTTP', 'kind', 'When']}
      rows={gatewayLocalStatusMap.map((r) => [
        <strong key="h">{r.status}</strong>,
        <code key="k" className="text-[0.8rem]">
          {r.kind}
        </code>,
        r.note,
      ])}
    />
  );
}

export function SandboxMountTable() {
  return (
    <DataTable
      headers={['Mount', 'Base URL', 'Auth header', 'Models']}
      rows={sandboxMounts.map((m) => [
        <code key="p">{m.provider}</code>,
        <code key="u" className="text-[0.8rem]">
          {m.url}
        </code>,
        <code key="a" className="text-[0.8rem]">
          {m.authHeader}
        </code>,
        <span key="m" className="font-mono text-[0.78rem]">
          {m.models.join(', ')}
        </span>,
      ])}
    />
  );
}

export function SandboxFaultTable() {
  return (
    <DataTable
      headers={['Model ID', 'Effect', 'What it exercises']}
      rows={sandboxFaults.map((f) => [
        <code key="m">{f.model}</code>,
        f.effect,
        <span key="e">
          {f.exercises}
          <code className="mt-1.5 block text-[0.78rem] text-[var(--fg-subtle)]">{f.example}</code>
        </span>,
      ])}
    />
  );
}

export function TestSuiteTable() {
  return (
    <DataTable
      headers={['Command', 'Needs', 'In CI', 'Proves']}
      rows={testSuites.map((s) => [
        <code key="c" className="text-[0.8rem]">
          {s.command}
        </code>,
        s.needs,
        s.inCI ? 'Yes' : 'No',
        s.proves,
      ])}
    />
  );
}

/**
 * The blog index, newest first.
 *
 * Reads `src/data/blog.ts`, the same source the sidebar uses, so a post cannot
 * appear in the navigation with one title and here with another.
 */
export function BlogIndex() {
  return (
    <div className="my-8 space-y-5">
      {blogPosts.map((post) => (
        <article
          key={post.slug}
          className="rounded-xl border p-6 transition-colors hover:border-[var(--accent)]"
          style={{ background: 'var(--bg-elevated)', boxShadow: 'var(--shadow-card)' }}
        >
          <p className="text-sm text-[var(--fg-subtle)]">
            <time dateTime={post.date}>{formatPostDate(post.date)}</time> · {post.author}
          </p>
          <h2 className="!mt-2 !mb-2 !border-0 !pb-0 text-2xl font-bold">
            <Link
              href={`/blog/${post.slug}`}
              className="text-[var(--fg)] hover:text-[var(--accent)]"
            >
              {post.title}
            </Link>
          </h2>
          <p className="!mb-0 leading-7 text-[var(--fg-muted)]">{post.summary}</p>
          <p className="!mb-0 !mt-3">
            <Link href={`/blog/${post.slug}`} className="font-semibold text-[var(--accent)]">
              Read more →
            </Link>
          </p>
        </article>
      ))}
    </div>
  );
}
