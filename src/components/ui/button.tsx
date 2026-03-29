import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

function getButtonClasses(variant: string, size: string, className?: string) {
  return cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-mono uppercase tracking-[0.1em] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold disabled:pointer-events-none disabled:opacity-50",
    {
      "bg-gold text-navy-900 hover:bg-gold-light": variant === "default",
      "border border-gold text-gold hover:bg-gold/10": variant === "outline",
      "hover:bg-navy-800 text-parchment": variant === "ghost",
      "h-9 px-4 py-2": size === "default",
      "h-8 px-3 text-xs": size === "sm",
      "h-10 px-8": size === "lg",
      "h-9 w-9": size === "icon",
    },
    className
  )
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
    const classes = getButtonClasses(variant, size, className)

    if (asChild && React.isValidElement(children)) {
      // Clone the child element and merge button classes onto it
      return React.cloneElement(children as React.ReactElement<any>, {
        className: cn(classes, (children as React.ReactElement<any>).props.className),
        ref,
      })
    }

    return (
      <button
        ref={ref}
        className={classes}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
