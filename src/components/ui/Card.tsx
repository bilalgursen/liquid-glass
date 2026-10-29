import type { ReactNode } from 'react'

import type { Theme } from './shared'

export type CardProps = {
  title?: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  theme?: Theme
  padding?: 'compact' | 'comfortable' | 'spacious'
  showHeader?: boolean
  divider?: boolean
}

const paddings = { compact: 'p-4 gap-3', comfortable: 'p-6 gap-5', spacious: 'p-8 gap-6' }

/** A titled group of controls with no surface of its own; the glass controls sit straight on the page. */
export function Card({
  title = 'Display',
  description = 'Adjust how surfaces look on this device.',
  children,
  footer,
  theme,
  padding = 'comfortable',
  showHeader = true,
  divider = false,
}: CardProps) {
  return (
    <section data-theme={theme} className={`relative flex w-full max-w-sm flex-col ${paddings[padding]}`}>
      {showHeader && (title || description) && (
        <header className={`flex flex-col gap-0.5 ${divider ? 'border-b border-black/[0.06] pb-4 dark:border-white/[0.08]' : ''}`}>
          {title && <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white">{title}</h3>}
          {description && <p className="text-[13px] text-neutral-500">{description}</p>}
        </header>
      )}
      {children && <div className="relative flex flex-col gap-[inherit]">{children}</div>}
      {footer && (
        <footer className={`relative flex items-center justify-end gap-2 ${divider ? 'border-t border-black/[0.06] pt-4 dark:border-white/[0.08]' : ''}`}>
          {footer}
        </footer>
      )}
    </section>
  )
}

export default Card
