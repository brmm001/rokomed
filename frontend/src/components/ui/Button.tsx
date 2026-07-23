import React from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<HTMLMotionProps<"button">, 'ref'> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    
    // Classes bases que antes ficavam espalhadas ou no index.css
    const baseClass = "inline-flex items-center justify-center gap-2 font-inter font-semibold transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap border-none"
    
    const sizeClasses = {
      sm: "px-3 py-1.5 text-xs rounded-lg",
      md: "px-5 py-2.5 text-sm rounded-[10px]",
      lg: "px-8 py-3.5 text-base rounded-xl"
    }
    
    const variantClasses = {
      primary: "bg-[var(--gradient-accent)] text-white shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.5)]",
      secondary: "bg-[rgba(59,130,246,0.1)] text-[var(--accent-blue)] border border-solid border-[rgba(59,130,246,0.3)] hover:bg-[rgba(59,130,246,0.2)] hover:border-[var(--accent-blue)]",
      ghost: "bg-transparent text-[var(--text-secondary)] border border-solid border-[var(--border)] hover:bg-[rgba(255,255,255,0.05)] hover:text-white hover:border-[var(--border-accent)]",
      danger: "bg-[rgba(239,68,68,0.15)] text-[#F87171] border border-solid border-[rgba(239,68,68,0.3)] hover:bg-[rgba(239,68,68,0.25)]"
    }

    const classes = `${baseClass} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: props.disabled ? 1 : 0.96 }}
        className={classes}
        {...props}
      >
        {children}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
