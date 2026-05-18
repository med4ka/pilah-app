'use client'

import { Recycle, ArrowRight } from 'lucide-react'

export default function DashboardBanner() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-[2rem] p-6 text-white shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)] border border-emerald-400/30 group cursor-pointer transition-all hover:shadow-[0_15px_35px_-10px_rgba(16,185,129,0.6)] hover:-translate-y-1 active:scale-[0.98]">
      
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-900/30 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative z-10 w-3/4">
        <h3 className="font-black text-xl mb-1.5 leading-tight tracking-tight drop-shadow-md">
          Ubah Sampah<br/>Jadi Berkah!
        </h3>
        <p className="text-[11px] font-medium text-emerald-50 opacity-90 mb-5 leading-relaxed drop-shadow-sm max-w-[90%]">
          Setiap botol yang dipilah menyelamatkan bumi & menambah Karma-mu.
        </p>
        <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 group-hover:bg-white group-hover:text-emerald-700">
          Mulai Sekarang <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
      
      <Recycle size={140} className="absolute -right-8 -bottom-8 text-white opacity-10 -rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-500" strokeWidth={1} />
    </div>
  )
}