import type { ReactNode, SVGProps } from 'react'

import { cn } from '@/lib/utils'

/*
 * Layout SVGs for the site chrome: hairline frames with crosshair corners,
 * faint grids, halftone fades and single-weight line icons. All strokes use
 * currentColor so a parent's text colour (and data-theme) themes them.
 */

type SvgProps = SVGProps<SVGSVGElement>

/** A small "+" registration mark. */
export function Crosshair({ className, size = 11, ...props }: SvgProps & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true" className={className} {...props}>
      <path d="M6 0.5v11M0.5 6h11" />
    </svg>
  )
}

export type FrameProps = {
  children?: ReactNode
  className?: string
  /** Draw "+" marks on the four corners. */
  corners?: boolean
  as?: 'div' | 'section' | 'article' | 'li'
  id?: string
}

/** A hairline-bordered box with registration marks on its corners. */
export function Frame({ children, className, corners = true, as: Tag = 'div', id }: FrameProps) {
  return (
    <Tag id={id} className={cn('relative border border-border', className)}>
      {corners && (
        <>
          <Crosshair className="absolute -top-[6px] -left-[6px] text-foreground/60" />
          <Crosshair className="absolute -top-[6px] -right-[6px] text-foreground/60" />
          <Crosshair className="absolute -bottom-[6px] -left-[6px] text-foreground/60" />
          <Crosshair className="absolute -right-[6px] -bottom-[6px] text-foreground/60" />
        </>
      )}
      {children}
    </Tag>
  )
}

/** Faint square grid, absolutely positioned behind a section. */
export function GridLines({ className, cell = 48, ...props }: SvgProps & { cell?: number }) {
  return (
    <svg className={cn('pointer-events-none absolute inset-0 h-full w-full text-foreground/[0.06]', className)} aria-hidden="true" {...props}>
      <defs>
        <pattern id="site-grid" width={cell} height={cell} patternUnits="userSpaceOnUse">
          <path d={`M ${cell} 0 L 0 0 0 ${cell}`} fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#site-grid)" />
    </svg>
  )
}

/** Halftone dots that fade out towards the bottom-left. */
export function Halftone({ className, ...props }: SvgProps) {
  return (
    <svg className={cn('pointer-events-none absolute text-foreground/20', className)} aria-hidden="true" {...props}>
      <defs>
        <pattern id="site-dots" width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.1" fill="currentColor" />
        </pattern>
        <linearGradient id="site-dots-fade" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id="site-dots-mask">
          <rect width="100%" height="100%" fill="url(#site-dots-fade)" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="url(#site-dots)" mask="url(#site-dots-mask)" />
    </svg>
  )
}

/**
 * Full-bleed dot grid behind the hero. Sparse and faint: dots clear out behind the
 * headline and fade away before the section's bottom edge so it never hard-stops.
 */
export function DotGrid({ className, cell = 28, radius = 0.9, ...props }: SvgProps & { cell?: number; radius?: number }) {
  return (
    <svg
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full text-foreground/[0.22] [mask-image:linear-gradient(to_bottom,black_55%,transparent)]',
        className,
      )}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <pattern id="hero-dots" width={cell} height={cell} patternUnits="userSpaceOnUse">
          <circle cx={cell / 2} cy={cell / 2} r={radius} fill="currentColor" />
        </pattern>
        <radialGradient id="hero-dots-fade" cx="50%" cy="40%" r="75%">
          <stop offset="0" stopColor="white" stopOpacity="0" />
          <stop offset="0.5" stopColor="white" stopOpacity="0.3" />
          <stop offset="1" stopColor="white" />
        </radialGradient>
        <mask id="hero-dots-mask">
          <rect width="100%" height="100%" fill="url(#hero-dots-fade)" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="url(#hero-dots)" mask="url(#hero-dots-mask)" />
    </svg>
  )
}

/** A dashed hairline across its container, like Cloudflare's hero rules. */
export function DashedRule({ className, dash = 16, ...props }: SvgProps & { dash?: number }) {
  return (
    <svg className={cn('pointer-events-none absolute inset-x-0 h-px w-full text-border', className)} preserveAspectRatio="none" aria-hidden="true" {...props}>
      <line x1="0" y1="0.5" x2="100%" y2="0.5" stroke="currentColor" strokeWidth="1" strokeDasharray={`${dash},${dash}`} />
    </svg>
  )
}

/* ---------- Line icons (24 grid, 1.5 stroke) ---------- */

function Base({ children, className, ...props }: SvgProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {children}
    </svg>
  )
}

export const LineIcon = {
  lens: (p: SvgProps) => (
    <Base {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M7.5 9.5a5.5 5.5 0 0 1 4-2.5M5 15.5a8.5 8.5 0 0 0 1.5 2" />
    </Base>
  ),
  spring: (p: SvgProps) => (
    <Base {...p}>
      <path d="M3 12h2l2-6 3 12 3-12 3 12 2-6h3" />
    </Base>
  ),
  layers: (p: SvgProps) => (
    <Base {...p}>
      <path d="m12 4 8 4-8 4-8-4 8-4Z" />
      <path d="m4 12 8 4 8-4M4 16l8 4 8-4" />
    </Base>
  ),
  terminal: (p: SvgProps) => (
    <Base {...p}>
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
      <path d="m7 9 3 3-3 3M12.5 15H17" />
    </Base>
  ),
  canvas: (p: SvgProps) => (
    <Base {...p}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
      <path d="M3.5 9h17M9 9v11.5" />
    </Base>
  ),
  gpu: (p: SvgProps) => (
    <Base {...p}>
      <rect x="6" y="6" width="12" height="12" rx="1.5" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="0.5" />
      <path d="M9 2.5V6M15 2.5V6M9 18v3.5M15 18v3.5M2.5 9H6M2.5 15H6M18 9h3.5M18 15h3.5" />
    </Base>
  ),
  json: (p: SvgProps) => (
    <Base {...p}>
      <path d="M8 3.5c-2 0-3 1-3 3v3c0 1.5-1 2.5-2 2.5 1 0 2 1 2 2.5v3c0 2 1 3 3 3M16 3.5c2 0 3 1 3 3v3c0 1.5 1 2.5 2 2.5-1 0-2 1-2 2.5v3c0 2-1 3-3 3" />
    </Base>
  ),
  motion: (p: SvgProps) => (
    <Base {...p}>
      <path d="M3 17c4 0 4-10 8-10s4 10 8 10" />
      <path d="M3 12h18" strokeDasharray="2 3" />
    </Base>
  ),
  document: (p: SvgProps) => (
    <Base {...p}>
      <path d="M14 3.5H7a1.5 1.5 0 0 0-1.5 1.5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8L14 3.5Z" />
      <path d="M14 3.5V8h4.5M9 12h6M9 16h6" />
    </Base>
  ),
  browser: (p: SvgProps) => (
    <Base {...p}>
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
      <path d="M3 9h18M6.5 6.8h.01M9 6.8h.01" />
    </Base>
  ),
  shield: (p: SvgProps) => (
    <Base {...p}>
      <path d="M12 3 4.5 6v5.5c0 4.5 3 8 7.5 9.5 4.5-1.5 7.5-5 7.5-9.5V6L12 3Z" />
      <path d="m9 12 2 2 4-4" />
    </Base>
  ),
  globe: (p: SvgProps) => (
    <Base {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c3 3 3 14 0 17M12 3.5c-3 3-3 14 0 17" />
    </Base>
  ),
  fork: (p: SvgProps) => (
    <Base {...p}>
      <circle cx="6" cy="5" r="2" />
      <circle cx="18" cy="5" r="2" />
      <circle cx="12" cy="19" r="2" />
      <path d="M6 7v2a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V7M12 12v5" />
    </Base>
  ),
  arrow: (p: SvgProps) => (
    <Base {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Base>
  ),
} as const

export type LineIconName = keyof typeof LineIcon

/* ---------- Diagrams ---------- */

type DiagramProps = { className?: string; title?: string }

function Node({ x, y, w, h, label, mono, accent }: { x: number; y: number; w: number; h: number; label: string; mono?: boolean; accent?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="3" fill="var(--background)" stroke={accent ? 'var(--color-accent)' : 'currentColor'} strokeWidth="1" />
      <text
        x={x + w / 2}
        y={y + h / 2 + 4}
        textAnchor="middle"
        fontSize="11"
        fontFamily={mono ? 'var(--font-mono)' : 'inherit'}
        fill={accent ? 'var(--color-accent)' : 'currentColor'}
      >
        {label}
      </text>
    </g>
  )
}

function Arrow({ d, flowing }: { d: string; flowing?: boolean }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={flowing ? 'var(--color-accent)' : 'currentColor'}
      strokeWidth="1"
      strokeDasharray="3 3"
      markerEnd="url(#diag-arrow)"
      className={flowing ? 'diag-flow' : undefined}
    />
  )
}

/**
 * How a control becomes glass: two Canvas2D layers and one lens into the shared WebGL
 * shader, back out to the control's canvas. `rendering` animates the arrows while the
 * demo beside it is drawing frames.
 */
export function GlassPipelineDiagram({ className, title = 'Render pipeline of one control', rendering = false }: DiagramProps & { rendering?: boolean }) {
  return (
    <svg viewBox="0 0 640 300" className={cn('h-auto w-full text-foreground', className)} role="img" aria-label={title}>
      <defs>
        <marker id="diag-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0.5 7 4 0 7.5" fill="none" stroke="currentColor" strokeWidth="1" />
        </marker>
        <pattern id="diag-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.08" />
        </pattern>
      </defs>
      <rect width="640" height="300" fill="url(#diag-grid)" />

      {/* Three plates: beneath / lens / above */}
      <g transform="translate(40 40)">
        <g opacity="0.55">
          <path d="M60 150 160 100l120 60-100 50Z" fill="none" stroke="currentColor" strokeWidth="1" />
          <text x="60" y="222" fontSize="10" fontFamily="var(--font-mono)" fill="currentColor" opacity="0.8">
            canvas2d · beneath
          </text>
        </g>
        <g>
          <path d="M60 110 160 60l120 60-100 50Z" fill="none" stroke="currentColor" strokeWidth="1" />
          <ellipse cx="160" cy="120" rx="34" ry="17" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" />
          <ellipse cx="160" cy="120" rx="24" ry="12" fill="none" stroke="var(--color-accent)" strokeWidth="0.75" opacity="0.6" />
          <text x="60" y="52" fontSize="10" fontFamily="var(--font-mono)" fill="var(--color-accent)">
            lens · position, size, bevel, refraction, frost
          </text>
        </g>
        <g opacity="0.55">
          <path d="M60 70 160 20l120 60-100 50Z" fill="none" stroke="currentColor" strokeWidth="1" />
          <text x="60" y="12" fontSize="10" fontFamily="var(--font-mono)" fill="currentColor" opacity="0.8">
            canvas2d · above
          </text>
        </g>
        {/* vertical registration */}
        <path d="M160 20v100" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 3" opacity="0.5" />
      </g>

      {/* Shared renderer */}
      <Node x={410} y={50} w={180} h={44} label="WebGL2 · TSL shader" mono accent />
      <text x="500" y="112" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="currentColor" opacity="0.6">
        one renderer for the whole page
      </text>
      <Arrow d="M325 150 C 360 150, 370 72, 405 72" flowing={rendering} />

      {/* Springs */}
      <Node x={410} y={140} w={180} h={44} label="damped springs · per frame" mono />
      <path d="M418 196h164" stroke="currentColor" strokeWidth="1" opacity="0.35" />
      <path d="M418 196 426 186 434 206 442 186 450 206 458 186 466 196" fill="none" stroke="var(--color-accent)" strokeWidth="1.25" />
      <Arrow d="M500 94v40" flowing={rendering} />

      {/* Output */}
      <Node x={410} y={230} w={180} h={44} label="<canvas> per control" mono />
      <Arrow d="M500 184v40" flowing={rendering} />
      <text x="500" y="292" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill={rendering ? 'var(--color-accent)' : 'currentColor'} opacity={rendering ? 1 : 0.6}>
        {rendering ? 'rendering · shader pass in flight' : 'idle · renders only while something moves'}
      </text>

      <Crosshair x="4" y="4" className="text-foreground/50" />
      <Crosshair x="625" y="4" className="text-foreground/50" />
      <Crosshair x="4" y="285" className="text-foreground/50" />
      <Crosshair x="625" y="285" className="text-foreground/50" />
    </svg>
  )
}
