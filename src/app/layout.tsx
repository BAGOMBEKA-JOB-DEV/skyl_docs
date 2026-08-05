import type { Metadata, Viewport } from 'next';
import { siteConfig } from '@/config/site';
import { ThemeScript } from '@/components/layout/theme-script';
import { SiteHeader } from '@/components/layout/site-header';
import { SidebarDrawerProvider } from '@/components/layout/sidebar-drawer-context';
import '@/styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    'go',
    'golang',
    'llm',
    'ai',
    'claude',
    'gpt',
    'gemini',
    'openai',
    'anthropic',
    'ollama',
    'sdk',
    'streaming',
    'tool calling',
  ],
  authors: [{ name: 'skyl maintainers', url: siteConfig.repo }],
  openGraph: {
    type: 'website',
    url: siteConfig.url,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1117' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-screen antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-[var(--accent-fg)]"
        >
          Skip to content
        </a>
        <SidebarDrawerProvider>
          <SiteHeader />
          {children}
        </SidebarDrawerProvider>
      </body>
    </html>
  );
}
