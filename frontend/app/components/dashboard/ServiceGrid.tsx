'use client'

import { Recycle, BookOpen, Map, Loader2 } from 'lucide-react'
import { useUIStore } from '@/store/useUIStore'

interface ServiceGridProps {
  onJemputClick: () => void;
  isSearching: boolean;
  disabled: boolean;
}

export default function ServiceGrid({ onJemputClick, isSearching, disabled }: ServiceGridProps) {
  const { openPilahPintar, openDropPointSheet } = useUIStore()

  const services = [
    {
      id: 'jemput', name: 'Jemput\nSampah', icon: Recycle, active: true, action: onJemputClick, primary: true,
    },
    {
      id: 'pintar', name: 'Pilah\nPintar', icon: BookOpen, active: true, action: openPilahPintar, primary: false,
    },
    {
      id: 'point', name: 'Drop\nPoint', icon: Map, active: true, action: openDropPointSheet, primary: false,
    },
  ];

  return (
    <section className="mb-10">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-neutral-900 tracking-tight">Layanan Utama</h2>
        <p className="text-xs text-neutral-400 mt-1">Pilih cara terbaik untuk mengelola sampahmu.</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {services.map((svc) => (
          <div key={svc.id} className={`flex flex-col items-center gap-3 ${!svc.active ? 'opacity-60' : ''}`}>
            <button
              onClick={svc.action}
              disabled={!svc.active || disabled || (svc.id === 'jemput' && isSearching)}
              className={`w-[76px] h-[76px] rounded-base flex items-center justify-center transition-all duration-300 ease-out border
                ${svc.primary
                  ? 'bg-primary text-primary-foreground border-primary shadow-soft hover:bg-primary/90'
                  : 'bg-white text-neutral-500 border-neutral-200 hover:text-neutral-800 hover:border-neutral-300 hover:bg-neutral-50 shadow-soft'}
                ${svc.active && !disabled && !(svc.id === 'jemput' && isSearching) ? 'hover:-translate-y-1 active:scale-[0.95]' : 'cursor-not-allowed'}`}
            >
              {svc.id === 'jemput' && isSearching ? (
                <Loader2 size={28} className="animate-spin" />
              ) : (
                <svc.icon size={28} strokeWidth={1.5} />
              )}
            </button>
            <span className={`text-[11px] font-semibold text-center leading-tight whitespace-pre-line tracking-tight ${svc.active ? 'text-neutral-600' : 'text-neutral-400'}`}>
              {svc.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}