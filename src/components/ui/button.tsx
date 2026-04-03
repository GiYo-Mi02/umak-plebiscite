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
    "inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-interface font-medium uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:pointer-events-none disabled:opacity-50",
    {
      "bg-black text-white hover:bg-zinc-800": variant === "default",
      "border-2 border-zinc-300 text-black hover:bg-zinc-50": variant === "outline",
      "hover:bg-zinc-100 text-black": variant === "ghost",
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
