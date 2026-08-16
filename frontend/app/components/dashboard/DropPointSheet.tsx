'use client'

import { MapPin, Navigation, Clock } from 'lucide-react'
import { useUIStore } from '@/store/useUIStore'
import Dialog from '@/app/components/ui/Dialog'

export default function DropPointSheet() {
  const { isDropPointSheetOpen, closeDropPointSheet } = useUIStore()

  // Drop point data (mockup)
  const dropPoints = [
    { id: 1, name: 'Pilah Box - Grand Indonesia', desc: 'Lantai LG, dekat eskalator Timur', dist: '1.2 km', lat: -6.1952, lng: 106.8216, open: true },
    { id: 2, name: 'Bank Sampah Berkah Menteng', desc: 'Jl. Menteng Raya No.14', dist: '2.5 km', lat: -6.1906, lng: 106.8333, open: true },
    { id: 3, name: 'Pilah Box - Stasiun Sudirman', desc: 'Pintu Keluar Selatan', dist: '3.1 km', lat: -6.2020, lng: 106.8211, open: false },
  ]

  return (
    <Dialog
      isOpen={isDropPointSheetOpen}
      onClose={closeDropPointSheet}
      title="Drop Point Terdekat"
      description="Lagi di jalan? Taruh sendiri aja!"
    >
      <div className="flex flex-col gap-4">
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
            {point.open ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${point.lat},${point.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:scale-95"
              >
                Arahkan <Navigation size={14} />
              </a>
            ) : (
              <span className="text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 bg-zinc-50 text-zinc-400 cursor-not-allowed">
                Arahkan <Navigation size={14} />
              </span>
            )}
            </div>
          </div>
        ))}
      </div>
    </Dialog>
  )
}