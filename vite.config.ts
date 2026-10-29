import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: Number(process.env.PORT ?? 0),
    strictPort: false,
  },
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    // Static site generation (SSG): every route renders to a real
    // `index.html` with full page content at build time, under
    // `.output/public` — SEO-friendly static files that hydrate on the
    // client. Forge publishes static output only; there is no SSR server at
    // runtime (`.output/server` is a build-time artifact the prerenderer
    // runs, never deployed). Because pages render in Node during the build,
    // components must guard client-only APIs (`window`, `document`, three.js
    // canvas setup, animation DOM work, …) behind `useEffect`. `failOnError`
    // fails the build on error responses; React render throws are swallowed
    // (Start recovers client-side and emits a content-less page), so the
    // `build` script also runs `scripts/verify-static-build.mjs` to catch
    // those — otherwise a broken page silently ships as empty HTML.
    tanstackStart({
      prerender: { enabled: true, crawlLinks: true, failOnError: true },
    }),
    viteReact(),
  ],
})
