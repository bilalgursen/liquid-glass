import { useRef, type KeyboardEvent, type PointerEvent } from 'react'

import { drawIcon, fontFamily, roundRect, scaleOptics } from './glass/draw'
import { PRESS, pressedLens, sliderOptics, stepSpring, type Spring } from './glass/physics'
import type { GlassTokens } from './glass/tokens'
import { useGlassCanvas } from './glass/useGlassCanvas'
import { Icon, iconShapes, type IconName } from './Icon'
import { focusRing, useElementSize, useSyncedState, type Theme } from './shared'

export type SegmentedOption = { value: string; label: string; icon?: IconName }

export type SegmentedControlProps = {
  options?: SegmentedOption[]
  value?: string
  onChange?: (value: string) => void
  theme?: Theme
  size?: 'sm' | 'md' | 'lg'
  stretch?: boolean
  showIcons?: boolean
  showLabels?: boolean
  ariaLabel?: string
  /** Height of the pressed lens relative to a segment. */
  lensScale?: number
  /** Zoom of the labels seen through the pressed lens. */
  magnify?: number
  indicatorBounce?: number
}

const defaultOptions: SegmentedOption[] = [
  { value: 'day', label: 'Day', icon: 'sun' },
  { value: 'week', label: 'Week', icon: 'sparkle' },
  { value: 'month', label: 'Month', icon: 'moon' },
]

const sizes = {
  sm: { h: 26, font: 12, pad: 'px-3', square: 'w-8', icon: 13 },
  md: { h: 32, font: 13, pad: 'px-4', square: 'w-10', icon: 15 },
  lg: { h: 40, font: 15, pad: 'px-5', square: 'w-12', icon: 17 },
}

// A segment is 80 design units tall; the outer well adds 4 px of padding.
const SEG_H = 80
const PAD_PX = 4

export function SegmentedControl({
  options = defaultOptions,
  value,
  onChange,
  theme,
  size = 'md',
  stretch = false,
  showIcons = true,
  showLabels = true,
  ariaLabel = 'Options',
  lensScale = 1.35,
  magnify = 0.12,
  indicatorBounce = 0.25,
}: SegmentedControlProps) {
  const [selected, setSelected] = useSyncedState(value ?? options[0]?.value, onChange)
  const index = Math.max(0, options.findIndex((o) => o.value === selected))
  const [areaRef, { width: W }] = useElementSize<HTMLDivElement>()
  const s = sizes[size]
  const n = Math.max(1, options.length)
  const segW = W / n
  const unit = s.h / SEG_H
  const m = { x: 50 * unit, top: 40 * unit, bottom: 150 * unit }
  const outerW = W + PAD_PX * 2
  const outerH = s.h + PAD_PX * 2
  const centerOf = (i: number) => (i + 0.5) * segW

  const sim = useRef({
    w: -1,
    center: { x: 0, v: 0 } as Spring,
    press: { x: 0, v: 0 } as Spring,
    pressed: false,
    dragX: null as number | null,
  })
  const drag = useRef<{ startX: number; moved: boolean } | null>(null)

  const drawLabels = (ctx: CanvasRenderingContext2D, tokens: GlassTokens) => {
    ctx.font = `600 ${s.font}px ${fontFamily()}`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    options.forEach((option, i) => {
      const color = i === index ? tokens.text : tokens.textMuted
      const icon = (showIcons || !showLabels) && option.icon ? option.icon : null
      const textW = showLabels ? ctx.measureText(option.label).width : 0
      const gap = icon && showLabels ? 6 : 0
      const total = (icon ? s.icon : 0) + gap + textW
      let x = m.x + PAD_PX + centerOf(i) - total / 2
      const y = m.top + PAD_PX + s.h / 2
      if (icon) {
        drawIcon(ctx, iconShapes[icon], x + s.icon / 2, y, s.icon, color)
        x += s.icon + gap
      }
      if (showLabels) {
        ctx.fillStyle = color
        ctx.fillText(option.label, x, y + s.font * 0.04)
      }
    })
  }

  const { canvasRef } = useGlassCanvas({
    width: outerW + m.x * 2,
    height: outerH + m.top + m.bottom,
    unit,
    fgUnderLens: 1,
    step(dt, reduced) {
      const st = sim.current
      // Snap (don't glide) when the control is first measured or resized.
      if (st.w !== W) {
        st.w = W
        st.center = { x: centerOf(index), v: 0 }
      }
      const target = st.dragX ?? centerOf(index)
      if (reduced) {
        st.center = { x: target, v: 0 }
        st.press = { x: st.pressed ? 1 : 0, v: 0 }
        return false
      }
      // While gliding to a new segment the pill swells into the clear lens, then settles.
      const travelling = st.dragX === null && Math.abs(st.center.x - target) > segW * 0.06
      const a = st.dragX !== null ? stepSpring(st.center, target, 40, 1, dt) : stepSpring(st.center, target, 14, 1 - indicatorBounce, dt)
      const b = stepSpring(st.press, st.pressed || travelling ? 1 : 0, PRESS.omega, PRESS.zeta, dt)
      return a || b
    },
    draw(bg, fg, tokens) {
      const st = sim.current
      // The well
      roundRect(bg, m.x, m.top, outerW, outerH, outerH / 2)
      bg.fillStyle = tokens.well
      bg.fill()
      drawLabels(bg, tokens)

      const rest = { w: segW / unit, h: SEG_H }
      const pressedSize = { w: rest.w * 1.12, h: SEG_H * lensScale }
      const o = { ...scaleOptics(sliderOptics, pressedSize.h / 120), cornerRadius: 999, magnification: magnify }
      const lens = pressedLens(st.press.x, rest, pressedSize, 1, o)
      const cx = (m.x + PAD_PX + st.center.x) / unit
      const cy = (m.top + PAD_PX + s.h / 2) / unit

      // Labels ride on top of the frosted pill; inside the clear lens the refracted copy shows instead.
      fg.save()
      roundRect(fg, (cx - lens.hx) * unit, (cy - lens.hy) * unit, lens.hx * 2 * unit, lens.hy * 2 * unit, lens.radius * unit)
      fg.clip()
      drawLabels(fg, tokens)
      fg.restore()

      return { ...lens, x: cx, y: cy, stretchX: 1, stretchY: 1, shiftX: 0 }
    },
  })

  const localX = (e: PointerEvent<HTMLDivElement>) => e.clientX - e.currentTarget.getBoundingClientRect().left
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { startX: localX(e), moved: false }
    sim.current.pressed = true
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    const x = localX(e)
    if (!d.moved && Math.abs(x - d.startX) < 4) return
    d.moved = true
    sim.current.dragX = Math.min(centerOf(n - 1), Math.max(centerOf(0), x))
  }
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    drag.current = null
    const st = sim.current
    st.pressed = false
    if (d?.moved && st.dragX !== null) {
      const nearest = Math.min(n - 1, Math.max(0, Math.round(st.dragX / segW - 0.5)))
      setSelected(options[nearest].value)
    } else if (d && segW > 0 && e.type === 'pointerup') {
      // Pointer capture retargets the click to the group, so a tap selects the segment here.
      const tapped = Math.min(n - 1, Math.max(0, Math.floor(d.startX / segW)))
      setSelected(options[tapped].value)
    }
    st.dragX = null
  }
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const dir = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : 0
    if (!dir) return
    e.preventDefault()
    const next = (index + dir + n) % n
    setSelected(options[next].value)
    e.currentTarget.querySelectorAll<HTMLButtonElement>('[role=radio]')[next]?.focus()
  }

  return (
    <div data-theme={theme} className={`relative rounded-full ${stretch ? 'flex w-full' : 'inline-flex'}`} style={{ padding: PAD_PX }}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{ left: -m.x, top: -m.top, width: outerW + m.x * 2, height: outerH + m.top + m.bottom }}
      />
      <div
        ref={areaRef}
        role="radiogroup"
        aria-label={ariaLabel}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`relative grid touch-none select-none ${stretch ? 'w-full' : ''}`}
        style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, height: s.h }}
      >
        {options.map((option, i) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={i === index}
            aria-label={showLabels ? undefined : option.label}
            tabIndex={i === index ? 0 : -1}
            onClick={() => setSelected(option.value)}
            // Text stays in the DOM for layout and a11y; the canvas draws it under the glass.
            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-full font-semibold text-transparent ${focusRing} ${showLabels ? s.pad : s.square}`}
            style={{ fontSize: s.font }}
          >
            {(showIcons || !showLabels) && option.icon && <Icon name={option.icon} size={s.icon} />}
            {showLabels && option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default SegmentedControl
