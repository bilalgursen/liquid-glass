import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { Frame, LineIcon, type LineIconName } from './layout-svg'

/* Shared, non-glass site chrome: section headers, feature grid, code blocks and footer. Cloudflare-style hairlines and registration marks. */

export const SITE_LINKS = [
  { href: '/#kit', label: 'Components' },
  { href: '/#how', label: 'How it works' },
  { href: '/#start', label: 'Get started' },
] as const

export function GitHubMark({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}

export type SectionHeaderProps = {
  title: string
  description?: string
  aside?: ReactNode
  className?: string
}

/** Title and lede; optional control on the right. */
export function SectionHeader({ title, description, aside, className }: SectionHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-6 md:flex-row md:items-end md:justify-between', className)}>
      <div className="flex max-w-2xl flex-col gap-3">
        <h2 className="text-[30px] leading-[1.1] font-semibold tracking-[-0.025em] text-balance text-foreground sm:text-[36px]">{title}</h2>
        {description && <p className="text-[15px] leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </header>
  )
}

export type Feature = { icon: LineIconName; title: string; body: string }

/** Equal hairline cells with a line icon, like Cloudflare's "Run everywhere" strip. */
export function FeatureGrid({ items, columns = 3, className }: { items: Feature[]; columns?: 2 | 3 | 4; className?: string }) {
  const cols = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-2 xl:grid-cols-4' }[columns]
  return (
    <Frame className={className}>
      <ul className={cn('grid grid-cols-1 divide-y divide-border md:divide-x md:divide-y-0', cols)}>
        {items.map((item) => {
          const Icon = LineIcon[item.icon]
          return (
            <li key={item.title} className="flex flex-col gap-4 p-6">
              <span className="flex size-9 items-center justify-center rounded-full border border-border text-foreground">
                <Icon />
              </span>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">{item.title}</h3>
                <p className="text-[13px] leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </Frame>
  )
}

/** Terminal-style code block with a mono title bar. */
export function CodeBlock({ children, title, className }: { children: string; title?: string; className?: string }) {
  return (
    <Frame className={cn('overflow-hidden bg-background', className)} corners={false}>
      {title && (
        <div className="flex items-center justify-between border-b border-border px-4 py-2 font-mono text-[11px] text-muted-foreground">
          <span>{title}</span>
          <span className="flex gap-1.5">
            <span className="size-2 rounded-full border border-border" />
            <span className="size-2 rounded-full border border-border" />
            <span className="size-2 rounded-full border border-border" />
          </span>
        </div>
      )}
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-relaxed text-foreground">
        <code>{children}</code>
      </pre>
    </Frame>
  )
}

export type SiteFooterProps = { repoUrl?: string; className?: string }

/** Hairline footer with the mark, links and licence. */
export function SiteFooter({ repoUrl = 'https://github.com', className }: SiteFooterProps) {
  return (
    <footer className={cn('w-full px-6 sm:px-10', className)}>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 border-t border-border py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2.5 text-foreground">
          <span className="text-[13px] font-semibold">Liquid Glass UI</span>
          <span className="font-mono text-[11px] text-muted-foreground">MIT · open source</span>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-muted-foreground">
          {SITE_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </a>
          ))}
          <a href={repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-foreground">
            <GitHubMark className="size-3.5" />
            GitHub
          </a>
        </nav>
        <p className="font-mono text-[11px] text-muted-foreground">three.js · TanStack Start · Tailwind v4</p>
      </div>
    </footer>
  )
}
