import React from 'react'
import { SHADOWS } from '../../constants/theme'

interface CardProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  icon?: React.ReactNode
  footer?: React.ReactNode
  className?: string
  headerClassName?: string
  bodyClassName?: string
  footerClassName?: string
  shadow?: 'sm' | 'md' | 'lg' | 'xl' | 'none'
  border?: boolean
  padding?: 'sm' | 'md' | 'lg' | 'none'
  onClick?: () => void
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  icon,
  footer,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  shadow = 'md',
  border = true,
  padding = 'md',
  onClick
}) => {
  // Mapeo de sombras
  const shadowClasses = {
    none: '',
    sm: SHADOWS.sm,
    md: SHADOWS.md,
    lg: SHADOWS.lg,
    xl: SHADOWS.xl
  }

  // Mapeo de padding
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  }

  return (
    <div 
      className={`
        bg-white dark:bg-gray-800 
        rounded-lg 
        ${border ? 'border border-gray-200 dark:border-gray-700' : ''}
        ${shadowClasses[shadow]}
        ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow duration-300' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {(title || subtitle || icon) && (
        <div className={`
          border-b border-gray-200 dark:border-gray-700
          ${paddingClasses[padding]}
          ${headerClassName}
        `}>
          <div className="flex items-center">
            {icon && <div className="mr-3 text-gray-500 dark:text-gray-400">{icon}</div>}
            <div>
              {title && <h3 className="text-lg font-medium text-gray-800 dark:text-white">{title}</h3>}
              {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
            </div>
          </div>
        </div>
      )}
      
      <div className={`${paddingClasses[padding]} ${bodyClassName}`}>
        {children}
      </div>
      
      {footer && (
        <div className={`
          border-t border-gray-200 dark:border-gray-700
          ${paddingClasses[padding]}
          ${footerClassName}
        `}>
          {footer}
        </div>
      )}
    </div>
  )
}

export default Card
