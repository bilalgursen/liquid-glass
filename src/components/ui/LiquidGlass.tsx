import { useRef } from 'react'

import { drawLabel, drawTrack, scaleOptics } from './glass/draw'
import { HOVER_X, HOVER_Y, PRESS, pressedLens, sliderOptics, stepSpring, type GlassOptics, type Spring } from './glass/physics'
import type { GlassTokens } from './glass/tokens'
import { useGlassCanvas } from './glass/useGlassCanvas'
import type { Theme } from './shared'

export type GlassBox = { x: number; y: number; width: number; height: number }

export type LiquidGlassProps = {
  /** Glass body size in CSS px. */
  width: number
  height: number
  /** Offset of the glass inside its positioned parent. */
  x?: number
  y?: number
  /** Corner radius in px; omit for a pill. */
  radius?: number
  /** CSS px per design unit; defaults to the slider's 120-unit lens height. */
  unit?: number
  /** Resting frost (0 clear … 1 frosted); pressing always clears it. */
  frost?: number
  pressed?: boolean
  /** Hovered glass swells with a wobbly, liquid spring. */
  hovered?: boolean
  /** Hover growth on every side, in px; defaults to 8% of the height. */
  hoverGrow?: number
  /** Pressed lens size relative to the resting glass. */
  swell?: number
  /** Extra canvas around the glass for swelling and the drop shadow (px). */
  margin?: { x: number; top: number; bottom: number }
  optics?: Partial<GlassOptics>
  frostCenter?: string
  frostEdge?: string
  /** Paints what lies beneath the glass, in the parent's coordinates. */
  drawBackdrop?: (ctx: CanvasRenderingContext2D, tokens: GlassTokens, glass: GlassBox) => void
  /** Rim highlight follows the cursor (buttons only by default). */
  cursorLight?: boolean
  className?: string
}

/**
 * A canvas pane of the hero slider's glass, absolutely positioned behind its parent's
 * content and rendered by the shared WebGL runtime (glass/runtime.ts).
 */
export function LiquidGlass({
  width,
  height,
  x = 0,
  y = 0,
  radius,
  unit,
  frost = 0,
  pressed = false,
  hovered = false,
  hoverGrow,
  swell = 1.06,
  margin,
  optics,
  frostCenter,
  frostEdge,
  drawBackdrop,
  cursorLight = false,
  className = '',
}: LiquidGlassProps) {
  const u = unit ?? Math.max(height, 1) / 120
  const m = margin ?? { x: height * 0.4 + 8, top: height * 0.4 + 8, bottom: height * 1.7 + 12 }
  const press = useRef<Spring>({ x: 0, v: 0 })
  const hoverX = useRef<Spring>({ x: 0, v: 0 })
  const hoverY = useRef<Spring>({ x: 0, v: 0 })
  const grow = (hoverGrow ?? height * 0.08) / u
  const canvasW = width + m.x * 2
  const canvasH = height + m.top + m.bottom

  const { canvasRef } = useGlassCanvas({
    width: canvasW,
    height: canvasH,
    unit: u,
    cursorLight,
    step: (dt, reduced) => {
      const hover = hovered ? 1 : 0
      if (reduced) {
        press.current = { x: pressed ? 1 : 0, v: 0 }
        hoverX.current = { x: hover, v: 0 }
        hoverY.current = { x: hover, v: 0 }
        return false
      }
      const p = stepSpring(press.current, pressed ? 1 : 0, PRESS.omega, PRESS.zeta, dt)
      const hx = stepSpring(hoverX.current, hover, HOVER_X.omega, HOVER_X.zeta, dt)
      const hy = stepSpring(hoverY.current, hover, HOVER_Y.omega, HOVER_Y.zeta, dt)
      return p || hx || hy
    },
    draw(bg, _fg, tokens) {
      if (drawBackdrop) {
        bg.save()
        bg.translate(m.x - x, m.top - y)
        drawBackdrop(bg, tokens, { x, y, width, height })
        bg.restore()
      }
      const rest = { w: width / u, h: height / u }
      const o = { ...scaleOptics(sliderOptics, rest.h / 120), cornerRadius: 999, ...optics }
      const lens = pressedLens(press.current.x, rest, { w: rest.w * swell, h: rest.h * swell }, frost, o)
      const gx = grow * hoverX.current.x
      const gy = grow * hoverY.current.x
      lens.hx += gx
      lens.hy += gy
      lens.radius = Math.min(lens.radius + Math.min(gx, gy), Math.min(lens.hx, lens.hy) - 1)
      if (radius !== undefined) {
        lens.radius = (radius / u) * (lens.hy / (rest.h / 2))
        // Shading bands deeper than the corner radius meet in visible diagonal seams on rectangles.
        lens.bevel = Math.min(lens.bevel, lens.radius * 1.2)
      }
      return {
        ...lens,
        x: (m.x + width / 2) / u,
        y: (m.top + height / 2) / u,
        stretchX: 1,
        stretchY: 1,
        shiftX: 0,
        frostCenter,
        frostEdge,
      }
    },
  })

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute ${className}`}
      style={{ left: x - m.x, top: y - m.top, width: canvasW, height: canvasH }}
    />
  )
}

export type LiquidGlassPreviewProps = Pick<LiquidGlassProps, 'frost' | 'pressed' | 'swell' | 'radius'> &
  Partial<
    Pick<
      GlassOptics,
      | 'refraction'
      | 'bevelWidth'
      | 'dispersion'
      | 'magnification'
      | 'rimIntensity'
      | 'topReflection'
      | 'innerShading'
      | 'causticStrength'
      | 'shadowOpacity'
    >
  > & {
    theme?: Theme
    lensWidth?: number
    lensHeight?: number
    /** Slides the lens across the sample scene (-1 … 1). */
    offset?: number
  }

// Canvas playground: one lens over a slider-style track and a line of type.
export function LiquidGlassPreview({
  theme = 'light',
  lensWidth = 245,
  lensHeight = 120,
  offset = 0,
  frost = 0,
  pressed = false,
  swell = 1,
  radius,
  ...optics
}: LiquidGlassPreviewProps) {
  const W = 680
  const H = 260
  const gx = W / 2 - lensWidth / 2 + offset * (W / 2 - lensWidth / 2 - 20)
  const gy = 110 - lensHeight / 2
  const set = Object.fromEntries(Object.entries(optics).filter(([, v]) => v !== undefined)) as Partial<GlassOptics>
  // The preview lens is always "pressed" optically: full refraction at rest too.
  const lensOptics: Partial<GlassOptics> = { restRefraction: set.refraction ?? 37, ...set }

  return (
    <div
      data-theme={theme}
      className="relative overflow-hidden bg-canvas dark:bg-canvas-dark"
      style={{ width: W, height: H }}
    >
      <LiquidGlass
        width={lensWidth}
        height={lensHeight}
        x={gx}
        y={gy}
        radius={radius}
        unit={1}
        frost={frost}
        pressed={pressed}
        swell={swell}
        margin={{ x: Math.max(gx, W - gx - lensWidth), top: gy, bottom: H - gy - lensHeight }}
        optics={lensOptics}
        drawBackdrop={(ctx, tokens) => {
          drawTrack(ctx, {
            x: 60,
            y: 110,
            length: W - 120,
            height: 32,
            fillEnd: W / 2,
            track: tokens.track,
            accent: tokens.accent,
          })
          drawLabel(ctx, 'Liquid glass bends what sits beneath it', W / 2, 205, 22, tokens.text, 600)
        }}
      />
    </div>
  )
}

export default LiquidGlass
