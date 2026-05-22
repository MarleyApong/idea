import { create } from "zustand"

export type NotificationType = "success" | "error" | "warning" | "info"

export interface Notification {
  id: string
  type: NotificationType
  message: string
  duration?: number
}

interface NotificationsState {
  notifications: Notification[]
  add: (notification: Omit<Notification, "id">) => void
  remove: (id: string) => void
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
  info: (message: string) => void
}

export const useNotifications = create<NotificationsState>((set) => ({
  notifications: [],

  add: (notification) => {
    const id = Math.random().toString(36).slice(2)
    const duration = notification.duration ?? 4000

    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }))

    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }))
    }, duration)
  },

  remove: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  success: (message) =>
    useNotifications.getState().add({ type: "success", message }),

  error: (message) =>
    useNotifications.getState().add({ type: "error", message, duration: 6000 }),

  warning: (message) =>
    useNotifications.getState().add({ type: "warning", message }),

  info: (message) =>
    useNotifications.getState().add({ type: "info", message }),
}))
