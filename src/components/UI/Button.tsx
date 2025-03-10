import React from 'react'
import { TRANSITIONS } from '../../constants/theme'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  disabled?: boolean
  className?: string
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  disabled = false,
  className = ''
}) => {
  // Mapeo de variantes a clases
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white dark:bg-primary-700 dark:hover:bg-primary-800',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white dark:bg-gray-600 dark:hover:bg-gray-700',
    success: 'bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white dark:bg-yellow-600 dark:hover:bg-yellow-700',
    info: 'bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
  }

  // Mapeo de tamaños a clases
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        rounded-lg font-medium shadow-sm transition-all duration-${TRANSITIONS.normal}
        flex items-center justify-center
        ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  )
}

export default Button
