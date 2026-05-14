'use client'

import { X, BookOpen, CheckCircle2, XCircle } from 'lucide-react'
import { usePilahStore } from '@/store/usePilahStore'

export default function PilahPintarSheet() {
  const { isPilahPintarOpen, closePilahPintar } = usePilahStore()

  if (!isPilahPintarOpen) return null

  // Data Panduan Daur Ulang
  const categories = [
    { id: 1, name: 'Botol Plastik (PET)', icon: '🥤', status: 'Bisa Didaur Ulang', ok: true, desc: 'Cuci bersih dan remukkan sebelum dibuang.' },
    { id: 2, name: 'Kardus & Kertas', icon: '📦', status: 'Bisa Didaur Ulang', ok: true, desc: 'Pastikan kering dan tidak berminyak.' },
    { id: 3, name: 'Kaca & Beling', icon: '🫙', status: 'Bisa Didaur Ulang', ok: true, desc: 'Pisahkan dari sampah lain agar aman.' },
    { id: 4, name: 'Styrofoam Makanan', icon: '🥡', status: 'Tidak Diterima', ok: false, desc: 'Sulit didaur ulang, kurangi penggunaannya.' },
    { id: 5, name: 'Baterai & Elektronik', icon: '🔋', status: 'Penanganan Khusus', ok: false, desc: 'Serahkan ke drop point E-Waste khusus.' }
  ]

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end sm:items-center bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-300">
       <div className="absolute inset-0" onClick={closePilahPintar} />
       
       <div className="relative w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2rem] h-[85vh] sm:h-[600px] flex flex-col shadow-2xl animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300 overflow-hidden">
          
          <div className="shrink-0 p-6 pb-4 border-b border-zinc-100 flex justify-between items-start bg-white relative z-10">
             <div>
                <div className="w-12 h-1.5 bg-zinc-200 rounded-full mb-6 sm:hidden" />
                <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2 tracking-tight">
                  Pilah Pintar <BookOpen size={20} className="text-blue-500" />
                </h2>
                <p className="text-sm font-medium text-zinc-500 mt-1">Panduan lengkap daur ulang sampahmu.</p>
             </div>
             <button onClick={closePilahPintar} className="p-2 bg-zinc-50 hover:bg-zinc-100 rounded-full text-zinc-500 transition-colors active:scale-95">
                <X size={20}/>
             </button>
          </div>

          {/* LIST KATALOG */}
          <div className="flex-grow overflow-y-auto p-6 bg-zinc-50/50 pb-20">
             <div className="grid gap-4">
                {categories.map(cat => (
                  <div key={cat.id} className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex items-start gap-4 hover:border-zinc-300 transition-colors">
                     <div className="text-3xl bg-zinc-50 w-14 h-14 flex items-center justify-center rounded-[1rem] shrink-0 border border-zinc-100">
                       {cat.icon}
                     </div>
                     <div>
                        <h3 className="font-bold text-zinc-900">{cat.name}</h3>
                        <div className={`flex items-center gap-1.5 mt-1 mb-1.5 text-[10px] font-bold uppercase tracking-wider ${cat.ok ? 'text-emerald-600' : 'text-red-500'}`}>
                          {cat.ok ? <CheckCircle2 size={12} strokeWidth={3}/> : <XCircle size={12} strokeWidth={3}/>} {cat.status}
                        </div>
                        <p className="text-xs font-medium text-zinc-500 leading-relaxed">{cat.desc}</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  )
}