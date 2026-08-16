'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  CheckCircle2,
  Loader2,
  Camera,
  ShieldCheck,
  AlertCircle,
  Recycle,
  Box,
  Layers,
  XCircle,
} from 'lucide-react'
import { getUserHistory, confirmPickup, getUserProfile, type Pickup, type PickupStatus as ApiPickupStatus } from '@/lib/api'
import { useAuthStore } from '@/store/useAuthStore'
import { useNotificationStore, type AppNotification } from '@/store/useNotificationStore'
import { useUIStore } from '@/store/useUIStore'
import PickupStatusStepper, { type PickupStatus } from '@/app/components/dashboard/PickupStatusStepper'

const ACTIVE_STATUSES: ApiPickupStatus[] = ['PENDING', 'ACCEPTED', 'VERIFYING']

// New statuses only observable via resident polling -> notification content.
// The COMPLETED transition is handled in handleConfirm (when confirm happens).
function statusChangeNotification(nextStatus: ApiPickupStatus): Omit<AppNotification, 'id' | 'timestamp' | 'read'> {
  switch (nextStatus) {
    case 'ACCEPTED':
      return {
        type: 'status_change',
        title: 'Pickup-mu diambil kolektor!',
        message: 'Seorang kolektor telah menerima jemputanmu dan sedang dalam perjalanan ke lokasimu.',
      }
    case 'VERIFYING':
      return {
        type: 'status_change',
        title: 'Kolektor sudah menimbang',
        message: 'Yuk buka Status Jemputan untuk mengonfirmasi hasil timbangan dan menyelesaikan transaksimu.',
      }
    default:
      return {
        type: 'status_change',
        title: 'Status pickup diperbarui',
        message: `Status jemputanmu berubah menjadi ${nextStatus.replace(/_/g, ' ').toLowerCase()}.`,
      }
  }
}

interface ActivePickupCardProps {
  // Reuses the existing create-pickup flow in page.tsx (handleJemput) —
  // triggered by the "Try Again" button when the pickup is CANCELLED.
  onRetry?: () => void
  // Sync to the parent: as soon as ANY pickup card (active/terminal) starts
  // showing, the page resets orderStatus -> WaitingRadar stops. True = a card is
  // showing, false = no card at all.
  onPickupVisibleChange?: (visible: boolean) => void
}

export default function ActivePickupCard({ onRetry, onPickupVisibleChange }: ActivePickupCardProps) {
  const { userData, setUserData } = useAuthStore()
  // SINGLE source of truth: the latest pickup being shown (any status —
  // PENDING/ACCEPTED/VERIFYING -> stepper, COMPLETED -> done card,
  // CANCELLED -> canceled card). Null = no card (back to default view).
  const [pickup, setPickup] = useState<Pickup | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const pollRef = useRef<number | null>(null)
  // Marks that a terminal card (COMPLETED/CANCELLED) is showing -> polling stops.
  const terminalRef = useRef<'CANCELLED' | 'COMPLETED' | null>(null)
  // Stale-response guard: each poll start bumps the counter; responses with an old
  // seq (snapshot taken before the status changed) are DROPPED, not overwriting latest state.
  const pollSeqRef = useRef(0)
  // After "Try Again", hide the old terminal card until a new active pickup shows.
  const retryingRef = useRef(false)

  // Last-seen status per pickup that has been shown, to detect status transitions
  // without starting new polling — piggybacks on existing polling.
  const prevActiveRef = useRef<{ id: string; status: string } | null>(null)

  // Detect status transitions for notifications: only when the SAME pickup moves
  // to a new active status (PENDING/ACCEPTED/VERIFYING). Transitions to
  // COMPLETED/CANCELLED are handled by the terminal card, not this notification.
  const detectStatusChange = useCallback((nextPickup: Pickup) => {
    const prev = prevActiveRef.current
    if (prev && prev.id === nextPickup.id && prev.status !== nextPickup.status) {
      useNotificationStore.getState().addNotification(statusChangeNotification(nextPickup.status as ApiPickupStatus))
    }
    prevActiveRef.current = { id: nextPickup.id, status: nextPickup.status }
  }, [])

  // Apply poll results to state — TOTAL REPLACE (not partial merge).
  // The server status is the single source of truth for render logic.
  const applyPoll = useCallback((list: Pickup[], seq: number) => {
    // Stale responses snapshotting an older status arrive late -> drop.
    if (seq !== pollSeqRef.current) return

    const active = list.find((p: Pickup) => ACTIVE_STATUSES.includes(p.status as ApiPickupStatus)) ?? null
    const latest = list[0] ?? null
    const terminal = latest && (latest.status === 'CANCELLED' || latest.status === 'COMPLETED') ? latest : null

    // After "Try Again", don't show the old terminal card while no new pickup exists yet.
    if (retryingRef.current && !active) return

    if (active) {
      retryingRef.current = false
      useUIStore.getState().setDismissedPickupId(null)
      terminalRef.current = null
      setFeedback(null)
      detectStatusChange(active)
      setPickup(active)
      return
    }

    if (terminal) {
      // A COMPLETED card already dismissed by the user must not be resurrected by polling.
      if (terminal.status === 'COMPLETED' && useUIStore.getState().dismissedPickupId === terminal.id) {
        terminalRef.current = null
        setPickup(null)
        return
      }
      terminalRef.current = terminal.status as 'CANCELLED' | 'COMPLETED'
      setPickup(terminal)
      return
    }

    terminalRef.current = null
    setFeedback(null)
    setPickup(null)
  }, [detectStatusChange])

  // Polling runs in the event loop (setInterval / promise callback), not a
  // synchronous setState in the effect body. Stops entirely while a terminal card shows.
  const pollActive = useCallback(() => {
    if (!userData) return Promise.resolve()
    if (terminalRef.current) return Promise.resolve()
    const started = ++pollSeqRef.current
    return getUserHistory()
      .then((data) => {
        applyPoll(data || [], started)
      })
      .catch(() => {
        // Keep polling; if a failure is only due to session issues, leave the card empty.
      })
  }, [userData, applyPoll])

  useEffect(() => {
    void pollActive()
    pollRef.current = window.setInterval(() => void pollActive(), 5000)
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current)
    }
  }, [pollActive])

  // Tell the parent when the card shows / disappears — this lets the page keep
  // orderStatus (radar phase) synced to a single source of truth.
  useEffect(() => {
    onPickupVisibleChange?.(pickup !== null)
  }, [pickup, onPickupVisibleChange])

  const handleConfirm = async () => {
    if (!pickup) return
    setIsConfirming(true)
    setFeedback(null)
    try {
      const res = await confirmPickup(pickup.id)
      // Show the success card IMMEDIATELY with a COMPLETED snapshot — don't wait
      // for polling. The server is the single source of truth for later sync.
      const completed = { ...pickup, status: 'COMPLETED' as ApiPickupStatus }
      retryingRef.current = false
      terminalRef.current = 'COMPLETED'
      prevActiveRef.current = { id: completed.id, status: completed.status }
      setPickup(completed)
      setFeedback({ type: 'success', text: `Selesai! Kamu dapat +${res.karma} Karma.` })
      useNotificationStore.getState().addNotification({
        type: 'status_change',
        title: 'Pickup selesai!',
        message: `Transaksi terverifikasi. Kamu mendapat +${res.karma} Karma.`,
      })
      try {
        const profile = await getUserProfile()
        setUserData(profile)
      } catch {
        // Cached karma doesn't need to be perfectly synced when profile refresh fails.
      }
      await pollActive()
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'Gagal mengonfirmasi. Coba lagi.' })
    } finally {
      setIsConfirming(false)
    }
  }

  const handleRetry = () => {
    useUIStore.getState().stopSearching()
    retryingRef.current = true
    terminalRef.current = null
    setPickup(null)
    onRetry?.()
  }

  const handleDismissCompleted = () => {
    if (!pickup) return
    useUIStore.getState().stopSearching()
    useUIStore.getState().setDismissedPickupId(pickup.id)
    terminalRef.current = null
    setFeedback(null)
    setPickup(null)
  }

  if (!userData) return null
  if (!pickup) return null

  const totalWeight = (pickup.plastic_weight || 0) + (pickup.cardboard_weight || 0) + (pickup.glass_weight || 0)

  // ── TERMINAL CARD: CANCELLED ──────────────────────────────────────────────
  if (pickup.status === 'CANCELLED') {
    return (
      <section className="mb-10">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-neutral-900 tracking-tight">Status Jemputan</h2>
          <p className="text-xs text-neutral-400 mt-1">Pantau perjalanan sampahmu sampai selesai.</p>
        </div>
        <div className="rounded-base p-6 border shadow-soft overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300 bg-white border-status-error/20">
          <div className="flex flex-col items-center text-center py-2">
            <div className="w-14 h-14 rounded-full bg-status-error/10 flex items-center justify-center mb-4">
              <XCircle size={26} className="text-status-error" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">Yah, orderan kamu dibatalkan otomatis</h3>
            <p className="text-xs font-medium text-neutral-500 mt-1.5 leading-relaxed max-w-[280px]">
              Belum ada kolektor yang gercep ambil orderan kamu nih, jadi dibatalkan setelah 3 menit. Sampahmu aman — tinggal coba lagi aja.
            </p>
            <button
              onClick={handleRetry}
              className="mt-5 w-full min-h-11 rounded-base font-bold flex items-center justify-center gap-2 transition-all bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98] shadow-soft"
            >
              <Recycle size={18} /> Coba Lagi
            </button>
            <span className="text-[10px] font-semibold text-neutral-300 uppercase tracking-wider mt-3">
              #{pickup.id.toString().substring(0, 6)}
            </span>
          </div>
        </div>
      </section>
    )
  }

  // ── TERMINAL CARD: COMPLETED ─────────────────────────────────────────────
  if (pickup.status === 'COMPLETED') {
    return (
      <section className="mb-10">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-neutral-900 tracking-tight">Status Jemputan</h2>
          <p className="text-xs text-neutral-400 mt-1">Pantau perjalanan sampahmu sampai selesai.</p>
        </div>
        <div className="rounded-base border shadow-soft overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300 bg-white border-status-completed/20">
          <div className="flex flex-col items-center text-center py-6 px-6">
            <PickupStatusStepper currentStatus="COMPLETED" />
            <div className="mt-6">
              <div className="w-14 h-14 rounded-full bg-status-completed/10 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={26} className="text-status-completed" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">Sampahmu sudah selesai dijemput!</h3>
              {feedback?.type === 'success' && (
                <p className="text-sm font-bold text-status-completed mt-1.5">{feedback.text}</p>
              )}
              <p className="text-xs font-medium text-neutral-500 mt-1.5 leading-relaxed max-w-[280px] mx-auto">
                Transaksi sudah terverifikasi dan tercatat di riwayatmu. Terima kasih sudah ikut menjaga lingkungan!
              </p>
              <button
                onClick={handleDismissCompleted}
                className="mt-5 w-full min-h-11 rounded-base font-bold flex items-center justify-center gap-2 transition-all bg-neutral-900 hover:bg-black text-white active:scale-[0.98] shadow-soft"
              >
                <CheckCircle2 size={18} /> Tutup
              </button>
              <span className="text-[10px] font-semibold text-neutral-300 uppercase tracking-wider mt-3">
                #{pickup.id.toString().substring(0, 6)}
              </span>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // ── ACTIVE CARD: PENDING / ACCEPTED / VERIFYING -> stepper ────────────────
  return (
    <section className="mb-10">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-neutral-900 tracking-tight">Status Jemputan</h2>
        <p className="text-xs text-neutral-400 mt-1">Pantau perjalanan sampahmu sampai selesai.</p>
      </div>
      <div className={`rounded-base p-6 border shadow-soft overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300 ${
        pickup.status === 'VERIFYING' ? 'bg-white border-status-verifying/20' :
        pickup.status === 'ACCEPTED' ? 'bg-white border-status-accepted/20' :
        'bg-white border-status-pending/20'
      }`}>
        <PickupStatusStepper currentStatus={pickup.status as PickupStatus} />

        <div className="flex items-center justify-between gap-3 mt-5">
          <div className="flex-1">
            <p className="font-semibold text-neutral-900 tracking-tight">
              {pickup.status === 'VERIFYING' ? 'Menunggu Konfirmasi' :
               pickup.status === 'ACCEPTED' ? 'Kolektor Menuju Lokasi' :
               'Mencari Kolektor'}
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              {pickup.status === 'VERIFYING' ? 'Kolektor sudah menimbang. Cek dulu sebelum konfirmasi.' :
               pickup.status === 'ACCEPTED' ? 'Pahlawan kebersihan sedang dalam perjalanan ke lokasimu.' :
               'Kami sedang mencari kolektor terdekat untuk sampahmu.'}
            </p>
          </div>
          <span className="text-[10px] font-semibold text-neutral-300 uppercase tracking-wider shrink-0">
            #{pickup.id.toString().substring(0, 6)}
          </span>
        </div>

        {/* Weight breakdown — ONLY during VERIFYING, so the resident knows what they're confirming */}
        {pickup.status === 'VERIFYING' && (
          <div className="space-y-2 mt-5 mb-5">
            <div className="bg-neutral-50 rounded-base p-4 border border-neutral-100 flex flex-col gap-3">
              <WeightRow icon={Recycle} label="Plastik" value={pickup.plastic_weight || 0} />
              <WeightRow icon={Box} label="Kardus" value={pickup.cardboard_weight || 0} />
              <WeightRow icon={Layers} label="Kaca" value={pickup.glass_weight || 0} />
              <div className="pt-3 border-t border-dashed border-neutral-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Berat</span>
                <span className="text-sm font-bold text-primary">{totalWeight.toLocaleString('id-ID')} kg</span>
              </div>
            </div>

            {pickup.photo_url ? (
              <a
                href={pickup.photo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-neutral-50 rounded-base p-3 border border-neutral-100 group"
              >
                <div className="p-2 bg-white rounded-base border border-neutral-100 text-neutral-600 group-hover:text-primary transition-colors">
                  <Camera size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-900">Foto Bukti Penimbangan</p>
                  <p className="text-[10px] font-medium text-neutral-400">Ketuk untuk melihat bukti</p>
                </div>
              </a>
            ) : null}
          </div>
        )}

        {feedback && (
          <div className={`mb-5 p-3 rounded-base flex items-start gap-2.5 text-xs font-semibold border animate-in fade-in ${
            feedback.type === 'success' ? 'bg-status-completed/10 text-status-completed border-status-completed/20' : 'bg-status-error/10 text-status-error border-status-error/20'
          }`}>
            {feedback.type === 'success' ? <ShieldCheck className="shrink-0 mt-0.5" size={16} /> : <AlertCircle className="shrink-0 mt-0.5" size={16} />}
            <p className="leading-snug">{feedback.text}</p>
          </div>
        )}

        {pickup.status === 'VERIFYING' && (
          <button
            onClick={handleConfirm}
            disabled={isConfirming}
            className="w-full py-3.5 rounded-base font-semibold flex items-center justify-center gap-2 transition-all bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98] disabled:opacity-70 shadow-soft"
          >
            {isConfirming ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
            Konfirmasi Selesai
          </button>
        )}
      </div>
    </section>
  )
}

function WeightRow({ icon: Icon, label, value }: { icon: LucideIcon, label: string, value: number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-white rounded-base border border-neutral-100 text-neutral-600">
          <Icon size={14} />
        </div>
        <span className="text-xs font-semibold text-neutral-700">{label}</span>
      </div>
      <span className="text-xs font-bold text-neutral-900">{value.toLocaleString('id-ID')} kg</span>
    </div>
  )
}