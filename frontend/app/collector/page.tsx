'use client'

import { useState, useEffect } from 'react'
import { MapPin, Loader2, Radar, CheckCircle2, AlertCircle, User as UserIcon, Truck, History, LayoutDashboard, TrendingUp, Star, LogOut, Wallet, ShieldCheck, Navigation, Crosshair } from 'lucide-react'
import { usePilahStore } from '@/store/usePilahStore'
import { getPendingPickups, acceptPickup, completePickup, getCollectorHistory } from '@/lib/api'
import AuthModal from '@/app/components/AuthModal'

// Konstanta titik statis untuk ilusi sebaran peta (Lightweight Prototype)
const MAP_POSITIONS = [
  { top: '30%', left: '20%' },
  { top: '60%', left: '70%' },
  { top: '25%', left: '60%' },
  { top: '75%', left: '35%' },
  { top: '40%', left: '80%' },
]

export default function CollectorDashboard() {
  const { token, userData, openAuthModal, logout } = usePilahStore()
  const [activeTab, setActiveTab] = useState<'radar' | 'history' | 'profile'>('radar')

  // States Utama
  const [pickups, setPickups] = useState<any[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)
  const [activeOrder, setActiveOrder] = useState<any | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // State Peta & History
  const [selectedPickup, setSelectedPickup] = useState<any | null>(null)
  const [historyData, setHistoryData] = useState<any[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  useEffect(() => {
    if (activeTab === 'history' && token) {
      setIsLoadingHistory(true)
      getCollectorHistory(token)
        .then(data => setHistoryData(data || []))
        .catch(err => console.error("Gagal muat history:", err))
        .finally(() => setIsLoadingHistory(false))
    }
  }, [activeTab, token])

  const completedMissions = historyData.filter(item => item.status === 'COMPLETED').length
  const totalKarma = completedMissions * 25

  const scanArea = async () => {
    if (!token) { openAuthModal(); return }
    setIsScanning(true); setMessage(null); setSelectedPickup(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      const data = await getPendingPickups(token) 
      setPickups(data || [])
      if (!data || data.length === 0) setMessage({ type: 'error', text: 'Area bersih. Belum ada sampah yang butuh dijemput.' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Gagal memindai area' })
    } finally { setIsScanning(false) }
  }

  const handleAccept = async (pickup: any) => {
    if (!token) { openAuthModal(); return }
    setIsProcessing(true)
    try {
      await acceptPickup(token, pickup.id.toString())
      setSelectedPickup(null)
      setActiveOrder(pickup)
      setPickups([])
      setMessage({ type: 'success', text: 'Target terkunci. Segera menuju lokasi User.' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Gagal mengambil orderan' })
    } finally { setIsProcessing(false) }
  }

  const handleComplete = async () => {
    if (!token || !activeOrder) return
    setIsProcessing(true)
    try {
      await completePickup(token, activeOrder.id.toString())
      setActiveOrder(null)
      setMessage({ type: 'success', text: 'Misi Selesai. Karma didistribusikan.' })
      getCollectorHistory(token).then(data => setHistoryData(data || [])) 
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Gagal menyelesaikan orderan' })
    } finally { setIsProcessing(false) }
  }

  const handleLogout = () => {
    if (window.confirm('Yakin ingin mengakhiri shift hari ini?')) logout()
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center sm:p-8">
      <main className="w-full max-w-md h-[100dvh] sm:h-[850px] bg-white flex flex-col relative overflow-hidden sm:rounded-[2.5rem] shadow-2xl border border-zinc-100">
        <AuthModal />

        {/* HEADER */}
        <header className="px-6 pt-10 pb-4 bg-white z-10 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                {token && userData ? `Shift Berjalan` : 'Sistem Kolektor'}
              </span>
              <h1 className="text-2xl font-black text-zinc-900 tracking-tight mt-1 flex items-center gap-2">
                {activeTab === 'radar' ? 'Radar Area' : activeTab === 'history' ? 'Riwayat Tugas' : 'Profil Mitra'} 
              </h1>
            </div>
            <button onClick={() => !token ? openAuthModal() : null} className="w-11 h-11 rounded-full bg-zinc-50 border border-zinc-200/80 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 transition-all active:scale-95 shadow-sm">
              {token ? <span className="text-sm font-bold text-emerald-600">{userData?.name.charAt(0).toUpperCase()}</span> : <UserIcon size={20} strokeWidth={2} />}
            </button>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <div className="flex-grow overflow-y-auto px-6 pt-2 pb-32">
          
          {message && activeTab === 'radar' && (
            <div className={`mb-6 p-4 rounded-2xl flex items-start gap-3 text-sm font-medium border animate-in fade-in ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
              {message.type === 'success' ? <CheckCircle2 className="shrink-0 mt-0.5" size={18} /> : <AlertCircle className="shrink-0 mt-0.5" size={18} />}
              <p className="leading-relaxed">{message.text}</p>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: RADAR (PROTOTIPE LIVE MAP)                             */}
          {/* ========================================================= */}
          {activeTab === 'radar' && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300 flex flex-col h-full">
              
              {/* CSS MAP CANVAS */}
              <div className="relative w-full h-[300px] sm:h-[350px] bg-[#fcfcfc] rounded-[2rem] border border-zinc-200 overflow-hidden shadow-inner mb-6 shrink-0">
                {/* Grid Pattern (City Blocks Illusion) */}
                <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(#000000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                
                {/* Center Point (Kolektor) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                   <div className="relative flex items-center justify-center">
                      <div className="w-5 h-5 bg-zinc-900 rounded-full border-2 border-white shadow-md z-10" />
                      <div className="absolute inset-0 bg-zinc-900 rounded-full animate-ping opacity-30" />
                      {isScanning && <div className="absolute w-40 h-40 border border-zinc-900/10 rounded-full animate-[ping_2s_infinite]" />}
                   </div>
                   <span className="mt-2 text-[10px] font-bold text-zinc-900 bg-white/80 px-2 py-0.5 rounded-full backdrop-blur-sm border border-zinc-100 shadow-sm">Posisi Anda</span>
                </div>

                {/* Map Markers (Titik Sampah) */}
                {!activeOrder && pickups.map((pickup, idx) => {
                  const pos = MAP_POSITIONS[idx % MAP_POSITIONS.length]
                  const isSelected = selectedPickup?.id === pickup.id
                  return (
                    <button 
                      key={pickup.id}
                      onClick={() => setSelectedPickup(pickup)}
                      className={`absolute -translate-x-1/2 -translate-y-full flex flex-col items-center justify-end transition-all duration-300 ${isSelected ? 'z-30 scale-110' : 'z-20 hover:scale-105'}`}
                      style={{ top: pos.top, left: pos.left }}
                    >
                      <div className={`p-2 rounded-full shadow-lg transition-colors ${isSelected ? 'bg-zinc-900 text-white' : 'bg-emerald-500 text-white'}`}>
                        <MapPin size={isSelected ? 20 : 16} />
                      </div>
                      <div className={`w-1 h-3 bg-gradient-to-b ${isSelected ? 'from-zinc-900' : 'from-emerald-500'} to-transparent`} />
                    </button>
                  )
                })}

                {/* Route Illusion (Saat Menerima Order) */}
                {activeOrder && (
                   <>
                     <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                       <line x1="50%" y1="50%" x2="30%" y2="30%" stroke="#10b981" strokeWidth="3" strokeDasharray="6 6" className="animate-[dash_1s_linear_infinite] opacity-50" />
                     </svg>
                     <div className="absolute top-[30%] left-[30%] -translate-x-1/2 -translate-y-full z-20 flex flex-col items-center animate-bounce">
                        <div className="bg-emerald-500 text-white p-2.5 rounded-full shadow-lg">
                          <MapPin size={20} />
                        </div>
                        <div className="w-1 h-3 bg-gradient-to-b from-emerald-500 to-transparent" />
                     </div>
                   </>
                )}
              </div>

              {/* ACTION AREA BOTTOM */}
              <div className="flex-grow">
                 {activeOrder ? (
                   <div className="bg-white p-6 rounded-[2rem] border border-emerald-100 shadow-sm animate-in slide-in-from-bottom-4">
                      <h3 className="font-black text-xl text-zinc-900 mb-1">Menuju Lokasi Target</h3>
                      <p className="text-sm font-medium text-zinc-500 mb-6 flex items-center gap-2">
                        <Navigation size={14}/> ID Target: {activeOrder.id.toString().substring(0,8)}
                      </p>
                      <button onClick={handleComplete} disabled={isProcessing} className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all bg-emerald-500 text-white hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-70">
                        {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={20} /> Konfirmasi Selesai</>}
                      </button>
                   </div>
                 ) : selectedPickup ? (
                   <div className="bg-white p-5 rounded-[1.5rem] border border-zinc-900 shadow-lg animate-in slide-in-from-bottom-4">
                      <div className="flex items-center justify-between mb-5">
                         <div>
                           <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Permintaan Baru</p>
                           <p className="font-bold text-zinc-900 text-lg mt-0.5">ID: {selectedPickup.id.toString().substring(0,8)}</p>
                         </div>
                         <div className="bg-zinc-100 p-2.5 rounded-full text-zinc-600">
                           <Crosshair size={20} />
                         </div>
                      </div>
                      <button onClick={() => handleAccept(selectedPickup)} disabled={isProcessing} className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2">
                         {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <><MapPin size={18} /> Ambil Tugas Ini</>}
                      </button>
                   </div>
                 ) : (
                   <div className="flex flex-col items-center justify-center py-6 opacity-60">
                     <Radar size={40} className="text-zinc-300 mb-3" />
                     <p className="text-sm font-medium text-zinc-400 text-center px-4">Tekan tombol scan di bawah untuk memperbarui radar.</p>
                   </div>
                 )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: HISTORY                                                */}
          {/* ========================================================= */}
          {activeTab === 'history' && (
            <div className="animate-in fade-in duration-300">
              {!isLoadingHistory && (
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 bg-white p-4 rounded-[1.5rem] border border-zinc-100 shadow-sm flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                      <TrendingUp size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">Misi Selesai</span>
                    </div>
                    <span className="text-2xl font-black text-zinc-900">{completedMissions}</span>
                  </div>
                  <div className="flex-1 bg-emerald-600 p-4 rounded-[1.5rem] shadow-md flex flex-col gap-1 text-white">
                    <div className="flex items-center gap-1.5 text-emerald-100 mb-1">
                      <Star size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">Total Karma</span>
                    </div>
                    <span className="text-2xl font-black">{totalKarma}</span>
                  </div>
                </div>
              )}

              {isLoadingHistory ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-emerald-500" /></div>
              ) : historyData.length === 0 ? (
                <div className="bg-white border border-dashed border-zinc-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                  <Truck size={40} className="text-zinc-300 mb-3" />
                  <p className="text-sm font-medium text-zinc-500">Belum ada tugas yang diselesaikan.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 px-1">Riwayat Perjalanan</p>
                  {historyData.map(item => (
                    <div key={item.id} className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex justify-between items-center hover:border-emerald-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-full ${item.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-50 text-zinc-600'}`}>
                          {item.status === 'COMPLETED' ? <CheckCircle2 size={20} /> : <Truck size={20} />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-zinc-900">{item.status === 'COMPLETED' ? 'Misi Selesai' : 'Sedang Berjalan'}</p>
                          <p className="text-[10px] font-medium text-zinc-400">{new Date(item.updated_at).toLocaleDateString('id-ID', {day: 'numeric', month:'short', hour:'2-digit', minute:'2-digit'})}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-black ${item.status === 'COMPLETED' ? 'text-emerald-600' : 'text-zinc-300'}`}>
                          {item.status === 'COMPLETED' ? '+25 Karma' : '-'}
                        </span>
                        <p className="text-[10px] font-bold text-zinc-300 uppercase mt-0.5">#{item.id.toString().substring(0,6)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: PROFILE                                                */}
          {/* ========================================================= */}
          {activeTab === 'profile' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              {userData ? (
                <>
                  <div className="bg-white p-5 rounded-[2rem] border border-zinc-100 shadow-sm flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                      <UserIcon size={28} className="text-emerald-600" />
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-1.5 truncate">
                        {userData.name} <ShieldCheck size={18} className="text-emerald-500 shrink-0" />
                      </h3>
                      <p className="text-sm font-medium text-zinc-500 truncate">{userData.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                         <span className="text-[10px] font-bold text-zinc-600 bg-zinc-100 px-2 py-1 rounded-md uppercase tracking-wider">Mitra Aktif</span>
                         <span className="text-[10px] font-bold text-zinc-900 bg-zinc-100 px-2 py-1 rounded-md flex items-center gap-1 uppercase tracking-wider"><Star size={10} className="fill-zinc-900 text-zinc-900"/> 4.9 Rating</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-1">Detail Operasional</p>
                    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden flex flex-col">
                      <div className="flex items-center justify-between p-4 border-b border-zinc-50 w-full text-left">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-zinc-50 rounded-xl"><Truck size={18} className="text-zinc-700"/></div>
                          <span className="font-semibold text-zinc-700 text-sm">Jenis Kendaraan</span>
                        </div>
                        <span className="text-sm font-bold text-zinc-900">Motor Bak</span>
                      </div>
                      <div className="flex items-center justify-between p-4 border-b border-zinc-50 w-full text-left">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-zinc-50 rounded-xl"><MapPin size={18} className="text-zinc-700"/></div>
                          <span className="font-semibold text-zinc-700 text-sm">Area Operasional</span>
                        </div>
                        <span className="text-sm font-bold text-zinc-900">Jakarta Pusat</span>
                      </div>
                      <div className="flex items-center justify-between p-4 w-full text-left">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-zinc-50 rounded-xl"><Wallet size={18} className="text-zinc-700"/></div>
                          <span className="font-semibold text-zinc-700 text-sm">Rekening Pencairan</span>
                        </div>
                        <span className="text-sm font-bold text-zinc-900">BCA ****1234</span>
                      </div>
                    </div>
                  </div>

                  <button onClick={handleLogout} className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 border border-red-100">
                    <LogOut size={20} /> Akhiri Shift
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <ShieldCheck size={48} className="text-zinc-200 mb-4" />
                  <p className="text-zinc-500 font-medium mb-4">Silakan masuk untuk melihat profil mitra.</p>
                  <button onClick={openAuthModal} className="bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold">Masuk Sekarang</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* BOTTOM NAVIGATION BAR */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-zinc-100 px-6 py-4 flex flex-col gap-4 z-20">
          {activeTab === 'radar' && !activeOrder && (
            <button onClick={scanArea} disabled={isScanning} className="w-full bg-zinc-900 text-white font-bold py-4 rounded-2xl flex justify-center items-center gap-2 hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-80 shadow-md">
              {isScanning ? <Loader2 className="animate-spin" size={20} /> : <><Radar size={18} /> Scan Area</>}
            </button>
          )}
          
          <div className="flex justify-between items-center px-2">
            <button onClick={() => setActiveTab('radar')} className={`flex-1 flex flex-col items-center gap-1.5 p-2 rounded-xl transition-colors ${activeTab === 'radar' ? 'text-zinc-900' : 'text-zinc-400 hover:bg-zinc-50'}`}>
              <LayoutDashboard size={24} strokeWidth={activeTab === 'radar' ? 2.5 : 2} />
              <span className="text-[10px] font-bold tracking-wide uppercase">Radar</span>
            </button>
            <button onClick={() => setActiveTab('history')} className={`flex-1 flex flex-col items-center gap-1.5 p-2 rounded-xl transition-colors ${activeTab === 'history' ? 'text-zinc-900' : 'text-zinc-400 hover:bg-zinc-50'}`}>
              <History size={24} strokeWidth={activeTab === 'history' ? 2.5 : 2} />
              <span className="text-[10px] font-bold tracking-wide uppercase">Riwayat</span>
            </button>
            <button onClick={() => setActiveTab('profile')} className={`flex-1 flex flex-col items-center gap-1.5 p-2 rounded-xl transition-colors ${activeTab === 'profile' ? 'text-zinc-900' : 'text-zinc-400 hover:bg-zinc-50'}`}>
              <UserIcon size={24} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
              <span className="text-[10px] font-bold tracking-wide uppercase">Profil</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}