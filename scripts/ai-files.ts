// Generates every machine-readable file from the docs source (src/docs/content.ts)
// and the real component files, so they can never drift from the site:
//   public/llms.txt, public/llms-full.txt, public/docs/*.md, public/tr/docs/*.md,
//   public/r/registry.json, public/r/<item>.json      (gitignored, rebuilt on every build)
//   skills/liquid-glass/references/components.md      (committed; the skill ships it)
// Runs from vite.config.ts at build and dev start. Fails loudly on a broken reference.
import { mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join, normalize, relative } from 'node:path'

import { CATALOG, CHANGE_KINDS, GROUPS, PAGES, REGISTRY, RELEASES, minorOf, pageBySlug, type Block, type DocPage, type RegistryItem } from '../src/docs/content'
import { REPO_URL, SITE_ORIGIN, installCommand, localizedPath, type Locale } from '../src/site/i18n'

const ROOT = join(import.meta.dirname, '..')
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8')
const write = (p: string, body: string) => {
  const abs = join(ROOT, p)
  mkdirSync(dirname(abs), { recursive: true })
  writeFileSync(abs, body)
}

const demoSource = (id: string) => read(`src/docs/demos/${id}.tsx`).trimEnd()

// ── Registry ──

const IMPORT_RE = /(?:from\s+|import\s*\(\s*)'([^']+)'/g

/** Entry files + every file they reach through relative imports. */
function closure(entries: string[]) {
  const files = new Set<string>()
  const packages = new Set<string>()
  const visit = (file: string) => {
    if (files.has(file)) return
    if (!existsSync(join(ROOT, file))) throw new Error(`[ai-files] missing file ${file}`)
    files.add(file)
    for (const [, spec] of read(file).matchAll(IMPORT_RE)) {
      if (spec.startsWith('.')) {
        const base = normalize(join(dirname(file), spec))
        const hit = ['', '.ts', '.tsx', '/index.ts'].map((ext) => base + ext).find((f) => existsSync(join(ROOT, f)) && !f.endsWith('/'))
        if (!hit) throw new Error(`[ai-files] ${file}: cannot resolve ${spec}`)
        visit(hit)
      } else if (spec.startsWith('#/') || spec.startsWith('@/')) {
        throw new Error(`[ai-files] ${file}: alias import ${spec} would break after copying; use a relative import`)
      } else if (spec !== 'react' && !spec.startsWith('react/') && spec !== 'react-dom') {
        packages.add(spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0])
      }
    }
  }
  entries.forEach(visit)
  return { files: [...files].sort(), packages: [...packages].sort() }
}

const VERSIONS: Record<string, string> = JSON.parse(read('package.json')).dependencies

function registryItem(item: RegistryItem) {
  const { files, packages } = closure(item.entries)
  return {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: item.name,
    type: 'registry:block',
    title: item.title,
    description: item.description,
    // What the files import, plus packages an item names itself (a peer the imports never mention).
    dependencies: [...new Set([...packages, ...(item.dependencies ?? [])])].sort().map((p) => `${p}@${VERSIONS[p] ?? 'latest'}`),
    ...(item.cssVars ? { cssVars: item.cssVars } : {}),
    ...(item.css ? { css: item.css } : {}),
    docs: `Docs: ${SITE_ORIGIN}/docs/${item.docs ?? item.name}.md — copy verbatim; customise through props and classes only.`,
    categories: ['liquid-glass'],
    files: files.map((path) => ({
      path,
      type: 'registry:component',
      target: relative('src', path),
      content: read(path),
    })),
  }
}

// ── Markdown ──

const md = (s: string) => s // the source strings are already Markdown (`code`, **bold**)

/** Agents get the export they import (GlassButton); the site shows the shorter docs title. */
const nameOf = (p: DocPage, locale: Locale) => p.name ?? p.title[locale]

function blockToMd(b: Block, locale: Locale): string {
  switch (b.type) {
    case 'p':
      return md(b.text[locale])
    case 'h':
      return `## ${b.text[locale]}`
    case 'list':
      return b.items.map((i) => `- ${md(i[locale])}`).join('\n')
    case 'note':
      return `> ${md(b.text[locale])}`
    case 'demo':
      return `${b.title ? `### ${b.title[locale]}\n\n` : ''}\`\`\`tsx\n${demoSource(b.id)}\n\`\`\``
    case 'code':
      return `\`\`\`${b.title === 'terminal' ? 'bash' : b.title === 'prompt' ? 'text' : 'tsx'}\n${b.code}\n\`\`\``
    case 'install':
      return `\`\`\`bash\n${installCommand(b.item)}\n\`\`\``
    case 'when': {
      const [use, avoid] = locale === 'tr' ? ['Şunun için', 'Şunun için değil'] : ['Use it for', 'Not for']
      return [`**${use}**`, '', ...b.use.map((i) => `- ${md(i[locale])}`), '', `**${avoid}**`, '', ...b.avoid.map((i) => `- ${md(i[locale])}`)].join('\n')
    }
    case 'index':
      return CATALOG.map(
        (p, i) =>
          `${String(i + 1).padStart(2, '0')}. **${p.verb?.[locale]}** — [${nameOf(p, locale)}](${SITE_ORIGIN}${localizedPath(`/docs/${p.slug}`, locale)}): ${(p.signature ?? p.description)[locale]}`,
      ).join('\n')
    case 'props': {
      const head = locale === 'tr' ? '| Prop | Tür | Varsayılan | Açıklama |' : '| Prop | Type | Default | Description |'
      const rows = b.rows.map((r) => `| \`${r.name}\` | \`${r.type.replace(/\|/g, '\\|')}\` | ${r.default ? `\`${r.default}\`` : '—'} | ${r.description[locale]} |`)
      return [head, '| --- | --- | --- | --- |', ...rows].join('\n')
    }
  }
}

export function pageToMarkdown(page: DocPage, locale: Locale): string {
  const parts = [`# ${nameOf(page, locale)}`, `> ${page.description[locale]}`]
  if (page.hero) parts.push(`\`\`\`tsx\n${demoSource(page.hero)}\n\`\`\``)
  for (const b of page.blocks) parts.push(blockToMd(b, locale))
  parts.push(`Source: ${SITE_ORIGIN}${localizedPath(`/docs/${page.slug}`, locale)}`)
  return parts.join('\n\n') + '\n'
}

const RULES = `## Rules for AI agents

1. Install with the shadcn CLI command shown on each page, or copy the files from ${REPO_URL}/tree/main/src/components/liquid-glass verbatim. Never re-implement, port or "simplify" the engine or shader: the look depends on its exact constants.
2. Customise only through the documented props and class names (\`className\`, \`bg-*\`, \`text-*\`, \`--glass-tint\`).
3. The components, one verb each: GlassButton (press), GlassActionButton (merge), GlassTabs (travel), GlassBadge (flow), GlassSlideToConfirm (drag), GlassCard (hold), GlassButtonGroup (share), RangeSlider (slide), Switch (flip), Checkbox (tick), GlassSelect (stretch), GlassDropdownMenu (open), GlassPopover (unfold), GlassSearch (find). Pick by the verb; they never overlap. GlassButton, GlassTabs, GlassSelect, GlassDropdownMenu, GlassPopover, GlassSearch, RangeSlider, Switch and Checkbox take their behaviour from UI SDK and need \`@ui-sdk/core\` and \`@ui-sdk/react\`; RangeSlider, Switch and Checkbox (imported from \`controls/\`) also need \`three\`; GlassSelect, GlassDropdownMenu, GlassPopover and GlassSearch are imported from \`glass-select\`, \`glass-dropdown-menu\`, \`glass-popover\` and \`glass-search\`. The rest have zero npm dependencies. They all wrap your own DOM. GlassActionButton's arrow is a gooey droplet that floats apart and melts into the body when pressed; GlassSelect's list stretches out of its button on a gooey neck, and GlassPopup (ships with it) puts that on your own menu or popover; GlassSearch's layers bud off the empty field as gooey droplets (give it \`layers\`, each with \`items\` or an async \`search\`). For your own tabs markup (Radix Tabs), GlassLens ships with GlassTabs; for a router link, use \`<GlassButton asChild>\`.
4. Requirements: React 19, Tailwind CSS v4, an \`@/\` alias to the source folder.`

function llmsIndex(): string {
  const lines = [
    '# Liquid Glass UI',
    '',
    '> Glass React components drawn in WebGL2, with behaviour from UI SDK (`@ui-sdk/core`, `@ui-sdk/react`) where a component needs it, one verb each: press (GlassButton), merge (GlassActionButton), travel (GlassTabs), flow (GlassBadge), drag (GlassSlideToConfirm), hold (GlassCard), slide (RangeSlider), flip (Switch), tick (Checkbox; these three need `three`), stretch (GlassSelect; needs `@ui-sdk/core` and `@ui-sdk/react`). Copy-paste components (shadcn registry), MIT.',
    '',
    RULES,
    '',
  ]
  for (const g of GROUPS) {
    lines.push(`## ${g.title.en}`, '')
    for (const p of PAGES.filter((x) => x.group === g.id)) lines.push(`- [${nameOf(p, 'en')}](${SITE_ORIGIN}/docs/${p.slug}.md): ${p.description.en}`)
    lines.push('')
  }
  lines.push('## Optional', '', `- [Full documentation in one file](${SITE_ORIGIN}/llms-full.txt)`, `- [Changelog](${SITE_ORIGIN}/changelog.md)`, `- [Türkçe dokümantasyon](${SITE_ORIGIN}/tr/docs/introduction.md)`, `- [Source code](${REPO_URL})`, '')
  return lines.join('\n')
}

const KIND_LABEL = {
  en: { new: 'New', improved: 'Improved', fixed: 'Fixed', removed: 'Removed' },
  tr: { new: 'Yeni', improved: 'İyileştirildi', fixed: 'Düzeltildi', removed: 'Kaldırıldı' },
} as const

/** The release notes, newest first: a heading per version, its patch releases under it. */
function changelogToMarkdown(locale: Locale): string {
  const lines = [locale === 'tr' ? '# Sürüm notları' : '# Changelog', '']
  let line = ''
  for (const r of RELEASES) {
    if (minorOf(r.version) !== line) {
      line = minorOf(r.version)
      lines.push(`## v${line}`, '')
    }
    lines.push(`### v${r.version} — ${r.date}`, '', r.title[locale], '')
    for (const k of CHANGE_KINDS) {
      const items = r.changes.filter((c) => c.kind === k)
      if (!items.length) continue
      lines.push(`**${KIND_LABEL[locale][k]}**`, '')
      for (const c of items) {
        const page = c.page ? pageBySlug(c.page) : undefined
        lines.push(`- ${page ? `[${nameOf(page, locale)}](${SITE_ORIGIN}${localizedPath(`/docs/${page.slug}`, locale)}.md): ` : ''}${c.text[locale]}`)
      }
      lines.push('')
    }
  }
  return lines.join('\n')
}

export function generateAiFiles() {
  // Start clean so a removed page or registry item never lingers in the output.
  for (const dir of ['public/r', 'public/docs', 'public/tr/docs']) rmSync(join(ROOT, dir), { recursive: true, force: true })
  for (const locale of ['en', 'tr'] as const) {
    for (const p of PAGES) write(`public${localizedPath(`/docs/${p.slug}`, locale)}.md`, pageToMarkdown(p, locale))
  }
  for (const locale of ['en', 'tr'] as const) write(`public${localizedPath('/changelog', locale)}.md`, changelogToMarkdown(locale))
  write('public/llms.txt', llmsIndex())
  write('public/llms-full.txt', ['# Liquid Glass UI — full documentation', '', RULES, '', ...PAGES.map((p) => pageToMarkdown(p, 'en'))].join('\n'))

  const items = REGISTRY.map(registryItem)
  for (const item of items) write(`public/r/${item.name}.json`, JSON.stringify(item, null, 2) + '\n')
  write(
    'public/r/registry.json',
    JSON.stringify(
      {
        $schema: 'https://ui.shadcn.com/schema/registry.json',
        name: 'liquid-glass',
        homepage: SITE_ORIGIN,
        items: items.map(({ content: _c, ...rest }: any) => ({ ...rest, files: rest.files.map(({ content: _x, ...f }: any) => f) })),
      },
      null,
      2,
    ) + '\n',
  )

  // The skill's reference: every page of the components, in English.
  write(
    'skills/liquid-glass/references/components.md',
    [
      '<!-- Generated from src/docs/content.ts by scripts/ai-files.ts. Do not edit by hand. -->',
      '',
      ...PAGES.filter((p) => p.group !== 'start').map((p) => pageToMarkdown(p, 'en')),
    ].join('\n'),
  )
}
