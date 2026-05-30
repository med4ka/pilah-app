'use client'

import { useState } from 'react'
import { X, HeartHandshake, TreePine, Droplets, BookOpen, CheckCircle2, Loader2 } from 'lucide-react'
import { usePilahStore } from '@/store/usePilahStore'

export default function DonasiSheet() {
  const { isDonasiOpen, closeDonasi, userData } = usePilahStore()
  
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null)
  const [donateAmount, setDonateAmount] = useState<number | ''>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const points = userData?.karma_points || 0

  if (!isDonasiOpen) return null

  const campaigns = [
    { id: 1, title: '1.000 Mangrove untuk Jakarta', target: 'Terkumpul 45.000 / 100.000 Karma', progress: 45, icon: TreePine, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { id: 2, title: 'Air Bersih Desa Suka Maju', target: 'Terkumpul 12.000 / 50.000 Karma', progress: 24, icon: Droplets, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { id: 3, title: 'Buku Pantas untuk Panti Asuhan', target: 'Terkumpul 8.500 / 25.000 Karma', progress: 34, icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  ]

  const handleDonate = () => {
    if (!selectedCampaign || !donateAmount || Number(donateAmount) <= 0) return
    if (Number(donateAmount) > points) {
      alert("Karma tidak cukup!")
      return
    }

    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setIsSuccess(true)
    }, 2000)
  }

  const resetAndClose = () => {
    setIsSuccess(false)
    setSelectedCampaign(null)
    setDonateAmount('')
    closeDonasi()
  }

  return (
    <div className="fixed inset-0 z-[60] flex justify-center items-end sm:items-center bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-300">
       <div className="absolute inset-0" onClick={resetAndClose} />
       
       <div className="relative w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2rem] p-6 pb-12 sm:pb-8 shadow-2xl animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300 ease-out flex flex-col max-h-[90vh]">
          
          <div className="flex justify-between items-start mb-6 shrink-0">
             <div>
                <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2 tracking-tight">
                  <HeartHandshake size={22} className="text-rose-500" /> Donasi Berkah
                </h2>
                <p className="text-sm font-medium text-zinc-500 mt-1">Ubah Karma-mu jadi manfaat nyata.</p>
             </div>
             <button onClick={resetAndClose} className="p-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-100 rounded-full text-zinc-500 transition-colors active:scale-95">
                <X size={20}/>
             </button>
          </div>

          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-10 animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <CheckCircle2 size={48} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-black text-zinc-900 mb-2">Alhamdulillah!</h3>
                <p className="text-sm text-zinc-500 text-center leading-relaxed font-medium mb-8 px-4">
                    Donasi sebesar <span className="font-bold text-zinc-900">{donateAmount} Karma</span> berhasil disalurkan. Terima kasih, Pahlawan!
                </p>
                <button onClick={resetAndClose} className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold active:scale-95 transition-all">
                    Selesai
                </button>
            </div>
          ) : (
            <>
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center justify-between mb-6 shrink-0">
                    <div>
                        <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-0.5">Saldo Karma Aktif</p>
                        <p className="text-xl font-black text-rose-700">{points.toLocaleString('id-ID')} Poin</p>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto space-y-3 pb-6 pr-1 scrollbar-hide">
                    {campaigns.map((camp) => (
                        <div 
                            key={camp.id} 
                            onClick={() => setSelectedCampaign(camp.id)}
                            className={`p-4 rounded-[1.5rem] border-2 transition-all cursor-pointer ${selectedCampaign === camp.id ? 'border-rose-500 bg-rose-50/30' : 'border-zinc-100 bg-white hover:border-zinc-200'}`}
                        >
                            <div className="flex gap-4 items-center">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${camp.bg} ${camp.color} border ${camp.border}`}>
                                    <camp.icon size={24} />
                                </div>
                                <div className="flex-grow">
                                    <h3 className="font-bold text-sm text-zinc-900 leading-tight mb-1">{camp.title}</h3>
                                    <p className="text-[10px] font-semibold text-zinc-500 mb-2">{camp.target}</p>
                                    <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${camp.progress}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {selectedCampaign && (
                    <div className="shrink-0 pt-4 border-t border-zinc-100 animate-in slide-in-from-bottom-4 duration-300">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 block px-1">Nominal Donasi</label>
                        <div className="flex gap-3 mb-4">
                            {[50, 100, 500].map(val => (
                                <button 
                                    key={val}
                                    onClick={() => setDonateAmount(val)}
                                    className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${donateAmount === val ? 'bg-rose-100 border-rose-200 text-rose-700' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
                                >
                                    {val}
                                </button>
                            ))}
                        </div>
                        <input 
                            type="number" 
                            placeholder="Ketik nominal lain..." 
                            value={donateAmount}
                            onChange={(e) => setDonateAmount(Number(e.target.value))}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3.5 mb-4 text-sm font-bold focus:outline-none focus:border-rose-500 transition-all"
                        />
                        <button 
                            onClick={handleDonate}
                            disabled={!donateAmount || Number(donateAmount) <= 0 || Number(donateAmount) > points || isProcessing}
                            className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-zinc-100 disabled:text-zinc-400 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] flex justify-center items-center gap-2"
                        >
                            {isProcessing ? <Loader2 size={18} className="animate-spin" /> : 'Kirim Donasi'}
                        </button>
                    </div>
                )}
            </>
          )}
       </div>
    </div>
  )
}