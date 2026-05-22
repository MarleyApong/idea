import { ButtonHTMLAttributes, forwardRef } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-medium rounded-xl transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"

    const variants = {
      primary:   "bg-primary text-white hover:bg-primary-dark",
      secondary: "border border-[var(--border)] text-[var(--fg)] bg-[var(--bg-card)] hover:bg-slate-100 dark:hover:bg-slate-700",
      ghost:     "text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-slate-100 dark:hover:bg-slate-800",
      danger:    "bg-red-500 text-white hover:bg-red-600",
    }

    const sizes = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2.5 gap-2",
      lg: "text-base px-5 py-3 gap-2",
    }

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"
