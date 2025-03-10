import React, { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  wrapperClassName?: string
  labelClassName?: string
  inputClassName?: string
  errorClassName?: string
  helperClassName?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      wrapperClassName = '',
      labelClassName = '',
      inputClassName = '',
      errorClassName = '',
      helperClassName = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${wrapperClassName}`}>
        {label && (
          <label
            htmlFor={props.id}
            className={`block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300 ${labelClassName}`}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500 dark:text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              block w-full rounded-lg border 
              ${error 
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-600 dark:focus:ring-red-500 dark:focus:border-red-500' 
                : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:focus:ring-primary-500 dark:focus:border-primary-500'}
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              ${leftIcon ? 'pl-10' : 'pl-4'} 
              ${rightIcon ? 'pr-10' : 'pr-4'} 
              py-2.5 text-sm
              disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
              dark:disabled:bg-gray-800 dark:disabled:text-gray-400
              ${inputClassName}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 dark:text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className={`mt-1 text-sm text-red-600 dark:text-red-400 ${errorClassName}`}>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className={`mt-1 text-sm text-gray-500 dark:text-gray-400 ${helperClassName}`}>
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

export default Input
