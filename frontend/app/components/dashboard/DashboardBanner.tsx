'use client'

import { Recycle } from 'lucide-react'

export default function DashboardBanner() {
  return (
    <div className="rounded-base border border-neutral-200 bg-white shadow-soft p-5 flex items-start gap-4">
      <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <Recycle size={20} strokeWidth={1.5} className="text-primary" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-neutral-900 tracking-tight">Ubah Sampah Jadi Berkah</h3>
        <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
          Setiap botol yang dipilah menyelamatkan bumi & menambah Karma-mu.
        </p>
      </div>
    </div>
  )
}