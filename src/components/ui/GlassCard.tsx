import { useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react'

import { createRefractionMap, type GlassShape, type RefractionMap } from './glass/refractionMap'
import { hexToRgb } from './glass/tokens'
import { Icon } from './Icon'
import type { Theme } from './shared'

export type GlassCardMode = 'light' | 'dark' | 'custom'

export type GlassCardProps = {
  /** Colour preset; "custom" uses the tint and border props. */
  mode?: GlassCardMode
  tintColor?: string
  tintAlpha?: number
  borderColor?: string
  borderAlpha?: number
  /** Mix of the frosted blur over the sharp refraction (0 … 1). */
  frostedOverlay?: number
  /** Frosted blur radius in px. */
  frostedRadius?: number
  borderWidth?: number
  /** Edge refraction, as a fraction of the window (as on the reference page). */
  refractStrength?: number
  shape?: GlassShape
  /** Size in px (a circle uses the width). */
  width?: number
  height?: number
  /** Corner radius for the rounded shape. */
  radius?: number
  /** Let the glass be dragged over the page, as on the reference (off by default). */
  draggable?: boolean
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

// Light and dark presets lifted from the reference shader.
const presets = {
  light: { tintColor: '#ffffff', tintAlpha: 0.15, borderColor: '#ffffff', borderAlpha: 0.6 },
  dark: { tintColor: '#0d0d0d', tintAlpha: 0.4, borderColor: '#ffffff', borderAlpha: 0.25 },
}

const rgba = (hex: string, alpha: number) => {
  const [r, g, b] = hexToRgb(hex)
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`
}

// SVG filters in backdrop-filter only render in Chromium; elsewhere the glass is frost only.
function useRefractionSupport() {
  const [supported, setSupported] = useState(false)
  useEffect(() => setSupported(/Chrome\//.test(navigator.userAgent)), [])
  return supported
}

function useWindowSize() {
  const [size, setSize] = useState({ width: 1024, height: 768 })
  useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return size
}

/**
 * A frosted glass shape that refracts the live page behind it at its rim: the
 * liquid-glass.vercel.app shader rebuilt as an SVG backdrop filter.
 */
export function GlassCard({
  mode = 'light',
  tintColor = '#ffffff',
  tintAlpha = 0.15,
  borderColor = '#ffffff',
  borderAlpha = 0.6,
  frostedOverlay = 1,
  frostedRadius = 10,
  borderWidth = 1.3,
  refractStrength = 0.065,
  shape = 'rounded',
  width = 500,
  height = 120,
  radius = 40,
  draggable = false,
  children,
  className = '',
  style,
}: GlassCardProps) {
  const colors = mode === 'custom' ? { tintColor, tintAlpha, borderColor, borderAlpha } : presets[mode]
  const h = shape === 'circle' ? width : height
  const filterId = `glass-card-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`
  const refracts = useRefractionSupport()
  const basis = useWindowSize()

  const [map, setMap] = useState<RefractionMap | null>(null)
  useEffect(() => {
    if (refracts) setMap(createRefractionMap(shape, width, h, radius, refractStrength, basis))
  }, [refracts, shape, width, h, radius, refractStrength, basis])

  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const drag = useRef<{ id: number; x: number; y: number } | null>(null)
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!draggable || (e.target as HTMLElement).closest('input, button, a, textarea, select')) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { id: e.pointerId, x: e.clientX - offset.x, y: e.clientY - offset.y }
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (d && d.id === e.pointerId) setOffset({ x: e.clientX - d.x, y: e.clientY - d.y })
  }
  const endDrag = () => (drag.current = null)

  const blur = (frostedRadius / 2) * frostedOverlay
  const backdropFilter = refracts && map ? `url(#${filterId})` : blur > 0 ? `blur(${blur}px)` : 'none'
  const borderRadius = shape === 'rounded' ? Math.min(radius, width / 2, h / 2) : shape === 'rectangle' ? 0 : '50%'

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={`relative flex items-center justify-center select-none ${draggable ? 'touch-none cursor-grab active:cursor-grabbing' : ''} ${className}`}
      style={{
        width,
        height: h,
        borderRadius,
        translate: `${offset.x}px ${offset.y}px`,
        backdropFilter,
        WebkitBackdropFilter: backdropFilter,
        // Tint over the frosted backdrop, then the inner rim, as in the shader.
        background: rgba(colors.tintColor, colors.tintAlpha),
        boxShadow: borderWidth > 0 ? `inset 0 0 1px ${borderWidth}px ${rgba(colors.borderColor, colors.borderAlpha)}` : undefined,
        ...style,
      }}
    >
      {refracts && map && (
        <svg aria-hidden="true" width="0" height="0" className="absolute">
          <filter id={filterId} x="0" y="0" width={width} height={h} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feImage href={map.href} x="0" y="0" width={width} height={h} preserveAspectRatio="none" result="map" />
            <feDisplacementMap in="SourceGraphic" in2="map" scale={map.scale} xChannelSelector="R" yChannelSelector="G" result="refracted" />
            <feGaussianBlur in="refracted" stdDeviation={frostedRadius / 2} result="blurred" />
            {/* Renormalise the blur so the rim doesn't fade into the transparent outside. */}
            <feComponentTransfer in="blurred" result="frosted">
              <feFuncA type="table" tableValues="1 1" />
            </feComponentTransfer>
            <feComposite in="refracted" in2="frosted" operator="arithmetic" k1="0" k2={1 - frostedOverlay} k3={frostedOverlay} k4="0" />
          </filter>
        </svg>
      )}
      {children}
    </div>
  )
}

export type GlassCardPreviewProps = GlassCardProps & {
  theme?: Theme
  stageWidth?: number
  stageHeight?: number
  /** Smaller sample content, for the gallery card. */
  compact?: boolean
}

const swatches = ['#3291FF', '#FF6B3D', '#22C55E', '#EC4899', '#FACC15', '#8B5CF6']

// Canvas playground: the glass resting over type and colour it can bend.
export function GlassCardPreview({ theme = 'light', stageWidth, stageHeight = 420, compact = false, ...glass }: GlassCardPreviewProps) {
  return (
    <div
      data-theme={theme}
      className="relative flex items-center justify-center overflow-visible bg-canvas dark:bg-canvas-dark"
      style={{ width: stageWidth ?? '100%', height: stageHeight }}
    >
      <div aria-hidden="true" className={`pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center ${compact ? 'gap-2.5 px-1' : 'gap-4 px-10'}`}>
        <p className={`leading-none font-bold tracking-[-0.03em] text-neutral-900 dark:text-white ${compact ? 'text-[44px]' : 'text-[88px]'}`}>
          Liquid Glass
        </p>
        <div className="flex gap-2">
          {swatches.map((color) => (
            <span key={color} className={`rounded-full ${compact ? 'h-6 w-10' : 'h-9 w-16'}`} style={{ background: color }} />
          ))}
        </div>
        <p className={`max-w-[46ch] text-neutral-500 ${compact ? 'text-[12px]' : 'text-[15px]'}`}>
          The rim bends the page behind it while the face frosts and tints whatever passes underneath.
        </p>
      </div>
      <GlassCard {...glass} />
    </div>
  )
}

export type GlassCardExamplesProps = Omit<GlassCardProps, 'shape' | 'width' | 'height' | 'radius' | 'children'> & {
  theme?: Theme
}

const ink = 'text-neutral-900 dark:text-white'
const muted = 'text-neutral-900/60 dark:text-white/60'

// Skiper UI's progressive blur (skiper41), turned sideways to soften where the rows enter and leave.
function ProgressiveBlur({ side, width = 150, blur = 4 }: { side: 'left' | 'right'; width?: number; blur?: number }) {
  const inward = side === 'left' ? 'to right' : 'to left'
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-y-0 select-none [--edge:var(--color-canvas)] dark:[--edge:var(--color-canvas-dark)] ${side === 'left' ? 'left-0' : 'right-0'}`}
      style={{
        width,
        background: `linear-gradient(${inward}, var(--edge), transparent)`,
        maskImage: `linear-gradient(${inward}, black 50%, transparent)`,
        WebkitMaskImage: `linear-gradient(${inward}, black 50%, transparent)`,
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
      }}
    />
  )
}

// A weather card and a search pill, over two looping rows of colour they can bend.
export function GlassCardExamples({ theme = 'light', mode, ...glass }: GlassCardExamplesProps) {
  const settings = { ...glass, mode: mode ?? theme }
  return (
    <div data-theme={theme} className="relative w-full overflow-hidden rounded-2xl bg-canvas py-10 dark:bg-canvas-dark">
      {/* Rows loop forever: two identical halves slide by exactly one half. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex flex-col justify-center overflow-hidden">
        {[1, 2].map((row) => (
          <div
            key={row}
            className="flex w-max animate-marquee whitespace-nowrap motion-reduce:animate-none"
            style={{ animationDuration: `${36 + row * 8}s`, animationDirection: row % 2 ? 'reverse' : 'normal' }}
          >
            {[0, 1].map((half) => (
              <div key={half} className="flex items-center gap-3 py-1.5 pr-3">
                {[...swatches, ...swatches].map((_, i) => (
                  <span key={i} className="h-12 w-24 shrink-0 rounded-full" style={{ background: swatches[(i + row) % swatches.length] }} />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
      <ProgressiveBlur side="left" />
      <ProgressiveBlur side="right" />

      <div className="relative flex flex-wrap items-center justify-center gap-6 px-6">
        <GlassCard {...settings} shape="rounded" width={180} height={180} radius={28}>
          <div className={`flex h-full w-full flex-col justify-between p-5 ${ink}`}>
            <div className="flex items-center gap-1.5 text-[14px] font-extrabold tracking-[-0.01em]">
              <Icon name="sun" size={15} strokeWidth={2.75} /> Istanbul
            </div>
            <div>
              <p className="text-[56px] leading-none font-black tracking-[-0.05em]">24°</p>
              <p className={`mt-1.5 text-[12px] font-bold ${muted}`}>Sunny · H 27° L 18°</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard {...settings} shape="rounded" width={300} height={56} radius={28}>
          <div className={`flex w-full items-center gap-2.5 px-5 text-[15px] font-extrabold ${ink}`}>
            <Icon name="search" size={17} strokeWidth={2.75} />
            <span className={muted}>Search</span>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

export default GlassCard
