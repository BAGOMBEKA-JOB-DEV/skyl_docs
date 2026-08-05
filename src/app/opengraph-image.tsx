import { ImageResponse } from 'next/og';
import { siteConfig, skylVersion } from '@/config/site';

export const dynamic = 'force-static';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;

/** The social card. Generated at build time, so it ships with the export. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0d1117',
          color: '#e6edf3',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 120, fontWeight: 800, letterSpacing: '-0.04em' }}>skyl</div>
        <div style={{ display: 'flex', fontSize: 44, color: '#9198a1', marginTop: 8 }}>{siteConfig.tagline}</div>
        <div
          style={{
            display: 'flex',
            marginTop: 40,
            fontSize: 26,
            color: '#59b0ff',
            border: '2px solid #1d70f0',
            borderRadius: 999,
            padding: '10px 28px',
          }}
        >
          v{skylVersion} · Apache 2.0 · Go 1.22+
        </div>
      </div>
    ),
    size,
  );
}
