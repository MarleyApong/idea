import { InputHTMLAttributes, forwardRef } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className = "", id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-(--fg)">
            {label}
            {hint && <span className="text-(--fg-muted) font-normal ml-1">({hint})</span>}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`w-full px-3 py-2.5 rounded-xl border text-sm text-(--fg) placeholder:text-(--fg-muted) bg-(--input-bg) focus:outline-none focus:ring-2 transition-colors ${
            error
              ? "border-red-300 focus:ring-red-200 focus:border-red-400"
              : "border-(--border) focus:ring-primary/30 focus:border-primary"
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)

Input.displayName = "Input"
