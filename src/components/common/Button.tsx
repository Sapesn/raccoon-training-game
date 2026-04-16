import React from 'react'
import { LoadingSpinner } from './LoadingSpinner'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  children: React.ReactNode
  className?: string
  fullWidth?: boolean
}

const variantStyles: Record<string, string> = {
  primary: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm hover:from-amber-600 hover:to-orange-600 active:scale-95',
  secondary: 'bg-white border border-amber-300 text-amber-700 hover:bg-amber-50 active:scale-95',
  ghost: 'text-gray-500 hover:text-amber-600 hover:bg-amber-50 active:scale-95',
  danger: 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 active:scale-95',
}

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  children,
  className = '',
  fullWidth = false,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        'rounded-xl font-medium transition-all duration-150 flex items-center justify-center gap-2',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? 'w-full' : '',
        (disabled || loading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className,
      ].join(' ')}
    >
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  )
}

export default Button
