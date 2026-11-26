import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig, type Plugin } from 'vite'

import { generateAiFiles } from './scripts/ai-files'
import { PAGES } from './src/docs/content'
import { LOCALES, SITE_ORIGIN, localizedPath } from './src/site/i18n'

/** Every public page, in both languages. The single list the prerenderer and sitemap use. */
const paths = LOCALES.flatMap((l) => ['/', '/docs', '/changelog', ...PAGES.filter((p) => p.slug !== 'introduction').map((p) => `/docs/${p.slug}`)].map((p) => localizedPath(p, l)))

/** llms.txt, per-page Markdown, the shadcn registry and the skill reference (scripts/ai-files.ts). */
const aiFiles = (): Plugin => ({
  name: 'liquid-glass-ai-files',
  buildStart: () => generateAiFiles(),
  configureServer: () => generateAiFiles(),
})

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: Number(process.env.PORT ?? 0),
    strictPort: false,
  },
  resolve: { tsconfigPaths: true },
  plugins: [
    aiFiles(),
    tailwindcss(),
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    // Static site generation: every page in `paths` renders to real HTML under
    // `.output/public` and hydrates on the client. There is no server at runtime, so
    // components must keep `window`/`document` inside effects. `failOnError` fails the
    // build on error responses; scripts/verify-static-build.mjs catches render throws.
    tanstackStart({
      pages: [
        ...paths.map((path) => ({ path })),
        { path: '/404', sitemap: { exclude: true } },
        { path: '/tr/404', sitemap: { exclude: true } },
      ],
      prerender: {
        enabled: true,
        crawlLinks: true,
        failOnError: true,
        filter: (page) => !page.path.includes('#') && !page.path.includes('?') && !page.path.endsWith('.md') && !page.path.endsWith('.txt') && !page.path.endsWith('.json'),
      },
      sitemap: { host: SITE_ORIGIN },
    }),
    viteReact(),
  ],
})
