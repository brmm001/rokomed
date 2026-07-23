import React from 'react'

export type CardVariant = 'glass' | 'apple' | 'solid'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  children: React.ReactNode
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'apple', padding = 'md', className = '', children, ...props }, ref) => {
    
    const baseClass = "rounded-[1rem]"
    
    const variantClasses = {
      glass: "bg-[var(--gradient-card)] border border-solid border-[var(--border)] shadow-[var(--shadow-card)] backdrop-blur-md",
      apple: "bg-[rgba(255,255,255,0.02)] border border-solid border-[rgba(255,255,255,0.05)] shadow-[0_4px_24px_rgba(0,0,0,0.2)]",
      solid: "bg-[var(--bg-elevated)] border border-solid border-[var(--border)]"
    }

    const paddingClasses = {
      none: "p-0",
      sm: "p-3",
      md: "p-5",
      lg: "p-8",
      xl: "p-10"
    }

    const classes = `${baseClass} ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'
