import { createFileRoute } from '@tanstack/react-router'

import { CATALOG, CHANGE_KINDS, type ChangeKind } from '#/docs/content'
import { ChangelogPage, type ChangelogSearch } from '#/site/changelog'
import { DocsShell } from '#/site/doc-page'
import { SITE_ORIGIN, alternateLinks, localeFromParam, localizedPath, shareMeta } from '#/site/i18n'
import { UI } from '#/site/ui'

export const Route = createFileRoute('/{-$locale}/changelog')({
  validateSearch: (s: Record<string, unknown>): ChangelogSearch => ({
    kind: CHANGE_KINDS.includes(s.kind as ChangeKind) ? (s.kind as ChangeKind) : undefined,
    c: CATALOG.some((p) => p.slug === s.c) ? (s.c as string) : undefined,
  }),
  head: ({ params }) => {
    const locale = localeFromParam(params.locale) ?? 'en'
    const t = UI[locale].changelog
    const title = `${t.title} — Liquid Glass UI`
    return {
      meta: [{ title }, { name: 'description', content: t.description }, { property: 'og:title', content: title }, { property: 'og:description', content: t.description }, ...shareMeta('/changelog', locale)],
      links: [...alternateLinks('/changelog', locale), { rel: 'alternate', type: 'text/markdown', href: `${SITE_ORIGIN}${localizedPath('/changelog', locale)}.md` }],
    }
  },
  component: Changelog,
})

function Changelog() {
  const { locale } = Route.useRouteContext()
  const search = Route.useSearch()
  return (
    <DocsShell locale={locale}>
      <ChangelogPage locale={locale} search={search} />
    </DocsShell>
  )
}
