import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
  children?: React.ReactNode
  className?: string
}

const Badge: React.FC<BadgeProps> = ({ className, variant = "default", ...props }) => {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 select-none",
        {
          "border-transparent bg-indigo-600 text-white hover:bg-indigo-700": variant === "default",
          "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200": variant === "secondary",
          "border-transparent bg-red-100 text-red-700 hover:bg-red-200": variant === "destructive",
          "border-slate-200 bg-white text-slate-700 hover:bg-slate-50": variant === "outline"
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
