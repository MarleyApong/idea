interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "primary" | "success" | "warning" | "muted"
  className?: string
}

const variants = {
  default: "bg-slate-100 text-slate-600",
  primary: "bg-primary/10 text-primary",
  success: "bg-green-50 text-green-700",
  warning: "bg-amber-50 text-amber-700",
  muted: "bg-(--bg) text-(--fg-muted)",
}

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
