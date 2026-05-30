'use client'

import { useState } from 'react'
import { X, Calculator, Plus, Minus, ArrowRight } from 'lucide-react'
import { usePilahStore } from '@/store/usePilahStore'

export default function KarmaCalculator() {
  const { isCalculatorOpen, closeCalculator, startSearching } = usePilahStore()
  
  const [plastic, setPlastic] = useState(0)
  const [cardboard, setCardboard] = useState(0)
  const [glass, setGlass] = useState(0)

  if (!isCalculatorOpen) return null

  const totalPoints = (plastic * 10) + (cardboard * 5) + (glass * 8)

  const ItemRow = ({ title, img, val, setVal }: any) => (
    <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-100 rounded-2xl">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-zinc-100 flex items-center justify-center p-2">
          <img src={img} alt={title} className="w-full h-full object-contain [image-rendering:pixelated]" />
        </div>
        <span className="font-bold text-zinc-700 text-sm">{title}</span>
      </div>
      <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-zinc-200 shadow-sm">
        <button onClick={() => setVal(Math.max(0, val - 1))} className="w-8 h-8 rounded-lg bg-zinc-50 hover:bg-zinc-100 flex items-center justify-center text-zinc-500 active:scale-95 transition-all">
          <Minus size={16} />
        </button>
        <span className="font-black text-zinc-900 w-6 text-center">{val}<span className="text-[10px] font-semibold text-zinc-400">kg</span></span>
        <button onClick={() => setVal(val + 1)} className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center active:scale-95 transition-all">
          <Plus size={16} />
        </button>
      </div>
    </div>
  )

  const handleJemput = () => {
    closeCalculator()
    setTimeout(() => {
        alert("Arahkan user ke konfirmasi jemputan (Simulasi)")
    }, 300)
  }

  return (
    <div className="fixed inset-0 z-[60] flex justify-center items-end sm:items-center bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={closeCalculator} />
        <div className="relative w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2rem] p-6 sm:p-8 shadow-2xl animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300 ease-out flex flex-col max-h-[90vh]">
          
          <div className="flex justify-between items-start mb-6 shrink-0">
            <div>
                <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2 tracking-tight">
                  <Calculator size={20} className="text-blue-500" /> Kalkulator Karma
                </h2>
                <p className="text-sm font-medium text-zinc-500 mt-1">Cek estimasi poin sebelum dijemput.</p>
            </div>
              <button onClick={closeCalculator} className="p-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-100 rounded-full text-zinc-500 transition-colors active:scale-95">
                <X size={20}/>
            </button>
          </div>

          <div className="flex-grow overflow-y-auto space-y-3 pb-6 scrollbar-hide">
            <ItemRow title="Botol Plastik" img="/botol.png" val={plastic} setVal={setPlastic} />
            <ItemRow title="Kardus & Kertas" img="/kardus.png" val={cardboard} setVal={setCardboard} />
            <ItemRow title="Kaca & Beling" img="/jar.png" val={glass} setVal={setGlass} />
          </div>

          <div className="shrink-0 pt-4 border-t border-zinc-100">
            <div className="bg-zinc-900 rounded-[1.5rem] p-5 shadow-xl shadow-zinc-900/20 text-white flex items-center justify-between mb-4">
                <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Estimasi Didapat</p>
                    <p className="text-3xl font-black tracking-tight text-emerald-400">+{totalPoints}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-medium text-zinc-400">Total Berat</p>
                    <p className="text-lg font-bold">{plastic + cardboard + glass} kg</p>
                </div>
            </div>
            
            <button 
                onClick={handleJemput}
                disabled={totalPoints === 0}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-100 disabled:text-zinc-400 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] flex justify-center items-center gap-2"
            >
                Panggil Pahlawan Sekarang <ArrowRight size={18} />
            </button>
          </div>
      </div>
    </div>
  )
}