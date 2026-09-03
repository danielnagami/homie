import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand-500 text-white shadow-card hover:bg-brand-600 active:bg-brand-700',
  secondary:
    'border border-brand-200 bg-white text-brand-700 hover:bg-brand-50 active:bg-brand-100',
  ghost: 'text-slate-500 hover:bg-brand-50 hover:text-brand-700',
}

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const classes = [
    'inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold transition-colors',
    'disabled:cursor-not-allowed disabled:opacity-50',
    variantClasses[variant],
    className,
  ].join(' ')

  return <button type={type} className={classes} {...props} />
}
