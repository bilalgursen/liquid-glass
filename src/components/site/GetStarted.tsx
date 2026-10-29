import type { Theme } from '#/components/ui/shared'

import { CodeBlock, SectionHeader } from './SiteChrome'
import { Frame } from './layout-svg'

export type GetStartedProps = {
  theme?: Theme
  repoUrl?: string
  showFileMap?: boolean
}

const fileMap: [string, string][] = [
  ['src/components/ui/', 'The kit: Button, Switch, Checkbox, RadioGroup, SegmentedControl, RangeSlider, Progress, TextField, Card, Icon.'],
  ['src/components/ui/glass/', 'Shared glass engine: runtime.ts (WebGL renderer + TSL shader), physics.ts (springs, lens morph), draw.ts, tokens.ts.'],
  ['src/components/ui/LiquidGlass.tsx', 'A bare glass pane you can put behind anything.'],
  ['src/components/liquid-glass-slider/', 'The original hero slider the kit was ported from.'],
  ['src/components/site/', 'The sections of this page and the shared site chrome.'],
  ['src/components/shadcn/', 'shadcn/ui primitives used by the site chrome (button, badge, separator).'],
]

/** Clone/run instructions and a file map. */
export function GetStarted({ theme, repoUrl = 'https://github.com', showFileMap = true }: GetStartedProps) {
  const repoName = repoUrl.split('/').filter(Boolean).pop() || 'liquid-glass-ui'

  return (
    <section data-theme={theme} id="start" className="w-full scroll-mt-14 px-6 py-20 sm:px-10 md:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <SectionHeader
          title="Run it, fork it, ship it"
          description="TanStack Start, Vite, Tailwind v4 and three.js. Clone it, run it with pnpm, copy the controls you need."
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CodeBlock title="terminal">{`git clone ${repoUrl}.git
cd ${repoName}
pnpm install
pnpm dev      # Vite dev server
pnpm build    # static prerender + verify-static-build`}</CodeBlock>
          <CodeBlock title="app.tsx">{`import { Switch } from '#/components/ui/Switch'
import { RangeSlider } from '#/components/ui/RangeSlider'

<Switch label="Notifications" checked onChange={setOn} />
<RangeSlider label="Brightness" value={40} endIcon="sun" />

// Any subtree can pick its own theme:
<div data-theme="dark">…</div>`}</CodeBlock>
        </div>

        {showFileMap && (
          <Frame>
            <h3 className="border-b border-border px-5 py-3 text-[15px] font-semibold text-foreground">Where things live</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2">
              {fileMap.map(([path, what], i) => (
                <div
                  key={path}
                  className={`flex flex-col gap-1 px-5 py-4 text-[13px] ${i > 0 ? 'border-t border-border' : ''} ${i === 1 ? 'md:border-t-0' : ''} ${i % 2 === 1 ? 'md:border-l' : ''}`}
                >
                  <dt className="font-mono text-[12px] font-medium text-foreground">{path}</dt>
                  <dd className="leading-relaxed text-muted-foreground">{what}</dd>
                </div>
              ))}
            </dl>
          </Frame>
        )}
      </div>
    </section>
  )
}

export default GetStarted
