"use client"

import { useNotifications, type NotificationType } from "@/shared/store/notifications"
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react"

const config: Record<NotificationType, { icon: typeof CheckCircle2; bg: string; border: string; text: string; icon_color: string }> = {
  success: { icon: CheckCircle2,    bg: "bg-green-50",  border: "border-green-200",  text: "text-green-800",  icon_color: "text-green-500"  },
  error:   { icon: AlertCircle,     bg: "bg-red-50",    border: "border-red-200",    text: "text-red-800",    icon_color: "text-red-500"    },
  warning: { icon: AlertTriangle,   bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-800",  icon_color: "text-amber-500"  },
  info:    { icon: Info,            bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-800",   icon_color: "text-blue-500"   },
}

export function Toaster() {
  const { notifications, remove } = useNotifications()

  if (notifications.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-100 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map((n) => {
        const { icon: Icon, bg, border, text, icon_color } = config[n.type]
        return (
          <div
            key={n.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg ${bg} ${border} pointer-events-auto animate-in slide-in-from-bottom-2 duration-200`}
          >
            <Icon className={`w-5 h-5 ${icon_color} shrink-0 mt-0.5`} />
            <p className={`flex-1 text-sm font-medium ${text}`}>{n.message}</p>
            <button
              onClick={() => remove(n.id)}
              className={`shrink-0 ${icon_color} hover:opacity-70 transition-opacity`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
