import { motion, type Transition } from 'motion/react'
import { useId, type KeyboardEvent } from 'react'

export type Theme = 'light' | 'dark'

export type ThemeSwitcherProps = {
  theme?: Theme
  onThemeChange?: (theme: Theme) => void
  showLabels?: boolean
  indicatorTransition?: Transition
}

const defaultIndicatorTransition: Transition = { type: 'spring', duration: 0.4, bounce: 0.2 }

const options: { value: Theme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z" />
    </svg>
  )
}

export function ThemeSwitcher({
  theme = 'light',
  onThemeChange,
  showLabels = true,
  indicatorTransition = defaultIndicatorTransition,
}: ThemeSwitcherProps) {
  const indicatorId = useId()
  const isDark = theme === 'dark'

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') onThemeChange?.('light')
    else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') onThemeChange?.('dark')
    else return
    e.preventDefault()
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      onKeyDown={onKeyDown}
      className={
        isDark
          ? 'relative inline-flex items-center gap-0.5 rounded-full bg-white/[0.05] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_0_0.5px_rgba(255,255,255,0.1)] backdrop-blur-md transition-colors duration-500'
          : 'relative inline-flex items-center gap-0.5 rounded-full bg-black/[0.04] p-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04),0_0_0_0.5px_rgba(0,0,0,0.06)] backdrop-blur-md transition-colors duration-500'
      }
    >
      {options.map((option) => {
        const selected = option.value === theme
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={showLabels ? undefined : option.label}
            tabIndex={selected ? 0 : -1}
            onClick={() => onThemeChange?.(option.value)}
            className={`relative flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-full text-[13px] font-medium transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3291FF] ${showLabels ? 'px-3.5' : 'w-9'} ${
              selected
                ? isDark
                  ? 'text-white'
                  : 'text-neutral-900'
                : isDark
                  ? 'text-neutral-500 hover:text-neutral-300'
                  : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {selected && (
              <motion.span
                layoutId={indicatorId}
                transition={indicatorTransition}
                className={
                  isDark
                    ? 'absolute inset-0 rounded-full bg-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_1px_3px_rgba(0,0,0,0.3)]'
                    : 'absolute inset-0 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(0,0,0,0.05)]'
                }
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {option.value === 'light' ? <SunIcon /> : <MoonIcon />}
              {showLabels && option.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default ThemeSwitcher
