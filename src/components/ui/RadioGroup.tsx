import { useRef, type KeyboardEvent } from 'react'

import { useGlassCap } from './Checkbox'
import { useElementSize, useSyncedState, focusRing, type Theme } from './shared'
import { LiquidGlass } from './LiquidGlass'

export type RadioOption = { value: string; label: string; description?: string }

export type RadioGroupProps = {
  options?: RadioOption[]
  value?: string
  onChange?: (value: string) => void
  theme?: Theme
  layout?: 'list' | 'cards'
  direction?: 'vertical' | 'horizontal'
  ariaLabel?: string
  /** Lens swell of the dot while pressed. */
  swell?: number
}

const defaultOptions: RadioOption[] = [
  { value: 'auto', label: 'Automatic', description: 'Match the system setting' },
  { value: 'light', label: 'Light', description: 'Bright frosted surfaces' },
  { value: 'dark', label: 'Dark', description: 'Low-light glass' },
]

const DOT = 22

function RadioDot({ selected, pressed, swell }: { selected: boolean; pressed: () => boolean; swell: number }) {
  const canvas = useGlassCap({
    box: DOT,
    radius: 50,
    on: selected,
    pressed,
    swell,
    drawMark(ctx, progress, cx, cy, b) {
      ctx.beginPath()
      ctx.arc(cx, cy, b * 0.19 * progress, 0, Math.PI * 2)
      ctx.fillStyle = '#ffffff'
      ctx.fill()
    },
  })
  return (
    <span className="relative mt-px shrink-0" style={{ width: DOT, height: DOT }}>
      {canvas}
    </span>
  )
}

function RadioCardGlass({ selected }: { selected: boolean }) {
  const [ref, { width, height }] = useElementSize<HTMLSpanElement>()
  return (
    <span ref={ref} className="absolute inset-0">
      {width > 0 && (
        <LiquidGlass
          width={width}
          height={height}
          radius={16}
          unit={1}
          frost={selected ? 1 : 0.25}
          margin={{ x: 24, top: 20, bottom: 60 }}
          optics={{ bevelWidth: 22, refraction: 10, restRefraction: 10, shadowSoftness: 22, shadowOffset: 8, shadowOpacity: selected ? 0.12 : 0.05 }}
        />
      )}
    </span>
  )
}

export function RadioGroup({
  options = defaultOptions,
  value,
  onChange,
  theme,
  layout = 'list',
  direction = 'vertical',
  ariaLabel = 'Appearance',
  swell = 1.18,
}: RadioGroupProps) {
  const [selected, setSelected] = useSyncedState(value ?? options[0]?.value, onChange)
  const index = options.findIndex((o) => o.value === selected)
  const pressedValue = useRef<string | null>(null)
  const cards = layout === 'cards'

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : 0
    if (!step) return
    e.preventDefault()
    const nextIndex = (index + step + options.length) % options.length
    setSelected(options[nextIndex].value)
    e.currentTarget.querySelectorAll<HTMLButtonElement>('[role=radio]')[nextIndex]?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      data-theme={theme}
      onKeyDown={onKeyDown}
      className={`flex ${direction === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col'} ${cards ? 'gap-2.5' : 'gap-3.5'}`}
    >
      {options.map((option) => {
        const isSelected = option.value === selected
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => setSelected(option.value)}
            onPointerDown={() => (pressedValue.current = option.value)}
            onPointerUp={() => (pressedValue.current = null)}
            onPointerLeave={() => (pressedValue.current = null)}
            className={`relative flex cursor-pointer items-start gap-3 text-left ${cards ? 'rounded-2xl px-4 py-3' : 'rounded-lg'} ${focusRing}`}
          >
            {cards && <RadioCardGlass selected={isSelected} />}
            <RadioDot selected={isSelected} pressed={() => pressedValue.current === option.value} swell={swell} />
            <span className="relative flex flex-col">
              <span className="text-[13px] leading-6 font-medium text-neutral-900 dark:text-white">{option.label}</span>
              {option.description && <span className="text-[12px] text-neutral-500">{option.description}</span>}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default RadioGroup
