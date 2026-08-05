import type { Sidebar } from './types';

/** Community and project governance. */
export const sidebarCommunity: Sidebar = [
  {
    title: 'Get involved',
    items: [
      { title: 'Community', path: '/community' },
      { title: 'Meet the Maintainers', path: '/community/maintainers' },
      { title: 'Contributing', path: '/community/contributing' },
      { title: 'Writing an Adapter', path: '/community/writing-an-adapter' },
      { title: 'Engineering Rules', path: '/community/engineering-rules' },
      { title: 'Code of Conduct', path: '/community/code-of-conduct' },
      { title: 'Acknowledgements', path: '/community/acknowledgements' },
    ],
  },
  {
    title: 'Security and privacy',
    items: [
      { title: 'Security Policy', path: '/community/security' },
      { title: 'Data Handling', path: '/community/data-handling' },
      { title: 'Threat Model', path: '/community/threat-model' },
    ],
  },
  {
    title: 'Project',
    items: [
      { title: 'Versions', path: '/community/versions' },
      { title: 'Roadmap', path: '/community/roadmap' },
      { title: 'Project Plan', path: '/community/project-plan' },
      { title: 'Releasing', path: '/community/releasing' },
      {
        title: 'Decision Records',
        path: '/community/adr',
        children: [
          { title: 'ADR-0001: Two-module layout', path: '/community/adr/0001-two-module-layout' },
          { title: 'ADR-0002: Provider interface', path: '/community/adr/0002-provider-interface' },
          {
            title: 'ADR-0003: Gateway as a separate module',
            path: '/community/adr/0003-gateway-as-separate-module',
          },
          {
            title: 'ADR-0004: Model IDs are pass-through',
            path: '/community/adr/0004-model-ids-are-pass-through',
          },
          { title: 'ADR-0005: No Copilot provider', path: '/community/adr/0005-no-copilot-provider' },
          {
            title: 'ADR-0006: Anthropic is its own module',
            path: '/community/adr/0006-anthropic-adapter-is-its-own-module',
          },
          { title: 'ADR-0007: OTel is its own module', path: '/community/adr/0007-otel-is-its-own-module' },
        ],
      },
    ],
  },
];
