#!/usr/bin/env node
/**
 * Verifies the non-Go gateway snippets.
 *
 * `check-snippets.mjs` compiles every Go block against the real library. The
 * Python and TypeScript examples cannot be compiled that way, and unverified
 * snippets rot — so this checks the two things that actually matter:
 *
 *   1. They parse. A broken example is worse than none.
 *   2. **Every JSON key they send exists in the gateway's wire format.** That is
 *      the failure that makes an example dangerous rather than merely old: if
 *      `max_tokens` is renamed in gateway/api.go, these must fail.
 *
 * Mark a block `verify` to include it:  ```python verify   /   ```ts verify
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const CONTENT = path.join(ROOT, 'src', 'content');
const WORK = path.join(ROOT, '.snippet-check', 'wire');

const skylArg = process.argv.indexOf('--skyl');
const SKYL = skylArg !== -1 ? process.argv[skylArg + 1] : path.resolve(ROOT, '..', 'skyl');
const API = path.join(SKYL, 'gateway', 'api.go');

// --------------------------------------------------------------------------
// The contract: every json tag the gateway defines.
// --------------------------------------------------------------------------

if (!fs.existsSync(API)) {
  console.log(`⊘ Skipping: no gateway/api.go at ${API} (pass --skyl <path>).`);
  process.exit(0);
}

const wireFields = new Set(
  [...fs.readFileSync(API, 'utf8').matchAll(/json:"([a-z_]+)/g)].map((m) => m[1]),
);

/**
 * Keys that are legitimately not gateway fields: nested JSON Schema vocabulary
 * inside `parameters`, and the SSE event shape, which is not declared in
 * api.go.
 */
const ALLOWED = new Set([
  // JSON Schema vocabulary, nested inside a tool's `parameters`.
  'type', 'properties', 'required', 'items', 'enum', 'description',
  // Example-specific tool argument names.
  'city',
  // The SSE event shape, which the gateway writes directly rather than
  // declaring as a struct in api.go.
  'text_delta', 'done',
]);

/**
 * HTTP header names. They sit in the same object-literal shape as body fields
 * and would otherwise be reported — but widening the key pattern to catch
 * camelCase drift (`maxTokens`) means capitalised names now match, so these
 * have to be named explicitly rather than excluded by casing.
 */
const HTTP_HEADERS = new Set(['Authorization', 'Accept', 'Connection']);

/**
 * Client-library option names — `fetch` init and `httpx` keyword arguments.
 *
 * These are needed because TypeScript object literals use **bare** keys
 * (`max_tokens: 512`), so the key pattern has to match unquoted identifiers to
 * cover TS at all — and that also matches the request options sitting beside
 * the body.
 */
const REQUEST_OPTIONS = new Set([
  'method', 'headers', 'body', 'timeout', 'json', 'signal', 'redirect', 'cache',
]);

// --------------------------------------------------------------------------
// Collect.
// --------------------------------------------------------------------------

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full));
    else if (e.name.endsWith('.mdx')) out.push(full);
  }
  return out;
}

const FENCE = /^```(python|ts)([^\n]*)\n([\s\S]*?)^```$/gm;
const snippets = [];

for (const file of walk(CONTENT)) {
  const src = fs.readFileSync(file, 'utf8');
  for (const m of src.matchAll(FENCE)) {
    if (!/\bverify\b/.test(m[2] ?? '')) continue;
    snippets.push({
      lang: m[1],
      file: path.relative(ROOT, file),
      line: src.slice(0, m.index).split('\n').length,
      code: m[3],
    });
  }
}

if (snippets.length === 0) {
  console.log('⊘ No Python/TypeScript snippets marked `verify`.');
  process.exit(0);
}

fs.rmSync(WORK, { recursive: true, force: true });
fs.mkdirSync(WORK, { recursive: true });

const errors = [];

// --------------------------------------------------------------------------
// 1. Syntax.
// --------------------------------------------------------------------------

snippets.forEach((s, n) => {
  const ext = s.lang === 'python' ? 'py' : 'ts';
  const file = path.join(WORK, `s${n}.${ext}`);
  fs.writeFileSync(file, s.code);

  try {
    if (s.lang === 'python') {
      execFileSync('python3', ['-c', `import ast,sys; ast.parse(open(sys.argv[1]).read())`, file], {
        stdio: 'pipe',
      });
    } else {
      // Syntax only: these snippets reference globals defined in sibling
      // blocks on the same page, so type resolution would report noise rather
      // than defects.
      execFileSync(
        'npx',
        ['tsc', '--noEmit', '--skipLibCheck', '--target', 'es2022',
         '--module', 'esnext', '--moduleResolution', 'bundler',
         '--noResolve', '--types', '', file],
        { stdio: 'pipe', cwd: ROOT },
      );
    }
  } catch (err) {
    const out = (err.stdout?.toString() ?? '') + (err.stderr?.toString() ?? '');
    // --noResolve means unresolved globals are expected; only real syntax
    // errors (TS1xxx) and Python SyntaxError count.
    const real = out
      .split('\n')
      .filter((l) => /error TS1\d{3}|SyntaxError|IndentationError/.test(l));
    if (real.length) {
      errors.push(`${s.file}:${s.line} (${s.lang}) syntax\n    ${real[0].trim()}`);
    }
  }
});

// --------------------------------------------------------------------------
// 2. Wire-contract conformance — the check that matters.
// --------------------------------------------------------------------------

for (const s of snippets) {
  /**
   * Object keys only.
   *
   * A key is preceded by `{` or `,` — requiring that is what separates a real
   * JSON field from language syntax that looks identical: Python's
   * `if name == "get_weather":` and TypeScript's `case 'rate_limit':` both end
   * in quote-colon but are not keys, and a looser pattern reports every one of
   * them.
   */
  const keys = new Set([
    // Quoted keys: Python dicts, JSON, and quoted JS properties.
    ...[...s.code.matchAll(/[{,]\s*["']([A-Za-z][A-Za-z0-9_]{2,})["']\s*:/g)].map((m) => m[1]),
    // Bare keys: TypeScript object literals write `max_tokens: 512`, so without
    // this the TS snippets are not contract-checked at all.
    //
    // A TypeScript *type annotation* is written identically — `args: Record<…>`
    // in a parameter list is indistinguishable from a key by shape alone. They
    // are told apart by what follows the colon: a type is a primitive, a
    // generic, or a capitalised name, where a wire value is a literal, string,
    // array, object or lowercase identifier.
    ...[...s.code.matchAll(/[{,]\s*([A-Za-z][A-Za-z0-9_]{2,})\s*:\s*([^\s,)]+)/g)]
      .filter(([, , value]) => !/^(string|number|boolean|unknown|any|void|Record<|Array<|[A-Z])/.test(value))
      .map((m) => m[1]),
  ]);
  for (const key of keys) {
    if (
      wireFields.has(key) ||
      ALLOWED.has(key) ||
      HTTP_HEADERS.has(key) ||
      REQUEST_OPTIONS.has(key)
    ) {
      continue;
    }
    errors.push(
      `${s.file}:${s.line} (${s.lang}) sends "${key}", which is not a field in ` +
        `gateway/api.go — the wire format may have changed`,
    );
  }
}

// --------------------------------------------------------------------------

// Scratch files are .ts, which tsconfig's `**/*.ts` would otherwise sweep into
// the Next build — clean up rather than rely solely on the exclude.
fs.rmSync(WORK, { recursive: true, force: true });

const py = snippets.filter((s) => s.lang === 'python').length;
const ts = snippets.length - py;

if (errors.length) {
  console.error(`\n${errors.length} problem(s) in non-Go snippets:\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}

console.log(
  `✓ ${snippets.length} non-Go snippets verified (${py} Python, ${ts} TypeScript) ` +
    `against ${wireFields.size} gateway wire fields.`,
);
