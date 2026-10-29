import { useEffect, useRef } from 'react'

import type { LiquidGlassInstance } from './engine'
import { defaultLiquidGlassParams, themePalettes, type LiquidGlassParams } from './params'

export type LiquidGlassSliderProps = Partial<LiquidGlassParams> & {
  className?: string
}

export function LiquidGlassSlider({
  className = 'relative h-dvh min-h-[420px] w-full overflow-hidden',
  ...props
}: LiquidGlassSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const engineRef = useRef<LiquidGlassInstance | null>(null)

  const theme = props.theme ?? defaultLiquidGlassParams.theme
  const params: LiquidGlassParams = { ...defaultLiquidGlassParams, ...themePalettes[theme], theme }
  for (const key of Object.keys(props) as (keyof LiquidGlassParams)[]) {
    if (props[key] !== undefined) (params as Record<string, unknown>)[key] = props[key]
  }
  const paramsRef = useRef(params)
  paramsRef.current = params

  // The engine is client-only (WebGPU/WebGL), so it loads lazily after mount.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let cancelled = false
    let engine: LiquidGlassInstance | null = null
    // Focus the hidden range input so arrow keys keep working after a drag.
    const focusInput = () => inputRef.current?.focus({ preventScroll: true })

    ;(async () => {
      const { createLiquidGlass } = await import('./engine')
      const instance = await createLiquidGlass(container, paramsRef.current, (value) => {
        const input = inputRef.current
        if (!input) return
        input.value = String(value)
        input.setAttribute('aria-valuenow', String(value))
      })
      if (cancelled) {
        instance.dispose()
        return
      }
      engine = instance
      engineRef.current = instance
      container.addEventListener('pointerdown', focusInput)
    })()

    return () => {
      cancelled = true
      container.removeEventListener('pointerdown', focusInput)
      engine?.dispose()
      engineRef.current = null
    }
  }, [params.sliderCount])

  useEffect(() => {
    engineRef.current?.setParams(paramsRef.current)
  })

  const lastValue = useRef(params.value)
  useEffect(() => {
    if (params.value === lastValue.current) return
    lastValue.current = params.value
    engineRef.current?.setValue(params.value)
  }, [params.value])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ background: `linear-gradient(90deg, ${params.bgLeft} 0%, ${params.bgRight} 100%)` }}
    >
      <input
        ref={inputRef}
        type="range"
        min={0}
        max={100}
        step={1}
        defaultValue={Math.round(params.value)}
        aria-label="Slider value"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(params.value)}
        onChange={(e) => engineRef.current?.setValue(Number(e.currentTarget.value))}
        className="pointer-events-none absolute h-px w-px opacity-0"
      />
    </div>
  )
}

export default LiquidGlassSlider
