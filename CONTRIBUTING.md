# Contributing to the skyl documentation

## Before you start

Run `npm run verify`. It is the same set of checks CI runs, and it is faster to
find a problem locally than in review.

## Adding a page

A route exists if and only if it appears in a sidebar. That is deliberate: the
link checker walks `src/sidebars/*.ts` and asserts an MDX file behind every
entry, so an orphaned page or a dead link fails the build rather than reaching a
reader.

1. Add the entry to `src/sidebars/learn.ts`, `reference.ts` or `community.ts`.
2. Create `src/content/<same path>.mdx`.
3. `npm run check:links`.

## The quality bar

Every page carries:

- An `<Intro>` saying what the page is for.
- At least one **complete, compiling** Go example, marked `verify`.
- The **failure modes** — what goes wrong, what error you get, and how to tell
  it apart from the adjacent mistake.
- Cross-links to the Reference page for every symbol named.
- `<ProviderTabs>` or a matrix excerpt wherever behaviour differs by vendor —
  never a vague "this varies by provider".
- A `<DeepDive>` wherever skyl made a non-obvious choice, explaining **why**.

**Learn pages** additionally need `<YouWillLearn>`, `<Recap>` and `<Challenges>`
with worked `<Solution>`s.

**Reference pages** need `<Signature>`, `<Parameters>` (every parameter, with
its zero-value behaviour), `<Returns>`, `<Caveats>`, `<Recipe>` usage examples,
and `<Trouble>` entries headed as the reader's own complaint.

## The accuracy rule

Every claim traces to source: a Go declaration, a doc comment, an ADR, or the
changelog. **Where the skyl repository's Markdown contradicts its code, the code
wins** — and the discrepancy is worth reporting upstream.

Nothing is invented to fill space. If a behaviour is unknown, say so.

## Tables

Never hand-write a table in MDX. Add the data to `src/data/` and render it
through a component in `src/components/mdx/data-views.tsx`. A fact corrected in
the data layer is corrected on every page that shows it — which is the only way
160 pages stay true.

## Snippets

Mark a Go fence `verify` when it compiles standalone. Do **not** mark an excerpt
that depends on a helper defined earlier on the page: the badge says "Compiles",
and it has to mean that.

```bash
node scripts/check-snippets.mjs --skyl ../skyl
```

## Style

Follow the project's own voice: blunt, specific, and willing to publish a gap.
skyl's third design principle is *honesty over coverage*, and the documentation
holds itself to the same standard — the ⚠️ column in the feature matrix is the
most useful thing on the site precisely because nothing else publishes it.

Prefer the concrete over the abstract. "Every provider rejects a tool result
that does not follow the call it answers" beats "ordering matters".
