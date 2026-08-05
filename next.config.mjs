/**
 * Next.js configuration for the skyl documentation site.
 *
 * The site is a fully static export: it deploys to GitHub Pages, so there is no
 * Node server at runtime and every route must be pre-rendered at build time.
 * That constraint is deliberate — documentation that needs a server to render
 * is documentation that can go down.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',

  // Pages are emitted as `path/index.html` so a static host can serve them
  // without rewrite rules.
  trailingSlash: true,

  reactStrictMode: true,

  // The static export has no image optimisation server.
  images: { unoptimized: true },

  // Type and lint errors must fail the build, not be silently tolerated.
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },

  // Content is authored in MDX alongside .ts/.tsx.
  pageExtensions: ['ts', 'tsx'],

  experimental: {
    // Shiki and the MDX pipeline run at build time only.
    optimizePackageImports: ['shiki'],
  },
};

export default nextConfig;
