import { create } from 'zustand'

export interface AppNotification {
  id: string
  title: string
  message: string
  timestamp: number
  read: boolean
  type: 'status_change' | 'system'
}

interface NotificationState {
  notifications: AppNotification[]
  addNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
}

const MAX_NOTIFICATIONS = 50

// All state here is purely derived/transient (regenerated on each load) — it is
// deliberately NOT persisted. Notifications are generated from pickup status
// transitions, not data that needs to survive a page refresh.
export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],

  addNotification: (n) =>
    set((state) => ({
      notifications: [
        {
          ...n,
          id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          timestamp: Date.now(),
          read: false,
        },
        ...state.notifications,
      ].slice(0, MAX_NOTIFICATIONS),
    })),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  clearAll: () => set({ notifications: [] }),
}))

// Computed selector: number of unread notifications.
// Used via useNotificationStore(selectUnreadCount) so re-renders happen only
// when the unread count actually changes.
export const selectUnreadCount = (s: NotificationState) =>
  s.notifications.filter((n) => !n.read).length