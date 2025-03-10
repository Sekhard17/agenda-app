import React from 'react'

interface NavCategoryProps {
  title: string
  children: React.ReactNode
  isCollapsed?: boolean
}

const NavCategory: React.FC<NavCategoryProps> = ({ 
  title, 
  children, 
  isCollapsed = false 
}) => {
  return (
    <div className="mb-4">
      {!isCollapsed && (
        <h3 className="px-5 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {title}
        </h3>
      )}
      <div className={`${isCollapsed ? 'px-2' : 'px-3'}`}>
        {children}
      </div>
    </div>
  )
}

export default NavCategory
