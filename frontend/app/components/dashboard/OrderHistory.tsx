'use client'

import { useState, useEffect } from 'react'
import { Package, CheckCircle2, Clock, MapPin, Loader2, ExternalLink, ShieldCheck, XCircle } from 'lucide-react'
import { getUserHistory, type Pickup } from '@/lib/api'
import Dialog from '@/app/components/ui/Dialog'

export default function OrderHistory() {
  const [history, setHistory] = useState<Pickup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [selectedOrder, setSelectedOrder] = useState<Pickup | null>(null)

  useEffect(() => {
    getUserHistory()
      .then((data) => setHistory(data || []))
      .catch((err) => console.error("Gagal load history:", err))
      .finally(() => setIsLoading(false))
  }, [])

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
          <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
              <Package size={28} className="text-zinc-400" strokeWidth={1.5} />
            </div>
            <h4 className="text-base font-bold text-neutral-700">Belum ada riwayat jemputan</h4>
            <p className="text-sm text-neutral-400 mt-1.5 leading-relaxed max-w-[260px] mx-auto">Mulai aksimu sekarang!</p>
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
                    order.status === 'CANCELLED' ? 'bg-status-error/10 text-status-error' :
                    order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                    order.status === 'ACCEPTED' ? 'bg-amber-50 text-amber-600' :
                    'bg-blue-50 text-blue-600'
                  }`}>
                    {order.status === 'CANCELLED' ? <XCircle size={24} /> :
                     order.status === 'COMPLETED' ? <CheckCircle2 size={24} /> :
                     order.status === 'ACCEPTED' ? <MapPin size={24} /> :
                     <Clock size={24} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 tracking-tight">
                      {order.status === 'CANCELLED' ? 'Jemputan Dibatalkan' :
                       order.status === 'COMPLETED' ? 'Selesai Dijemput' :
                       order.status === 'ACCEPTED' ? 'Kolektor Menuju Lokasi' : 'Mencari Kolektor'}
                    </h3>
                    <p className="text-[11px] font-semibold text-zinc-400 mt-0.5">
                      {formatDate(order.created_at).date}, {formatDate(order.created_at).time}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black ${order.status === 'CANCELLED' ? 'text-status-error' : order.status === 'COMPLETED' ? 'text-emerald-600' : 'text-zinc-300'}`}>
                    {order.status === 'COMPLETED' ? `+${order.karma_earned ?? 0} Karma` : '0 Karma'}
                  </p>
                  <p className="text-[10px] font-bold text-zinc-300 mt-1 uppercase tracking-wider">
                    ORD-{order.id.toString().substring(0,8)}
                  </p>
                </div>
              </div>

              {/* Verified badge — only shows when the pickup is COMPLETED & has a proof hash */}
              {order.status === 'COMPLETED' && order.ipfs_hash && (
                <a
                  href={`https://gateway.pinata.cloud/ipfs/${order.ipfs_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title="Bukti transaksi tersimpan permanen di jaringan terdesentralisasi"
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold text-status-completed bg-status-completed/10 border border-status-completed/20 px-3 py-1.5 rounded-lg hover:bg-status-completed/15 transition-colors w-fit"
                >
                  <ShieldCheck size={12} /> Terverifikasi
                </a>
              )}
            </div>
          ))
        )}
      </div>

      <Dialog
        isOpen={selectedOrder !== null}
        onClose={() => setSelectedOrder(null)}
        title="Detail Transaksi"
        description={selectedOrder ? `ID: ${selectedOrder.id}` : undefined}
      >
        {selectedOrder && (
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-zinc-50">
            <span className="text-sm font-semibold text-zinc-500">Status</span>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-xl ${
              selectedOrder.status === 'CANCELLED' ? 'bg-status-error/10 text-status-error border border-status-error/20' :
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

          {/* Transaction proof — only shows when a proof hash exists */}
          {selectedOrder.ipfs_hash && (
            <div className="pt-4 animate-in fade-in duration-500 delay-150">
              <a
                href={`https://gateway.pinata.cloud/ipfs/${selectedOrder.ipfs_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Bukti transaksi tersimpan permanen di jaringan terdesentralisasi"
                className="w-full flex items-center justify-between bg-status-completed/10 border border-status-completed/20 rounded-[1.5rem] p-4 group hover:bg-status-completed/15 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-white rounded-xl border border-status-completed/20 text-status-completed">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-status-completed">Terverifikasi</p>
                    <p className="text-[10px] font-medium text-zinc-400">Bukti tersimpan permanen di jaringan terdesentralisasi</p>
                  </div>
                </div>
                <ExternalLink size={14} className="text-status-completed group-hover:scale-110 transition-transform" />
              </a>
            </div>
          )}
        </div>
        )}
      </Dialog>
    </div>
  )
}