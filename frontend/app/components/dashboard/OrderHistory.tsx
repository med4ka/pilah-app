'use client'

import { useState, useEffect } from 'react'
import { Package, CheckCircle2, Clock, MapPin, Loader2, Link2, ExternalLink, X, Copy, Check } from 'lucide-react'
import { usePilahStore } from '@/store/usePilahStore'
import { getUserHistory } from '@/lib/api'

export default function OrderHistory() {
  const { token } = usePilahStore()
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (token) {
      getUserHistory(token)
        .then((data) => setHistory(data || []))
        .catch((err) => console.error("Gagal load history:", err))
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [token])

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return {
      date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400 animate-pulse">
        <Loader2 className="animate-spin mb-4 text-emerald-500" size={32} />
        <p className="text-sm font-semibold tracking-wide">Menyiapkan riwayatmu...</p>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 pb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Riwayat Jemputan</h2>
        <p className="text-sm text-zinc-500 font-medium mt-1">Lacak semua aksi pahlawanmu di sini.</p>
      </div>

      <div className="flex flex-col gap-4">
        {history.length === 0 ? (
          <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center">
            <Package size={48} className="text-zinc-300 mb-4" strokeWidth={1.5} />
            <p className="text-sm font-medium text-zinc-500 leading-relaxed">Belum ada riwayat jemputan.<br/>Mulai aksimu sekarang!</p>
          </div>
        ) : (
          history.map((order) => (
            <div 
              key={order.id} 
              onClick={() => setSelectedOrder(order)}
              className="bg-white p-5 rounded-[1.5rem] border border-zinc-100 shadow-sm flex flex-col gap-4 cursor-pointer hover:border-emerald-200 hover:shadow-[0_8px_24px_-6px_rgba(16,185,129,0.15)] hover:-translate-y-1 transition-all duration-300 active:scale-[0.98] group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300 ${
                    order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                    order.status === 'ACCEPTED' ? 'bg-amber-50 text-amber-600' :
                    'bg-blue-50 text-blue-600'
                  }`}>
                    {order.status === 'COMPLETED' ? <CheckCircle2 size={24} /> :
                     order.status === 'ACCEPTED' ? <MapPin size={24} /> :
                     <Clock size={24} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 tracking-tight">
                      {order.status === 'COMPLETED' ? 'Selesai Dijemput' :
                       order.status === 'ACCEPTED' ? 'Kolektor Menuju Lokasi' : 'Mencari Kolektor'}
                    </h3>
                    <p className="text-[11px] font-semibold text-zinc-400 mt-0.5">
                      {formatDate(order.created_at).date}, {formatDate(order.created_at).time}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black ${order.status === 'COMPLETED' ? 'text-emerald-600' : 'text-zinc-300'}`}>
                    {order.status === 'COMPLETED' ? '+50 Karma' : '0 Karma'}
                  </p>
                  <p className="text-[10px] font-bold text-zinc-300 mt-1 uppercase tracking-wider">
                    ORD-{order.id.toString().substring(0,8)}
                  </p>
                </div>
              </div>

              {order.status === 'COMPLETED' && order.ipfs_hash && (
                <div className="mt-1 pt-3 border-t border-zinc-50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-teal-700 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100/50 px-3 py-1.5 rounded-lg shadow-sm">
                    <Link2 size={12} className="text-teal-600" /> Web3 Proof Saved
                  </div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest group-hover:text-emerald-500 transition-colors">Lihat Detail</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-center items-end sm:items-center bg-zinc-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setSelectedOrder(null)} />
          
          <div className="relative w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2rem] p-6 sm:p-8 shadow-2xl animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300 ease-out">
            <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mb-6 sm:hidden" />
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black text-zinc-900 tracking-tight">Detail Transaksi</h3>
                <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-widest">ID: {selectedOrder.id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-100 rounded-full text-zinc-500 transition-colors active:scale-95">
                <X size={20}/>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-zinc-50">
                <span className="text-sm font-semibold text-zinc-500">Status</span>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-xl ${
                  selectedOrder.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                  selectedOrder.status === 'ACCEPTED' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                  'bg-blue-50 text-blue-600 border border-blue-100'
                }`}>
                  {selectedOrder.status}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-zinc-50">
                <span className="text-sm font-semibold text-zinc-500">Tanggal & Waktu</span>
                <span className="text-sm font-bold text-zinc-900 text-right">
                  {formatDate(selectedOrder.created_at).date}<br/>
                  <span className="text-xs text-zinc-400">{formatDate(selectedOrder.created_at).time} WIB</span>
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-zinc-50">
                <span className="text-sm font-semibold text-zinc-500">Karma Didapat</span>
                <span className="text-lg font-black text-emerald-600">
                  {selectedOrder.status === 'COMPLETED' ? '+50 Points' : '0 Points'}
                </span>
              </div>

              {selectedOrder.ipfs_hash && (
                <div className="pt-4 animate-in fade-in duration-500 delay-150">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Link2 size={14} className="text-emerald-500" /> Web3 IPFS Hash
                  </p>
                  <div className="bg-zinc-50 border border-zinc-200/60 rounded-[1.5rem] p-4 flex flex-col gap-4 shadow-inner">
                    <p className="text-[11px] font-mono text-zinc-600 break-all leading-relaxed bg-white p-3 rounded-xl border border-zinc-100">
                      {selectedOrder.ipfs_hash}
                    </p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleCopyHash(selectedOrder.ipfs_hash)}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                          copied ? 'bg-emerald-500 text-white shadow-md' : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                        }`}
                      >
                        {copied ? <><Check size={14} /> Tersalin!</> : <><Copy size={14} /> Salin Hash</>}
                      </button>
                      <a 
                        href={`https://gateway.pinata.cloud/ipfs/${selectedOrder.ipfs_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-md"
                      >
                        Cek Explorer <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}