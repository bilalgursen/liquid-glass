import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { useEffect, type CSSProperties } from 'react'

import { GlassSlideToConfirm } from '@/components/liquid-glass'
import { CATALOG } from '@/docs/content'
import { FrameSection, column } from '#/site/chrome'
import { CodeBlock, InstallCommand } from '#/site/code'
import { DocLink } from '#/site/links'
import { ENTERED_KEY, REPO_URL, SITE_ORIGIN, alternateLinks, localeFromParam, localeParam, shareMeta } from '#/site/i18n'
import { UI } from '#/site/ui'

export const Route = createFileRoute('/{-$locale}/')({
  head: ({ params }) => {
    const locale = localeFromParam(params.locale) ?? 'en'
    const t = UI[locale].hero
    return {
      meta: [
        { title: locale === 'tr' ? 'Liquid Glass UI — React için cam bileşenleri' : 'Liquid Glass UI — glass components for React' },
        { name: 'description', content: t.search },
        { property: 'og:title', content: 'Liquid Glass UI' },
        { property: 'og:description', content: t.search },
        ...shareMeta('/', locale),
        { 'script:ld+json': siteData(t.search) },
      ],
      links: alternateLinks('/', locale),
    }
  },
  component: Home,
})

// What search engines read about the site: its name (the one shown above a result), the
// code it documents, and OneMoreThink as the publisher, which has its own page and entry.
const PUBLISHER = 'https://onemorethink.dev/#organization'
const siteData = (description: string) => ({
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'WebSite', '@id': `${SITE_ORIGIN}/#website`, url: `${SITE_ORIGIN}/`, name: 'Liquid Glass UI', alternateName: ['Liquid Glass', 'LiquidGlass'], inLanguage: ['en', 'tr'], publisher: { '@id': PUBLISHER } },
    { '@type': 'Organization', '@id': PUBLISHER, name: 'OneMoreThink', url: 'https://onemorethink.dev/' },
    {
      '@type': 'SoftwareSourceCode',
      name: 'Liquid Glass UI',
      description,
      url: `${SITE_ORIGIN}/`,
      codeRepository: REPO_URL,
      programmingLanguage: 'TypeScript',
      runtimePlatform: 'React',
      license: 'https://opensource.org/licenses/MIT',
      publisher: { '@id': PUBLISHER },
    },
  ],
})

const USAGE = `import { GlassButton, GlassTabs } from '@/components/liquid-glass'

<GlassTabs
  aria-label="View"
  value={view}
  onValueChange={setView}
  options={[
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ]}
/>
<GlassButton material="tinted" className="bg-sky-500 text-white">
  Save
</GlassButton>`

/** Entrance delay (and, for blocks, a shorter rise than the 20% the h1 lines use). */
const at = (d: number, rise?: string) => ({ '--d': `${d}s`, ...(rise ? { '--rise': rise } : {}) }) as CSSProperties

const h2 = 'font-display text-[32px] leading-[1.06] tracking-[-0.01em] text-balance text-foreground sm:text-[48px]'

function Home() {
  const { locale } = Route.useRouteContext()
  const t = UI[locale]
  const p = { locale: localeParam(locale) }
  const router = useRouter()

  // The slide is the page's one call to action: the docs load while the track draws in, the
  // check shows for a beat, and then the page turns.
  const openDocs = async () => {
    await router.preloadRoute({ to: '/{-$locale}/docs', params: p }).catch(() => {})
    window.setTimeout(() => router.navigate({ to: '/{-$locale}/docs', params: p }), 520)
  }

  // The entrance plays once per session; afterwards (and on the way back) the page is just there.
  useEffect(() => {
    const id = window.setTimeout(() => {
      document.documentElement.setAttribute('data-entered', '')
      try {
        sessionStorage.setItem(ENTERED_KEY, '1')
      } catch {}
    }, 2800)
    return () => window.clearTimeout(id)
  }, [])

  return (
    // Pulled up under the transparent header, so the rails run to the top of the page.
    <main className="-mt-16">
      {/* ── Hero: one promise, then the glass ── */}
      <section className="relative overflow-hidden">
        <div className={`${column} bg-background`}>
          {/* The hero fills the first screen (under the band), its promise and its slide in the middle. */}
          <div className="relative flex min-h-[max(560px,calc(100svh-var(--band,0px)))] flex-col items-center justify-center px-4 pt-28 pb-20 text-center sm:px-5 sm:pt-32 sm:pb-24">
            {/* One line from sm up, sized to the viewport; phones wrap it. */}
            <h1 className="font-display text-[46px] leading-[1.0] tracking-[-0.015em] text-balance text-foreground sm:text-[clamp(46px,7.2vw,104px)] sm:whitespace-nowrap">
              {/* Padding keeps the blur of the entrance from being clipped. */}
              <span className="enter -m-6 block p-6" style={at(0.4)}>
                {t.hero.lines.join(' ')}
              </span>
            </h1>
            <p className="enter mt-6 max-w-[40ch] text-lead leading-relaxed text-balance text-muted-foreground sm:text-[19px]" style={at(0.6, '12px')}>
              {t.hero.subtitle}
            </p>
            {/* The one glass on the page, straight on the page: slide it and the docs open. */}
            <div className="enter mt-12 flex w-full justify-center" style={at(0.75, '12px')}>
              <GlassSlideToConfirm
                className="w-full max-w-sm"
                size="xl"
                pendingLabel={t.hero.opening}
                successLabel={t.hero.opening}
                onConfirm={openDocs}
              >
                {t.hero.slide}
              </GlassSlideToConfirm>
            </div>
          </div>
        </div>
      </section>

      {/* ── The set as a line of names, each one its page: the tiles are on the docs index. ── */}
      <FrameSection inner="px-6 pt-24 pb-32 sm:pt-28 md:pb-40">
        <p className="mx-auto max-w-[30ch] text-center font-display text-[26px] leading-[1.18] tracking-[-0.01em] text-balance sm:text-[36px]">
          <span className="text-foreground">{t.set.title}</span> <span className="text-muted-foreground">{t.set.description}</span>
        </p>
        <ul className="mx-auto mt-10 flex max-w-[52rem] flex-wrap justify-center gap-x-5 gap-y-2 text-body text-muted-foreground">
          {CATALOG.map((page) => (
            <li key={page.slug}>
              <DocLink page={page} locale={locale} className="transition-colors duration-150 hover:text-foreground">
                {page.title[locale]}
              </DocLink>
            </li>
          ))}
          <li>
            <Link to="/{-$locale}/docs" params={p} className="group inline-flex items-center gap-1 text-foreground">
              {t.nav.allComponents}
              <ArrowRight aria-hidden className="size-4 motion-safe:transition-transform motion-safe:duration-150 motion-safe:group-hover:translate-x-0.5" />
            </Link>
          </li>
        </ul>
      </FrameSection>

      {/* ── Facts: three numbers and a lot of air ── */}
      <FrameSection inner="px-6 py-28 sm:px-10 md:py-40">
        <h2 className={`${h2} mx-auto max-w-[20ch] text-center`}>{t.facts.title}</h2>
        <div className="mt-16 grid gap-14 md:mt-24 md:grid-cols-3 md:gap-8">
          {t.facts.items.map((item) => (
            <div key={item.fig} className="flex flex-col items-center text-center">
              <p className="font-mono text-caption text-muted-foreground">{item.fig}</p>
              <p className="mt-6 text-[64px] leading-none font-semibold tracking-[-0.05em] text-foreground tabular-nums sm:text-[80px]">{item.stat}</p>
              <p className="mt-4 text-lead font-medium tracking-[-0.01em] text-foreground">{item.title}</p>
              <p className="mt-3 max-w-[32ch] text-body leading-relaxed text-pretty text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </FrameSection>

      {/* ── Install: an inset panel whose colour rises out of the page ── */}
      <FrameSection id="start" className="scroll-mt-14" inner="p-2 sm:p-3">
        <div className="rounded-[28px] bg-[linear-gradient(to_bottom,var(--background),var(--muted)_420px)] px-6 pt-24 pb-14 sm:px-12 md:pt-32 md:pb-16">
          <div className="mx-auto flex max-w-[34rem] flex-col items-center gap-4 text-center">
            <h2 className={h2}>{t.install.title}</h2>
            <p className="max-w-[46ch] text-lead text-pretty text-muted-foreground">{t.install.description}</p>
          </div>
          <div className="mx-auto mt-14 grid max-w-[1040px] gap-5 md:grid-cols-[5fr_6fr] md:items-start">
            <div className="flex min-w-0 flex-col gap-5">
              <InstallCommand item="liquid-glass" locale={locale} />
              <p className="px-1 text-body-sm leading-relaxed text-muted-foreground">
                {t.install.ai}{' '}
                <Link to="/{-$locale}/docs/$slug" params={{ ...p, slug: 'ai' }} className="text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-foreground">
                  {t.install.aiLink}
                </Link>
              </p>
            </div>
            <CodeBlock code={USAGE} title="toolbar.tsx" locale={locale} className="min-w-0" />
          </div>
        </div>
      </FrameSection>
    </main>
  )
}
