import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info'
  size?: 'sm' | 'md' | 'lg'
  rounded?: 'full' | 'md'
  icon?: React.ReactNode
  className?: string
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  rounded = 'md',
  icon,
  className = ''
}) => {
  // Mapeo de variantes a clases
  const variantClasses = {
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300',
    secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
  }

  // Mapeo de tamaños a clases
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base'
  }

  // Mapeo de bordes redondeados
  const roundedClasses = {
    full: 'rounded-full',
    md: 'rounded-md'
  }

  return (
    <span
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${roundedClasses[rounded]}
        inline-flex items-center font-medium
        ${className}
      `}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  )
}

export default Badge
