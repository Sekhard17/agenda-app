import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { TRANSITIONS } from '../../constants/theme'
import { IoClose } from 'react-icons/io5'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnClickOutside?: boolean
  showCloseButton?: boolean
  className?: string
  headerClassName?: string
  bodyClassName?: string
  footerClassName?: string
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnClickOutside = true,
  showCloseButton = true,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = ''
}) => {
  const modalRef = useRef<HTMLDivElement>(null)

  // Manejar el cierre con la tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // Prevenir el scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  // Manejar el clic fuera del modal
  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnClickOutside && modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose()
    }
  }

  // Mapeo de tamaños a clases
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  }

  if (!isOpen) return null

  return createPortal(
    <div 
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        bg-black bg-opacity-50 backdrop-blur-sm
        transition-opacity duration-${TRANSITIONS.normal}
      `}
      onClick={handleOutsideClick}
    >
      <div 
        ref={modalRef}
        className={`
          w-full ${sizeClasses[size]} 
          bg-white dark:bg-gray-800 
          rounded-lg shadow-xl 
          transform transition-all duration-${TRANSITIONS.normal}
          ${className}
        `}
      >
        {(title || showCloseButton) && (
          <div className={`
            flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700
            ${headerClassName}
          `}>
            {title && <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>}
            {showCloseButton && (
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                onClick={onClose}
              >
                <IoClose className="w-6 h-6" />
              </button>
            )}
          </div>
        )}
        
        <div className={`p-4 ${bodyClassName}`}>
          {children}
        </div>
        
        {footer && (
          <div className={`
            p-4 border-t border-gray-200 dark:border-gray-700
            ${footerClassName}
          `}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

export default Modal
