import React from 'react'

export type BadgeVariant = 'blue' | 'teal' | 'gold' | 'green' | 'red' | 'gray'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  icon?: React.ReactNode
  children: React.ReactNode
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'blue', icon, className = '', children, ...props }, ref) => {
    
    const baseClass = "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border border-solid"
    
    const variantClasses = {
      blue: "bg-[rgba(59,130,246,0.15)] text-[#93C5FD] border-[rgba(59,130,246,0.25)]",
      teal: "bg-[rgba(20,184,166,0.15)] text-[#5EEAD4] border-[rgba(20,184,166,0.25)]",
      gold: "bg-[rgba(245,158,11,0.15)] text-[#FCD34D] border-[rgba(245,158,11,0.25)]",
      green: "bg-[rgba(16,185,129,0.15)] text-[#6EE7B7] border-[rgba(16,185,129,0.25)]",
      red: "bg-[rgba(239,68,68,0.15)] text-[#FCA5A5] border-[rgba(239,68,68,0.25)]",
      gray: "bg-[rgba(100,116,139,0.15)] text-[#94A3B8] border-[rgba(100,116,139,0.25)]"
    }

    const classes = `${baseClass} ${variantClasses[variant]} ${className}`

    return (
      <span ref={ref} className={classes} {...props}>
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'
