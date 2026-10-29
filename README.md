# Liquid Glass UI

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

Before publishing, set `REPO_URL` in `src/routes/index.tsx` to the real
repository.

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


## Stack

TanStack Start · Vite · Tailwind CSS v4 · three.js · motion. pnpm only.
Generated files (`src/routeTree.gen.ts`, `.output/`) are not hand-edited.

## License

MIT — see `LICENSE`.
