import { memo, useEffect, useRef, useState } from 'react'

import { drawLabel, drawTrack, scaleOptics } from '#/components/ui/glass/draw'
import { PRESS, pressedLens, sliderOptics, stepSpring, type Spring } from '#/components/ui/glass/physics'
import type { GlassViewStats } from '#/components/ui/glass/runtime'
import { useGlassCanvas } from '#/components/ui/glass/useGlassCanvas'
import { SegmentedControl } from '#/components/ui/SegmentedControl'
import { useElementSize, type Theme } from '#/components/ui/shared'
import { cn } from '@/lib/utils'

import { FeatureGrid, SectionHeader, type Feature } from './SiteChrome'
import { Frame, GlassPipelineDiagram } from './layout-svg'

export type RenderMode = 'demand' | 'always'

export type HowItWorksProps = {
  theme?: Theme
  /** Starting mode of the live demo. */
  mode?: RenderMode
  showDiagram?: boolean
  showInternals?: boolean
}

const internals: Feature[] = [
  {
    icon: 'gpu',
    title: 'One renderer for the page',
    body: 'A single WebGL2 renderer (three.js WebGPURenderer on its WebGL backend, shaders in TSL) draws every control and copies the result into each control’s own canvas, so a page full of glass never hits the browser’s context limit.',
  },
  {
    icon: 'layers',
    title: 'Two layers and one lens',
    body: 'A control paints two Canvas2D layers, what sits beneath the glass and what rides on top, and hands the shader one lens: position, size, bevel, refraction, frost.',
  },
  {
    icon: 'motion',
    title: 'Springs stepped per frame',
    body: 'Motion is damped springs; a view only renders while something moves or a prop changed. prefers-reduced-motion snaps every spring to its target.',
  },
  {
    icon: 'document',
    title: 'Prerendered, hydrated lazily',
    body: 'Every page is prerendered to static HTML and the renderer loads on the client after hydration, so first paint is plain markup.',
  },
]

const modes: { value: RenderMode; label: string; title: string; body: string }[] = [
  {
    value: 'demand',
    label: 'On demand',
    title: 'Renders only while something moves',
    body: 'The springs are stepped every frame, but the shader runs only when a spring is still moving or a prop changed. At rest the control costs nothing.',
  },
  {
    value: 'always',
    label: 'Every frame',
    title: 'A plain requestAnimationFrame loop',
    body: 'The same lens, redrawn on every frame whether or not anything changed. Multiply by every control on a page and the GPU never idles.',
  },
]

/* ---------- Live demo: one lens, two render loops ---------- */

const H = 250
const TRACK_Y = H * 0.42
const LENS = { w: 210, h: 100 }
const SWELL = 1.08
const GROW = 8

type LoopStats = { perSecond: number; msPerSecond: number }

// Memoised: any re-render of the canvas owner repaints once (useGlassCanvas), which would
// itself show up on the "on demand" counter. The meter below keeps its own state instead.
const GlassLoopDemo = memo(function GlassLoopDemo({ mode, onRendering }: { mode: RenderMode; onRendering?: (on: boolean) => void }) {
  const [areaRef, { width: W }] = useElementSize<HTMLDivElement>()
  const sim = useRef({
    x: { x: 0, v: 0 } as Spring,
    y: { x: TRACK_Y, v: 0 } as Spring,
    press: { x: 0, v: 0 } as Spring,
    hover: { x: 0, v: 0 } as Spring,
    pointer: null as { x: number; y: number } | null,
    pressed: false,
    started: false,
  })

  const { canvasRef, stats, invalidate } = useGlassCanvas({
    width: W,
    height: H,
    unit: 1,
    cursorLight: true,
    alwaysRender: mode === 'always',
    step(dt, reduced) {
      const s = sim.current
      if (!s.started && W > 0) {
        s.started = true
        s.x = { x: W / 2, v: 0 }
      }
      // At rest the lens sits on the track like a slider thumb.
      const target = s.pointer ?? { x: W / 2, y: TRACK_Y }
      const hover = s.pointer ? 1 : 0
      if (reduced) {
        s.x = { x: target.x, v: 0 }
        s.y = { x: target.y, v: 0 }
        s.press = { x: s.pressed ? 1 : 0, v: 0 }
        s.hover = { x: hover, v: 0 }
        return false
      }
      const a = stepSpring(s.x, target.x, 14, 0.75, dt)
      const b = stepSpring(s.y, target.y, 14, 0.75, dt)
      const c = stepSpring(s.press, s.pressed ? 1 : 0, PRESS.omega, PRESS.zeta, dt)
      const d = stepSpring(s.hover, hover, 12, 0.5, dt)
      return a || b || c || d
    },
    draw(bg, _fg, tokens) {
      const s = sim.current
      drawTrack(bg, {
        x: 36,
        y: TRACK_Y,
        length: Math.max(W - 72, 0),
        height: 28,
        fillEnd: W * 0.55,
        track: tokens.track,
        accent: tokens.accent,
      })
      drawLabel(bg, 'Same pixels in both loops.', W / 2, H * 0.74, Math.min(18, W / 22), tokens.text, 600)
      drawLabel(bg, 'Drag the lens, then flip the loop.', W / 2, H * 0.74 + Math.min(18, W / 22) * 1.5, Math.min(13, W / 30), tokens.textMuted, 500)
      const o = { ...scaleOptics(sliderOptics, LENS.h / 120), cornerRadius: 999, restRefraction: sliderOptics.refraction }
      const lens = pressedLens(s.press.x, LENS, { w: LENS.w * SWELL, h: LENS.h * SWELL }, 0, o)
      const g = GROW * s.hover.x
      lens.hx += g
      lens.hy += g
      lens.radius = Math.min(lens.radius + g, Math.min(lens.hx, lens.hy) - 1)
      // Keep the whole lens inside the canvas so the shader always has backdrop to bend.
      const x = Math.min(Math.max(s.x.x, lens.hx + 4), Math.max(W - lens.hx - 4, lens.hx + 4))
      const y = Math.min(Math.max(s.y.x, lens.hy + 4), H - lens.hy - 4)
      return { ...lens, x, y, stretchX: 1, stretchY: 1, shiftX: 0 }
    },
  })

  // Switching the loop repaints once so the "every frame" counter starts at once.
  useEffect(() => invalidate(), [mode, invalidate])

  const local = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  return (
    <div className="flex flex-col">
      <div
        ref={areaRef}
        className="relative cursor-grab touch-none overflow-hidden active:cursor-grabbing"
        style={{ height: H }}
        onPointerMove={(e) => (sim.current.pointer = local(e))}
        onPointerLeave={() => {
          sim.current.pointer = null
          sim.current.pressed = false
        }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          sim.current.pointer = local(e)
          sim.current.pressed = true
        }}
        onPointerUp={() => (sim.current.pressed = false)}
        onPointerCancel={() => (sim.current.pressed = false)}
      >
        <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ width: W, height: H }} />
      </div>
      <LoopMeter stats={stats} onRendering={onRendering} />
    </div>
  )
})

/** Samples the view's running totals twice a second and shows the rates. */
function LoopMeter({ stats, onRendering }: { stats: () => GlassViewStats; onRendering?: (on: boolean) => void }) {
  const onRenderingRef = useRef(onRendering)
  onRenderingRef.current = onRendering
  const [rate, setRate] = useState<LoopStats>({ perSecond: 0, msPerSecond: 0 })
  useEffect(() => {
    let last = stats()
    let lastAt = performance.now()
    const id = setInterval(() => {
      const now = stats()
      const t = performance.now()
      const dt = (t - lastAt) / 1000
      const perSecond = Math.round((now.renders - last.renders) / dt)
      setRate({ perSecond, msPerSecond: Math.round(((now.ms - last.ms) / dt) * 10) / 10 })
      onRenderingRef.current?.(perSecond > 0)
      last = now
      lastAt = t
    }, 500)
    return () => clearInterval(id)
  }, [stats])

  return (
    <>
      <dl className="grid grid-cols-2 border-t border-border font-mono text-[11px] text-muted-foreground">
        <div className="flex flex-col gap-1 px-4 py-3">
          <dt>shader passes / s</dt>
          <dd className={cn('text-[22px] leading-none font-medium tabular-nums', rate.perSecond > 0 ? 'text-accent' : 'text-foreground')}>
            {rate.perSecond}
          </dd>
        </div>
        <div className="flex flex-col gap-1 border-l border-border px-4 py-3">
          <dt>main thread ms / s</dt>
          <dd className="text-[22px] leading-none font-medium text-foreground tabular-nums">{rate.msPerSecond.toFixed(1)}</dd>
        </div>
      </dl>
      <span className="sr-only" aria-live="polite">
        {rate.perSecond > 0 ? 'Rendering' : 'Idle'}
      </span>
    </>
  )
}

/* ---------- Section ---------- */

/** The hero's old pipeline diagram, now beside a live control you can drive with two render loops. */
export function HowItWorks({ theme, mode: initialMode = 'demand', showDiagram = true, showInternals = true }: HowItWorksProps) {
  const [mode, setMode] = useState<RenderMode>(initialMode)
  const [rendering, setRendering] = useState(false)
  const current = modes.find((m) => m.value === mode) ?? modes[0]

  return (
    <section data-theme={theme} id="how" className="w-full scroll-mt-14 px-6 sm:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 border-b border-border py-20 md:py-24">
        <SectionHeader
          title="How the glass works"
          description="Every control hands one lens to a shared WebGL shader. Drag the lens below and flip the render loop: both loops draw the identical image, but only one of them is free while nothing moves."
        />

        <div className={cn('grid grid-cols-1 gap-6', showDiagram && 'lg:grid-cols-2')}>
          <Frame className="flex flex-col bg-background/60">
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
              <span className="font-mono text-[11px] whitespace-nowrap text-muted-foreground">one control · live</span>
              <SegmentedControl
                size="sm"
                showIcons={false}
                ariaLabel="Render loop"
                value={mode}
                onChange={(v) => setMode(v as RenderMode)}
                options={modes.map(({ value, label }) => ({ value, label }))}
              />
            </div>
            <GlassLoopDemo mode={mode} onRendering={setRendering} />
            <div className="flex flex-col gap-1 border-t border-border px-4 py-4">
              <h3 className="text-[14px] font-semibold text-foreground">{current.title}</h3>
              <p className="text-[13px] leading-relaxed text-muted-foreground">{current.body}</p>
            </div>
          </Frame>

          {showDiagram && (
            <Frame className="flex items-center bg-background/60 p-4 sm:p-6">
              <GlassPipelineDiagram rendering={rendering} />
            </Frame>
          )}
        </div>

        {showInternals && <FeatureGrid items={internals} columns={2} />}
      </div>
    </section>
  )
}

export default HowItWorks
