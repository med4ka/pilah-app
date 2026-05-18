'use client'

import { Wallet, Clock, Gift } from 'lucide-react'
import { usePilahStore } from '@/store/usePilahStore'

interface KarmaWalletProps {
  points: number;
  onRiwayatClick: () => void;
}

export default function KarmaWallet({ points, onRiwayatClick }: KarmaWalletProps) {
  const { openRewardSheet } = usePilahStore()

  return (
    <section className="bg-zinc-900 text-white rounded-[2rem] p-6 mb-8 shadow-xl shadow-zinc-900/10 border border-zinc-800">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 text-zinc-400 mb-1.5">
            <Wallet size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Saldo Karma</span>
          </div>
          <div className="text-4xl font-black tabular-nums tracking-tight">
            {points.toLocaleString('id-ID')}
          </div>
        </div>
        <div className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-3 py-1.5 rounded-full border border-emerald-500/30">
          Member Aktif
        </div>
      </div>
      
      <div className="flex gap-3">
        <button 
          onClick={openRewardSheet} 
          className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-inner border border-white/5"
        >
          <Gift size={16} /> Tukar Cuan
        </button>
        <button 
          onClick={onRiwayatClick}
          className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-inner border border-white/5"
        >
          <Clock size={16} /> Cek Riwayat
        </button>
      </div>
    </section>
  )
}