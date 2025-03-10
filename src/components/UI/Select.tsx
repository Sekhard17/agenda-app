import React, { forwardRef } from 'react'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string
  options: SelectOption[]
  error?: string
  helperText?: string
  fullWidth?: boolean
  onChange?: (value: string) => void
  wrapperClassName?: string
  labelClassName?: string
  selectClassName?: string
  errorClassName?: string
  helperClassName?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      error,
      helperText,
      fullWidth = false,
      onChange,
      wrapperClassName = '',
      labelClassName = '',
      selectClassName = '',
      errorClassName = '',
      helperClassName = '',
      ...props
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e.target.value)
      }
    }

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
        <select
          ref={ref}
          className={`
            block w-full rounded-lg border 
            ${error 
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-600 dark:focus:ring-red-500 dark:focus:border-red-500' 
              : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:focus:ring-primary-500 dark:focus:border-primary-500'}
            bg-white dark:bg-gray-700 text-gray-900 dark:text-white
            px-4 py-2.5 text-sm
            disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
            dark:disabled:bg-gray-800 dark:disabled:text-gray-400
            ${selectClassName}
          `}
          onChange={handleChange}
          {...props}
        >
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
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

export default Select
