import { motion, type Transition } from 'motion/react'
import { useState, type ReactNode } from 'react'

import { Icon, type IconName } from './Icon'
import { LiquidGlass } from './LiquidGlass'
import { focusRing, useElementSize, type Theme } from './shared'

export type ButtonVariant = 'glass' | 'frosted' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export type ButtonProps = {
  children?: ReactNode
  theme?: Theme
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: IconName | 'none'
  trailingIcon?: IconName | 'none'
  iconOnly?: boolean
  disabled?: boolean
  /** Lens swell while pressed. */
  swell?: number
  /** Label scale while hovered; the glass swells around it. */
  hoverScale?: number
  labelTransition?: Transition
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
}

const defaultLabelTransition: Transition = { type: 'spring', stiffness: 256, damping: 19.2, mass: 1 }
// Soft, bouncy spring so the ghost button swells like the glass ones.
const ghostTransition: Transition = { type: 'spring', stiffness: 260, damping: 11, mass: 0.9 }

const sizeClasses: Record<ButtonSize, { base: string; label: string; square: string; icon: number }> = {
  sm: { base: 'h-8 gap-1.5 text-[12px]', label: 'px-4', square: 'w-8', icon: 13 },
  md: { base: 'h-10 gap-2 text-[13px]', label: 'px-5', square: 'w-10', icon: 15 },
  lg: { base: 'h-12 gap-2 text-[15px]', label: 'px-6', square: 'w-12', icon: 18 },
}

const textClasses: Record<ButtonVariant, string> = {
  glass: 'text-neutral-900 dark:text-white',
  frosted: 'text-neutral-900 dark:text-white',
  ghost:
    'rounded-full text-neutral-600 hover:bg-black/[0.04] hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/[0.06] dark:hover:text-white',
}

export function Button({
  children = 'Continue',
  theme,
  variant = 'glass',
  size = 'md',
  icon = 'none',
  trailingIcon = 'none',
  iconOnly = false,
  disabled = false,
  swell = 1.08,
  hoverScale = 1.04,
  labelTransition = defaultLabelTransition,
  type = 'button',
  onClick,
}: ButtonProps) {
  const [ref, { width, height }] = useElementSize<HTMLButtonElement>()
  const [pressed, setPressed] = useState(false)
  const [hoveredState, setHovered] = useState(false)
  const hovered = hoveredState && !disabled
  const s = sizeClasses[size]
  const leading = iconOnly && icon === 'none' ? 'sparkle' : icon
  const release = () => setPressed(false)
  const labelScale = pressed ? swell : hovered && variant !== 'ghost' ? hoverScale : 1

  return (
    <motion.button
      ref={ref}
      type={type}
      data-theme={theme}
      disabled={disabled}
      onClick={onClick}
      onPointerDown={() => !disabled && setPressed(true)}
      onPointerUp={release}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={() => {
        release()
        setHovered(false)
      }}
      onPointerCancel={release}
      animate={variant === 'ghost' ? { scale: pressed ? 0.97 : hovered ? 1.06 : 1 } : undefined}
      transition={ghostTransition}
      aria-label={iconOnly && typeof children === 'string' ? children : undefined}
      className={`relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full font-semibold whitespace-nowrap select-none disabled:cursor-not-allowed disabled:opacity-40 ${focusRing} ${s.base} ${iconOnly ? s.square : s.label} ${textClasses[variant]}`}
    >
      {variant !== 'ghost' && width > 0 && (
        <LiquidGlass
          width={width}
          height={height}
          pressed={pressed}
          hovered={hovered}
          swell={swell}
          frost={variant === 'frosted' ? 1 : 0}
          cursorLight
        />
      )}
      <motion.span
        className="relative flex items-center gap-[inherit]"
        animate={{ scale: labelScale }}
        transition={labelTransition}
      >
        {leading !== 'none' && <Icon name={leading} size={s.icon} />}
        {!iconOnly && children}
        {!iconOnly && trailingIcon !== 'none' && <Icon name={trailingIcon} size={s.icon} />}
      </motion.span>
    </motion.button>
  )
}

export default Button
