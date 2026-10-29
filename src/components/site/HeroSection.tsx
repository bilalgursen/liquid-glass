import type { Theme } from '#/components/ThemeSwitcher'
import { Button } from '@/components/shadcn/button'

import { Crosshair, DashedRule, DotGrid } from './layout-svg'
import { GitHubMark } from './SiteChrome'

export type HeroSectionProps = {
  theme?: Theme
  repoUrl?: string
  eyebrow?: string
  title?: string
  subtitle?: string
}

/** Landing hero: a centred headline, one line of lede and two calls to action over a sparse dot grid, framed by dashed hairline rules with registration marks. No glow or lighting. */
export function HeroSection({
  theme = 'light',
  repoUrl = 'https://github.com',
  eyebrow = 'Open source · MIT',
  title = 'Glass controls for React, drawn by one shader.',
  subtitle = 'A component kit where every button, switch and slider is a refracting WebGL lens with spring physics, light and dark themes, and no runtime beyond three.js.',
}: HeroSectionProps) {
  return (
    <section data-theme={theme} className="w-full px-6 pt-6 sm:px-10">
      <div className="relative mx-auto flex max-w-6xl flex-col items-center py-24 text-center md:py-32">
        <DotGrid />
        <DashedRule className="top-0 hidden md:block" />
        <DashedRule className="bottom-0 hidden md:block" />
        <Crosshair className="absolute top-0 left-0 hidden -translate-x-1/2 -translate-y-1/2 text-foreground/50 md:block" />
        <Crosshair className="absolute top-0 right-0 hidden translate-x-1/2 -translate-y-1/2 text-foreground/50 md:block" />
        <Crosshair className="absolute bottom-0 left-0 hidden -translate-x-1/2 translate-y-1/2 text-foreground/50 md:block" />
        <Crosshair className="absolute right-0 bottom-0 hidden translate-x-1/2 translate-y-1/2 text-foreground/50 md:block" />
        {eyebrow && <p className="relative mb-6 font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">{eyebrow}</p>}
        <h1 className="relative max-w-4xl text-[40px] leading-[1.02] font-semibold tracking-[-0.035em] text-balance text-foreground sm:text-[56px] lg:text-[64px]">
          {title}
        </h1>
        <p className="relative mt-6 max-w-2xl text-[16px] leading-relaxed text-balance text-muted-foreground sm:text-[17px]">{subtitle}</p>
        <div className="relative mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="rounded-md">
            <a href={repoUrl} target="_blank" rel="noreferrer">
              <GitHubMark />
              View on GitHub
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-md">
            <a href="#how">How it works</a>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
