'use client'

import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import type { ButtonVariant, ButtonSize } from '@/types'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 sm:px-8 py-3 sm:py-4 text-base',
  lg: 'px-8 sm:px-10 md:px-12 py-4 sm:py-5 text-lg',
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base = `inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-deep-space ${sizeClasses[size]}`

  const disabledStyles = disabled
    ? 'opacity-40 cursor-not-allowed pointer-events-none'
    : ''

  if (variant === 'primary') {
    return (
      <button
        className={`group relative ${base} bg-linear-to-r from-treez-purple to-treez-pink text-white shadow-lg hover:shadow-treez-purple/50 hover:scale-105 active:scale-95 overflow-hidden focus-visible:ring-treez-purple ${disabledStyles} ${className}`}
        disabled={disabled}
        {...props}
      >
        <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
        <div className="absolute inset-0 bg-linear-to-r from-treez-pink to-treez-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </button>
    )
  }

  if (variant === 'secondary') {
    return (
      <button
        className={`${base} border-2 border-treez-cyan text-treez-cyan hover:bg-treez-cyan/10 hover:shadow-lg hover:shadow-treez-cyan/30 hover:scale-105 active:scale-95 focus-visible:ring-treez-cyan ${disabledStyles} ${className}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  }

  if (variant === 'danger') {
    return (
      <button
        className={`group relative ${base} bg-linear-to-r from-red-600 to-red-500 text-white shadow-lg hover:shadow-red-500/50 hover:scale-105 active:scale-95 overflow-hidden focus-visible:ring-red-500 ${disabledStyles} ${className}`}
        disabled={disabled}
        {...props}
      >
        <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
        <div className="absolute inset-0 bg-linear-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </button>
    )
  }

  return (
    <button
      className={`${base} border border-white/10 hover:border-treez-purple bg-white/5 hover:bg-treez-purple/10 hover:shadow-lg hover:shadow-treez-purple/30 hover:scale-110 active:scale-95 focus-visible:ring-treez-purple ${disabledStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
