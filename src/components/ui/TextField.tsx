import { useId, useState } from 'react'

import { Icon, type IconName } from './Icon'
import { LiquidGlass } from './LiquidGlass'
import { useElementSize, useSyncedState, type Theme } from './shared'

export type TextFieldProps = {
  value?: string
  onChange?: (value: string) => void
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  type?: 'text' | 'email' | 'password' | 'search'
  theme?: Theme
  size?: 'md' | 'lg'
  shape?: 'pill' | 'rounded'
  icon?: IconName | 'none'
  clearable?: boolean
  disabled?: boolean
  /** Resting frost of the glass capsule; focusing clears and swells it slightly. */
  frost?: number
}

export function TextField({
  value = '',
  onChange,
  label = 'Email',
  placeholder = 'you@example.com',
  hint,
  error,
  type = 'text',
  theme,
  size = 'md',
  shape = 'pill',
  icon = 'none',
  clearable = false,
  disabled = false,
  frost = 0.6,
}: TextFieldProps) {
  const id = useId()
  const [text, setText] = useSyncedState(value, onChange)
  const [focused, setFocused] = useState(false)
  const [ref, { width, height }] = useElementSize<HTMLDivElement>()
  const radius = shape === 'pill' ? undefined : 14
  const message = error || hint

  return (
    <div data-theme={theme} className="flex w-full max-w-xs flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="px-1 text-[12px] font-medium text-neutral-600 dark:text-neutral-400">
          {label}
        </label>
      )}
      <div
        ref={ref}
        className={`relative flex items-center gap-2 text-neutral-500 ${size === 'lg' ? 'h-12 px-5 text-[15px]' : 'h-10 px-4 text-[13px]'} ${shape === 'pill' ? 'rounded-full' : 'rounded-[14px]'} ${error ? 'outline-[1.5px] outline-[#e5484d] outline-solid' : 'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent'} ${disabled ? 'opacity-40' : ''}`}
      >
        {width > 0 && (
          <LiquidGlass width={width} height={height} radius={radius} frost={frost} pressed={focused} swell={1.03} />
        )}
        {icon !== 'none' && <Icon name={icon} size={size === 'lg' ? 17 : 15} className="relative" />}
        <input
          id={id}
          type={type}
          value={text}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => setText(e.currentTarget.value)}
          className="relative min-w-0 flex-1 bg-transparent text-neutral-900 outline-none placeholder:text-neutral-400 disabled:cursor-not-allowed dark:text-white dark:placeholder:text-neutral-500"
        />
        {clearable && text && (
          <button
            type="button"
            aria-label="Clear"
            onClick={() => setText('')}
            className="relative flex size-5 cursor-pointer items-center justify-center rounded-full bg-black/[0.08] text-neutral-500 hover:text-neutral-800 dark:bg-white/10 dark:hover:text-white"
          >
            <Icon name="close" size={10} strokeWidth={2.6} />
          </button>
        )}
      </div>
      {message && <p className={`px-1 text-[12px] ${error ? 'text-[#e5484d]' : 'text-neutral-500'}`}>{message}</p>}
    </div>
  )
}

export default TextField
