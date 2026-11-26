import { Link, useLocation } from '@tanstack/react-router'
import { ArrowRight, Menu, Moon, Sun, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type FocusEvent, type PointerEvent, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { CATALOG, FEATURED, PAGES, VERSION, minorOf } from '@/docs/content'
import { cn } from '@/lib/utils'

import { GitHubMark, Rivets, Wordmark, column } from './chrome'
import { REPO_URL, SITE_ORIGIN, localeParam, type Locale } from './i18n'
import { DocLink, exactActive } from './links'
import { setTheme, useTheme } from './theme'
import { UI } from './ui'

// The header: logo, a dock in the middle (Docs ▾, Components ▾, Changelog, For AI) with one
// highlight that slides between items, and one shared panel that morphs between menus. The
// dock is shadcn's NavigationMenu (Radix), the phone menu shadcn's Sheet. Plain CSS (blur, no
// WebGL): the glass belongs to the components, not the frame.

type MenuId = 'docs' | 'components'

function ThemeToggle({ locale }: { locale: Locale }) {
  const [theme] = useTheme()
  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={UI[locale].theme.label}>
      <Sun className="dark:hidden" />
      <Moon className="hidden dark:block" />
    </Button>
  )
}

// Stars come from the public GitHub API in the browser (the pages are prerendered, so the
// count is never baked in). One request per session; until it answers, only the mark shows.
const STARS_KEY = 'lg-stars'
let starsRequest: Promise<number | null> | null = null

function loadStars(): Promise<number | null> {
  try {
    const cached = sessionStorage.getItem(STARS_KEY)
    if (cached !== null) return Promise.resolve(Number(cached))
  } catch {}
  starsRequest ??= fetch(`https://api.github.com/repos/${new URL(REPO_URL).pathname.slice(1)}`)
    .then((r) => (r.ok ? r.json() : null))
    .then((repo: { stargazers_count?: number } | null) => {
      const n = typeof repo?.stargazers_count === 'number' ? repo.stargazers_count : null
      try {
        if (n !== null) sessionStorage.setItem(STARS_KEY, String(n))
      } catch {}
      return n
    })
    .catch(() => null)
  return starsRequest
}

function useStars() {
  const [stars, setStars] = useState<number | null>(null)
  useEffect(() => {
    let live = true
    loadStars().then((n) => live && setStars(n))
    return () => {
      live = false
    }
  }, [])
  return stars
}

function GitHubButton({ locale }: { locale: Locale }) {
  const t = UI[locale]
  const stars = useStars()
  const tag = locale === 'tr' ? 'tr-TR' : 'en-US'
  return (
    <Button asChild variant="ghost" size="icon" className={stars === null ? undefined : 'w-auto gap-1.5 px-2.5'}>
      <a
        href={REPO_URL}
        target="_blank"
        rel="noreferrer"
        aria-label={stars === null ? t.nav.github : `${t.nav.github}, ${new Intl.NumberFormat(tag).format(stars)} ${t.nav.stars}`}
      >
        <GitHubMark />
        {stars !== null && (
          <span className="text-ui font-medium tabular-nums text-muted-foreground">
            {new Intl.NumberFormat(tag, { notation: 'compact', maximumFractionDigits: 1 }).format(stars)}
          </span>
        )}
      </a>
    </Button>
  )
}

// ── Panel contents ──

const item = 'group flex rounded-lg transition-colors duration-100 hover:bg-muted hover:duration-0'

function ComponentsPanel({ locale }: { locale: Locale }) {
  const t = UI[locale]
  return (
    <div className="flex w-[min(640px,calc(100vw-2rem))] flex-col gap-1 p-2">
      <ul className="grid grid-cols-2 gap-1">
        {CATALOG.map((p, i) => (
          <li key={p.slug} className={i === 0 || (CATALOG.length % 2 === 0 && i === CATALOG.length - 1) ? 'col-span-2' : ''}>
            <NavigationMenuLink asChild>
              <DocLink page={p} locale={locale} className={`${item} items-center gap-3.5 p-2.5`}>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="text-ui leading-none font-medium text-foreground">{p.title[locale]}</span>
                  <span className="line-clamp-2 text-ui leading-snug text-muted-foreground">{p.signature?.[locale]}</span>
                </span>
              </DocLink>
            </NavigationMenuLink>
          </li>
        ))}
      </ul>
      <WhatsNewRow locale={locale} label={t.nav.whatsNew} />
    </div>
  )
}

function WhatsNewRow({ locale, label }: { locale: Locale; label: string }) {
  return (
    <NavigationMenuLink asChild>
      <Link
        to="/{-$locale}/changelog"
        params={{ locale: localeParam(locale) }}
        activeOptions={exactActive}
        className={`${item} items-center gap-3 border-t border-border px-3 pt-3 pb-2.5 hover:rounded-lg`}
      >
        <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-kind-new" />
        <span className="shrink-0 text-ui font-medium text-foreground">{label}</span>
        {/* The news is the last version that added a component, not the last patch. */}
        <span className="shrink-0 font-mono text-micro text-faint">v{minorOf(FEATURED.version)}</span>
        <span className="min-w-0 flex-1 truncate text-ui text-muted-foreground">{FEATURED.title[locale]}</span>
        <ArrowRight className="size-3.5 shrink-0 text-faint group-hover:text-foreground motion-safe:transition-transform motion-safe:duration-150 motion-safe:group-hover:translate-x-0.5" />
      </Link>
    </NavigationMenuLink>
  )
}

function DocsPanel({ locale }: { locale: Locale }) {
  const t = UI[locale]
  const start = PAGES.filter((p) => p.group === 'start')
  return (
    <div className="flex w-[min(520px,calc(100vw-2rem))] flex-col gap-1 p-2">
      <ul className="flex flex-col gap-0.5">
        {start.map((p) => (
          <li key={p.slug}>
            <NavigationMenuLink asChild>
              <DocLink page={p} locale={locale} className={`${item} flex-col gap-1 px-3 py-2.5`}>
                <span className="text-ui leading-none font-medium text-foreground">{p.title[locale]}</span>
                <span className="text-ui leading-snug text-muted-foreground">{p.description[locale]}</span>
              </DocLink>
            </NavigationMenuLink>
          </li>
        ))}
        <li>
          <NavigationMenuLink asChild>
            <Link to="/{-$locale}/changelog" params={{ locale: localeParam(locale) }} activeOptions={exactActive} className={`${item} flex-col gap-1 px-3 py-2.5`}>
              <span className="text-ui leading-none font-medium text-foreground">{t.changelog.title}</span>
              <span className="text-ui leading-snug text-muted-foreground">{t.changelog.description}</span>
            </Link>
          </NavigationMenuLink>
        </li>
      </ul>
      <NavigationMenuLink asChild>
        <a href={`${SITE_ORIGIN}/llms.txt`} className={`${item} items-center justify-between gap-3 border-t border-border px-3 pt-3 pb-2.5`}>
          <span className="font-mono text-caption text-foreground">llms.txt</span>
          <span className="text-ui text-muted-foreground">{t.nav.llms}</span>
        </a>
      </NavigationMenuLink>
    </div>
  )
}

// ── Dock ──

/** Where the highlight sits; null until the pointer or focus first reaches the dock. */
type Hl = { x: number; w: number; instant: boolean }

function Dock({ locale, section }: { locale: Locale; section: string | null }) {
  const t = UI[locale].nav
  const p = { locale: localeParam(locale) }
  const [value, setValue] = useState('')
  const [hl, setHl] = useState<Hl | null>(null)
  const [pointerIn, setPointerIn] = useState(false)
  const [focusIn, setFocusIn] = useState(false)
  const triggers = useRef<Partial<Record<MenuId, HTMLButtonElement | null>>>({})

  // The highlight shows while the pointer or focus is on the dock, or a menu is open.
  const shown = !!hl && (pointerIn || focusIn || value !== '')
  const shownRef = useRef(shown)
  shownRef.current = shown

  // Items are positioned against the list, so offsetLeft is where the highlight slides to. It
  // jumps there instead when it was hidden.
  const moveTo = useCallback((el: HTMLElement | null | undefined) => {
    if (el) setHl({ x: el.offsetLeft, w: el.offsetWidth, instant: !shownRef.current })
  }, [])

  const follow = {
    onPointerEnter: (e: PointerEvent<HTMLElement>) => {
      if (e.pointerType === 'mouse') moveTo(e.currentTarget)
    },
    onFocus: (e: FocusEvent<HTMLElement>) => moveTo(e.currentTarget),
  }

  const trigger = (id: MenuId, label: string) => (
    <NavigationMenuItem value={id}>
      <NavigationMenuTrigger
        ref={(el) => {
          triggers.current[id] = el
        }}
        {...follow}
        className={cn(section === id && 'text-foreground')}
      >
        {label}
      </NavigationMenuTrigger>
      <NavigationMenuContent>{id === 'docs' ? <DocsPanel locale={locale} /> : <ComponentsPanel locale={locale} />}</NavigationMenuContent>
    </NavigationMenuItem>
  )

  return (
    <NavigationMenu
      aria-label={t.primary}
      value={value}
      onValueChange={(v) => {
        setValue(v)
        // Opened by a tap or a key: the highlight goes to that trigger too.
        if (v) moveTo(triggers.current[v as MenuId])
      }}
      delayDuration={80}
      onFocus={() => setFocusIn(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocusIn(false)
      }}
    >
      <NavigationMenuList
        onPointerEnter={() => setPointerIn(true)}
        onPointerLeave={() => setPointerIn(false)}
        className="rounded-full border border-border bg-surface/70 p-1 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
      >
        <li
          aria-hidden
          role="presentation"
          className={cn(
            'pointer-events-none absolute inset-y-1 left-0 rounded-full bg-muted shadow-[inset_0_0_0_1px_var(--border)] motion-reduce:transition-opacity',
            hl?.instant ? 'transition-opacity duration-150' : 'transition-[translate,width,opacity] duration-[220ms,220ms,150ms] ease-(--ease-drawer)',
          )}
          style={{ translate: `${hl?.x ?? 0}px 0`, width: hl?.w ?? 0, opacity: shown ? 1 : 0 }}
        />
        {trigger('docs', t.docs)}
        {trigger('components', t.components)}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              to="/{-$locale}/changelog"
              params={p}
              activeOptions={exactActive}
              {...follow}
              className={cn(navigationMenuTriggerStyle(), section === 'changelog' && 'text-foreground')}
            >
              {t.changelog}
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              to="/{-$locale}/docs/$slug"
              params={{ ...p, slug: 'ai' }}
              activeOptions={exactActive}
              {...follow}
              className={cn(navigationMenuTriggerStyle(), section === 'ai' && 'text-foreground')}
            >
              {t.ai}
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

// ── Phone ──

/** The phone menu: a full-screen sheet whose top row repeats the header, so only the menu
 * icon turns into a close icon. Rails run its full height, like the page's. */
function MobileMenu({ locale }: { locale: Locale }) {
  const t = UI[locale]
  const [open, setOpen] = useState(false)
  const p = { locale: localeParam(locale) }
  const closeRef = useRef<HTMLButtonElement>(null)

  // The sheet exists below the dock's breakpoint only; widening the window closes it.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 48rem)')
    const close = () => mq.matches && setOpen(false)
    mq.addEventListener('change', close)
    return () => mq.removeEventListener('change', close)
  }, [])

  const row = 'flex h-11 items-center justify-between gap-3 rounded-lg px-3 text-body text-foreground transition-colors duration-150 hover:bg-muted aria-[current=page]:bg-muted aria-[current=page]:font-medium'
  const group = 'px-3 pb-2 text-caption font-medium text-muted-foreground'
  // Every link closes the sheet on its way out.
  const close = (node: ReactNode, key?: string) => (
    <SheetClose key={key} asChild>
      {node}
    </SheetClose>
  )

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t.nav.menu} className="md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="top"
        overlay={false}
        aria-describedby={undefined}
        // Focus lands on the close button, where the menu button was.
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          closeRef.current?.focus()
        }}
        className="bottom-0 border-b-0 md:hidden"
      >
        <SheetTitle className="sr-only">{t.nav.menu}</SheetTitle>
        <div className="border-b border-rail">
          <div className={`${column} flex h-16 items-center gap-6 px-4 sm:px-6`}>
            <Rivets at={['bl', 'br']} />
            {close(
              <Link to="/{-$locale}" params={p} activeOptions={exactActive} aria-label="Liquid Glass UI" className="flex items-center text-foreground">
                <Wordmark />
              </Link>,
            )}
            <div className="ml-auto flex items-center gap-2">
              <GitHubButton locale={locale} />
              <ThemeToggle locale={locale} />
              <SheetClose asChild>
                <Button ref={closeRef} variant="ghost" size="icon" aria-label={t.nav.close}>
                  <X />
                </Button>
              </SheetClose>
            </div>
          </div>
        </div>
        <div className={`${column} min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-6 pb-10`}>
          <nav aria-label={t.nav.primary} className="flex flex-col gap-7">
            <div className="flex flex-col">
              <p className={group}>{t.nav.docs}</p>
              {PAGES.filter((x) => x.group === 'start').map((x) =>
                close(
                  <DocLink page={x} locale={locale} className={row}>
                    {x.title[locale]}
                  </DocLink>,
                  x.slug,
                ),
              )}
              {close(
                <Link to="/{-$locale}/changelog" params={p} activeOptions={exactActive} className={row}>
                  {t.changelog.title}
                  <span className="font-mono text-micro text-muted-foreground">v{VERSION}</span>
                </Link>,
              )}
            </div>
            <div className="flex flex-col">
              <p className={group}>{t.nav.components}</p>
              {CATALOG.map((x) =>
                close(
                  <DocLink page={x} locale={locale} className={row}>
                    {x.title[locale]}
                  </DocLink>,
                  x.slug,
                ),
              )}
            </div>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ── Header ──

export function SiteHeader({ locale }: { locale: Locale }) {
  const p = { locale: localeParam(locale) }
  const path = useLocation({ select: (l) => l.pathname })
  const home = /^\/(tr\/?)?$/.test(path)
  const section = /\/docs\/ai\/?$/.test(path)
    ? 'ai'
    : CATALOG.some((x) => path.replace(/\/$/, '').endsWith(`/docs/${x.slug}`))
      ? 'components'
      : path.includes('/docs')
        ? 'docs'
        : path.includes('/changelog')
          ? 'changelog'
          : null

  // Transparent over the landing hero; a material once the page scrolls under it.
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  const solid = scrolled || !home

  return (
    <header className="sticky top-0 z-40 w-full border-b border-rail">
      {/* The material is a layer of its own: a backdrop-filter on the header itself would make
          the header the containing block of anything fixed inside it. */}
      <div
        aria-hidden
        className={`absolute inset-0 -z-10 transition-[background-color] duration-200 ${
          solid ? 'bg-background/80 backdrop-blur-xl backdrop-saturate-150' : 'bg-transparent'
        }`}
      />
      {/* The header is part of the frame: its rails are the page's rails, its border the first divider. */}
      <div className={`${column} flex h-16 items-center gap-6 px-4 sm:px-6`}>
        <Rivets at={['bl', 'br']} />
        <div className="flex shrink-0 items-center gap-3">
          <Link to="/{-$locale}" params={p} activeOptions={exactActive} aria-label="Liquid Glass UI" className="flex items-center text-foreground">
            <Wordmark />
          </Link>
        </div>
        {/* w-max: centred from the middle, the dock would otherwise only get half the bar and
            wrap its labels at tablet widths. */}
        <div className="absolute left-1/2 hidden w-max -translate-x-1/2 md:block">
          <Dock locale={locale} section={section} />
        </div>
        {/* The language switch lives in the footer, so the bar stays this short. */}
        <div className="ml-auto flex items-center gap-2">
          <GitHubButton locale={locale} />
          <ThemeToggle locale={locale} />
          <MobileMenu locale={locale} />
        </div>
      </div>
    </header>
  )
}
