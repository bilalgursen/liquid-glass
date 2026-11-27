import { HeadContent, ScriptOnce, Scripts, createRootRoute, useParams } from '@tanstack/react-router'

import { headScript } from '#/site/head-script'
import { localeFromParam } from '#/site/i18n'
import { NotFound } from '#/site/not-found'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Liquid Glass UI' },
      { property: 'og:site_name', content: 'Liquid Glass UI' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
    links: [
      { rel: 'icon', href: '/favicon.ico', sizes: '32x32' },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Cal+Sans&family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap' },
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: () => <NotFound locale="en" />,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { locale } = useParams({ strict: false })
  return (
    // data-theme and color-scheme are set before paint by the head script.
    <html lang={localeFromParam(locale) ?? 'en'} suppressHydrationWarning>
      <head>
        <ScriptOnce>{headScript()}</ScriptOnce>
        <HeadContent />
        {/* Cookieless page metrics (no cookies, no personal data). */}
        <script defer src="https://v.akalan.dev/_v/s.js" />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
