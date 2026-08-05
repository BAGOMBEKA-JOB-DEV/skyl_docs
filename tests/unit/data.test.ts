import { describe, expect, it } from 'vitest';
import { matrixRows, silentlyIgnored, matrixGroupLabels } from '@/data/feature-matrix';
import { compatEndpoints, providers, getProvider } from '@/data/providers';
import { gatewayEndpoints, gatewayEnvVars, gatewayStatusMap } from '@/data/gateway';
import { allSymbols, coreSymbols, requestFields, usageFields } from '@/data/api-symbols';
import { modules } from '@/config/site';

/**
 * The data layer drives every generated table on the site, so a mistake here is
 * a mistake on many pages at once. These assert the invariants that make the
 * rendered tables meaningful.
 */

describe('feature matrix', () => {
  it('gives every row a cell for all four adapters', () => {
    for (const row of matrixRows) {
      for (const p of ['anthropic', 'openai', 'gemini', 'openaicompat'] as const) {
        expect(row.cells[p], `${row.id} is missing ${p}`).toBeDefined();
      }
    }
  });

  it('uses only known groups', () => {
    for (const row of matrixRows) {
      expect(Object.keys(matrixGroupLabels)).toContain(row.group);
    }
  });

  it('has unique row ids', () => {
    const ids = matrixRows.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('documents the silently-ignored cases the matrix marks', () => {
    // The list is the reader-facing summary of the ⚠️ cells, so it must not be
    // empty while those cells exist.
    const ignored = matrixRows.filter((r) =>
      Object.values(r.cells).some((c) => c.state === 'ignored'),
    );
    expect(ignored.length).toBeGreaterThan(0);
    expect(silentlyIgnored.length).toBeGreaterThan(0);
  });

  it('gives every silently-ignored entry a workaround', () => {
    for (const e of silentlyIgnored) {
      expect(e.why.length, e.id).toBeGreaterThan(10);
      expect(e.workaround.length, e.id).toBeGreaterThan(10);
    }
  });
});

describe('providers', () => {
  it('has exactly four adapters', () => {
    expect(providers).toHaveLength(4);
  });

  it('marks only anthropic as its own module', () => {
    expect(providers.filter((p) => p.module === 'own').map((p) => p.id)).toEqual(['anthropic']);
  });

  it('requires a base URL option on openaicompat', () => {
    const names = getProvider('openaicompat').options.map((o) => o.name);
    expect(names).toContain('WithBaseURL');
    expect(names).toContain('WithName');
  });

  it('marks the four local runtimes as needing no key', () => {
    const local = compatEndpoints.filter((e) => !e.needsKey).map((e) => e.name);
    expect(local).toEqual(
      expect.arrayContaining(['Ollama', 'vLLM', 'LM Studio', 'llama.cpp']),
    );
  });

  it('gives every compat endpoint an absolute base URL', () => {
    for (const e of compatEndpoints) {
      expect(e.baseURL, e.name).toMatch(/^https?:\/\//);
    }
  });
});

describe('gateway', () => {
  it('leaves only health, readiness and metrics unauthenticated', () => {
    const open = gatewayEndpoints.filter((e) => !e.authenticated).map((e) => e.path);
    expect(open.sort()).toEqual(['/healthz', '/metrics', '/readyz']);
  });

  it('requires exactly one environment variable', () => {
    const required = gatewayEnvVars.filter((v) => v.required).map((v) => v.name);
    expect(required).toEqual(['SKYL_AUTH_TOKEN']);
  });

  it('maps an upstream auth failure to 502, not 401', () => {
    // The caller's token was fine; ours was not. Returning 401 would tell a
    // client to re-authenticate when an operator must rotate a key.
    const auth = gatewayStatusMap.find((r) => r.sentinel === 'ErrAuth');
    expect(auth?.status).toBe(502);
  });

  it('gives every status entry a machine-readable kind', () => {
    for (const r of gatewayStatusMap) {
      expect(r.kind, r.sentinel).toMatch(/^[a-z_]+$/);
    }
  });
});

describe('api symbols', () => {
  it('has unique hrefs', () => {
    const hrefs = allSymbols.map((s) => s.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it('points every symbol at a reference route', () => {
    for (const s of allSymbols) {
      expect(s.href, s.name).toMatch(/^\/reference\//);
    }
  });

  it('documents the whole client surface', () => {
    const names = coreSymbols.map((s) => s.name);
    for (const want of ['New', 'Client.Complete', 'Client.Stream', 'Client.Models', 'Provider']) {
      expect(names).toContain(want);
    }
  });

  it('describes every request and usage field', () => {
    for (const f of [...requestFields, ...usageFields]) {
      expect(f.description.length, f.name).toBeGreaterThan(20);
    }
  });
});

describe('modules', () => {
  it('keeps the core module dependency-free', () => {
    expect(modules.find((m) => m.id === 'skyl')?.dependencies).toBe('none');
  });

  it('keeps the core Go floor below the adapter floors', () => {
    const core = Number(modules.find((m) => m.id === 'skyl')!.goVersion.split('.')[1]);
    for (const m of modules.filter((x) => x.id !== 'skyl')) {
      expect(Number(m.goVersion.split('.')[1]), m.id).toBeGreaterThanOrEqual(core);
    }
  });
});
