import { cn } from "@/lib/utils"
import React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  children: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
          {
            "bg-blue-700 text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700": variant === "default",
            "border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100": variant === "outline",
            "hover:bg-gray-100 text-gray-800 dark:hover:bg-gray-800 dark:text-gray-100": variant === "ghost",
            "underline-offset-4 hover:underline text-blue-700 dark:text-blue-400": variant === "link",
            "bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800": variant === "destructive",
            "h-10 px-4 py-2 text-sm sm:text-base": size === "default",
            "h-8 px-3 text-xs sm:text-sm": size === "sm",
            "h-12 px-6 text-base sm:text-lg": size === "lg",
            "h-9 w-9 p-0 sm:h-10 sm:w-10": size === "icon",
          },
          className,
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"

// Export as both named and default
export default Button