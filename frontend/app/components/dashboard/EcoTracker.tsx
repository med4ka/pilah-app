'use client'

import { Leaf, Wind, Globe } from 'lucide-react'

export default function EcoTracker() {
  const stats = [
    { id: 1, label: 'Plastik Terselamatkan', value: '12.5 kg', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 2, label: 'Emisi CO2 Dikurangi', value: '3.2 kg', icon: Wind, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 3, label: 'Pohon Terselamatkan', value: '1 Pohon', icon: Leaf, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  return (
    <section className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-sm font-black text-zinc-900 tracking-tight">Dampak Ekosistemmu</h2>
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">Update Mingguan</span>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-white border border-zinc-100 rounded-[1.5rem] p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-zinc-50 rounded-2xl text-zinc-600">
              <Globe size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total Kontribusi</p>
              <h3 className="text-lg font-black text-zinc-900 tracking-tight">12.5 kg Plastik</h3>
            </div>
          </div>
          <div className="text-right">
             <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">+15% Bulan Ini</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
           {stats.slice(1).map((item) => (
             <div key={item.id} className="bg-white border border-zinc-100 p-4 rounded-[1.5rem] shadow-sm">
                <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center mb-3`}>
                  <item.icon size={20} />
                </div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                <p className="text-sm font-black text-zinc-900 tracking-tight">{item.value}</p>
             </div>
           ))}
        </div>
      </div>
    </section>
  )
}