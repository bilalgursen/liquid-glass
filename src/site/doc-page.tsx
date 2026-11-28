import { Link, useLocation } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, Check, Copy, FileText, Minus } from 'lucide-react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GROUPS, PAGES, REGISTRY, badgeOf, pageBySlug, type Block, type DocPage, type PropRow } from '@/docs/content'
import { DEMOS } from '@/docs/demos'
import { cn } from '@/lib/utils'

import { GitHubMark, Inline, Stage, column } from './chrome'
import { CodeBlock, InstallCommand } from './code'
import { ComponentGrid } from './component-grid'
import { REPO_URL, SITE_ORIGIN, alternateLinks, localeFromParam, localeParam, localizedPath, shareMeta, type L, type Locale } from './i18n'
import { DocLink, exactActive } from './links'
import { BadgePill, ComponentNews, WhatsNewCard } from './release'
import { UI } from './ui'

export function docHead(page: DocPage, param: string | undefined, path: string) {
  const locale = localeFromParam(param) ?? 'en'
  const title = `${page.title[locale]} — Liquid Glass UI`
  return {
    meta: [
      { title },
      { name: 'description', content: page.description[locale] },
      { property: 'og:title', content: title },
      { property: 'og:description', content: page.description[locale] },
      ...shareMeta(path, locale),
    ],
    links: [...alternateLinks(path, locale), { rel: 'alternate', type: 'text/markdown', href: `${SITE_ORIGIN}${markdownPath(page, locale)}` }],
  }
}

const markdownPath = (page: DocPage, locale: Locale) => `${localizedPath(`/docs/${page.slug}`, locale)}.md`

/** Heading ids come from the English text so both languages share anchors. */
const anchor = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const isCurrent = (pathname: string, slug: string) => {
  const last = pathname.replace(/\/$/, '').split('/').pop()
  return slug === 'introduction' ? last === 'docs' : last === slug
}

// ── Sidebar ──

// The focus ring sits inside the row: the scrolling list would clip one drawn outside it.
const row = (active: boolean) =>
  `relative flex h-8 items-center gap-2 rounded-lg pr-2 pl-3 transition-colors duration-150 focus-visible:outline-offset-[-2px] ${
    active ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
  }`

export function DocsSidebar({ locale }: { locale: Locale }) {
  const pathname = useLocation({ select: (l) => l.pathname })
  const onChangelog = /\/changelog\/?$/.test(pathname)
  return (
    <aside className="sticky top-16 hidden h-[calc(100dvh-4rem-var(--band))] w-[248px] shrink-0 flex-col py-8 pr-4 pl-4 lg:flex">
      <nav aria-label={UI[locale].nav.docs} className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto overscroll-contain text-ui [scrollbar-width:thin]">
        {GROUPS.map((g) => (
          <div key={g.id} className="flex flex-col gap-0.5">
            <p className="pb-2 pl-3 text-caption font-medium text-muted-foreground">{g.title[locale]}</p>
            {PAGES.filter((p) => p.group === g.id).map((p) => {
              const active = !onChangelog && isCurrent(pathname, p.slug)
              const badge = badgeOf(p.slug)
              return (
                <DocLink key={p.slug} page={p} locale={locale} className={row(active)}>
                  <span className="truncate">{p.title[locale]}</span>
                  {badge && p.group === 'components' && (
                    <span className="ml-auto">
                      <BadgePill locale={locale} kind={badge} />
                    </span>
                  )}
                </DocLink>
              )
            })}
          </div>
        ))}
        <div className="flex flex-col gap-0.5">
          <p className="pb-2 pl-3 text-caption font-medium text-muted-foreground">{UI[locale].docs.resources}</p>
          <Link to="/{-$locale}/changelog" params={{ locale: localeParam(locale) }} activeOptions={exactActive} className={row(onChangelog)}>
            {UI[locale].changelog.title}
          </Link>
          <a href={`${SITE_ORIGIN}/llms.txt`} className={row(false)}>
            <span className="font-mono text-caption">llms.txt</span>
          </a>
        </div>
      </nav>
      <div className="pt-4">
        <WhatsNewCard locale={locale} />
      </div>
    </aside>
  )
}

/** Sidebar + page, the frame every docs page and the changelog share. */
export function DocsShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <div className={`${column} flex min-h-[calc(100dvh-4rem)] gap-10 px-4 sm:px-6 lg:pl-0 xl:gap-14`}>
      <DocsSidebar locale={locale} />
      <main className="flex min-w-0 flex-1">{children}</main>
    </div>
  )
}

// ── Blocks ──

/** A live demo with a Preview / Code switch (shadcn Tabs). The code is the demo file itself. */
export function Preview({ id, locale, title, className = '' }: { id: string; locale: Locale; title?: string; className?: string }) {
  const demo = DEMOS[id]
  if (!demo) throw new Error(`Unknown demo "${id}"`)
  const { Component, source } = demo
  const t = UI[locale].code
  return (
    <Tabs defaultValue="preview" className={cn('overflow-hidden rounded-2xl border border-border bg-background', className)}>
      <div className="flex h-11 items-center gap-1 border-b border-border px-2">
        <TabsList aria-label={title ?? t.example}>
          <TabsTrigger value="preview">{t.preview}</TabsTrigger>
          <TabsTrigger value="code">{t.code}</TabsTrigger>
        </TabsList>
        <span className="ml-auto truncate pr-2 font-mono text-micro text-muted-foreground">{id}.tsx</span>
      </div>
      {/* The preview stays mounted so the glass keeps its state when you peek at the code. */}
      <TabsContent value="preview" forceMount className="data-[state=inactive]:hidden">
        {/* A demo marked data-bleed runs from one side of the stage to the other: no padding at the sides. */}
        <Stage className="min-h-[340px] p-6 sm:p-12 has-[>[data-bleed]]:px-0!">
          <Component />
        </Stage>
      </TabsContent>
      <TabsContent value="code">
        <CodeBlock code={source} locale={locale} bare />
      </TabsContent>
    </Tabs>
  )
}

function Install({ item, locale }: { item: string; locale: Locale }) {
  const t = UI[locale].docs
  const manual = pageBySlug('installation')!
  return (
    <div className="flex flex-col gap-3">
      <InstallCommand item={item} locale={locale} />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-ui text-muted-foreground">
        <Badge size="lg" className="font-mono">
          {t.noDeps}
        </Badge>
        {item !== 'liquid-glass' && (
          <DocLink page={manual} locale={locale} className="underline-offset-4 hover:text-foreground hover:underline">
            {t.manualLink} →
          </DocLink>
        )}
      </div>
    </div>
  )
}

function When({ use, avoid, locale }: { use: L[]; avoid: L[]; locale: Locale }) {
  const t = UI[locale].docs
  const column = (title: string, items: L[], good: boolean) => (
    <div className="flex flex-col gap-3 bg-background p-5">
      <p className="text-ui font-medium text-foreground">{title}</p>
      <ul className="flex flex-col gap-2.5">
        {items.map((i, n) => (
          <li key={n} className="flex gap-2.5 text-body-sm leading-relaxed text-muted-foreground">
            {good ? <Check aria-hidden className="mt-1 size-3.5 shrink-0 text-kind-new" /> : <Minus aria-hidden className="mt-1 size-3.5 shrink-0 text-faint" />}
            <span>
              <Inline text={i[locale]} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
  return (
    <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
      {column(t.use, use, true)}
      {column(t.avoid, avoid, false)}
    </div>
  )
}

export function PropsTable({ rows, locale }: { rows: PropRow[]; locale: Locale }) {
  const t = UI[locale].docs
  return (
    <Table className="min-w-[560px]">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[38%]">{t.prop}</TableHead>
          <TableHead className="w-[32%]">{t.type}</TableHead>
          <TableHead>{t.default}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.name}>
            <TableCell>
              <code className="font-mono text-ui font-medium text-foreground">{r.name}</code>
              <p className="mt-1 leading-relaxed text-muted-foreground">
                <Inline text={r.description[locale]} />
              </p>
            </TableCell>
            <TableCell className="font-mono text-caption text-(--tok-tag)">{r.type}</TableCell>
            {/* A long default (a class list) wraps instead of squeezing the type column. */}
            <TableCell className="font-mono text-caption text-muted-foreground [overflow-wrap:anywhere]">{r.default ?? '—'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

const h2 = 'scroll-mt-24 pt-10 text-title font-semibold tracking-[-0.02em] text-foreground'

function BlockView({ block, locale }: { block: Block; locale: Locale }) {
  switch (block.type) {
    case 'p':
      return (
        <p className="text-body text-muted-foreground">
          <Inline text={block.text[locale]} />
        </p>
      )
    case 'h':
      return (
        <h2 id={anchor(block.text.en)} className={h2}>
          {block.text[locale]}
        </h2>
      )
    case 'list':
      return (
        <ul className="flex list-disc flex-col gap-2 pl-5 text-body text-muted-foreground marker:text-border-strong">
          {block.items.map((i, n) => (
            <li key={n}>
              <Inline text={i[locale]} />
            </li>
          ))}
        </ul>
      )
    case 'note':
      return (
        <p className="mt-4 border-l-2 border-border-strong pl-4 text-ui leading-relaxed text-muted-foreground">
          <Inline text={block.text[locale]} />
        </p>
      )
    case 'demo':
      return (
        <figure className="flex flex-col gap-3">
          {block.title && <figcaption className="text-body-sm font-medium text-foreground">{block.title[locale]}</figcaption>}
          <Preview id={block.id} locale={locale} title={block.title?.[locale]} />
        </figure>
      )
    case 'code':
      return <CodeBlock code={block.code} title={block.title} locale={locale} />
    case 'install':
      return (
        <>
          <h2 id="installation" className={h2}>
            {UI[locale].docs.install}
          </h2>
          <Install item={block.item} locale={locale} />
        </>
      )
    case 'when':
      return <When use={block.use} avoid={block.avoid} locale={locale} />
    case 'props':
      return <PropsTable rows={block.rows} locale={locale} />
    case 'index':
      return <ComponentGrid locale={locale} />
  }
}

// ── Examples: held back ──

/**
 * The Examples sections are held back for now: the site leaves them out, heading and
 * all, and promises nothing in their place. The blocks stay in content.ts (and in the
 * Markdown and llms files); set this to false to bring them back. Pages listed in
 * EXAMPLES_SHOWN (by slug) show theirs already: all of them, or only the demos named
 * (each with the text that follows it, up to the next demo).
 */
const EXAMPLES_HIDDEN = true
const EXAMPLES_SHOWN: Record<string, 'all' | string[]> = {
  'slide-to-confirm': 'all',
  button: ['glass-button-props'],
}

/** Drops each Examples section (or all of it but the demos its page shows): its heading and everything up to the next one. */
function withoutExamples(blocks: Block[], slug: string): Block[] {
  const shown = EXAMPLES_SHOWN[slug]
  if (!EXAMPLES_HIDDEN || shown === 'all') return blocks
  const out: Block[] = []
  let inExamples = false
  let keep = true
  for (const b of blocks) {
    if (b.type === 'h' || b.type === 'install') {
      inExamples = b.type === 'h' && b.text.en === 'Examples'
      keep = !inExamples || !!shown
    } else if (inExamples && b.type === 'demo') keep = !!shown && shown.includes(b.id)
    if (keep) out.push(b)
  }
  return out
}

// ── Table of contents ──

function tocOf(page: DocPage, locale: Locale) {
  return withoutExamples(page.blocks, page.slug).flatMap((b) =>
    b.type === 'h' ? [{ id: anchor(b.text.en), label: b.text[locale] }] : b.type === 'install' ? [{ id: 'installation', label: UI[locale].docs.install }] : [],
  )
}

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/** "On this page": one marker slides along the rail to the section in view. */
export function Toc({ items, locale }: { items: { id: string; label: string }[]; locale: Locale }) {
  const [active, setActive] = useState<string | null>(null)
  const [mark, setMark] = useState<{ y: number; h: number } | null>(null)
  const list = useRef<HTMLUListElement>(null)
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => !!e)
    if (!els.length) return
    setActive((a) => a ?? els[0].id)
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (hit) setActive(hit.target.id)
      },
      { rootMargin: '-88px 0px -60% 0px' },
    )
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [items])
  useIsoLayoutEffect(() => {
    const a = list.current?.querySelector<HTMLElement>(`[data-toc="${active}"]`)
    setMark(a ? { y: a.offsetTop, h: a.offsetHeight } : null)
  }, [active, items])
  if (items.length < 2) return null
  const t = UI[locale].docs
  return (
    <aside className="sticky top-16 hidden h-fit w-[200px] shrink-0 py-10 md:py-14 xl:block">
      <p className="pb-3 text-caption font-medium text-faint">{t.onThisPage}</p>
      <ul ref={list} className="relative flex flex-col border-l border-border text-ui">
        {mark && (
          <span
            aria-hidden
            className="absolute -left-px w-px bg-foreground transition-[translate,height] duration-200 ease-(--ease-out) motion-reduce:transition-none"
            style={{ translate: `0 ${mark.y}px`, height: mark.h, top: 0 }}
          />
        )}
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              data-toc={i.id}
              aria-current={active === i.id ? 'location' : undefined}
              className={`block py-1 pl-3 transition-colors duration-150 ${active === i.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {i.label}
            </a>
          </li>
        ))}
      </ul>
      <a href="#content" className="mt-5 inline-flex items-center gap-1.5 text-caption text-faint transition-colors hover:text-foreground">
        <ArrowUp aria-hidden className="size-3" />
        {t.backToTop}
      </a>
    </aside>
  )
}

// ── Article ──

const meta = 'text-muted-foreground hover:text-foreground'

/** Copies the page's Markdown (the same file agents read) to the clipboard. */
function CopyPage({ page, locale }: { page: DocPage; locale: Locale }) {
  const t = UI[locale].docs
  const [done, setDone] = useState(false)
  const copy = async () => {
    const text = fetch(markdownPath(page, locale)).then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
    try {
      // A ClipboardItem with a pending blob keeps the click's permission across the fetch (Safari).
      await navigator.clipboard.write([new ClipboardItem({ 'text/plain': text.then((s) => new Blob([s], { type: 'text/plain' })) })])
    } catch {
      try {
        await navigator.clipboard.writeText(await text)
      } catch {
        return
      }
    }
    setDone(true)
    setTimeout(() => setDone(false), 1400)
  }
  return (
    <>
      <Button variant="outline" size="xs" onClick={copy} className={meta}>
        <span aria-hidden className="icon-swap">
          <Copy data-shown={!done} />
          <Check data-shown={done} />
        </span>
        {t.copyPage}
      </Button>
      <span role="status" className="sr-only">
        {done ? t.copied : ''}
      </span>
    </>
  )
}

export function DocArticle({ page, locale }: { page: DocPage; locale: Locale }) {
  const t = UI[locale].docs
  const i = PAGES.indexOf(page)
  const prev = PAGES[i - 1]
  const next = PAGES[i + 1]
  const group = GROUPS.find((g) => g.id === page.group)!
  const toc = useMemo(() => tocOf(page, locale), [page, locale])
  const badge = page.group === 'components' ? badgeOf(page.slug) : null
  return (
    <div className="flex min-w-0 flex-1 gap-12">
      <article className="mx-auto flex w-full max-w-[760px] min-w-0 flex-col gap-5 py-10 md:py-14">
        <header className="flex flex-col gap-3 pb-3">
          <div className="flex items-center justify-between gap-4">
            <p className="flex items-center gap-2 font-mono text-caption text-faint">
              {group.title[locale]}
            </p>
            <div className="flex items-center gap-1.5">
              {prev && (
                <Button asChild variant="outline" size="icon-sm" className={meta}>
                  <DocLink page={prev} locale={locale} aria-label={`${t.prev}: ${prev.title[locale]}`}>
                    <ArrowLeft aria-hidden />
                  </DocLink>
                </Button>
              )}
              {next && (
                <Button asChild variant="outline" size="icon-sm" className={meta}>
                  <DocLink page={next} locale={locale} aria-label={`${t.next}: ${next.title[locale]}`}>
                    <ArrowRight aria-hidden />
                  </DocLink>
                </Button>
              )}
            </div>
          </div>
          <h1 className="flex flex-wrap items-center gap-3 font-display text-[40px] leading-[1.05] tracking-[-0.01em] text-foreground">
            {page.title[locale]}
            {badge && <BadgePill locale={locale} kind={badge} />}
          </h1>
          <p className="max-w-[60ch] text-lead text-muted-foreground">{page.description[locale]}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <CopyPage page={page} locale={locale} />
            <Button asChild variant="outline" size="xs" className={meta}>
              <a href={markdownPath(page, locale)}>
                <FileText aria-hidden />
                {t.markdown}
              </a>
            </Button>
            {page.group === 'components' && (
              <Button asChild variant="outline" size="xs" className={meta}>
                <a href={`${REPO_URL}/blob/main/${REGISTRY.find((r) => r.name === page.slug)?.entries[0] ?? `src/components/liquid-glass/${page.slug}.tsx`}`} target="_blank" rel="noreferrer">
                  <GitHubMark className="size-3.5" />
                  {t.source}
                  <ArrowUpRight aria-hidden className="size-3" />
                </a>
              </Button>
            )}
          </div>
        </header>
        {page.group === 'components' && <ComponentNews slug={page.slug} locale={locale} />}
        {page.hero && <Preview id={page.hero} locale={locale} />}
        {withoutExamples(page.blocks, page.slug).map((b, k) => <BlockView key={k} block={b} locale={locale} />)}
        <nav aria-label={t.pagination} className="mt-12 grid grid-cols-2 gap-3 text-ui">
          {prev ? (
            <DocLink page={prev} locale={locale} className="flex flex-col gap-1 rounded-xl border border-border p-4 transition-colors hover:bg-muted">
              <span className="flex items-center gap-1 text-muted-foreground">
                <ArrowLeft aria-hidden className="size-3.5" />
                {t.prev}
              </span>
              <span className="font-medium text-foreground">{prev.title[locale]}</span>
            </DocLink>
          ) : (
            <span />
          )}
          {next && (
            <DocLink page={next} locale={locale} className="flex flex-col items-end gap-1 rounded-xl border border-border p-4 text-right transition-colors hover:bg-muted">
              <span className="flex items-center gap-1 text-muted-foreground">
                {t.next}
                <ArrowRight aria-hidden className="size-3.5" />
              </span>
              <span className="font-medium text-foreground">{next.title[locale]}</span>
            </DocLink>
          )}
        </nav>
      </article>
      <Toc items={toc} locale={locale} />
    </div>
  )
}
