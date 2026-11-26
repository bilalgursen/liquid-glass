import { Link, useHydrated } from '@tanstack/react-router'
import { Fragment, type CSSProperties, type ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'
import { CATALOG, PAGES, VERSION } from '@/docs/content'

import { LOCALES, LOCALE_KEY, REPO_URL, SITE_ORIGIN, localeParam, type Locale } from './i18n'
import { DocLink, exactActive } from './links'
import { UI } from './ui'

// Site chrome is deliberately plain: the glass belongs to the components, not the frame.
// The frame is lines: rails at the column edges, full-bleed dividers, a rivet where they cross.

/** `code` and **bold** inside a docs string. */
export function Inline({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('`') ? (
          <code key={i} className="rounded-[5px] border border-border bg-muted px-1 py-px font-mono text-[0.86em] text-foreground">
            {p.slice(1, -1)}
          </code>
        ) : p.startsWith('**') ? (
          <strong key={i} className="font-medium text-foreground">
            {p.slice(2, -2)}
          </strong>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  )
}

export const LOGO_LETTERS = [
  'M172.33 90.9738V24.4138H189.354V34.1418C192.852 26.6325 199.636 22.8778 209.706 22.8778C214.399 22.8778 218.623 23.9871 222.378 26.2058C226.132 28.3391 229.119 31.4111 231.338 35.4218C233.556 31.4111 236.372 28.3391 239.786 26.2058C243.284 23.9871 247.978 22.8778 253.866 22.8778C258.644 22.8778 262.954 23.9871 266.794 26.2058C270.634 28.4245 273.663 31.5818 275.882 35.6778C278.1 39.7738 279.21 44.6378 279.21 50.2698V90.9738H261.93V54.4938C261.93 48.6911 260.692 44.5098 258.218 41.9498C255.743 39.3045 252.543 37.9818 248.618 37.9818C244.607 37.9818 241.322 39.1338 238.762 41.4378C236.287 43.7418 235.05 48.0938 235.05 54.4938V90.9738H217.77V54.4938C217.77 48.6911 216.447 44.5098 213.802 41.9498C211.156 39.3045 207.7 37.9818 203.434 37.9818C199.764 37.9818 196.522 39.3045 193.706 41.9498C190.975 44.5098 189.61 48.6911 189.61 54.4938V90.9738H172.33Z',
  'M321.726 92.6378C314.899 92.6378 308.798 91.0591 303.422 87.9018C298.046 84.7445 293.822 80.5631 290.75 75.3578C287.763 70.0671 286.27 64.2218 286.27 57.8218C286.27 51.4218 287.763 45.5765 290.75 40.2858C293.822 34.9951 298.046 30.7711 303.422 27.6138C308.798 24.4565 314.899 22.8778 321.726 22.8778C328.638 22.8778 334.739 24.4565 340.03 27.6138C345.406 30.7711 349.587 34.9951 352.574 40.2858C355.646 45.5765 357.182 51.4218 357.182 57.8218C357.182 64.2218 355.646 70.0671 352.574 75.3578C349.587 80.5631 345.406 84.7445 340.03 87.9018C334.739 91.0591 328.638 92.6378 321.726 92.6378ZM321.726 76.8938C325.395 76.8938 328.595 76.0405 331.326 74.3338C334.056 72.5418 336.147 70.1951 337.598 67.2938C339.134 64.3925 339.902 61.2351 339.902 57.8218C339.902 54.3231 339.134 51.1231 337.598 48.2218C336.147 45.3205 334.056 43.0165 331.326 41.3098C328.595 39.5178 325.395 38.6218 321.726 38.6218C318.056 38.6218 314.856 39.5178 312.126 41.3098C309.395 43.0165 307.262 45.3205 305.726 48.2218C304.275 51.1231 303.55 54.3231 303.55 57.8218C303.55 61.2351 304.275 64.3925 305.726 67.2938C307.262 70.1951 309.395 72.5418 312.126 74.3338C314.856 76.0405 318.056 76.8938 321.726 76.8938Z',
  'M364.83 90.9738V24.4138H381.598V37.0858C382.707 32.3071 384.968 28.6805 388.382 26.2058C391.795 23.6458 396.403 22.5365 402.206 22.8778V39.1338H399.774C394.824 39.1338 390.643 40.7125 387.23 43.8698C383.816 47.0271 382.11 51.3791 382.11 56.9258V90.9738H364.83Z',
  'M436.577 92.6378C429.75 92.6378 423.734 91.0591 418.529 87.9018C413.323 84.7445 409.27 80.5631 406.369 75.3578C403.553 70.0671 402.145 64.2218 402.145 57.8218C402.145 51.4218 403.638 45.5765 406.625 40.2858C409.611 34.9098 413.665 30.6431 418.785 27.4858C423.99 24.3285 429.921 22.7498 436.577 22.7498C443.233 22.7498 449.078 24.3285 454.113 27.4858C459.233 30.6431 463.201 34.9098 466.017 40.2858C468.918 45.5765 470.369 51.4218 470.369 57.8218C470.369 58.7605 470.326 59.7418 470.241 60.7658C470.155 61.7898 470.027 62.8565 469.857 63.9658H420.065C421.003 67.8911 422.881 71.0911 425.697 73.5658C428.598 76.0405 432.225 77.2778 436.577 77.2778C440.331 77.2778 443.574 76.4245 446.305 74.7178C449.121 73.0111 451.297 70.8778 452.833 68.3178L466.273 78.4298C463.627 82.6111 459.659 86.0245 454.369 88.6698C449.078 91.3151 443.147 92.6378 436.577 92.6378ZM436.321 37.5978C432.225 37.5978 428.726 38.8351 425.825 41.3098C422.923 43.7845 421.003 47.0271 420.065 51.0378H452.961C452.022 47.3685 450.059 44.2111 447.073 41.5658C444.171 38.9205 440.587 37.5978 436.321 37.5978Z',
  'M226.546 185.974C219.975 185.974 214.94 184.352 211.442 181.11C207.943 177.867 206.194 172.619 206.194 165.366V134.134H196.85V119.414H206.194V105.974L223.474 104.182V119.414H237.554V134.134H223.474V164.47C223.474 168.566 225.266 170.614 228.85 170.614H236.018V185.974H226.546Z',
  'M243.33 185.974V92.5338H260.61V128.63C264.194 121.462 270.892 117.878 280.706 117.878C285.484 117.878 289.794 118.987 293.634 121.206C297.474 123.424 300.503 126.582 302.722 130.678C304.94 134.774 306.05 139.638 306.05 145.27V185.974H288.77V149.494C288.77 143.691 287.447 139.51 284.802 136.95C282.156 134.304 278.7 132.982 274.434 132.982C270.764 132.982 267.522 134.304 264.706 136.95C261.975 139.51 260.61 143.691 260.61 149.494V185.974H243.33Z',
  'M324.281 113.91C321.379 113.91 318.905 112.928 316.857 110.966C314.894 108.918 313.913 106.486 313.913 103.67C313.913 100.939 314.894 98.5925 316.857 96.6298C318.905 94.5818 321.379 93.5578 324.281 93.5578C327.267 93.5578 329.742 94.5818 331.705 96.6298C333.667 98.5925 334.649 100.939 334.649 103.67C334.649 106.571 333.667 109.003 331.705 110.966C329.742 112.928 327.267 113.91 324.281 113.91ZM315.705 185.974V119.414H332.985V185.974H315.705Z',
  'M343.205 185.974V119.414H360.229V129.142C363.727 121.632 370.511 117.878 380.581 117.878C385.359 117.878 389.669 118.987 393.509 121.206C397.349 123.424 400.378 126.582 402.597 130.678C404.815 134.774 405.925 139.638 405.925 145.27V185.974H388.645V149.494C388.645 143.691 387.322 139.51 384.677 136.95C382.031 134.304 378.575 132.982 374.309 132.982C370.639 132.982 367.397 134.304 364.581 136.95C361.85 139.51 360.485 143.691 360.485 149.494V185.974H343.205Z',
  'M415.58 185.974V92.5338H432.86V146.294L457.82 119.414H482.396L451.036 150.39L482.524 185.974H459.612L432.86 154.358V185.974H415.58Z',
]

export const LOGO_MARK = [
  'M202.593 223.504C203.895 225.187 204.922 226.595 204.209 228.878C202.867 233.202 196.717 238.741 193.792 242.397C189.069 248.306 182.233 258.1 176.11 262.193C167.348 268.05 154.964 265.187 148.572 257.261C146.528 254.732 145.486 251.756 144.343 248.806C127.235 254.037 114.101 247.323 110.892 229.215C92.2688 232.982 80.0912 223.665 78.9807 204.768C74.4496 205.912 69.7061 207.296 65.2636 208.769C67.9357 212.089 71.1235 215.1 73.7131 218.545C82.345 230.028 87.6861 244.108 89.5855 258.284C90.2584 263.34 91.0083 276.565 88.9753 281.013C88.1052 282.909 86.0215 284.082 83.9418 283.726C82.1192 283.412 80.4061 282.028 79.9171 280.212C79.1387 277.32 80.3508 271.632 80.4922 268.44C80.7905 261.581 79.6404 254.089 77.5521 247.56C74.0501 236.627 68.5471 226.924 60.9848 218.286C57.3911 214.182 50.6327 211.019 50.187 205.33C50.7875 204.208 51.0149 203.061 52.1957 202.319C54.9949 200.551 59.2379 200.494 62.3761 199.471C81.8535 193.132 104.453 188.849 113.081 167.286C115.474 161.307 116.191 154.461 113.518 148.514C108.497 149.329 103.55 150.956 98.6052 152.305C89.8348 154.698 81.0435 157.096 72.2537 159.399C63.3544 161.728 54.4483 164.081 45.5616 166.474C40.7496 167.769 35.671 168.788 31.0482 170.653C25.5672 172.866 20.538 176.226 16.1974 180.219C2.1089 193.18 1.87439 209.106 0.934965 226.744C0.288059 238.831 -0.5686 250.835 0.522132 262.936C2.89553 289.312 17.259 314.765 39.195 329.825C80.4568 358.148 135.082 350.52 166.141 311.051C185.749 286.13 199.408 257.547 211.241 228.325C214.103 221.263 218.174 213.546 218.53 205.809C218.838 199.118 216.066 192.076 210.745 187.91C205.175 183.551 197.139 183.114 191.145 186.922C189.443 188.001 187.914 189.543 186.695 191.14C182.409 196.745 154.453 238.126 153.758 241.902C152.883 246.686 154.851 251.424 159.083 253.948C162.91 256.229 167.827 256.005 171.574 253.642C175.379 251.246 188.811 233.421 192.683 228.732C194.017 227.118 195.502 224.368 197.386 223.382C199.374 222.351 200.654 222.842 202.593 223.504Z',
  'M45.9546 156.265C51.2772 154.957 94.4794 143.751 95.8833 142.609C97.516 141.272 108.817 119.766 110.789 116.184C122.569 94.8136 134.738 73.6466 146.518 52.2762C151.515 43.2189 157.086 34.3868 161.757 25.1626C162.684 23.3311 163.2 21.3961 163.406 19.3567C164.218 11.3188 159.036 3.55412 151.466 0.945143C145.323 -1.17668 137.98 0.326579 133.324 4.92651C128.633 9.55849 124.393 19.1674 120.989 25.0792C112.552 39.7319 103.969 54.3076 95.7315 69.0677C84.6444 88.9289 72.9793 108.485 61.7411 128.267C56.5419 137.419 49.8861 146.637 45.9546 156.265Z',
  'M140.496 239.86C141.918 239.003 143.312 238.239 144.402 236.941C148.369 232.209 151.543 226.524 154.958 221.382C161.087 212.149 167.342 203.004 173.433 193.745C178.009 186.79 187.061 176.266 189.588 168.807C194.007 155.763 182.83 144.568 169.804 146.654C166.317 147.677 163.111 149.246 160.782 152.148C158.599 154.876 157.111 158.395 155.462 161.462C151.921 168.045 148.209 174.536 144.669 181.123C139.278 191.154 133.705 201.126 128.095 211.041C125.668 215.322 121.812 220.382 120.921 225.273C119.965 230.517 122.316 236.264 126.886 239.082C131.263 241.778 135.857 241.681 140.496 239.86Z',
  'M109.132 139.489C111.321 139.056 113.568 138.308 115.852 138.775C126.611 140.981 125.816 158.509 123.588 166.468C122.116 171.721 119.608 176.597 116.378 180.978C109.282 190.619 99.7088 195.64 89.5894 201.354C87.178 209.724 91.4348 219.561 101.104 220.505C105.536 220.938 110.111 219.823 113.345 216.598C116.572 213.383 118.433 208.53 120.614 204.579C124.744 197.099 128.942 189.656 133.009 182.14C137.242 174.316 141.631 166.566 145.928 158.778C152.986 145.994 161.622 134.04 149.819 120.868C145.775 116.354 138.998 114 133.011 114.549C123.615 115.416 118.914 121.619 114.517 129.255C112.596 132.592 110.569 136.015 109.132 139.489Z',
]

/** The name as it is written in the header: "liquid" light, "glass" heavy, one word's worth
 *  of space between them and none added. Geist, lowercase, in the text colour. The drawn
 *  logo (below) is for the footer. */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`text-[1.3125rem] leading-none tracking-[-0.03em] ${className}`}>
      <span className="font-light">liquid</span>
      <span className="font-semibold">glass</span>
    </span>
  )
}

/** The logo. It takes the text colour, so it follows the theme. */
export function Logo({ className = 'h-10 w-auto', style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 483 347" fill="currentColor" aria-hidden="true" className={className} style={style}>
      {LOGO_LETTERS.map((d) => (
        <path key={d} d={d} />
      ))}
      {LOGO_MARK.map((d) => (
        <path key={d} d={d} fillRule="evenodd" clipRule="evenodd" />
      ))}
    </svg>
  )
}

/** The hand alone: the symbol, for places too small for the whole logo. */
export function LogoMark({ className = 'h-10 w-auto', style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 219 347" fill="currentColor" aria-hidden="true" className={className} style={style}>
      {LOGO_MARK.map((d) => (
        <path key={d} d={d} fillRule="evenodd" clipRule="evenodd" />
      ))}
    </svg>
  )
}

export function GitHubMark({ className = 'size-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}

// ── Frame ──

/** The column every page shares, header to footer: 1320px, rails on both sides. The header,
 * the docs shell and every landing section use it, so the lines meet like one drawing. */
export const column = 'relative mx-auto w-[calc(100%-2rem)] max-w-[1320px] border-x border-rail sm:w-[calc(100%-3rem)]'

const rivetAt: Record<'tl' | 'tr' | 'bl' | 'br', CSSProperties> = {
  tl: { left: -0.5, top: -0.5, translate: '-50% -50%' },
  tr: { right: -0.5, top: -0.5, translate: '50% -50%' },
  bl: { left: -0.5, bottom: -0.5, translate: '-50% 50%' },
  br: { right: -0.5, bottom: -0.5, translate: '50% 50%' },
}

/** Rivets on the corners of the nearest positioned box. */
export function Rivets({ at = ['tl', 'tr'] }: { at?: (keyof typeof rivetAt)[] }) {
  return (
    <>
      {at.map((k) => (
        <i key={k} aria-hidden className="rivet" style={rivetAt[k]} />
      ))}
    </>
  )
}

/** A full-bleed divider with the column inside it and rivets where the rails meet it. */
export function FrameSection({ children, id, className = '', inner = '' }: { children: ReactNode; id?: string; className?: string; inner?: string }) {
  return (
    <section id={id} className={`border-t border-rail ${className}`}>
      <div className={`${column} ${inner}`}>
        <Rivets />
        {children}
      </div>
    </section>
  )
}

// ── Footer ──

/** English · Türkçe: the same page in the other language. It sits at the foot of every page;
 * the header stays for getting around. */
function LangSwitch({ locale }: { locale: Locale }) {
  const t = UI[locale].lang
  // Keeps the changelog's filters and the #section once hydrated (the prerendered links carry
  // neither, so the first client render must not either).
  const hydrated = useHydrated()
  return (
    <nav aria-label={t.label} className="flex items-center rounded-full border border-border p-0.5">
      {LOCALES.map((l) => (
        <Link
          key={l}
          to="."
          params={(prev: Record<string, unknown>) => ({ ...prev, locale: localeParam(l) })}
          search={hydrated ? true : undefined}
          hash={hydrated ? true : undefined}
          hrefLang={l}
          lang={l}
          aria-current={l === locale ? 'true' : undefined}
          onClick={() => {
            try {
              localStorage.setItem(LOCALE_KEY, l)
            } catch {}
          }}
          className={`flex h-6 items-center rounded-full px-2.5 transition-colors duration-150 ${
            l === locale ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t[l]}
        </Link>
      ))}
    </nav>
  )
}

export function SiteFooter({ locale }: { locale: Locale }) {
  const p = { locale: localeParam(locale) }
  const t = UI[locale]
  const head = 'pb-3 text-caption font-medium text-foreground'
  const link = 'text-ui text-muted-foreground transition-colors duration-150 hover:text-foreground'
  return (
    <footer className="w-full border-t border-rail">
      <div className={`${column} grid gap-10 px-6 pt-14 pb-10 sm:grid-cols-2 sm:px-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]`}>
        <Rivets />
        <div className="flex flex-col items-start gap-4">
          <Link to="/{-$locale}" params={p} activeOptions={exactActive} aria-label="Liquid Glass UI" className="flex items-center text-foreground">
            <Logo className="h-14 w-auto" />
          </Link>
          <p className="max-w-[30ch] text-ui leading-relaxed text-muted-foreground">{t.hero.subtitle}</p>
          <Badge asChild size="lg" className="press h-7 gap-2 pr-3 pl-2.5 text-caption">
            <Link to="/{-$locale}/changelog" params={p} activeOptions={exactActive}>
              <span aria-hidden className="size-1.5 rounded-full bg-kind-new" />
              <span className="font-mono">v{VERSION}</span>
              <span aria-hidden className="text-faint">
                ·
              </span>
              {t.nav.whatsNew}
            </Link>
          </Badge>
        </div>
        <nav aria-label={t.nav.docs} className="flex flex-col gap-2">
          <p className={head}>{t.nav.docs}</p>
          {PAGES.filter((x) => x.group === 'start').map((x) => (
            <DocLink key={x.slug} page={x} locale={locale} className={link}>
              {x.title[locale]}
            </DocLink>
          ))}
        </nav>
        <nav aria-label={t.nav.components} className="flex flex-col gap-2">
          <p className={head}>{t.nav.components}</p>
          {CATALOG.map((x) => (
            <DocLink key={x.slug} page={x} locale={locale} className={link}>
              {x.title[locale]}
            </DocLink>
          ))}
        </nav>
        <nav aria-label={t.docs.resources} className="flex flex-col gap-2">
          <p className={head}>{t.docs.resources}</p>
          <Link to="/{-$locale}/changelog" params={p} activeOptions={exactActive} className={link}>
            {t.changelog.title}
          </Link>
          <a href={`${SITE_ORIGIN}/llms.txt`} className={link}>
            llms.txt
          </a>
          <a href={REPO_URL} target="_blank" rel="noreferrer" className={link}>
            GitHub
          </a>
        </nav>
      </div>
      <div className="border-t border-rail">
        <div className={`${column} flex flex-wrap items-center justify-between gap-3 px-6 py-5 text-caption text-faint sm:px-10`}>
          <Rivets />
          <p>
            {t.footer}{' '}
            <a href="https://github.com/bilalgursen" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
              bilalgursen
            </a>{' '}
            {t.footerFrom}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <p className="font-mono">{t.stack}</p>
            <LangSwitch locale={locale} />
          </div>
        </div>
      </div>
    </footer>
  )
}

/** The quiet surface every live preview sits on. The glass reads it as its backdrop. */
export function Stage({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`relative flex items-center justify-center bg-stage ${className}`}>{children}</div>
}

/** Small mono label: "01", "Fig 0.2". */
export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`font-mono text-caption text-muted-foreground ${className}`}>{children}</p>
}
