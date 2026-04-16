import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: string
  onClick?: () => void
}

export function Card({ children, className = '', padding = 'p-4', onClick }: CardProps) {
  const base = `bg-white rounded-2xl shadow-sm border border-gray-100 ${padding}`
  return onClick ? (
    <div
      onClick={onClick}
      className={`${base} cursor-pointer active:scale-[0.98] transition-transform ${className}`}
    >
      {children}
    </div>
  ) : (
    <div className={`${base} ${className}`}>{children}</div>
  )
}

export default Card
