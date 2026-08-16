'use client'

import { BookOpen, CheckCircle2, XCircle } from 'lucide-react'
import { useUIStore } from '@/store/useUIStore'
import Dialog from '@/app/components/ui/Dialog'

export default function PilahPintarSheet() {
  const { isPilahPintarOpen, closePilahPintar } = useUIStore()

  const categories = [
    { id: 1, name: 'Botol Plastik (PET)', icon: '🥤', status: 'Bisa Didaur Ulang', ok: true, desc: 'Cuci bersih dan remukkan sebelum dibuang.' },
    { id: 2, name: 'Kardus & Kertas', icon: '📦', status: 'Bisa Didaur Ulang', ok: true, desc: 'Pastikan kering dan tidak berminyak.' },
    { id: 3, name: 'Kaca & Beling', icon: '🫙', status: 'Bisa Didaur Ulang', ok: true, desc: 'Pisahkan dari sampah lain agar aman.' },
    { id: 4, name: 'Styrofoam Makanan', icon: '🥡', status: 'Tidak Diterima', ok: false, desc: 'Sulit didaur ulang, kurangi penggunaannya.' },
    { id: 5, name: 'Baterai & Elektronik', icon: '🔋', status: 'Penanganan Khusus', ok: false, desc: 'Serahkan ke drop point E-Waste khusus.' }
  ]

  return (
    <Dialog
      isOpen={isPilahPintarOpen}
      onClose={closePilahPintar}
      title={<span className="flex items-center gap-2">Pilah Pintar <BookOpen size={20} className="text-blue-500" /></span>}
      description="Panduan lengkap daur ulang sampahmu."
    >
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
    </Dialog>
  )
}