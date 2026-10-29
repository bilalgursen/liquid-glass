// Fail the build when a prerendered page shipped a failed server render.
//
// React marks a boundary that threw during SSR with an `<!--$!-->` comment
// (a clean render emits `<!--$-->`). TanStack Start recovers from such a
// throw by client-rendering the page, so `vite build` still exits 0 and the
// prerender step writes a content-less HTML file — the deployed page would
// look fine in a browser but be empty to search engines. This site exists as
// SEO-friendly static output, so treat that as a build failure and say
// exactly which pages are affected.
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const outDir = join(import.meta.dirname, '..', '.output', 'public')

let pages
try {
  pages = htmlFilesUnder(outDir)
} catch {
  console.error(`[verify-static-build] No static output at ${outDir} — the prerender step did not run.`)
  process.exit(1)
}
if (pages.length === 0) {
  console.error('[verify-static-build] No prerendered .html pages found — the published site would be empty.')
  process.exit(1)
}

const broken = pages.filter((abs) =>
  readFileSync(abs, 'utf8').includes('<!--$!-->'),
)
if (broken.length > 0) {
  console.error(
    '[verify-static-build] Server render failed for:\n' +
      broken.map((abs) => `  - /${relative(outDir, abs)}`).join('\n') +
      '\nA component on these routes threw while rendering at build time' +
      ' (see the "Error in renderToReadableStream" message above — usually' +
      ' `window`/`document` accessed during render). Move browser-only work' +
      ' into `useEffect`, or set `ssr: false` on that route. See AGENTS.md' +
      ' ("Pages").',
  )
  process.exit(1)
}
console.log(`[verify-static-build] ${pages.length} static page(s) OK.`)

function htmlFilesUnder(dir) {
  const found = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, entry.name)
    if (entry.isDirectory()) found.push(...htmlFilesUnder(abs))
    else if (entry.name.endsWith('.html')) found.push(abs)
  }
  return found
}
