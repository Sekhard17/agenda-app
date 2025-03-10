import React from 'react'
import { FiCalendar } from 'react-icons/fi'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  // Definir tamaños según la prop size
  const sizes = {
    sm: {
      icon: 'h-6 w-6',
      text: 'text-lg'
    },
    md: {
      icon: 'h-8 w-8',
      text: 'text-xl'
    },
    lg: {
      icon: 'h-10 w-10',
      text: 'text-2xl'
    }
  }

  return (
    <div className="flex items-center">
      <div className={`bg-primary dark:bg-accent text-white p-2 rounded-lg ${sizes[size].icon}`}>
        <FiCalendar className="h-full w-full" />
      </div>
      {showText && (
        <span className={`ml-2 font-bold text-primary dark:text-accent ${sizes[size].text}`}>
          Agenda App
        </span>
      )}
    </div>
  )
}

export default Logo
