'use client'

import { X, MapPin, Navigation, Clock } from 'lucide-react'
import { usePilahStore } from '@/store/usePilahStore'

export default function DropPointSheet() {
  const { isDropPointSheetOpen, closeDropPointSheet } = usePilahStore()

  if (!isDropPointSheetOpen) return null

  const dropPoints = [
    { id: 1, name: 'Pilah Box - Grand Indonesia', desc: 'Lantai LG, dekat eskalator Timur', dist: '1.2 km', open: true },
    { id: 2, name: 'Bank Sampah Berkah Menteng', desc: 'Jl. Menteng Raya No.14', dist: '2.5 km', open: true },
    { id: 3, name: 'Pilah Box - Stasiun Sudirman', desc: 'Pintu Keluar Selatan', dist: '3.1 km', open: false },
  ]

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end sm:items-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
       <div className="absolute inset-0" onClick={closeDropPointSheet} />
       
       <div className="relative w-full max-w-md bg-white rounded-t-[2rem] sm:rounded-[2rem] h-[85vh] sm:h-auto flex flex-col shadow-2xl animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300 overflow-hidden">
          
          <div className="shrink-0 p-6 pb-4 border-b border-zinc-100 flex justify-between items-start bg-white">
             <div>
                <div className="w-12 h-1.5 bg-zinc-200 rounded-full mb-6 sm:hidden" />
                <h2 className="text-xl font-black text-zinc-900">Drop Point Terdekat</h2>
                <p className="text-sm font-medium text-zinc-500 mt-1">Lagi di jalan? Taruh sendiri aja!</p>
             </div>
             <button onClick={closeDropPointSheet} className="p-2 bg-zinc-50 hover:bg-zinc-100 rounded-full text-zinc-500 transition-colors">
                <X size={20}/>
             </button>
          </div>

          <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-zinc-50/50 pb-20">
            {dropPoints.map((point) => (
              <div key={point.id} className="bg-white p-5 rounded-[1.5rem] border border-zinc-100 shadow-sm flex flex-col gap-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-emerald-50 rounded-full shrink-0">
                      <MapPin size={20} className="text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900 leading-tight">{point.name}</h3>
                      <p className="text-xs font-medium text-zinc-500 mt-1">{point.desc}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2 py-1 rounded-md shrink-0">{point.dist}</span>
                </div>

                <div className="flex items-center justify-between mt-2 pt-4 border-t border-zinc-50">
                   <div className="flex items-center gap-1.5">
                      <Clock size={14} className={point.open ? 'text-emerald-500' : 'text-red-500'} />
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${point.open ? 'text-emerald-600' : 'text-red-600'}`}>
                        {point.open ? 'Buka Sekarang' : 'Tutup'}
                      </span>
                   </div>
                <button 
                    onClick={() => point.open ? alert(`Membuka rute Google Maps ke: ${point.name}`) : alert('Maaf, lokasi ini sedang tutup.')}
                    className={`text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors ${point.open ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:scale-95' : 'bg-zinc-50 text-zinc-400 cursor-not-allowed'}`}
                  >
                    Arahkan <Navigation size={14} />
                   </button>
                </div>
              </div>
            ))}
          </div>
       </div>
    </div>
  )
}