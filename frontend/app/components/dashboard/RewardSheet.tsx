'use client'

import { useState } from 'react'
import { X, Gift, Smartphone, Wallet, Coffee, AlertCircle, CheckCircle2 } from 'lucide-react'
import { usePilahStore } from '@/store/usePilahStore'

export default function RewardSheet() {
  const { isRewardSheetOpen, closeRewardSheet, userData } = usePilahStore()
  const points = userData?.karma_points || 0
  
  const [toast, setToast] = useState<{ type: 'success' | 'error', msg: string } | null>(null)

  if (!isRewardSheetOpen) return null

  const CATALOG = [
    { id: 1, title: 'Pulsa All Operator 10k', cost: 100, icon: Smartphone, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { id: 2, title: 'Saldo GoPay Rp 25.000', cost: 250, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { id: 3, title: 'Voucher Kopi Kenangan', cost: 50, icon: Coffee, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  ]

  const handleTukar = (itemCost: number, itemName: string) => {
    if (points >= itemCost) {
      setToast({ type: 'success', msg: `Berhasil menukar! ${itemName} akan dikirim ke akunmu.` })
    } else {
      setToast({ type: 'error', msg: `Saldo Karma kurang! Kamu butuh ${itemCost} poin.` })
    }
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end sm:items-center bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-300">
       <div className="absolute inset-0" onClick={closeRewardSheet} />
       
       <div className="relative w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2rem] p-6 pb-12 sm:pb-8 shadow-2xl animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300 ease-out flex flex-col max-h-[90vh]">
          <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mb-6 sm:hidden shrink-0" />
          
          <div className="flex justify-between items-center mb-6 shrink-0">
             <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2 tracking-tight">
                <Gift size={24} className="text-emerald-500"/> Katalog Tukar Karma
             </h2>
             <button onClick={closeRewardSheet} className="p-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-100 rounded-full text-zinc-500 transition-colors active:scale-95">
                <X size={20}/>
             </button>
          </div>

          <div className="text-center py-6 bg-zinc-900 rounded-[1.5rem] border border-zinc-800 shrink-0 mb-6 relative overflow-hidden shadow-xl shadow-zinc-900/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <p className="text-[10px] font-bold text-zinc-400 mb-1 tracking-widest uppercase relative z-10">Total Karma Aktif</p>
            <p className="text-4xl font-black text-white tracking-tight relative z-10">{points.toLocaleString('id-ID')}</p>
          </div>

          {toast && (
            <div className={`mb-4 p-3 rounded-2xl flex items-start gap-3 text-sm font-bold border animate-in fade-in slide-in-from-top-2 shrink-0 ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
              {toast.type === 'success' ? <CheckCircle2 className="shrink-0 mt-0.5" size={18} /> : <AlertCircle className="shrink-0 mt-0.5" size={18} />}
              <p className="leading-snug text-xs">{toast.msg}</p>
            </div>
          )}

          <div className="overflow-y-auto flex-grow space-y-3 pr-1">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 px-1">Pilihan Cuan Hari Ini</p>
            
            {CATALOG.map((item) => {
              const isAffordable = points >= item.cost
              return (
                <div key={item.id} className="bg-white border border-zinc-100 p-4 rounded-2xl flex items-center justify-between shadow-sm hover:border-zinc-300 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${item.bg} ${item.color} ${item.border} border`}>
                      <item.icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900 text-sm leading-tight">{item.title}</h3>
                      <p className="text-[10px] font-black text-zinc-400 mt-1 uppercase tracking-wider">{item.cost} Karma</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleTukar(item.cost, item.title)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                      isAffordable 
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md' 
                        : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'
                    }`}
                  >
                    Tukar
                  </button>
                </div>
              )
            })}
          </div>

      </div>
    </div>
  )
}