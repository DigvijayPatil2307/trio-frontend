import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 disabled:pointer-events-none disabled:opacity-50 active:scale-98 cursor-pointer select-none",
          {
            // Variants
            "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md shadow-indigo-200":
              variant === "default",
            "bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-100":
              variant === "destructive",
            "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300":
              variant === "outline",
            "bg-slate-100 text-slate-900 hover:bg-slate-200":
              variant === "secondary",
            "hover:bg-slate-100 text-slate-700 hover:text-slate-900":
              variant === "ghost",
            "text-indigo-600 underline-offset-4 hover:underline":
              variant === "link",

            // Sizes
            "h-10 px-4 py-2": size === "default",
            "h-8 rounded-lg px-3 text-xs": size === "sm",
            "h-12 px-8 text-base": size === "lg",
            "h-9 w-9 p-0": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
