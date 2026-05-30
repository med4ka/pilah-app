'use client'

import { useState, useEffect, useCallback } from 'react'
import { MapPin, Loader2, Radar, CheckCircle2, AlertCircle, User as UserIcon, Truck, History, LayoutDashboard, TrendingUp, Star, LogOut, Wallet, ShieldCheck, Navigation, Crosshair, Scale, X, Camera, Upload, RefreshCw } from 'lucide-react'
import { usePilahStore } from '@/store/usePilahStore'
import { getPendingPickups, acceptPickup, completePickup, getCollectorHistory, getUserProfile, confirmPickupUser } from '@/lib/api'
import AuthModal from '@/app/components/AuthModal'
import CollectorProfileView from '../collector/CollectorProfileView'

const MAP_POSITIONS = [
  { top: '30%', left: '20%' },
  { top: '60%', left: '70%' },
  { top: '25%', left: '60%' },
  { top: '75%', left: '35%' },
  { top: '40%', left: '80%' },
]

export default function CollectorDashboard() {
  const { token, userData, setUserData, openAuthModal, logout } = usePilahStore()
  const [activeTab, setActiveTab] = useState<'radar' | 'history' | 'profile'>('radar')

  const [mounted, setMounted] = useState(false)
  const [pickups, setPickups] = useState<any[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)
  const [activeOrder, setActiveOrder] = useState<any | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const [selectedPickup, setSelectedPickup] = useState<any | null>(null)
  const [historyData, setHistoryData] = useState<any[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  const [weighingOrder, setWeighingOrder] = useState<any | null>(null)
  const [plastic, setPlastic] = useState<string>('')
  const [cardboard, setCardboard] = useState<string>('')
  const [glass, setGlass] = useState<string>('') 
  const [photoTaken, setPhotoTaken] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (token && mounted && !userData) {
      getUserProfile(token)
        .then(data => setUserData(data))
        .catch(err => {
          if (err.message.includes('Sesi')) logout()
        })
    }
  }, [token, userData, setUserData, logout, mounted])

  const fetchHistory = useCallback(async () => {
    if (!token) return;
    setIsLoadingHistory(true);
    try {
      const data = await getCollectorHistory(token);
      setHistoryData(data || []);
    } catch (err) {
      console.error("Gagal muat history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === 'history' && mounted) {
      fetchHistory();
    }
  }, [activeTab, mounted, fetchHistory])

  const completedMissions = historyData.filter(item => item.status === 'COMPLETED').length
  const totalKarma = completedMissions * 25

  const scanArea = async () => {
    if (!token) { openAuthModal(); return }
    setIsScanning(true); setMessage(null); setSelectedPickup(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      const data = await getPendingPickups(token).catch(() => [
        { id: '03383e4a', latitude: 0, longitude: 0 },
        { id: 'dummy-5e6f7g8h', latitude: 0, longitude: 0 }
      ]) 
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
      await acceptPickup(token, pickup.id.toString()).catch(() => console.log('Simulasi terima order'))
      setSelectedPickup(null)
      setActiveOrder({...pickup, status: 'ACCEPTED'})
      setPickups([])
      setMessage({ type: 'success', text: '🎯 Target Terkunci! Lokasi warga dikirim ke Navigasi.' })
      setTimeout(() => setMessage(null), 4000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Gagal mengambil orderan' })
    } finally { setIsProcessing(false) }
  }

  const handleSubmitWeighing = async () => {
    if (!plastic && !cardboard && !glass) {
      alert("Masukkan minimal satu berat sampah!")
      return
    }
    setIsProcessing(true)
    try {
      const payload = {
        plastic_weight: parseFloat(plastic) || 0,
        cardboard_weight: parseFloat(cardboard) || 0,
        glass_weight: parseFloat(glass) || 0,
        photo_url: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=500" 
      }
      
      await completePickup(token!, weighingOrder.id.toString(), payload).catch(() => console.log('Simulasi kirim timbangan'))
      
      setMessage({ type: 'success', text: 'Timbangan Terkirim! Warga sedang mereview...' })
      setActiveOrder({...weighingOrder, status: 'VERIFYING'})
      setWeighingOrder(null)
      setPhotoTaken(false)
      setPlastic('')
      setCardboard('')
      setGlass('')
      
      fetchHistory() 
      setTimeout(() => setMessage(null), 4000)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setIsProcessing(false)
    }
  }

  const forceCompleteOrder = async () => {
    if (!token || !activeOrder) return
    setIsProcessing(true)
    try {
      await confirmPickupUser(token, activeOrder.id.toString()).catch(() => console.log('Simulasi warga setuju'))
      setMessage({ type: 'success', text: 'Misi Selesai! Riwayat telah diperbarui!' })
      setActiveOrder(null)
      fetchHistory()
      setTimeout(() => setMessage(null), 5000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Gagal konfirmasi orderan' })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleLogout = () => {
    if (window.confirm('Yakin ingin mengakhiri shift hari ini?')) logout()
  }

  const handleDecimalInput = (val: string, setter: any) => {
    const cleanVal = val.replace(/[^0-9.]/g, '') 
    setter(cleanVal)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center sm:p-8 selection:bg-emerald-100">
      <main className="w-full max-w-md h-[100dvh] sm:h-[850px] bg-white flex flex-col relative overflow-hidden sm:rounded-[2.5rem] shadow-2xl border border-zinc-100">
        <AuthModal />

        {message && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-5 fade-in duration-300 w-full px-4">
            <div className="bg-zinc-900/95 backdrop-blur-md text-white px-5 py-4 rounded-2xl shadow-2xl shadow-emerald-900/20 text-xs font-bold border border-zinc-800 flex items-center gap-3 w-full">
              {message.type === 'success' ? <CheckCircle2 className="text-emerald-400 shrink-0" size={20} /> : <AlertCircle className="text-red-400 shrink-0" size={20} />}
              <span className="leading-snug">{message.text}</span>
            </div>
          </div>
        )}

        <header className="px-6 pt-10 pb-4 bg-white z-10 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-md">
                {token && userData ? `Shift Berjalan` : 'Sistem Mitra'}
              </span>
              <h1 className="text-2xl font-black text-zinc-900 tracking-tight mt-2 flex items-center gap-2">
                {activeTab === 'radar' ? 'Radar Area' : activeTab === 'history' ? 'Riwayat Tugas' : 'Profil Mitra'} 
              </h1>
            </div>
            <button onClick={() => !token ? openAuthModal() : null} className="w-11 h-11 rounded-full bg-zinc-50 border border-zinc-200/80 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 transition-all active:scale-95 shadow-sm">
              {token && userData ? <span className="text-sm font-bold text-emerald-600">{userData.name.charAt(0).toUpperCase()}</span> : <UserIcon size={20} strokeWidth={2} />}
            </button>
          </div>
        </header>

        <div className="flex-grow overflow-y-auto px-6 pt-2 pb-32 scrollbar-hide">
          {activeTab === 'radar' && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300 flex flex-col h-full">
              
              <div className="relative w-full h-[320px] sm:h-[350px] bg-zinc-50 rounded-[2rem] border border-zinc-200/80 overflow-hidden shadow-inner mb-6 shrink-0">
                <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: 'radial-gradient(#000000 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }} />
                
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                  <div className="relative flex items-center justify-center">
                      <div className="w-6 h-6 bg-emerald-600 rounded-full border-2 border-white shadow-md z-10" />
                      <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-40" />
                      {isScanning && <div className="absolute w-48 h-48 border-[1.5px] border-emerald-500/20 rounded-full animate-[ping_2s_infinite]" />}
                  </div>
                  <span className="mt-2 text-[10px] font-bold text-zinc-700 bg-white/90 px-3 py-1 rounded-full backdrop-blur-md border border-zinc-100 shadow-sm">Posisi Truk</span>
                </div>

                {!activeOrder && pickups.map((pickup, idx) => {
                  const pos = MAP_POSITIONS[idx % MAP_POSITIONS.length]
                  const isSelected = selectedPickup?.id === pickup.id
                  return (
                    <button 
                      key={pickup.id}
                      onClick={() => setSelectedPickup(pickup)}
                      className={`absolute -translate-x-1/2 -translate-y-full flex flex-col items-center justify-end transition-all duration-500 ease-out ${isSelected ? 'z-30 scale-125' : 'z-20 hover:scale-110'}`}
                      style={{ top: pos.top, left: pos.left }}
                    >
                      <div className={`p-2.5 rounded-full shadow-lg transition-colors ${isSelected ? 'bg-zinc-900 text-white animate-bounce' : 'bg-white text-zinc-600 border border-zinc-200'}`}>
                        <MapPin size={isSelected ? 18 : 16} strokeWidth={isSelected ? 2.5 : 2} />
                      </div>
                      <div className={`w-1 h-3 bg-gradient-to-b ${isSelected ? 'from-zinc-900' : 'from-zinc-400'} to-transparent`} />
                    </button>
                  )
                })}

                {activeOrder && (
                  <>
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                      <line x1="50%" y1="50%" x2="30%" y2="30%" stroke="#10b981" strokeWidth="3" strokeDasharray="6 6" className="animate-[dash_1s_linear_infinite] opacity-60" />
                    </svg>
                    <div className="absolute top-[30%] left-[30%] -translate-x-1/2 -translate-y-full z-20 flex flex-col items-center animate-bounce">
                        <div className="bg-zinc-900 text-emerald-400 p-3 rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.2)]">
                          <MapPin size={20} strokeWidth={2.5} />
                        </div>
                        <div className="w-1.5 h-4 bg-gradient-to-b from-zinc-900 to-transparent" />
                    </div>
                  </>
                )}
              </div>

              <div className="flex-grow flex flex-col justify-end">
                {activeOrder ? (
                  <div className="bg-white p-6 rounded-[2rem] border border-emerald-100 shadow-[0_10px_30px_-10px_rgba(16,185,129,0.2)] animate-in slide-in-from-bottom-4">
                      <h3 className="font-black text-xl text-zinc-900 mb-1">Status Operasional</h3>
                      <p className="text-sm font-semibold text-zinc-500 mb-6 flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-lg w-fit">
                        <Navigation size={14} className="text-emerald-500"/> ID: {activeOrder.id}
                      </p>
                      
                      {activeOrder.status === 'VERIFYING' ? (
                        <div className="space-y-3">
                          <div className="w-full py-3.5 bg-amber-50 text-amber-600 text-sm font-bold rounded-[1.25rem] flex items-center justify-center gap-2 border border-amber-200">
                            <Loader2 size={18} className="animate-spin" /> Menunggu Warga Setuju...
                          </div>
                          <button onClick={forceCompleteOrder} disabled={isProcessing} className="w-full py-3 bg-zinc-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md">
                            {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <><CheckCircle2 size={14} /> (Simulasi) Setujui & Selesaikan Misi</>}
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setWeighingOrder(activeOrder)} disabled={isProcessing} className="w-full py-4 rounded-[1.25rem] font-bold flex items-center justify-center gap-2 transition-all bg-emerald-500 text-white hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-70 shadow-md shadow-emerald-500/20">
                          <Scale size={20} /> Input Timbangan & Foto
                        </button>
                      )}
                  </div>
                ) : selectedPickup ? (
                  <div className="bg-zinc-900 p-6 rounded-[2rem] shadow-xl animate-in slide-in-from-bottom-4 border border-zinc-800 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                      <div className="flex items-center justify-between mb-6 relative z-10">
                        <div>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Permintaan Baru</p>
                          <p className="font-black text-white text-lg mt-0.5">ID: {selectedPickup.id}</p>
                        </div>
                        <div className="bg-zinc-800/50 border border-zinc-700 p-3 rounded-2xl text-emerald-400 backdrop-blur-sm">
                          <Crosshair size={24} />
                        </div>
                      </div>
                      <button onClick={() => handleAccept(selectedPickup)} disabled={isProcessing} className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-[1.25rem] transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2 relative z-10 shadow-lg">
                        {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <><MapPin size={18} /> Ambil Tugas Ini</>}
                      </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6">
                    <button onClick={scanArea} disabled={isScanning} className="w-full bg-zinc-900 text-white font-bold py-4 rounded-[1.25rem] flex justify-center items-center gap-2 hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-80 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.3)]">
                      {isScanning ? <Loader2 className="animate-spin" size={20} /> : <><Radar size={18} /> Scan Area Sekarang</>}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex gap-4 mb-6">
                <div className="flex-1 bg-white p-5 rounded-[1.5rem] border border-zinc-100 shadow-sm flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                    <TrendingUp size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Misi Selesai</span>
                  </div>
                  <span className="text-3xl font-black text-zinc-900">{completedMissions}</span>
                </div>
                <div className="flex-1 bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 rounded-[1.5rem] shadow-md flex flex-col gap-1 text-white relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 bg-white/10 w-24 h-24 rounded-full blur-xl" />
                  <div className="flex items-center gap-1.5 text-emerald-100 mb-1 relative z-10">
                    <Star size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Total Karma</span>
                  </div>
                  <span className="text-3xl font-black relative z-10">{totalKarma}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-3 px-1">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Riwayat Perjalanan</p>
                <button 
                  onClick={fetchHistory} 
                  disabled={isLoadingHistory}
                  className="text-[10px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw size={12} className={isLoadingHistory ? "animate-spin" : ""} /> Segarkan Data
                </button>
              </div>

              {isLoadingHistory ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-emerald-500" /></div>
              ) : historyData.length === 0 ? (
                <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center">
                  <Truck size={40} className="text-zinc-300 mb-4" strokeWidth={1.5} />
                  <p className="text-sm font-medium text-zinc-500 leading-relaxed">Belum ada tugas yang diselesaikan.<br/>Aktifkan radar untuk memulai!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historyData.map(item => (
                    <div key={item.id} className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex justify-between items-center hover:border-emerald-200 transition-all hover:shadow-md hover:-translate-y-0.5 group">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${item.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-50 text-zinc-600'}`}>
                          {item.status === 'COMPLETED' ? <CheckCircle2 size={20} /> : <Truck size={20} />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-zinc-900 tracking-tight">{item.status === 'COMPLETED' ? 'Misi Selesai' : 'Sedang Berjalan'}</p>
                          <p className="text-[10px] font-semibold text-zinc-400 mt-0.5">{new Date(item.updated_at).toLocaleDateString('id-ID', {day: 'numeric', month:'short', hour:'2-digit', minute:'2-digit'})}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-black ${item.status === 'COMPLETED' ? 'text-emerald-600' : 'text-zinc-300'}`}>
                          {item.status === 'COMPLETED' ? '+25 Karma' : '-'}
                        </span>
                        <p className="text-[10px] font-bold text-zinc-300 uppercase mt-1 tracking-widest">#{item.id.toString().substring(0,6)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        {activeTab === 'profile' && <CollectorProfileView userData={userData} onLogout={handleLogout} />}
        </div>

        {weighingOrder && (
          <div className="absolute inset-0 z-50 flex justify-center items-end bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="absolute inset-0" onClick={() => setWeighingOrder(null)} />
            <div className="relative w-full bg-white rounded-t-[2.5rem] p-6 pb-10 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
                <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mb-6" />
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-black flex items-center gap-2 tracking-tight">
                    <Scale size={20} className="text-emerald-500" /> Verifikasi Sampah
                  </h3>
                  <button onClick={() => setWeighingOrder(null)} className="p-2 bg-zinc-50 hover:bg-zinc-100 rounded-full text-zinc-500 transition-colors"><X size={20}/></button>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 mb-1.5 block">Botol Plastik (KG)</label>
                    <input type="text" inputMode="decimal" placeholder="Contoh: 2.5" value={plastic} onChange={(e) => handleDecimalInput(e.target.value, setPlastic)} className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 font-bold text-zinc-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all shadow-inner placeholder:text-zinc-300" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 mb-1.5 block">Kardus & Kertas (KG)</label>
                    <input type="text" inputMode="decimal" placeholder="Contoh: 1.0" value={cardboard} onChange={(e) => handleDecimalInput(e.target.value, setCardboard)} className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 font-bold text-zinc-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all shadow-inner placeholder:text-zinc-300" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 mb-1.5 block">Botol Kaca (KG)</label>
                    <input type="text" inputMode="decimal" placeholder="Contoh: 0.5" value={glass} onChange={(e) => handleDecimalInput(e.target.value, setGlass)} className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 font-bold text-zinc-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all shadow-inner placeholder:text-zinc-300" />
                  </div>
                </div>

                <button 
                  onClick={() => setPhotoTaken(true)}
                  className={`w-full py-5 rounded-[1.5rem] border-2 border-dashed flex flex-col items-center justify-center gap-2 mb-6 transition-all ${photoTaken ? 'bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm' : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100 hover:border-zinc-300'}`}
                >
                  {photoTaken ? <><CheckCircle2 size={28} /> <span className="font-bold text-sm">Foto Timbangan Tersimpan</span></> : <><Camera size={28} /> <span className="font-bold text-sm">Jepret Foto Bukti Fisik</span></>}
                </button>

                <button 
                  onClick={handleSubmitWeighing} disabled={!photoTaken || isProcessing}
                  className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:bg-zinc-100 disabled:text-zinc-400 active:scale-[0.98] transition-all shadow-lg"
                >
                  {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <><Upload size={20} /> Kirim Data Warga</>}
                </button>
            </div>
          </div>
        )}

        <div className="absolute bottom-6 left-0 right-0 px-6 z-30 flex justify-center pointer-events-none">
          <nav className="w-full max-w-[320px] bg-white/80 backdrop-blur-xl border border-white/60 px-6 py-3.5 flex justify-between items-center shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] rounded-full pointer-events-auto">
            {[
              { id: 'radar', icon: LayoutDashboard, label: 'Radar' },
              { id: 'history', icon: History, label: 'Riwayat' },
              { id: 'profile', icon: UserIcon, label: 'Profil' }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id as any)}
                  className="flex flex-col items-center gap-1 transition-all duration-300 relative group w-16"
                >
                  {isActive && <div className="absolute -top-3 w-1 h-1 bg-emerald-500 rounded-full animate-in fade-in zoom-in duration-300" />}
                  <div className={`transition-all duration-300 ${isActive ? 'text-emerald-600 -translate-y-1' : 'text-zinc-400 group-hover:text-zinc-600 group-hover:-translate-y-0.5 group-active:scale-95'}`}>
                    <tab.icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'drop-shadow-sm' : ''} />
                  </div>
                  <span className={`text-[10px] transition-all duration-300 ${isActive ? 'font-bold text-emerald-700 opacity-100' : 'font-semibold text-zinc-400 opacity-0 absolute -bottom-4'}`}>
                    {tab.label}
                  </span>
                </button>
              )
            })}
          </nav>
        </div>
      </main>
    </div>
  )
}