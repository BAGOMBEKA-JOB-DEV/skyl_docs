import { MDXRemote } from 'next-mdx-remote-client/rsc';
import rehypeSlug from 'rehype-slug';
import { getDoc } from '@/lib/content';
import { rehypeShiki } from '@/lib/rehype-shiki';
import { remarkCodeMeta } from '@/lib/remark-code-meta';
import { mdxComponents } from '@/components/mdx';
import { flattenSidebar, findInSidebar, tracks, type TrackId } from '@/sidebars';
import { DocSidebar } from './doc-sidebar';
import { Toc } from './toc';
import { Breadcrumbs, EditThisPage, PageHeader, PrevNext, SiteFooter } from './page-chrome';

/**
 * Renders one documentation page.
 *
 * Every routed page in all three tracks goes through here, so the chrome —
 * breadcrumbs, TOC, prev/next, edit link — is identical everywhere by
 * construction rather than by discipline.
 */
export async function DocPage({ track, route }: { track: TrackId; route: string }) {
  const doc = getDoc(route);
  const { sidebar, label, root } = tracks[track];

  const found = findInSidebar(sidebar, route);
  const flat = flattenSidebar(sidebar);
  const index = flat.findIndex((i) => i.path === route);
  const prev = index > 0 ? flat[index - 1] : undefined;
  const next = index >= 0 && index < flat.length - 1 ? flat[index + 1] : undefined;

  return (
    <>
      <div className="mx-auto flex max-w-[1600px] gap-8 px-4 lg:px-6">
        <DocSidebar sidebar={sidebar} />

        {/* gap-8 matches the sidebar gutter above, so the reading column sits
            between two equal gutters rather than 32px on one side and 40 on
            the other. */}
        <div className="flex min-w-0 flex-1 justify-center gap-8 py-10">
          {/*
            `mx-auto` matters once the column hits its 768px cap: without it
            every leftover pixel collects on the right instead of splitting,
            which left the content visibly off-centre on wide screens.
          */}
          <main id="main-content" className="mx-auto min-w-0 flex-1 xl:max-w-3xl">
            <Breadcrumbs
              track={label}
              trackHref={root}
              {...(found?.section ? { section: found.section } : {})}
              {...(found?.parent ? { parent: found.parent } : {})}
            />

            <PageHeader
              title={doc.frontmatter.title}
              {...(doc.frontmatter.description ? { description: doc.frontmatter.description } : {})}
              {...(doc.frontmatter.badge ? { badge: doc.frontmatter.badge } : {})}
              {...(doc.frontmatter.noCopy ? { noCopy: true } : {})}
              markdownPath={`/md${route}.md`}
            />

            <article className="prose-skyl">
              <MDXRemote
                source={doc.body}
                components={mdxComponents}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkCodeMeta],
                    rehypePlugins: [rehypeSlug, rehypeShiki],
                  },
                }}
              />
            </article>

            <EditThisPage filePath={doc.filePath} />
            <PrevNext {...(prev ? { prev } : {})} {...(next ? { next } : {})} />
          </main>

          <Toc headings={doc.headings} />
        </div>
      </div>

      {/*
        Outside the row, so the footer spans the page. Nested inside <main> it
        was trapped in the 768px reading column and its own centring could
        never take effect.
      */}
      <SiteFooter />
    </>
  );
}
