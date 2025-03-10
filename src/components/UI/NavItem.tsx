import React from 'react'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

export interface NavItemProps {
  to: string
  icon: React.ReactNode
  label: string
  badge?: number
  isCollapsed?: boolean
  onClick?: () => void
  isActive?: boolean
  className?: string
}

const NavItem: React.FC<NavItemProps> = ({
  to,
  icon,
  label,
  badge,
  isCollapsed = false,
  onClick,
  isActive: isActiveProp,
  className = ''
}) => {
  const location = useLocation()
  // Determinar si el ítem está activo basado en la ruta actual o en la prop isActive
  const isActive = isActiveProp !== undefined ? isActiveProp : location.pathname === to

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        flex items-center px-3 py-3 my-1 mx-2 rounded-lg text-sm font-medium
        transition-all duration-200 ease-in-out
        ${
          isActive
            ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-primary-600 dark:hover:text-primary-400'
        }
        ${isCollapsed ? 'justify-center' : ''}
        ${className}
      `}
    >
      <div className={`
        flex items-center justify-center 
        ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400'}
        ${isCollapsed ? 'h-6 w-6' : 'h-6 w-6'}
      `}>
        {icon}
      </div>
      
      {!isCollapsed && (
        <>
          <span className="ml-3 truncate">{label}</span>
          {badge !== undefined && (
            <span className={`
              ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full
              ${isActive 
                ? 'bg-primary-200 text-primary-800 dark:bg-primary-800 dark:text-primary-200' 
                : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}
            `}>
              {badge}
            </span>
          )}
        </>
      )}
      
      {isCollapsed && badge !== undefined && (
        <span className={`
          absolute top-0 right-0 -mt-1 -mr-1 flex items-center justify-center h-4 w-4 rounded-full text-xs font-medium
          ${isActive 
            ? 'bg-primary-500 text-white' 
            : 'bg-gray-400 text-white dark:bg-gray-600'}
        `}>
          {badge}
        </span>
      )}
    </Link>
  )
}

export default NavItem