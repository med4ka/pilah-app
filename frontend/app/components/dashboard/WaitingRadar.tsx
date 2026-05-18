'use client'

import { MapPin, X } from 'lucide-react'

interface WaitingRadarProps {
  onCancel: () => void;
}

export default function WaitingRadar({ onCancel }: WaitingRadarProps) {
  return (
    <section className="bg-white rounded-3xl p-8 mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden animate-in zoom-in-95 duration-500 ease-out">
      
      {/* Radar Pulsing Animation (Murni Tailwind, super ringan!) */}
      <div className="relative flex items-center justify-center w-24 h-24 mb-6 mt-4">
        {/* Lingkaran luar berdenyut hilang (Ping) */}
        <div className="absolute w-full h-full bg-emerald-100 rounded-full animate-ping opacity-75" />
        {/* Lingkaran tengah bernapas (Pulse) */}
        <div className="absolute w-3/4 h-3/4 bg-emerald-200 rounded-full animate-pulse" />
        {/* Core titik tengah */}
        <div className="relative z-10 w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)]">
          <MapPin size={24} className="text-white animate-bounce" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-zinc-900 mb-1">Mencari Pahlawan...</h3>
      <p className="text-xs text-zinc-500 font-medium text-center mb-6 leading-relaxed">
        Memindai radius 5km untuk menemukan<br/>kolektor terdekat dari lokasimu.
      </p>

      {/* Tombol Batal Minimalis */}
      <button
        onClick={onCancel}
        className="px-6 py-2.5 rounded-full bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 active:scale-95 transition-all flex items-center gap-2"
      >
        <X size={14} strokeWidth={2.5} />
        Batalkan Pencarian
      </button>
    </section>
  )
}