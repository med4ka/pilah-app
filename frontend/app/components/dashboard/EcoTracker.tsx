'use client'

import { useEffect, useState, useMemo } from 'react'
import { Globe, Wind, Leaf, Loader2 } from 'lucide-react'
import { usePilahStore } from '@/store/usePilahStore'
import { getUserHistory } from '@/lib/api'

export default function EcoTracker() {
  const { token } = usePilahStore()
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }

    getUserHistory(token)
      .then((data) => {
        const completed = (data || []).filter((h: any) => h.status === 'COMPLETED')
        setHistory(completed)
      })
      .catch((err) => console.error("EcoTracker Log: Gagal fetch data", err))
      .finally(() => setIsLoading(false))
  }, [token])

  const stats = useMemo(() => {
    let plastic = 0, cardboard = 0, glass = 0
    
    history.forEach(item => {
      plastic += (item.plastic_weight || 0)
      cardboard += (item.cardboard_weight || 0)
      glass += (item.glass_weight || 0)
    })

    const totalKg = plastic + cardboard + glass
    const co2Reduced = (plastic * 1.5) + (cardboard * 3.0) + (glass * 0.3)
    const treesSaved = cardboard * 0.017

    return {
      totalKg: totalKg.toFixed(1),
      co2Reduced: co2Reduced.toFixed(1),
      treesSaved: Math.floor(treesSaved), 
    }
  }, [history])

  if (isLoading) {
    return (
      <div className="mb-8 flex justify-center items-center py-10 bg-zinc-50/50 rounded-[2rem] border border-zinc-100 border-dashed">
        <Loader2 className="animate-spin text-emerald-500" size={24} />
      </div>
    )
  }

  return (
    <section className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-sm font-black text-zinc-900 tracking-tight">Dampak Ekosistemmu</h2>
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase border border-emerald-100/50">Update Real-time</span>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-white border border-zinc-100 rounded-[1.5rem] p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-zinc-50 rounded-2xl text-zinc-600 border border-zinc-100">
              <Globe size={20} />
            </div>
          <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total Kontribusi</p>
              <h3 className="text-lg font-black text-zinc-900 tracking-tight">{stats.totalKg} kg <span className="text-sm font-semibold text-zinc-500">Sampah</span></h3>
            </div>
              </div>
                <div className="text-right">
            <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">+Aktif</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
           {/* Metric 2: Emisi CO2 */}
           <div className="bg-white border border-zinc-100 p-4 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/50 flex items-center justify-center mb-3">
                <Wind size={20} />
              </div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5 truncate">Emisi CO2 Berkurang</p>
              <p className="text-sm font-black text-zinc-900 tracking-tight">{stats.co2Reduced} <span className="text-xs font-semibold text-zinc-500">kg</span></p>
           </div>

           {/* Metric 3: Pohon */}
           <div className="bg-white border border-zinc-100 p-4 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100/50 flex items-center justify-center mb-3">
                <Leaf size={20} />
              </div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5 truncate">Pohon Diselamatkan</p>
              <p className="text-sm font-black text-zinc-900 tracking-tight">{stats.treesSaved} <span className="text-xs font-semibold text-zinc-500">Pohon</span></p>
           </div>
        </div>
      </div>
    </section>
  )
}