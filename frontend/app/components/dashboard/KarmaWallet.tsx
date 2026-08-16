'use client'

import { Wallet, Clock, Gift } from 'lucide-react'
import { useUIStore } from '@/store/useUIStore'

interface KarmaWalletProps {
  points: number;
  onRiwayatClick: () => void;
}

export default function KarmaWallet({ points, onRiwayatClick }: KarmaWalletProps) {
  const { openRewardSheet } = useUIStore()

  return (
    <section className="bg-white rounded-base border border-neutral-200/70 shadow-soft p-5 mb-10 animate-in fade-in duration-300">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-neutral-500 mb-2">
            <Wallet size={16} strokeWidth={1.75} />
            <span className="text-[10px] font-semibold uppercase tracking-widest">Saldo Karma</span>
          </div>
          <div className="text-4xl font-bold tabular-nums tracking-tight text-neutral-900">
            {points.toLocaleString('id-ID')}
          </div>
        </div>
        <span className="text-[10px] font-semibold px-3 py-1.5 rounded-full border border-primary/20 text-primary bg-primary/5">
          Member Aktif
        </span>
      </div>

      <div className="flex gap-3">
        <button
          onClick={openRewardSheet}
          className="flex-1 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-700 py-3 rounded-base text-xs font-semibold transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Gift size={16} /> Tukar Cuan
        </button>
        <button
          onClick={onRiwayatClick}
          className="flex-1 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-700 py-3 rounded-base text-xs font-semibold transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Clock size={16} /> Cek Riwayat
        </button>
      </div>
    </section>
  )
}