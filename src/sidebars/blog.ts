import { blogPosts } from '@/data/blog';
import type { Sidebar } from './types';

/**
 * The blog track.
 *
 * Generated from `src/data/blog.ts` rather than hand-listed, so the sidebar and
 * the index page cannot drift apart — adding a post is one entry in one file.
 */
export const sidebarBlog: Sidebar = [
  {
    title: 'Blog',
    items: [
      { title: 'All posts', path: '/blog', description: 'Everything written about skyl so far.' },
      ...blogPosts.map((post) => ({
        title: post.title,
        path: `/blog/${post.slug}`,
        description: post.summary,
      })),
    ],
  },
];
