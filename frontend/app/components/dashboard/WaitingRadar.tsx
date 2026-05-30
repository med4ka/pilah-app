'use client'

import { MapPin, X, BellRing } from 'lucide-react'
import { usePilahStore } from '@/store/usePilahStore'

interface WaitingRadarProps {
  onCancel: () => void;
}

export default function WaitingRadar({ onCancel }: WaitingRadarProps) {
  const { openVerification } = usePilahStore()

  const handleSimulasiNotif = () => {
    onCancel() 
    setTimeout(() => {
      openVerification() 
    }, 500) 
  }

  return (
    <section className="bg-white rounded-3xl p-8 mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden animate-in zoom-in-95 duration-500 ease-out">
      
      <div className="relative flex items-center justify-center w-24 h-24 mb-6 mt-4">
        <div className="absolute w-full h-full bg-emerald-100 rounded-full animate-ping opacity-75" />
        <div className="absolute w-3/4 h-3/4 bg-emerald-200 rounded-full animate-pulse" />
        <div className="relative z-10 w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)]">
          <MapPin size={24} className="text-white animate-bounce" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-zinc-900 mb-1">Mencari Pahlawan...</h3>
      <p className="text-xs text-zinc-500 font-medium text-center mb-6 leading-relaxed">
        Memindai radius 5km untuk menemukan<br/>kolektor terdekat dari lokasimu.
      </p>

      <div className="flex gap-3 w-full max-w-[280px]">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl bg-red-50 text-red-600 text-[11px] font-bold hover:bg-red-100 active:scale-95 transition-all flex justify-center items-center gap-1.5 border border-red-100"
        >
          <X size={14} strokeWidth={2.5} /> Batalkan
        </button>

        <button
          onClick={handleSimulasiNotif}
          className="flex-[1.5] py-3 rounded-xl bg-blue-50 text-blue-600 text-[11px] font-bold hover:bg-blue-100 active:scale-95 transition-all flex justify-center items-center gap-1.5 border border-blue-100 shadow-sm"
        >
          <BellRing size={14} className="animate-[wiggle_1s_ease-in-out_infinite]" /> Simulasi Kolektor Tiba
        </button>
      </div>

    </section>
  )
}