'use client'

import { X, Calculator, HeartHandshake, Target, LayoutGrid, Users } from 'lucide-react'
import { usePilahStore } from '@/store/usePilahStore'

export default function MoreServicesSheet() {
const { isMoreSheetOpen, closeMoreSheet, openCalculator, openDonasi } = usePilahStore()
  if (!isMoreSheetOpen) return null

  const extraServices = [
    { id: 'calc', name: 'Kalkulator\nKarma', icon: Calculator, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { id: 'donate', name: 'Donasi\nBerkah', icon: HeartHandshake, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
    { id: 'community', name: 'Misi\nKomunitas', icon: Users, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    { id: 'mission', name: 'Misi\nMingguan', icon: Target, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
  ]

  const handleKlik = (id: string, name: string) => {
    if (id === 'calc') {
      closeMoreSheet()
      setTimeout(openCalculator, 300) 
    } else if (id === 'donate') {
      closeMoreSheet()
      setTimeout(openDonasi, 300) 
    } else {
      alert(`Fitur ${name.replace('\n', ' ')} sedang diracik oleh tim Developer Pilah!`)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end sm:items-center bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-300">
       <div className="absolute inset-0" onClick={closeMoreSheet} />
       
       <div className="relative w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2rem] p-6 pb-12 sm:pb-8 shadow-2xl animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300 ease-out">
          <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mb-6 sm:hidden" />
          
          <div className="flex justify-between items-start mb-6">
             <div>
                <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2 tracking-tight">
                  <LayoutGrid size={20} className="text-emerald-500" /> Layanan Ekstra
                </h2>
                <p className="text-sm font-medium text-zinc-500 mt-1">Eksplorasi fitur menarik lainnya.</p>
             </div>
             <button onClick={closeMoreSheet} className="p-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-100 rounded-full text-zinc-500 transition-colors active:scale-95">
                <X size={20}/>
             </button>
          </div>

          <div className="grid grid-cols-4 gap-3">
             {extraServices.map((svc) => (
               <button 
                 key={svc.id} 
                 onClick={() => handleKlik(svc.id, svc.name)}
                 className="flex flex-col items-center gap-2 group"
               >
                 <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center transition-all duration-300 ease-out border shadow-sm ${svc.bg} ${svc.color} ${svc.border} group-hover:-translate-y-1 group-active:scale-95`}>
                   <svc.icon size={26} strokeWidth={1.5} className="drop-shadow-sm group-hover:scale-110 transition-transform" />
                 </div>
                 <span className="text-[10px] font-bold text-center leading-tight whitespace-pre-line tracking-tight text-zinc-600 group-hover:text-zinc-900 transition-colors">
                   {svc.name}
                 </span>
               </button>
             ))}
          </div>
       </div>
    </div>
  )
}