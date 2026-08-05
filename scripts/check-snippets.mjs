#!/usr/bin/env node
/**
 * Compiles every Go snippet marked `verify` against the real skyl library.
 *
 * A documentation site full of code that does not compile is worse than one
 * with no code at all, because the reader trusts it. This assembles each marked
 * fence into a Go file, drops them into a temporary module with a `replace`
 * onto a local skyl checkout, and runs the type checker.
 *
 *     ```go verify
 *     client := skyl.New(openai.New(key))
 *     ```
 *
 * Snippets are fragments, not programs, so each is wrapped in a function body
 * unless it already declares a package. Undefined helpers a snippet refers to
 * (`run`, `client`, `ctx`, …) are supplied by a shared preamble.
 *
 * Usage:
 *   node scripts/check-snippets.mjs [--skyl ../skyl] [--keep]
 *
 * Skips with a clear message — rather than failing — when Go or the skyl
 * checkout is unavailable, so it can run in CI where neither is guaranteed.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execFileSync, spawnSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const CONTENT = path.join(ROOT, 'src', 'content');

const argv = process.argv.slice(2);
const skylArg = argv.indexOf('--skyl');
const SKYL = path.resolve(ROOT, skylArg >= 0 ? argv[skylArg + 1] : '../skyl');
const KEEP = argv.includes('--keep');
const WORK = path.join(ROOT, '.snippet-check');

// --------------------------------------------------------------------------
// Preconditions.
// --------------------------------------------------------------------------

function have(cmd) {
  return spawnSync(cmd, ['version'], { stdio: 'ignore' }).status === 0;
}

if (!have('go')) {
  console.log('⊘ Skipping: no Go toolchain on PATH.');
  process.exit(0);
}
if (!fs.existsSync(path.join(SKYL, 'go.mod'))) {
  console.log(`⊘ Skipping: no skyl checkout at ${SKYL} (pass --skyl <path>).`);
  process.exit(0);
}

// --------------------------------------------------------------------------
// Collect the marked snippets.
// --------------------------------------------------------------------------

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith('.mdx')) out.push(full);
  }
  return out;
}

const FENCE = /^```go([^\n]*)\n([\s\S]*?)^```$/gm;

const snippets = [];
for (const file of walk(CONTENT)) {
  const src = fs.readFileSync(file, 'utf8');
  let i = 0;
  for (const m of src.matchAll(FENCE)) {
    const meta = m[1] ?? '';
    if (!/\bverify\b/.test(meta)) continue;
    snippets.push({
      file: path.relative(ROOT, file),
      index: i++,
      code: m[2],
      line: src.slice(0, m.index).split('\n').length,
    });
  }
}

if (snippets.length === 0) {
  console.log('⊘ No snippets marked `verify`.');
  process.exit(0);
}

// --------------------------------------------------------------------------
// Assemble a module.
// --------------------------------------------------------------------------

fs.rmSync(WORK, { recursive: true, force: true });
fs.mkdirSync(WORK, { recursive: true });

// The core library targets Go 1.22 and provider/anthropic targets 1.24. Match
// the go directive to the local toolchain so it never tries to download one,
// and include the Anthropic module only when the toolchain can build it.
// Verifying the core against 1.22 is exactly what the module split promises.
const GOVERSION = execFileSync('go', ['env', 'GOVERSION'], { encoding: 'utf8' }).trim();
const [, major, minor] = /go(\d+)\.(\d+)/.exec(GOVERSION) ?? [];
const goDirective = `${major}.${minor}`;
const canBuildAnthropic = Number(major) > 1 || Number(minor) >= 24;

const MOD = `module snippetcheck

go ${goDirective}

require github.com/BAGOMBEKA-JOB-DEV/skyl v0.0.0

replace github.com/BAGOMBEKA-JOB-DEV/skyl => ${SKYL}
${
  canBuildAnthropic
    ? `
require github.com/BAGOMBEKA-JOB-DEV/skyl/provider/anthropic v0.0.0

replace github.com/BAGOMBEKA-JOB-DEV/skyl/provider/anthropic => ${path.join(SKYL, 'provider', 'anthropic')}
`
    : ''
}`;
fs.writeFileSync(path.join(WORK, 'go.mod'), MOD);

if (!canBuildAnthropic) {
  console.log(
    `  note: Go ${GOVERSION} cannot build provider/anthropic (needs 1.24); ` +
      'substituting a local stub so snippets still type-check.',
  );
}

/**
 * Names snippets refer to without defining. Documentation snippets are
 * excerpts; supplying the surrounding scope is what lets them stay excerpts
 * instead of becoming forty-line programs nobody reads.
 */
const ANTHROPIC_IMPORT = canBuildAnthropic
  ? '\t"github.com/BAGOMBEKA-JOB-DEV/skyl/provider/anthropic"'
  : '\tanthropic "snippetcheck/anthropicstub"';

const PREAMBLE = `package snippetcheck

import (
	"bufio"
	"bytes"
	"context"
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"os/exec"
	"os/signal"
	"reflect"
	"runtime"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"github.com/BAGOMBEKA-JOB-DEV/skyl"
${ANTHROPIC_IMPORT}
	"github.com/BAGOMBEKA-JOB-DEV/skyl/provider/gemini"
	"github.com/BAGOMBEKA-JOB-DEV/skyl/provider/openai"
	"github.com/BAGOMBEKA-JOB-DEV/skyl/provider/openaicompat"
)

// Ambient scope the snippets are written against.
var (
	ctx      context.Context
	cancel   context.CancelFunc
	client   *skyl.Client
	p        skyl.Provider
	req      *skyl.Request
	resp     *skyl.Response
	last     *skyl.Response
	stream   skyl.Stream
	calls    []skyl.ToolCall
	call     skyl.ToolCall
	msgs     []skyl.Message
	total    skyl.Usage
	stop     skyl.StopReason
	err      error
	key      string
	oaKey    string
	gKey     string
	anthropicKey string
	geminiKey    string
	model    string
	src      string
	input    string
	inputs   []string
	article  string
	text     string
	data     []byte
	before   []byte
	after    []byte
	args     json.RawMessage
	a1       json.RawMessage
	a2       json.RawMessage
	documentText string
	stableInstructions string
	perRequestContext  string
	schema   map[string]any
	extractTool skyl.Tool
	invoice  struct {
		Number string \`json:"number"\`
		Total  float64 \`json:"total"\`
	}
	stored []struct {
		Role string
		Text string
	}
	configuredModels []skyl.ModelInfo
	hc       *http.Client
	f        *os.File
	t        *testing.T
	tp       trace
	mp       meter
	span     spanIface
	attempts atomic.Int64
	retries  atomic.Int64
	events   chan skyl.HookEvent
	sem      chan struct{}
	seen     bool
	round    int
	maxToolRounds int
	maxRounds int
	inputBudget int
	errToolCallsPending = errors.New("tool calls pending")
	errTruncated = errors.New("truncated")
	errNotConfigured = errors.New("not configured")
	errBug = errors.New("bug")
	primary  *skyl.Client
	fallback *skyl.Client
	backup   *skyl.Client
	c        *lru
	w        http.ResponseWriter
	r        *http.Request
	want     []string
	provider string
	name     string
	baseURL  string
	path_    string
	keep     int
	weatherTool skyl.Tool
	ev       skyl.HookEvent
	results  []string
	answer   struct{ Text string; Complete bool }
	flusher  http.Flusher
	sc       *bufio.Scanner
	cmd      *exec.Cmd
	stderr   io.ReadCloser
	srv      *httptest.Server
	got      map[string]any
	history  []string
	billed   int
	stubDir  string
	firstToken chan struct{}
	guarded  skyl.Stream
	declared []string
	hosts    []string
	res      *http.Response
	raw      json.RawMessage
	reply    strings.Builder
	img      skyl.Image
	out      string
	e        *skyl.Error
	apiErr   struct{ Type, Message string }
	m        skyl.Message
	payload  map[string]any
	httpReq  *http.Request
	body     []byte
	parts    []skyl.Part
	full     map[string]any
	frames   []json.RawMessage
	gen      map[string]any
	status   int
	attempt  int
	src2     string
	token    string
	proxyURL *url.URL
	cert     tls.Certificate
	traced   *http.Client
	opts     []skyl.Option
	first    skyl.Usage
	second   skyl.Usage
)

// Types a snippet refers to as though it were inside its own package.
type Clients struct{ Fast, Smart *skyl.Client }
type Handler struct{ client *skyl.Client }
type Provider struct {
	apiKey  string
	baseURL string
	hc      *http.Client
}

func (p *Provider) Name() string { return "myprovider" }
func (p *Provider) encode(*skyl.Request) (map[string]any, error) { return nil, nil }
func (p *Provider) decode([]byte) (*skyl.Response, error)        { return nil, nil }

type Option func(*Provider)

const defaultBaseURL = "https://api.example.com"

func New(apiKey string, opts ...Option) *Provider { return &Provider{} }
func WithBaseURL(string) Option                   { return nil }
func Sandbox() Clients                            { return Clients{} }
func Local() Clients                              { return Clients{} }

var attribute = struct {
	Int    func(string, int) any
	String func(string, string) any
}{func(string, int) any { return nil }, func(string, string) any { return nil }}

type trace interface{}
type meter interface{}
type spanIface interface{ SetAttributes(...any) }
type lru struct{}

func (l *lru) Get(any) (any, bool) { return nil, false }
func (l *lru) Add(any, any)        {}

// Helpers the snippets call.
func run(...any) string                        { return "" }
func runTool(...any) (string, error)           { return "", nil }
func weather(string) string                    { return "" }
func key_(any) string                          { return "" }
func transform(any) []any                      { return nil }
func enough(skyl.StreamEvent) bool             { return false }
func parseAddr(string) string                  { return "" }
func extractMessage([]byte) string             { return "" }
func jsonType(reflect.Type) string             { return "string" }
func knownCity(string) bool                    { return true }
func trimSafely([]skyl.Message, int) []skyl.Message { return nil }
func schemaFor(any) map[string]any             { return nil }
func describe(*skyl.Response) string           { return "" }
func imageFromData(string, []byte) skyl.Part   { return nil }
func imageFromURL(string) skyl.Part            { return nil }
func compat(name, baseURL, key string) skyl.Provider { return nil }
func streamTurn(...any) (bool, error)          { return false, nil }
func applyToolResults(...any)                  {}
func toolResult(...any) skyl.Message           { return skyl.Message{} }
func startSandbox(*testing.T) string           { return "" }
func providerAt(string) skyl.Provider          { return nil }
func checkModels(...any) error                 { return nil }
func local() skyl.Provider                     { return nil }
func build(any) skyl.Provider                  { return nil }
func cacheRate(skyl.Usage) float64             { return 0 }
func rawField[T any](json.RawMessage, string) (T, bool, error) { var z T; return z, false, nil }
func store([]skyl.Message) []any               { return nil }
func fingerprint(*skyl.Response) (string, bool) { return "", false }
func handle(error) error                       { return nil }
func check(*skyl.Request) error                { return nil }
func ask(...any) (any, error)                  { return nil, nil }
func complete(...any) (*skyl.Response, error)  { return nil, nil }
func turn(...any) error                        { return nil }
func pick(string) (skyl.Provider, error)       { return nil, nil }
func collect(...any) (any, error)              { return nil, nil }
func runAll(...any) []string                   { return nil }
func warnOverrides(map[string]any)             {}
func noThinking(*skyl.Request, string)         {}
func supportsImageURLs(...any) bool            { return false }
func imagePart(...any) (skyl.Part, error)      { return nil, nil }
func toStrings(any) []string                   { return nil }
func loadSchema(string) (map[string]any, error) { return nil, nil }
func userTurns([]skyl.Message) []skyl.Message  { return nil }
func trim([]skyl.Message, int) []skyl.Message  { return nil }
func testClient(skyl.Provider) *skyl.Client    { return nil }
func policy(string) []skyl.Option              { return nil }
func chain(...skyl.Hook) skyl.Hook             { return nil }
func streamingClient() *http.Client            { return nil }
func completeWithFallback(...any) (*skyl.Response, error) { return nil, nil }
func completeDegrading(...any) (*skyl.Response, error)    { return nil, nil }
func rotate(string)                            {}
func parseAddr2(string) string                 { return "" }
type answerShim struct{ Text string; Complete, Refused bool }
func providerOf(*skyl.Error) string            { return "" }
func f64(v float64) *float64                   { return &v }

var metrics = struct {
	Record   func(...any)
	Inc      func(...any)
	Observe  func(...any)
}{func(...any) {}, func(...any) {}, func(...any) {}}

var alerts = struct{ Page func(...any) }{func(...any) {}}
var costs = struct{ Add func(...any) }{func(...any) {}}
var telemetry = struct{ Hook skyl.Hook }{func(context.Context, skyl.HookEvent) {}}
var ui = struct {
	OpenThinkingPane     func()
	AppendThinking       func(string)
	AppendAnswer         func(string)
	CollapseThinkingPane func()
}{func() {}, func(string) {}, func(string) {}, func() {}}
var db = struct{ Exec func(...any) }{func(...any) {}}
var otel = struct {
	Hook               func(...any) skyl.Option
	HTTPClient         func(*http.Client) *http.Client
	WithoutSpans       func() any
	WithTracerProvider func(any) any
	WithMeterProvider  func(any) any
}{
	func(...any) skyl.Option { return nil },
	func(*http.Client) *http.Client { return nil },
	func() any { return nil },
	func(any) any { return nil },
	func(any) any { return nil },
}

var _ = []any{
	bufio.NewScanner, bytes.NewReader, tls.LoadX509KeyPair, fmt.Println,
	io.ReadAll, log.Fatal, net.Dialer{}, http.Get, httptest.NewServer,
	url.Parse, os.ReadFile, exec.Command, signal.NotifyContext,
	runtime.NumGoroutine, strconv.Itoa, strings.Builder{}, sync.Mutex{},
	time.Second, anthropic.New, gemini.New, openai.New, openaicompat.New,
	ctx, cancel, client, p, req, resp, last, stream, calls, call, msgs, total,
	stop, err, key, oaKey, gKey, anthropicKey, geminiKey, model, src, input,
	inputs, article, text, data, before, after, args, a1, a2, documentText,
	stableInstructions, perRequestContext, schema, extractTool, invoice, stored,
	configuredModels, hc, f, t, tp, mp, span, events, sem, seen, round,
	maxToolRounds, maxRounds, inputBudget, primary, fallback, backup, c, w, r,
	want, provider, name, baseURL, path_, keep, weatherTool,
	run, runTool, weather, key_, transform, enough, parseAddr, extractMessage,
	jsonType, knownCity, providerOf, f64, metrics, alerts, costs, telemetry, ui, db, otel,
	errToolCallsPending, errTruncated, errNotConfigured, errBug,
}
`;


// When the toolchain is too old for provider/anthropic, stand in a stub with
// the same surface so the snippets still type-check against the real core.
if (!canBuildAnthropic) {
  const stubDir = path.join(WORK, 'anthropicstub');
  fs.mkdirSync(stubDir, { recursive: true });
  fs.writeFileSync(
    path.join(stubDir, 'anthropic.go'),
    `package anthropicstub

import (
	"net/http"

	"github.com/BAGOMBEKA-JOB-DEV/skyl"
)

type Option func(*provider)

type provider struct{}

func New(apiKey string, opts ...Option) skyl.Provider { return nil }

func WithBaseURL(url string) Option              { return nil }
func WithHTTPClient(hc *http.Client) Option      { return nil }
func WithHeader(key, value string) Option        { return nil }
`,
  );
}

let wrapped = 0;
const located = [];

/**
 * Snippets come in three shapes:
 *
 *   program   — declares its own `package`. A complete file, compiled as-is.
 *   declaring — contains a top-level func or type, so it cannot be wrapped in
 *               a function body. (`var` and `const` are legal statements, so
 *               they do not disqualify a snippet.)
 *   fragment  — statements, wrapped in a function body.
 *
 * Every snippet gets its **own package directory**, containing the preamble and
 * the snippet in a single file. That is not tidiness: Go import scope is
 * per-file, so a preamble in a sibling file would not supply `skyl` to the
 * snippet — and per-package isolation also stops two snippets that both define
 * `pick` from colliding.
 */
function classify(code) {
  if (/^\s*package\s+\w/m.test(code)) return 'program';
  if (/^(func|type)\s/m.test(code)) return 'declaring';
  return 'fragment';
}

for (const [n, snip] of snippets.entries()) {
  const kind = classify(snip.code);
  const dir = path.join(WORK, `s${n}`);
  fs.mkdirSync(dir, { recursive: true });

  let body;
  if (kind === 'program') {
    body = snip.code;
  } else {
    // Strip preamble declarations the snippet redefines, so its own win.
    const declared = [...snip.code.matchAll(/^(?:func|type)\s+(\w+)/gm)].map((m) => m[1]);
    let preamble = PREAMBLE;
    for (const d of declared) {
      preamble = preamble
        .replace(new RegExp(`^func ${d}\\(.*$`, 'gm'), '')
        .replace(new RegExp(`^type ${d}\\b[^\\n]*$`, 'gm'), '')
        .replace(new RegExp(`(?<![\\w.])\\b${d}\\b,`, 'g'), '');
    }
    // Go rejects an unused local variable. A documentation fragment routinely
    // declares one to show its type and then stops — so blank-assign every
    // name the snippet introduces with `:=`.
    const introduced = new Set();
    for (const line of snip.code.split('\n')) {
      // Names bound in a `for`/`if`/`switch` header are scoped to that
      // statement, so blank-assigning them afterwards would be undefined.
      if (/^[\t ]*(for|if|switch)\b/.test(line)) continue;
      const m = /^[\t ]*([\w, ]+?)\s*:=/.exec(line);
      if (!m) continue;
      for (const raw of m[1].split(',')) {
        const nm = raw.trim();
        if (/^[A-Za-z_]\w*$/.test(nm) && nm !== '_') introduced.add(nm);
      }
    }
    const silence = [...introduced].map((nm) => `\t_ = ${nm}`).join('\n');

    // A fragment often ends in `return err`. Give the wrapper a signature with
    // matching arity, using `any` so every value assigns.
    let arity = 0;
    for (const m of snip.code.matchAll(/^[\t ]*return\s+(.+)$/gm)) {
      let depth = 0;
      let n2 = 1;
      for (const ch of m[1]) {
        if ('([{'.includes(ch)) depth++;
        else if (')]}'.includes(ch)) depth--;
        else if (ch === ',' && depth === 0) n2++;
      }
      arity = Math.max(arity, n2);
    }
    const sig =
      arity === 0 ? '' : arity === 1 ? ' any' : ` (${Array(arity).fill('any').join(', ')})`;
    const tail = arity === 0 ? '' : `\treturn ${Array(arity).fill('nil').join(', ')}\n`;

    body =
      kind === 'declaring'
        ? `${preamble}\n${snip.code}\n`
        : `${preamble}\n\nfunc snippet${n}()${sig} {\n${snip.code}\n${silence}\n${tail}}\n`;
    if (kind === 'fragment') wrapped++;
  }

  const rel = path.join(`s${n}`, 'snippet.go');
  fs.writeFileSync(path.join(WORK, rel), body);
  located.push({ rel, kind, ...snip });
}

// --------------------------------------------------------------------------
// Compile.
// --------------------------------------------------------------------------

console.log(
  `Compiling ${snippets.length} snippet(s) from ${new Set(snippets.map((s) => s.file)).size} page(s) ` +
    `against ${path.relative(ROOT, SKYL)}…`,
);

const env = { ...process.env, GOWORK: 'off', GOFLAGS: '-mod=mod' };
const result = spawnSync('go', ['build', './...'], { cwd: WORK, env, encoding: 'utf8' });

if (result.status !== 0) {
  console.error('\n✗ Snippet compilation failed.\n');
  console.error(result.stderr || result.stdout);
  console.error('\nGenerated file → source page:');
  for (const s of located) {
    console.error(`  ${s.rel}  ←  ${s.file}:${s.line}`);
  }
  console.error(`\nInspect ${path.relative(ROOT, WORK)} with --keep to debug.`);
  if (!KEEP) fs.rmSync(WORK, { recursive: true, force: true });
  process.exit(1);
}

if (!KEEP) fs.rmSync(WORK, { recursive: true, force: true });
console.log(`\n✓ All ${snippets.length} verified snippets compile (${wrapped} wrapped as fragments).`);
