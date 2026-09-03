import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'mint' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  icon?: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-coral-400 text-white shadow-[0_4px_0_#e2634d,0_8px_20px_rgba(255,126,103,0.28)] hover:bg-coral-500 active:translate-y-[3px] active:shadow-[0_1px_0_#e2634d,0_2px_8px_rgba(255,126,103,0.18)]',
  secondary:
    'border-2 border-coral-300 bg-white text-coral-400 shadow-[0_3px_0_#ffdad4] hover:bg-coral-50 active:translate-y-[2px] active:shadow-[0_1px_0_#ffdad4]',
  ghost: 'bg-transparent text-pebble hover:bg-lavender-100 active:scale-95',
  mint: 'bg-mint-600 text-white shadow-[0_4px_0_#005230,0_8px_18px_rgba(0,109,65,0.22)] hover:bg-mint-700 active:translate-y-[3px] active:shadow-[0_1px_0_#005230]',
  danger: 'bg-red-100 text-red-700 shadow-[0_3px_0_#fecaca] hover:bg-red-200 active:translate-y-[2px]',
}

export function Button({
  variant = 'primary',
  icon,
  className = '',
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 font-display text-sm font-extrabold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
