import { useRef } from 'react'

import { drawTrack } from './glass/draw'
import { pressedLens, sliderOptics, stepSpring, type Spring } from './glass/physics'
import { useGlassCanvas } from './glass/useGlassCanvas'
import { useElementSize, type Theme } from './shared'

export type ProgressProps = {
  value?: number
  label?: string
  theme?: Theme
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  indeterminate?: boolean
  /** Encase the track in a clear glass tube. */
  tube?: boolean
  fillBounce?: number
}

// Slider design units: a 32-unit track inside the 68-unit resting glass.
const TRACK = 32
const TUBE_H = 68
const MARGIN = { x: 40, top: 50, bottom: 150 }
const trackHeights = { sm: 6, md: 10, lg: 16 }

export function Progress({
  value = 64,
  label = 'Uploading',
  theme,
  size = 'md',
  showValue = true,
  indeterminate = false,
  tube = true,
  fillBounce = 0.15,
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, value))
  const T = trackHeights[size]
  const unit = T / TRACK
  const [ref, { width: W }] = useElementSize<HTMLDivElement>()
  const areaH = (tube ? TUBE_H : TRACK) * unit
  const sim = useRef({ fill: { x: pct, v: 0 } as Spring, sweep: 0 })

  const canvasW = W + MARGIN.x * 2 * unit
  const canvasH = (MARGIN.top + MARGIN.bottom) * unit

  const { canvasRef } = useGlassCanvas({
    width: canvasW,
    height: canvasH,
    unit,
    step(dt, reduced) {
      const s = sim.current
      if (indeterminate && !reduced) {
        s.sweep = (s.sweep + dt / 1.4) % 1
        return true
      }
      if (reduced) {
        s.fill = { x: pct, v: 0 }
        return false
      }
      return stepSpring(s.fill, pct, 9, 1 - fillBounce, dt)
    },
    draw(bg, _fg, tokens) {
      const s = sim.current
      const x0 = MARGIN.x * unit
      const y = MARGIN.top * unit
      const common = { y, height: T, track: tokens.track, accent: tokens.accent }
      if (indeterminate) {
        drawTrack(bg, { ...common, x: x0, length: W, fillEnd: x0 })
        // A 40% segment sweeping across, clipped to the track
        const t = s.sweep
        const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
        const segW = W * 0.4
        const start = x0 - segW + eased * (W + segW)
        bg.save()
        bg.beginPath()
        bg.roundRect(x0, y - T / 2, W, T, T / 2)
        bg.clip()
        drawTrack(bg, { ...common, x: start, length: segW, fillEnd: start + segW, track: 'rgba(0,0,0,0)' })
        bg.restore()
      } else {
        drawTrack(bg, { ...common, x: x0, length: W, fillEnd: s.fill.x <= 0 ? x0 : x0 + (s.fill.x / 100) * W })
      }
      const length = W / unit
      const lens = pressedLens(0, { w: length + (TUBE_H - TRACK), h: TUBE_H }, { w: length, h: TUBE_H }, 0, sliderOptics)
      return {
        ...lens,
        x: MARGIN.x + length / 2,
        y: MARGIN.top,
        stretchX: 1,
        stretchY: 1,
        shiftX: 0,
        visible: tube,
      }
    },
  })

  return (
    <div data-theme={theme} className="flex w-full max-w-md flex-col gap-2">
      {(label || showValue) && (
        <div className="flex items-center justify-between px-1 text-[13px] font-medium">
          <span className="text-neutral-900 dark:text-white">{label}</span>
          {showValue && !indeterminate && <span className="text-neutral-500 tabular-nums">{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        ref={ref}
        role="progressbar"
        aria-label={label || 'Progress'}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={indeterminate ? undefined : Math.round(pct)}
        className="relative w-full"
        style={{ height: areaH }}
      >
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{ left: -MARGIN.x * unit, top: areaH / 2 - MARGIN.top * unit, width: canvasW, height: canvasH }}
        />
      </div>
    </div>
  )
}

export default Progress
