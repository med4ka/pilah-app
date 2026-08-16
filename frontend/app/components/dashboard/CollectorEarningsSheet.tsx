'use client'

import { useState } from 'react'
import { Coins, ShieldCheck, Smartphone, CreditCard, Loader2, Wallet, CheckCircle2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuthStore } from '@/store/useAuthStore'
import { useCollectorPaymentMethodStore } from '@/store/useCollectorPaymentMethodStore'
import { redeemEarnings, getUserProfile } from '@/lib/api'
import Dialog from '@/app/components/ui/Dialog'
import { tapScale, transitionFast } from '@/lib/motion'

// Artificial payment-gateway-like delay before the success screen shows.
const PROCESSING_DELAY_MS = 1600

type Phase = 'idle' | 'processing' | 'success'

interface CollectorEarningsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

// Collector "Withdraw Earnings": the earnings balance is already in Rupiah straight
// from the backend (no rate/conversion like the resident Cuan Exchange).
// The balance is REALLY reduced in the DB, "fund transfer" is only simulated, and the
// payout method comes from useCollectorPaymentMethodStore (separate from residents).
export default function CollectorEarningsSheet({ isOpen, onClose }: CollectorEarningsSheetProps) {
  const userData = useAuthStore((s) => s.userData)
  const setUserData = useAuthStore((s) => s.setUserData)
  const { collectorMethods, selectedCollectorMethodId, setSelectedCollectorMethodId } = useCollectorPaymentMethodStore()

  const [phase, setPhase] = useState<Phase>('idle')
  const [error, setError] = useState<string | null>(null)
  const [rupiahSent, setRupiahSent] = useState<number | null>(null)

  const balance = userData?.collector_earnings || 0
  const selectedMethod = collectorMethods.find((m) => m.id === selectedCollectorMethodId) || null
  const canRedeem = balance > 0 && selectedMethod !== null

  // Reset to the selection screen every time the dialog closes (so reopening
  // doesn't show a stale success/processing screen).
  const handleClose = () => {
    setPhase('idle')
    setRupiahSent(null)
    onClose()
  }

  const handleRedeem = async () => {
    if (!canRedeem || phase === 'processing') return
    const sentAmount = balance
    setError(null)
    setPhase('processing')
    try {
      // Real withdrawal: the backend actually decrements the user's collector_earnings.
      await redeemEarnings(sentAmount)
      // Only after success, run a short loading animation (artificial delay).
      await new Promise((resolve) => setTimeout(resolve, PROCESSING_DELAY_MS))
      // Refresh userData from the backend so other UI balances update too.
      try {
        const fresh = await getUserProfile()
        setUserData(fresh)
      } catch {
        // Profile load failure isn't fatal — the new balance still comes from the redeem response.
      }
      setRupiahSent(sentAmount)
      setPhase('success')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan. Coba lagi.')
      setPhase('idle')
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={<span className="flex items-center gap-2"><Coins size={22} className="text-primary" /> Tarik Pendapatan</span>}
      description="Cairkan saldo pendapatan mitra."
    >
      <AnimatePresence mode="wait">
        {phase === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={transitionFast}
          >
            <div className="bg-neutral-900 rounded-[1.5rem] border border-neutral-800 p-6 mb-5 relative overflow-hidden shadow-xl shadow-neutral-900/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
              <p className="text-[10px] font-bold text-neutral-400 mb-1 tracking-widest uppercase relative z-10">Saldo Pendapatan</p>
              <p className="text-4xl font-black text-white tracking-tight tabular-nums relative z-10">Rp {balance.toLocaleString('id-ID')}</p>
              <p className="text-[10px] font-medium text-neutral-500 mt-3 relative z-10">Berupa Rupiah langsung, tanpa kurs</p>
            </div>

            {/* Withdrawal amount — simple approach: withdraw ALL balance (full balance) */}
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 ml-1">Jumlah Penarikan</p>
            <button
              type="button"
              disabled={balance <= 0}
              className="w-full bg-white rounded-[1.5rem] p-4 flex items-center justify-between cursor-pointer transition-all border-2 border-primary shadow-soft mb-5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/5">
                  <Wallet className="text-primary" size={20} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-neutral-900 text-lg leading-tight">Tarik Semua Pendapatan</h4>
                  <p className="text-[11px] font-bold text-neutral-400 mt-1">
                    {balance > 0
                      ? `Rp ${balance.toLocaleString('id-ID')}`
                      : 'Tidak ada pendapatan untuk ditarik'}
                  </p>
                </div>
              </div>
              <CheckCircle2 className="text-primary shrink-0" size={24} />
            </button>

            {/* Payout method — from useCollectorPaymentMethodStore (filled via Profile > Payment Method) */}
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 ml-1">Metode Pembayaran</p>
            <div className="space-y-2.5 mb-5">
              {collectorMethods.length === 0 && (
                <p className="text-sm font-medium text-neutral-400 text-center py-4">
                  Belum ada metode. Tambah dulu di Profil → Metode Pembayaran.
                </p>
              )}
              {collectorMethods.map((method) => {
                const isSelected = selectedCollectorMethodId === method.id
                const isConnected = method.kind === 'ewallet' || method.detail !== 'Belum disambungkan'
                return (
                  <button
                    type="button"
                    key={method.id}
                    onClick={() => setSelectedCollectorMethodId(method.id)}
                    className={`w-full bg-white rounded-[1.5rem] p-4 flex items-center justify-between cursor-pointer transition-all ${
                      isSelected ? 'border-2 border-primary shadow-soft' : 'border-2 border-neutral-100 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${method.kind === 'bank' ? 'bg-status-accepted/10' : 'bg-primary/5'}`}>
                        {method.kind === 'bank'
                          ? <CreditCard className="text-status-accepted" size={20} />
                          : <Smartphone className="text-primary" size={20} />}
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold text-neutral-900 text-base leading-tight">{method.name}</h4>
                        <p className={`text-[11px] font-bold mt-0.5 tracking-wider ${isConnected ? 'text-neutral-400' : 'text-neutral-300'}`}>
                          {isConnected ? method.detail : 'Belum disambungkan'}
                        </p>
                      </div>
                    </div>
                    <CheckCircle2 className={isSelected ? 'text-primary shrink-0' : 'text-neutral-200 shrink-0'} size={22} />
                  </button>
                )
              })}
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-base flex items-start gap-2.5 text-sm font-medium bg-status-error/10 text-status-error border border-status-error/20">
                <span className="leading-snug">{error}</span>
              </div>
            )}

            <motion.button
              onClick={handleRedeem}
              disabled={!canRedeem}
              whileTap={tapScale}
              transition={transitionFast}
              className="w-full min-h-[48px] rounded-base font-bold flex items-center justify-center gap-2 transition-colors bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft"
            >
              <Wallet size={18} /> Tarik Sekarang
            </motion.button>
            {balance === 0 && (
              <p className="text-center text-xs font-medium text-neutral-400 mt-3">
                Pendapatan masih Rp0 — selesaikan pickup dulu buat ngumpulin.
              </p>
            )}
          </motion.div>
        )}

        {phase === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transitionFast}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-5">
              <Loader2 size={32} className="text-primary animate-spin" />
            </div>
            <h3 className="font-black text-neutral-900 text-lg mb-1">Memproses penarikan...</h3>
            <p className="text-sm font-medium text-neutral-400 leading-relaxed">
              Mohon tunggu, jangan tutup jendela ini.
            </p>
          </motion.div>
        )}

        {phase === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={transitionFast}
            className="flex flex-col items-center justify-center py-6 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-status-completed/10 flex items-center justify-center mb-4">
              <ShieldCheck size={34} className="text-status-completed" />
            </div>
            <h3 className="font-black text-neutral-900 text-xl mb-1">Penarikan Berhasil!</h3>
            <p className="text-[15px] font-bold text-neutral-700 tabular-nums leading-relaxed mt-2">
              Dana Rp {(rupiahSent ?? 0).toLocaleString('id-ID')}
              <br />
              telah dikirim ke&nbsp;
              <span className="text-primary">{selectedMethod ? selectedMethod.name : 'metode pilihan'}</span>
            </p>
            <p className="text-xs font-medium text-neutral-400 leading-relaxed mt-4 max-w-[260px]">
              Simulasi untuk keperluan portofolio — dana tidak benar-benar terkirim.
            </p>
            <motion.button
              onClick={handleClose}
              whileTap={tapScale}
              transition={transitionFast}
              className="mt-6 w-full min-h-[48px] rounded-base font-bold flex items-center justify-center transition-colors bg-neutral-900 text-white hover:bg-neutral-800 shadow-soft"
            >
              Selesai
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  )
}