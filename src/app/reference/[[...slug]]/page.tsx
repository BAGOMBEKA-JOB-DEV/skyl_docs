import type { Metadata } from 'next';
import { DocPage } from '@/components/layout/doc-page';
import { getDoc, resolveContentFile } from '@/lib/content';
import { flattenSidebar, sidebarReference } from '@/sidebars';

/** Every Reference route comes from the sidebar, so navigation and routing agree. */
export function generateStaticParams() {
  return flattenSidebar(sidebarReference)
    // Only routes that actually have content are pre-rendered. Completeness is
    // asserted by scripts/check-links.mjs, which fails when a sidebar entry has
    // no MDX file behind it.
    .filter((item) => resolveContentFile(item.path as string))
    .map((item) => ({
    slug: (item.path as string).replace('/reference', '').split('/').filter(Boolean),
  }));
}

function routeFor(slug: string[] | undefined): string {
  return slug?.length ? `/reference/${slug.join('/')}` : '/reference';
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc(routeFor(slug));
  return {
    title: doc.frontmatter.title,
    ...(doc.frontmatter.description ? { description: doc.frontmatter.description } : {}),
  };
}

export default async function ReferencePage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  return <DocPage track="reference" route={routeFor(slug)} />;
}
