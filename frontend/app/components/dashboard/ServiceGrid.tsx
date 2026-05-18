'use client'

import { Recycle, BookOpen, Map, Loader2 } from 'lucide-react'
import { usePilahStore } from '@/store/usePilahStore'

interface ServiceGridProps {
  onJemputClick: () => void;
  isSearching: boolean;
  disabled: boolean;
}

export default function ServiceGrid({ onJemputClick, isSearching, disabled }: ServiceGridProps) {
  const { openPilahPintar, openDropPoint } = usePilahStore()

  // ✨ PREMIUM UI: Gradient Halus + Organic Shadows
  const services = [
    { 
      id: 'jemput', name: 'Jemput\nSampah', icon: Recycle, active: true, action: onJemputClick, 
      style: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 text-emerald-700 border-emerald-200/60 hover:border-emerald-300 hover:shadow-[0_8px_20px_-6px_rgba(16,185,129,0.3)]' 
    },
    { 
      id: 'pintar', name: 'Pilah\nPintar', icon: BookOpen, active: true, action: openPilahPintar, 
      style: 'bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-700 border-blue-200/60 hover:border-blue-300 hover:shadow-[0_8px_20px_-6px_rgba(59,130,246,0.3)]' 
    },
    { 
      id: 'point', name: 'Drop\nPoint', icon: Map, active: true, action: openDropPoint, 
      style: 'bg-gradient-to-br from-amber-50 to-amber-100/50 text-amber-700 border-amber-200/60 hover:border-amber-300 hover:shadow-[0_8px_20px_-6px_rgba(245,158,11,0.3)]' 
    },
    { 
      id: 'more', name: 'Lainnya', icon: null, true: false, action: () => {}, 
      style: 'bg-zinc-50/50 text-zinc-400 border-zinc-200/50' 
    },
  ];

  return (
    <section className="mb-8">
      <h2 className="text-sm font-black text-zinc-900 mb-4 px-1 tracking-tight">Layanan Utama</h2>
      <div className="grid grid-cols-4 gap-4">
        {services.map((svc) => (
          <div key={svc.id} className={`flex flex-col items-center gap-2 ${!svc.active ? 'opacity-60' : ''}`}>
            <button 
              onClick={svc.action}
              disabled={!svc.active || disabled || (svc.id === 'jemput' && isSearching)}
              className={`w-[72px] h-[72px] rounded-[1.25rem] flex items-center justify-center transition-all duration-300 ease-out border shadow-sm
                ${svc.style} 
                ${svc.active && !disabled && !(svc.id === 'jemput' && isSearching) ? 'hover:-translate-y-1 active:scale-[0.95]' : 'cursor-not-allowed'}`}
            >
              {svc.id === 'jemput' && isSearching ? (
                <Loader2 size={28} className="animate-spin text-emerald-600" />
              ) : svc.icon ? (
                <svc.icon size={28} strokeWidth={1.5} className="drop-shadow-sm" />
              ) : (
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-300" />)}
                </div>
              )}
            </button>
            <span className={`text-[11px] font-bold text-center leading-tight whitespace-pre-line tracking-tight ${svc.active ? 'text-zinc-700' : 'text-zinc-400'}`}>
              {svc.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}