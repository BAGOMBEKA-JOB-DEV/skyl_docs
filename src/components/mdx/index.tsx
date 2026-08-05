import Link from 'next/link';
import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { CodeBlock } from './code-block';
import { ConsoleBlock, TerminalBlock } from './terminal';
import {
  Caveats,
  DataTable,
  FieldTable,
  Parameters,
  Recipe,
  Returns,
  Signature,
  Trouble,
} from './reference';
import {
  CardGrid,
  Challenge,
  Challenges,
  Hint,
  Intro,
  LearnMore,
  Recap,
  Solution,
  WhatsNext,
  YouWillLearn,
  YouWillLearnCard,
} from './learn';
import { DeepDive, Note, Pitfall, PreV1, Unvalidated, Wip } from './callouts';
import { Panel, ProviderTabs } from './provider-tabs';
import { LanguageTabs } from './language-tabs';
import { AsciiDiagram, ClientStackDiagram, Diagram } from './diagram';
import { FeatureMatrix } from '@/components/feature-matrix/feature-matrix';
import * as DataViews from './data-views';

/** Internal links route through next/link; external ones open safely. */
function Anchor({ href = '', children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const external = /^https?:\/\//.test(href);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} {...rest}>
      {children}
    </Link>
  );
}

/**
 * Headings carry an anchor so any paragraph on the site is linkable.
 *
 * `rehype-slug` supplies the id; this adds the visible affordance.
 */
function heading(level: 2 | 3 | 4) {
  const Tag = `h${level}` as const;
  const size = {
    2: 'mt-12 mb-4 border-b pb-2 text-2xl font-bold',
    3: 'mt-9 mb-3 text-xl font-semibold',
    4: 'mt-7 mb-2 text-lg font-semibold',
  }[level];

  return function Heading({ id, children, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
    return (
      <Tag id={id} className={`group scroll-mt-24 ${size}`} {...rest}>
        {children}
        {id ? (
          <a
            href={`#${id}`}
            aria-label="Link to this section"
            className="ml-2 text-[var(--fg-subtle)] opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          >
            #
          </a>
        ) : null}
      </Tag>
    );
  };
}

/**
 * The MDX component vocabulary.
 *
 * Owning this map — rather than inheriting a docs theme's — is what makes
 * `<YouWillLearn>`, `<Recap>` and `<Challenges>` possible at all. No prebuilt
 * theme offers them, and a page can only use what appears here.
 */
export const mdxComponents = {
  // --- base elements ---
  a: Anchor,
  h2: heading(2),
  h3: heading(3),
  h4: heading(4),
  p: (props: HTMLAttributes<HTMLParagraphElement>) => <p className="my-4 leading-7" {...props} />,
  ul: (props: HTMLAttributes<HTMLUListElement>) => (
    <ul className="my-4 list-disc space-y-2 pl-6 leading-7" {...props} />
  ),
  ol: (props: HTMLAttributes<HTMLOListElement>) => (
    <ol className="my-4 list-decimal space-y-2 pl-6 leading-7" {...props} />
  ),
  li: (props: HTMLAttributes<HTMLLIElement>) => <li className="pl-1" {...props} />,
  blockquote: (props: HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="my-6 border-l-4 pl-5 italic text-[var(--fg-muted)]"
      style={{ borderLeftColor: 'var(--border)' }}
      {...props}
    />
  ),
  hr: () => <hr className="my-10" />,
  table: (props: HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 overflow-x-auto rounded-xl border">
      <table className="w-full border-collapse text-left text-[0.9rem]" {...props} />
    </div>
  ),
  th: (props: HTMLAttributes<HTMLTableCellElement>) => (
    <th className="border-b px-4 py-2.5 font-semibold" style={{ background: 'var(--bg-subtle)' }} {...props} />
  ),
  td: (props: HTMLAttributes<HTMLTableCellElement>) => (
    <td className="border-t px-4 py-3 align-top leading-6" {...props} />
  ),
  code: (props: HTMLAttributes<HTMLElement>) => (
    <code
      className="rounded px-1.5 py-0.5 font-mono text-[0.85em]"
      style={{ background: 'var(--bg-inset)' }}
      {...props}
    />
  ),
  // The rehype plugin replaces fenced blocks with a div carrying the metadata.
  div: (props: HTMLAttributes<HTMLDivElement> & { className?: string }) =>
    props.className?.includes('code-block') ? <CodeBlock {...props} /> : <div {...props} />,

  // --- learn track ---
  Intro,
  YouWillLearn,
  YouWillLearnCard,
  LearnMore,
  Recap,
  Challenges,
  Challenge,
  Hint,
  Solution,
  CardGrid,
  WhatsNext,

  // --- callouts ---
  Note,
  Pitfall,
  DeepDive,
  Wip,
  Unvalidated,
  PreV1,

  // --- reference template ---
  Signature,
  Parameters,
  Returns,
  Caveats,
  Recipe,
  Trouble,
  FieldTable,
  DataTable,

  // --- code and terminal ---
  TerminalBlock,
  ConsoleBlock,

  // --- interactive ---
  ProviderTabs,
  LanguageTabs,
  Panel,
  FeatureMatrix,

  // --- diagrams ---
  Diagram,
  AsciiDiagram,
  ClientStackDiagram,

  // --- generated data views ---
  ...DataViews,
} satisfies Record<string, unknown>;

export type MDXComponents = typeof mdxComponents;

export function MDXBody({ children }: { children: ReactNode }) {
  return <div className="prose-skyl">{children}</div>;
}
