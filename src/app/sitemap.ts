import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { allRoutes } from '@/sidebars';

/**
 * Every page, for search engines.
 *
 * Sourced from the sidebars rather than from the filesystem, so a page that is
 * not navigable is also not indexed — the link checker already guarantees the
 * two agree.
 */
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['/', ...allRoutes()];
  return routes.map((route) => ({
    url: `${siteConfig.url}${route === '/' ? '' : route}/`,
    changeFrequency: 'weekly',
    // The landing page and the two track entry points matter most.
    priority: route === '/' ? 1 : route === '/learn' || route === '/reference/skyl' ? 0.9 : 0.7,
  }));
}
