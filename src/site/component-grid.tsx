import { ArrowRight } from 'lucide-react'

import { CATALOG, type DocPage } from '@/docs/content'
import { DEMOS } from '@/docs/demos'

import type { Locale } from './i18n'
import { DocLink } from './links'
import { UI } from './ui'

// The components as live tiles on the docs index.
// Each tile renders the component's hero demo (the same file its docs page shows), centred
// on a quiet neutral stage: colour lives only inside the demos, where the glass bends it.

function Tile({ page, locale, wide = false, inspector = false }: { page: DocPage; locale: Locale; wide?: boolean; inspector?: boolean }) {
  const Demo = DEMOS[page.hero!].Component
  const t = UI[locale]
  return (
    <article className={`group/tile @container relative flex min-w-0 flex-col overflow-hidden rounded-[28px] bg-stage ${wide ? 'sm:col-span-2' : ''}`}>
      <div
        // (A demo marked data-bleed runs edge to edge in any tile.)
        className={`flex w-full flex-1 items-center justify-center pt-16 pb-2 sm:py-24 has-[>[data-bleed]]:px-0! ${
          // A wide tile without notes runs its demo edge to edge (the glass cards' rows of colour).
          wide && !inspector ? 'min-h-[320px] sm:min-h-[460px]' : wide ? 'min-h-[360px] px-5 sm:min-h-[520px] sm:px-6' : 'min-h-[280px] px-5 sm:min-h-[420px] sm:px-6'
        }`}
      >
        <Demo />
      </div>
      {inspector && <Inspector locale={locale} />}
      <DocLink
        page={page}
        locale={locale}
        aria-label={`${t.docs.open}: ${page.title[locale]}`}
        // Over the stage's bottom band from sm up; under the stage on phones, so it never covers the demo.
        className="group/link relative flex items-end justify-between gap-6 px-7 pt-4 pb-6 sm:absolute sm:inset-x-0 sm:bottom-0"
      >
        <span className="flex min-w-0 flex-col gap-1">
          <span className="text-[19px] leading-tight font-semibold tracking-[-0.02em] text-foreground">{page.title[locale]}</span>
          <span className="max-w-[40ch] text-body-sm leading-snug text-muted-foreground">{page.signature?.[locale]}</span>
        </span>
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground/[0.06] text-foreground transition-[background-color,translate] duration-150 group-hover/link:bg-foreground/[0.11] motion-safe:group-hover/link:translate-x-0.5"
        >
          <ArrowRight className="size-4" />
        </span>
      </DocLink>
    </article>
  )
}

/**
 * Design-inspector notes either side of the Press scene (a 576px box), on the rows 20px
 * above and below its centre, where the scene's grid lines run. Only when the tile has room.
 */
function Inspector({ locale }: { locale: Locale }) {
  const i = UI[locale].inspector
  const note = 'flex h-0 items-center gap-2.5 font-mono text-micro whitespace-nowrap text-muted-foreground'
  const line = 'h-px w-10 bg-[linear-gradient(to_right,var(--border-strong)_50%,transparent_0)] bg-[size:4px_1px]'
  const dot = 'size-[5px] rounded-full bg-foreground/35'
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden @min-[1080px]:block">
      <div className="absolute top-1/2 right-[calc(50%+312px)] flex flex-col items-end">
        {[i.material, i.size].map((n, k) => (
          <span key={n} className={note} style={{ translate: `0 ${k ? 20 : -20}px` }}>
            {n}
            <span className={line} />
            <span className={dot} />
          </span>
        ))}
      </div>
      <div className="absolute top-1/2 left-[calc(50%+312px)] flex flex-col items-start">
        {[i.spring, i.refract].map((n, k) => (
          <span key={n} className={note} style={{ translate: `0 ${k ? 20 : -20}px` }}>
            <span className={dot} />
            <span className={line} />
            {n}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Press first and full width, the rest two by two; an odd one out at the end runs full width too. */
export function ComponentGrid({ locale }: { locale: Locale }) {
  const [first, ...rest] = CATALOG
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Tile page={first} locale={locale} wide inspector />
      {rest.map((p, i) => (
        <Tile key={p.slug} page={p} locale={locale} wide={rest.length % 2 === 1 && i === rest.length - 1} />
      ))}
    </div>
  )
}
