'use client'

import { useState } from 'react'
import { X, BookOpen, CheckCircle2, XCircle, Camera, Loader2, Sparkles, RefreshCcw } from 'lucide-react'
import { usePilahStore } from '@/store/usePilahStore'

export default function PilahPintarSheet() {
  const { isPilahPintarOpen, closePilahPintar } = usePilahStore()
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<null | 'success'>(null)

  if (!isPilahPintarOpen) return null

  const handleStartScan = () => {
    setIsScanning(true)
    setTimeout(() => {
      setIsScanning(false)
      setScanResult('success')
    }, 2500)
  }

  const resetScan = () => {
    setIsScanning(false)
    setScanResult(null)
  }

  const categories = [
    { id: 1, name: 'Botol Plastik (PET)', icon: '🥤', status: 'Bisa Didaur Ulang', ok: true, desc: 'Cuci bersih dan remukkan sebelum dibuang.' },
    { id: 2, name: 'Kardus & Kertas', icon: '📦', status: 'Bisa Didaur Ulang', ok: true, desc: 'Pastikan kering dan tidak berminyak.' },
    { id: 3, name: 'Kaca & Beling', icon: '🫙', status: 'Bisa Didaur Ulang', ok: true, desc: 'Pisahkan dari sampah lain agar aman.' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end sm:items-center bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-300">
       <div className="absolute inset-0" onClick={closePilahPintar} />
       
       <div className="relative w-full max-w-md bg-white rounded-t-[2rem] sm:rounded-[2rem] h-[85vh] sm:h-[650px] flex flex-col shadow-2xl animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300 overflow-hidden">
          
          <div className="shrink-0 p-6 pb-4 border-b border-zinc-100 flex justify-between items-start bg-white relative z-10">
             <div>
                <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2 tracking-tight">
                  Pilah Pintar <BookOpen size={20} className="text-blue-500" />
                </h2>
                <p className="text-sm font-medium text-zinc-500 mt-1">Gunakan AI untuk cek jenis sampahmu.</p>
             </div>
             <button onClick={closePilahPintar} className="p-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-100 rounded-full text-zinc-500 transition-colors active:scale-95">
                <X size={20}/>
             </button>
          </div>

          <div className="flex-grow overflow-y-auto p-6 bg-zinc-50/50 pb-20">
             {isScanning ? (
               /* ✨ SIMULASI SCANNING UI */
               <div className="flex flex-col items-center justify-center h-full py-10 animate-in fade-in zoom-in duration-500">
                  <div className="relative w-64 h-64 bg-zinc-900 rounded-[2.5rem] overflow-hidden border-4 border-emerald-500 shadow-2xl shadow-emerald-500/20">
                     <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&q=80&w=400')] bg-cover opacity-50" />
                     {/* Scanner Line Animation */}
                     <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 shadow-[0_0_15px_#10b981] animate-[scan_2s_infinite]" />
                     <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles size={48} className="text-emerald-400 animate-pulse" />
                     </div>
                  </div>
                  <h3 className="text-lg font-black text-zinc-900 mt-8">Sedang Menganalisis...</h3>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-2 animate-pulse">Memindai Tekstur Sampah</p>
               </div>
             ) : scanResult ? (
               /* ✨ HASIL SCAN MOCKUP */
               <div className="animate-in zoom-in-95 duration-500">
                  <div className="bg-emerald-500 p-8 rounded-[2rem] text-center text-white shadow-xl shadow-emerald-500/20 mb-6">
                     <CheckCircle2 size={64} className="mx-auto mb-4" />
                     <h3 className="text-2xl font-black tracking-tight">Katalog PET Ditemukan!</h3>
                     <p className="text-emerald-50 text-sm mt-2">Ini adalah botol plastik PET 1. Bisa didaur ulang 100%.</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm mb-6">
                     <p className="text-[10px] font-bold text-zinc-400 uppercase mb-3 tracking-widest">Instruksi Pahlawan</p>
                     <ul className="space-y-3 text-sm font-bold text-zinc-700">
                        <li className="flex items-center gap-2">🟢 Cuci sisa minuman</li>
                        <li className="flex items-center gap-2">🟢 Lepas label plastik</li>
                        <li className="flex items-center gap-2">🟢 Remas botol hingga tipis</li>
                     </ul>
                  </div>
                  <button onClick={resetScan} className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
                     <RefreshCcw size={18} /> Cek Barang Lain
                  </button>
               </div>
             ) : (
               /* ✨ TAMPILAN AWAL KATALOG + TOMBOL AI SCAN */
               <div className="space-y-6">
                  <button onClick={handleStartScan} className="w-full bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-[2rem] text-white flex items-center justify-between shadow-xl shadow-emerald-500/20 group hover:-translate-y-1 transition-all active:scale-95">
                     <div className="text-left">
                        <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest mb-1">Fitur Baru</p>
                        <h3 className="text-lg font-black tracking-tight">Cek Pakai AI Camera</h3>
                        <p className="text-[11px] text-emerald-50 font-medium opacity-80">Arahkan kamera ke sampahmu.</p>
                     </div>
                     <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/20 group-hover:bg-white group-hover:text-emerald-600 transition-all">
                        <Camera size={28} />
                     </div>
                  </button>

                  <div>
                     <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4 px-1">Panduan Manual</p>
                     <div className="grid gap-3">
                        {categories.map(cat => (
                          <div key={cat.id} className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4">
                             <div className="text-2xl bg-zinc-50 w-12 h-12 flex items-center justify-center rounded-xl shrink-0 border border-zinc-100">{cat.icon}</div>
                             <div className="flex-grow">
                                <h3 className="font-bold text-zinc-900 text-sm">{cat.name}</h3>
                                <p className="text-[10px] font-bold text-emerald-600 uppercase mt-0.5 tracking-wider">{cat.status}</p>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
             )}
          </div>
       </div>
    </div>
  )
}