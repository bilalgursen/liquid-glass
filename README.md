# Liquid Glass UI

**Live:** https://liquid-glass-interface.pages.dev · **Source:** https://github.com/bilalgursen/liquid-glass

An open-source React component kit where every control is a real refracting
lens: one WebGL shader, damped spring physics, light and dark themes. Ten
controls — Button, Switch, Checkbox, RadioGroup, SegmentedControl,
RangeSlider, Progress, TextField, Card, Icon — plus a bare
`LiquidGlass` pane you can put behind anything.

The site is a single page: a plain centred hero, the live kit, a "How the
glass works" section (a lens you can drag with a live switch between the
on-demand render loop and a naive every-frame loop, beside the pipeline
diagram), and get-started notes. The glass is reserved for the components
themselves; everything around them is plain, hairline-and-mono site chrome
built on shadcn/ui.

The site deploys to Cloudflare Pages from `main` (build `pnpm build`,
output `.output/public`, env `NITRO_PRESET=node-server` so the static
prerender lands there instead of a serverless preset).

## Run it

```sh
pnpm install
pnpm dev      # Vite dev server
pnpm build    # static prerender (SSG) + scripts/verify-static-build.mjs
```

Every component has a colocated `*.stories.json` (a Forge canvas frame with
a props panel); you can ignore them if you do not use Forge.

## Use a control

```tsx
import { Switch } from '#/components/ui/Switch'
import { RangeSlider } from '#/components/ui/RangeSlider'

<Switch label="Notifications" checked onChange={setOn} />
<RangeSlider label="Brightness" value={40} endIcon="sun" />

// Any subtree can pick its own theme:
<div data-theme="dark">…</div>
```

## Where things live

| Path | What |
| --- | --- |
| `src/components/ui/` | The kit. |
| `src/components/ui/glass/` | Shared glass engine: `runtime.ts` (WebGL renderer + TSL shader), `physics.ts` (springs, lens morph), `draw.ts`, `tokens.ts`. |
| `src/components/ui/LiquidGlass.tsx` | A bare glass pane. |
| `src/components/site/` | Sections of the landing page and the shared site chrome (`SiteChrome.tsx`, `layout-svg.tsx`: hairline frames, registration marks, line icons, pipeline diagrams). |
| `src/components/shadcn/` | shadcn/ui primitives used by the site chrome (`button`, `badge`, `separator`); `components.json` points the CLI here so it never collides with the glass kit in `ui/`. |

## How the glass works

- One WebGL2 renderer (three.js `WebGPURenderer` on its WebGL backend,
  shaders in TSL) draws every control and copies the result into each
  control's own `<canvas>`, so a page full of glass never hits the browser's
  context limit.
- A control paints two Canvas2D layers — what sits beneath the glass and
  what rides on top — and hands the shader one lens: position, size, bevel,
  refraction, frost.
- Motion is damped springs stepped per frame; a view only renders while
  something moves or a prop changed. `prefers-reduced-motion` snaps every
  spring to its target. A view can opt into `alwaysRender` (the site's demo
  uses it for the comparison) and exposes `stats()` — passes and
  main-thread ms so far.
- Pages prerender to static HTML; the renderer loads lazily on the client.


## Browser support

- **Controls (Button, Switch, Slider, …)** render through WebGL2 and work in
  every current browser, including Safari and iOS.
- **Glass cards** (`GlassCard`, the weather and calendar cards) bend the page
  behind them with an SVG `feDisplacementMap` filter inside `backdrop-filter`.
  Only Chromium (Chrome, Edge, Arc, Brave) composites SVG backdrop filters, so
  Safari, Firefox and every iOS browser show the same frosted, tinted glass
  without the rim refraction. The component detects this and falls back to a
  plain `blur()` on its own.
- **Mobile**: the displacement filter is re-rasterised on every frame the
  pill rows slide behind the cards, which stutters on phone GPUs. On coarse
  pointers and screens under 768px (`useLowPowerDevice` in `GlassCard.tsx`)
  the cards therefore fall back to the plain frosted glass, the rows stand
  still and the edge blur is dropped. The lens demo in "How the glass works"
  still renders on request only unless you flip it to every frame.
  `prefers-reduced-motion` stops the rows and snaps the springs everywhere.

## Stack

TanStack Start · Vite · Tailwind CSS v4 · three.js · motion. pnpm only.
Generated files (`src/routeTree.gen.ts`, `.output/`) are not hand-edited.

## License

MIT — see `LICENSE`.
