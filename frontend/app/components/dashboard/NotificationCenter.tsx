'use client'

import { BellOff, CheckCheck } from 'lucide-react'
import { useUIStore } from '@/store/useUIStore'
import {
  useNotificationStore,
  selectUnreadCount,
  type AppNotification,
} from '@/store/useNotificationStore'
import Dialog from '@/app/components/ui/Dialog'

// Simple relative time without an extra library.
// "Just now" → minutes → hours → days → falls back to a date.
function timeAgo(timestamp: number): string {
  const minutes = Math.floor((Date.now() - timestamp) / 60000)
  if (minutes < 1) return 'Baru saja'
  if (minutes < 60) return `${minutes} menit lalu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} hari lalu`
  return new Date(timestamp).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// In-app notification center. Wraps the existing shared Dialog — not a new modal.
// Triggered from the header bell or "Notifikasi & Radar" in ProfileTab.
export default function NotificationCenter() {
  const isOpen = useUIStore((s) => s.isNotificationCenterOpen)
  const close = useUIStore((s) => s.closeNotificationCenter)

  const notifications = useNotificationStore((s) => s.notifications)
  const unreadCount = useNotificationStore(selectUnreadCount)
  const markAsRead = useNotificationStore((s) => s.markAsRead)
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead)

  return (
    <Dialog
      isOpen={isOpen}
      onClose={close}
      title="Notifikasi"
      description={unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua sudah dibaca'}
    >
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
            <BellOff size={28} className="text-neutral-400" strokeWidth={1.5} />
          </div>
          <h4 className="text-base font-bold text-neutral-700">Belum ada notifikasi</h4>
          <p className="text-sm text-neutral-400 mt-1 leading-relaxed max-w-[260px] mx-auto">
            Perubahan status jemputanmu akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="self-end mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/5 border border-primary/10 px-3 py-2 rounded-base hover:bg-primary/10 transition-colors active:scale-95"
            >
              <CheckCheck size={14} /> Tandai semua terbaca
            </button>
          )}

          <div className="flex flex-col gap-2">
            {notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} onClick={() => markAsRead(n.id)} />
            ))}
          </div>
        </div>
      )}
    </Dialog>
  )
}

function NotificationItem({ notification: n, onClick }: { notification: AppNotification; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-start gap-3 p-3.5 rounded-base border transition-colors active:scale-[0.99] ${
        n.read
          ? 'bg-white border-neutral-100'
          : 'bg-primary/[0.04] border-primary/10'
      }`}
    >
      {/* Unread indicator: primary dot; once read becomes a thin neutral dot */}
      <span
        className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
          n.read ? 'bg-neutral-200' : 'bg-primary'
        }`}
      />
      <span className="flex-1 min-w-0">
        <span className={`block text-sm font-bold tracking-tight ${n.read ? 'text-neutral-600' : 'text-neutral-900'}`}>
          {n.title}
        </span>
        <span className="block text-xs font-medium text-neutral-500 mt-0.5 leading-relaxed">
          {n.message}
        </span>
        <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-1.5">
          {timeAgo(n.timestamp)}
        </span>
      </span>
    </button>
  )
}