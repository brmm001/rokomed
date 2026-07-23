import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', icon, ...props }, ref) => {
    
    const baseClass = "w-full bg-[rgba(10,22,40,0.8)] border border-solid border-[var(--border)] rounded-[0.625rem] text-[var(--text-primary)] text-[0.9375rem] font-inter outline-none transition-all duration-200 placeholder:text-[var(--text-muted)] focus:border-[var(--accent-blue)] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
    
    const paddingClass = icon ? "py-3 pr-4 pl-10" : "px-4 py-3"

    const classes = `${baseClass} ${paddingClass} ${className}`

    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input ref={ref} className={classes} {...props} />
      </div>
    )
  }
)

Input.displayName = 'Input'
