// Locales and URLs. English lives at the root (/docs/…), Turkish under /tr (/tr/docs/…).
// Plain TS (no React): also imported by vite.config.ts to list the pages to prerender.
export const SITE_ORIGIN = 'https://liquidglass.onemorethink.dev'
export const REPO_URL = 'https://github.com/bilalgursen/liquid-glass'

export const LOCALES = ['en', 'tr'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'
/** localStorage key of an explicit language choice. */
export const LOCALE_KEY = 'liquid-glass-locale'
/** localStorage key of an explicit theme choice. */
export const THEME_KEY = 'liquid-glass-theme'
/** sessionStorage key: the landing entrance has played this session. */
export const ENTERED_KEY = 'liquid-glass-entered'

/** localStorage key of the chosen package manager (install commands). */
export const PM_KEY = 'liquid-glass-pm'

export const PACKAGE_MANAGERS = ['pnpm', 'npm', 'yarn', 'bun'] as const
export type PackageManager = (typeof PACKAGE_MANAGERS)[number]

const RUNNERS: Record<PackageManager, string> = { pnpm: 'pnpm dlx', npm: 'npx', yarn: 'yarn dlx', bun: 'bunx --bun' }

/** The shadcn CLI command that installs one registry item. */
export const installCommand = (item: string, pm: PackageManager = 'npm') => `${RUNNERS[pm]} shadcn@latest add ${SITE_ORIGIN}/r/${item}.json`

/** A localized string. */
export type L = { en: string; tr: string }

/** `{-$locale}` param → locale; anything other than "tr" is not a locale. */
export function localeFromParam(param: string | undefined): Locale | null {
  if (param === undefined) return 'en'
  if (param === 'tr') return 'tr'
  return null
}

export function localeParam(locale: Locale): string | undefined {
  return locale === DEFAULT_LOCALE ? undefined : locale
}

/** ('/docs/button', 'tr') → '/tr/docs/button'. */
export function localizedPath(path: string, locale: Locale): string {
  const clean = path === '/' ? '' : path
  return locale === DEFAULT_LOCALE ? clean || '/' : `/${locale}${clean}`
}

/** canonical + hreflang alternates for one locale-less path. */
export function alternateLinks(path: string, locale: Locale) {
  return [
    { rel: 'canonical', href: SITE_ORIGIN + localizedPath(path, locale) },
    ...LOCALES.map((l) => ({ rel: 'alternate', hrefLang: l, href: SITE_ORIGIN + localizedPath(path, l) })),
    { rel: 'alternate', hrefLang: 'x-default', href: SITE_ORIGIN + localizedPath(path, DEFAULT_LOCALE) },
  ]
}
