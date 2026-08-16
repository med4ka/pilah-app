'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MapPin, Loader2, Radar, CheckCircle2, AlertCircle, User as UserIcon, Truck, History, LayoutDashboard, TrendingUp, Star, LogOut, Wallet, ShieldCheck, Navigation, Crosshair, Pencil, Coins, Smartphone, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useUIStore } from '@/store/useUIStore'
import { useCollectorPaymentMethodStore } from '@/store/useCollectorPaymentMethodStore'
import { getPendingPickups, acceptPickup, completePickup, getCollectorHistory, updateProfile, type Pickup, type UserProfile } from '@/lib/api'
import AuthModal from '@/app/components/AuthModal'
import Dialog from '@/app/components/ui/Dialog'
import PaymentMethodEditor from '@/app/components/ui/PaymentMethodEditor'
import CollectorEarningsSheet from '@/app/components/dashboard/CollectorEarningsSheet'
import CollectorCompleteDialog from '@/app/components/dashboard/CollectorCompleteDialog'
import { tapScale, hoverScale, transitionFast, fadeSlideUp } from '@/lib/motion'

// Safe helper to read an error message without assuming its type.
function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

// Build resident weight-estimate chips (~2kg Plastik) — only materials with a
// value > 0. If all are 0 (user skipped), return an empty array (render nothing,
// following the DESIGN.md empty-state principle: no empty placeholder).
function buildEstimateChips(pickup: Pickup): string[] {
  const chips: string[] = []
  const fmt = (v?: number) => (v ?? 0).toLocaleString('id-ID', { maximumFractionDigits: 1 })
  if ((pickup.est_plastic_weight ?? 0) > 0) chips.push(`${fmt(pickup.est_plastic_weight)}kg Plastik`)
  if ((pickup.est_cardboard_weight ?? 0) > 0) chips.push(`${fmt(pickup.est_cardboard_weight)}kg Kardus`)
  if ((pickup.est_glass_weight ?? 0) > 0) chips.push(`${fmt(pickup.est_glass_weight)}kg Kaca`)
  return chips
}

// Static points for the scattered radar-map illusion
const MAP_POSITIONS = [
  { top: '30%', left: '20%' },
  { top: '60%', left: '70%' },
  { top: '25%', left: '60%' },
  { top: '75%', left: '35%' },
  { top: '40%', left: '80%' },
]

export default function CollectorDashboard() {
  const { userData, setUserData, logout } = useAuthStore()
  const { openAuthModal } = useUIStore()
  const { collectorMethods, selectedCollectorMethodId, setSelectedCollectorMethodId, addCollectorMethod } = useCollectorPaymentMethodStore()
  const [activeTab, setActiveTab] = useState<'radar' | 'history' | 'profile'>('radar')

  const [pickups, setPickups] = useState<Pickup[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)
  const [activeOrder, setActiveOrder] = useState<Pickup | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const [selectedPickup, setSelectedPickup] = useState<Pickup | null>(null)
  const [historyData, setHistoryData] = useState<Pickup[] | null>(null)
  const [isEarningsOpen, setIsEarningsOpen] = useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [isCompleteOpen, setIsCompleteOpen] = useState(false)

  useEffect(() => {
    if ((activeTab === 'history' || activeTab === 'profile') && userData) {
      getCollectorHistory()
        .then(data => setHistoryData(data || []))
        .catch(err => {
          console.error("Gagal muat history:", err)
          setHistoryData([])
        })
    }
  }, [activeTab, userData])

  const isLoadingHistory = activeTab === 'history' && historyData === null
  const completedMissions = (historyData || []).filter(item => item.status === 'COMPLETED').length
  // Collector earnings from COMPLETED pickups in history (counted backend, sent via
  // earnings_earned). More informative for "history stats" than the total
  // collector_earnings balance (which accumulates across sessions).
  const totalEarnings = (historyData || []).reduce<number>((sum, item) => sum + (item.status === 'COMPLETED' ? (item.earnings_earned ?? 0) : 0), 0)

  const scanArea = async () => {
    if (!userData) { openAuthModal(); return }
    setIsScanning(true); setMessage(null); setSelectedPickup(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      const data = await getPendingPickups() 
      setPickups(data || [])
      if (!data || data.length === 0) setMessage({ type: 'error', text: 'Area bersih. Belum ada sampah yang butuh dijemput.' })
    } catch (error) {
      setMessage({ type: 'error', text: errorMessage(error, 'Gagal memindai area') })
    } finally { setIsScanning(false) }
  }

  const handleAccept = async (pickup: Pickup) => {
    if (!userData) { openAuthModal(); return }
    setIsProcessing(true)
    try {
      await acceptPickup(pickup.id.toString())
      setSelectedPickup(null)
      setActiveOrder(pickup)
      setPickups([])
      setMessage({ type: 'success', text: 'Target terkunci. Segera menuju lokasi User.' })
    } catch (error) {
      setMessage({ type: 'error', text: errorMessage(error, 'Gagal mengambil orderan') })
    } finally { setIsProcessing(false) }
  }

  const submitVerification = async (input: { plasticWeight: number; cardboardWeight: number; glassWeight: number }) => {
    if (!userData || !activeOrder) return
    setIsProcessing(true)
    try {
      await completePickup(activeOrder.id.toString(), {
        plastic_weight: input.plasticWeight,
        cardboard_weight: input.cardboardWeight,
        glass_weight: input.glassWeight,
      })
      setActiveOrder(null)
      setIsCompleteOpen(false)
      setMessage({ type: 'success', text: 'Berat tercatat. Menunggu konfirmasi warga.' })
      getCollectorHistory().then(data => setHistoryData(data || [])) 
    } catch (error) {
      setMessage({ type: 'error', text: errorMessage(error, 'Gagal menyelesaikan orderan') })
    } finally { setIsProcessing(false) }
  }

  const handleLogout = () => {
    if (window.confirm('Yakin ingin mengakhiri shift hari ini?')) logout()
  }

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [profileDraft, setProfileDraft] = useState({ vehicleType: '', serviceArea: '', bankName: '', bankAccountNumber: '' })

  const openEditProfile = () => {
    setProfileDraft({
      vehicleType: userData?.vehicle_type || '',
      serviceArea: userData?.service_area || '',
      bankName: userData?.bank_name || '',
      bankAccountNumber: userData?.bank_account_number || '',
    })
    setIsEditProfileOpen(true)
  }

  const saveProfileMitra = async () => {
    if (!userData) return
    try {
      const updated: UserProfile = await updateProfile({
        vehicle_type: profileDraft.vehicleType.trim(),
        service_area: profileDraft.serviceArea.trim(),
        bank_name: profileDraft.bankName.trim(),
        bank_account_number: profileDraft.bankAccountNumber.trim(),
      })
      setUserData({
        ...userData,
        vehicle_type: updated.vehicle_type,
        service_area: updated.service_area,
        bank_name: updated.bank_name,
        bank_account_number: updated.bank_account_number,
      })
      setIsEditProfileOpen(false)
      setMessage({ type: 'success', text: 'Profil mitra diperbarui!' })
    } catch (error) {
      setMessage({ type: 'error', text: errorMessage(error, 'Gagal menyimpan profil') })
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <main className="w-full h-[100dvh] md:max-w-xl md:mx-auto flex flex-col relative overflow-hidden">
        <AuthModal />
        <CollectorEarningsSheet isOpen={isEarningsOpen} onClose={() => setIsEarningsOpen(false)} />
        <CollectorCompleteDialog
          isOpen={isCompleteOpen}
          onClose={() => setIsCompleteOpen(false)}
          isProcessing={isProcessing}
          onSubmit={submitVerification}
        />

        <header className="px-6 pt-10 pb-4 bg-white z-10 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                {userData ? `Shift Berjalan` : 'Sistem Kolektor'}
              </span>
              <h1 className="text-2xl font-black text-neutral-900 tracking-tight mt-1 flex items-center gap-2">
                {activeTab === 'radar' ? 'Radar Area' : activeTab === 'history' ? 'Riwayat Tugas' : 'Profil Mitra'} 
              </h1>
            </div>
            <button onClick={() => !userData ? openAuthModal() : null} className="w-11 h-11 rounded-full bg-neutral-50 border border-neutral-200/80 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition-all active:scale-95 shadow-soft">
              {userData ? <span className="text-sm font-bold text-primary">{userData?.name.charAt(0).toUpperCase()}</span> : <UserIcon size={20} strokeWidth={2} />}
            </button>
          </div>
        </header>

        <div className="flex-grow overflow-y-auto px-5 pt-3 pb-32">
          
          {message && (activeTab === 'radar' || activeTab === 'profile') && (
            <div className={`mb-4 p-3.5 rounded-base flex items-start gap-3 text-sm font-medium border animate-in fade-in ${message.type === 'success' ? 'bg-status-completed/10 text-status-completed border-status-completed/20' : 'bg-status-error/10 text-status-error border-status-error/20'}`}>
              {message.type === 'success' ? <CheckCircle2 className="shrink-0 mt-0.5" size={18} /> : <AlertCircle className="shrink-0 mt-0.5" size={18} />}
              <p className="leading-relaxed">{message.text}</p>
            </div>
          )}

          {activeTab === 'radar' && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300 flex flex-col h-full">
              
              <div className="relative w-full h-[260px] sm:h-[300px] bg-neutral-50 rounded-base border border-neutral-200 overflow-hidden shadow-soft mb-4 shrink-0">
                {/* Grid pattern to simulate city blocks */}
                <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(var(--color-neutral-500) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                   <div className="relative flex items-center justify-center">
                      <div className="w-5 h-5 bg-neutral-900 rounded-full border-2 border-white shadow-md z-10" />
                      <div className="absolute inset-0 bg-neutral-900 rounded-full animate-ping opacity-30" />
                      {isScanning && <div className="absolute w-40 h-40 border border-neutral-900/10 rounded-full animate-[ping_2s_infinite]" />}
                   </div>
                   <span className="mt-2 text-[10px] font-bold text-neutral-900 bg-white/80 px-2 py-0.5 rounded-full backdrop-blur-sm border border-neutral-100 shadow-soft">Posisi Anda</span>
                </div>

                {!activeOrder && (
                  <AnimatePresence>
                    {pickups.map((pickup, idx) => {
                      const pos = MAP_POSITIONS[idx % MAP_POSITIONS.length]
                      const isSelected = selectedPickup?.id === pickup.id
                      return (
                        <motion.button
                          key={pickup.id}
                          onClick={() => setSelectedPickup(pickup)}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={transitionFast}
                          className={`absolute -translate-x-1/2 -translate-y-full flex flex-col items-center justify-end transition-all duration-300 ${isSelected ? 'z-30 scale-110' : 'z-20 hover:scale-105'}`}
                          style={{ top: pos.top, left: pos.left }}
                        >
                          <div className={`p-2 rounded-full shadow-md transition-colors text-white ${isSelected ? 'bg-neutral-900' : 'bg-status-pending'}`}>
                            <MapPin size={isSelected ? 20 : 16} />
                          </div>
                          <div className={`w-1 h-3 bg-gradient-to-b ${isSelected ? 'from-neutral-900' : 'from-status-pending'} to-transparent`} />
                        </motion.button>
                      )
                    })}
                  </AnimatePresence>
                )}

                {/* Simulated route while an order is active */}
                {activeOrder && (
                   <>
                     <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                       <line x1="50%" y1="50%" x2="30%" y2="30%" stroke="var(--color-status-completed)" strokeWidth="3" strokeDasharray="6 6" className="animate-[dash_1s_linear_infinite] opacity-50" />
                     </svg>
                     <div className="absolute top-[30%] left-[30%] -translate-x-1/2 -translate-y-full z-20 flex flex-col items-center animate-bounce">
                        <div className="bg-status-completed text-white p-2.5 rounded-full shadow-md">
                          <MapPin size={20} />
                        </div>
                        <div className="w-1 h-3 bg-gradient-to-b from-status-completed to-transparent" />
                     </div>
                   </>
                )}
              </div>

              <div className="flex-grow">
                 {activeOrder ? (
                   <div className="bg-white p-5 rounded-base border border-status-completed/30 shadow-soft animate-in slide-in-from-bottom-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">Order Aktif</p>
                          <h3 className="font-black text-lg text-neutral-900">Menuju Lokasi Target</h3>
                        </div>
                        <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider">#{activeOrder.id.toString().substring(0,8)}</span>
                      </div>
                      <p className="text-xs font-semibold text-neutral-400 mb-5 flex items-center gap-1.5">
                        <Navigation size={14}/> Gas! Segera menuju titik pengambilan.
                      </p>
                      <motion.button onClick={() => setIsCompleteOpen(true)} disabled={isProcessing} whileTap={tapScale} transition={transitionFast} className="w-full min-h-[48px] rounded-base font-bold flex items-center justify-center gap-2 transition-colors bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-70 shadow-soft">
                        {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={20} /> Konfirmasi Selesai</>}
                      </motion.button>
                   </div>
                 ) : pickups.length > 0 ? (
                   <div className="space-y-3">
                     <div className="flex items-center justify-between mb-1 px-1">
                       <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{pickups.length} Titik Jemput Tersedia</p>
                       <span className="text-[10px] font-semibold text-neutral-400">Ketuk pin untuk sorot</span>
                     </div>
                      <AnimatePresence>
                       {pickups.map((pickup) => {
                         const isSelected = selectedPickup?.id === pickup.id
                         const estChips = buildEstimateChips(pickup)
                         return (
                           <motion.div
                             key={pickup.id}
                             {...fadeSlideUp}
                             exit={{ opacity: 0, y: -8, transition: transitionFast }}
                             whileHover={hoverScale}
                             className={`bg-white rounded-base border p-3 shadow-soft transition-colors ${isSelected ? 'border-status-pending/50' : 'border-neutral-200/80'}`}
                           >
                             <div className="flex items-center gap-3">
                               <div className={`p-2 rounded-base shrink-0 ${isSelected ? 'bg-status-pending/10 text-status-pending' : 'bg-neutral-100 text-neutral-500'}`}>
                                 <Crosshair size={18} strokeWidth={1.75} />
                               </div>
                               <div className="flex-1 min-w-0">
                                 <div className="flex items-center gap-2">
                                   <p className="font-bold text-sm text-neutral-900 truncate">#{pickup.id.toString().substring(0, 8)}</p>
                                   <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-status-pending/10 text-status-pending uppercase tracking-wider shrink-0">Pending</span>
                                 </div>
                                 <p className="text-[11px] font-medium text-neutral-400 truncate mt-0.5">
                                   {(pickup.latitude ?? 0).toFixed(4)}, {(pickup.longitude ?? 0).toFixed(4)}
                                 </p>
                                  {/* Resident weight estimate (optional) — shown only when a value is > 0 */}
                                 {estChips.length > 0 && (
                                   <div className="flex flex-wrap gap-1.5 mt-1.5">
                                     {estChips.map((chip) => (
                                       <span
                                         key={chip}
                                         className="text-[10px] font-bold text-neutral-600 bg-neutral-100 border border-neutral-200 rounded-full px-2 py-0.5 tracking-tight"
                                       >
                                         ~{chip}
                                       </span>
                                     ))}
                                   </div>
                                 )}
                               </div>
                             </div>
                            <motion.button onClick={() => handleAccept(pickup)} disabled={isProcessing} whileTap={tapScale} transition={transitionFast} className="mt-3 w-full min-h-11 rounded-base font-bold flex items-center justify-center gap-2 transition-colors bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-70 shadow-soft">
                              {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <><MapPin size={18} /> Ambil Tugas Ini</>}
                            </motion.button>
                          </motion.div>
                        )
                      })}
                      </AnimatePresence>
                    </div>
                 ) : ( 
                   <div className="flex flex-col items-center justify-center py-6 text-center">
                     <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
                       <Radar size={28} className="text-neutral-400" strokeWidth={1.5} />
                     </div>
                     <h4 className="text-base font-bold text-neutral-700">Belum ada titik jemput</h4>
                     <p className="text-sm text-neutral-400 mt-1 leading-relaxed max-w-[260px] mx-auto">Tekan tombol scan di bawah untuk memperbarui radar.</p>
                   </div>
                 )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="animate-in fade-in duration-300">
              {!isLoadingHistory && (
                <div className="flex gap-3 mb-5">
                  <div className="flex-1 bg-white p-4 rounded-base border border-neutral-200/80 shadow-soft flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
                      <TrendingUp size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">Misi Selesai</span>
                    </div>
                    <span className="text-2xl font-black text-neutral-900">{completedMissions}</span>
                  </div>
                  <div className="flex-1 bg-status-completed p-4 rounded-base shadow-soft flex flex-col gap-1 text-primary-foreground">
                    <div className="flex items-center gap-1.5 opacity-80 mb-1">
                      <Star size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">Total Pendapatan</span>
                    </div>
                    <span className="text-2xl font-black tabular-nums">Rp {totalEarnings.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              )}

              {isLoadingHistory ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
              ) : (historyData || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-300">
                  <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                    <Truck size={28} className="text-neutral-400" strokeWidth={1.5} />
                  </div>
                  <h4 className="text-base font-bold text-neutral-700">Belum ada tugas selesai</h4>
                  <p className="text-sm text-neutral-400 mt-1.5 leading-relaxed max-w-[260px] mx-auto">Tugas yang kamu selesaikan akan muncul di sini.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1 px-1">Riwayat Perjalanan</p>
                  <AnimatePresence>
                  {(historyData || []).map(item => (
                    <motion.div
                      key={item.id}
                      {...fadeSlideUp}
                      exit={{ opacity: 0, y: -8, transition: transitionFast }}
                      whileHover={hoverScale}
                      className="bg-white p-3.5 rounded-base border border-neutral-200/80 shadow-soft flex justify-between items-center"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-full shrink-0 ${item.status === 'COMPLETED' ? 'bg-status-completed/10 text-status-completed' : 'bg-status-pending/10 text-status-pending'}`}>
                          {item.status === 'COMPLETED' ? <CheckCircle2 size={18} /> : <Truck size={18} />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm text-neutral-900">{item.status === 'COMPLETED' ? 'Misi Selesai' : 'Sedang Berjalan'}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${item.status === 'COMPLETED' ? 'bg-status-completed/10 text-status-completed' : 'bg-status-pending/10 text-status-pending'}`}>
                              {item.status === 'COMPLETED' ? 'Selesai' : 'Aktif'}
                            </span>
                          </div>
                          <p className="text-[10px] font-medium text-neutral-400 mt-0.5">{new Date(item.updated_at).toLocaleDateString('id-ID', {day: 'numeric', month:'short', hour:'2-digit', minute:'2-digit'})}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-xs font-black ${item.status === 'COMPLETED' ? 'text-status-completed' : 'text-neutral-300'}`}>
                          {item.status === 'COMPLETED' ? `Rp ${(item.earnings_earned ?? 0).toLocaleString('id-ID')}` : '-'}
                        </span>
                        <p className="text-[10px] font-bold text-neutral-300 uppercase mt-0.5">#{item.id.toString().substring(0,6)}</p>
                      </div>
                    </motion.div>
                  ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              {userData ? (
                <>
                  <div className="bg-white p-5 rounded-base border border-neutral-200/80 shadow-soft flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center shrink-0 border border-primary/20">
                      <UserIcon size={28} className="text-primary" />
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-1.5 truncate">
                        {userData.name} <ShieldCheck size={18} className="text-primary shrink-0" />
                      </h3>
                      <p className="text-sm font-medium text-neutral-500 truncate">{userData.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                         <span className="text-[10px] font-bold text-primary bg-primary/5 border border-primary/20 px-2 py-1 rounded-md uppercase tracking-wider">Mitra Aktif</span>
                         <span className="text-[10px] font-bold text-neutral-600 bg-neutral-100 px-2 py-1 rounded-md flex items-center gap-1 uppercase tracking-wider"><CheckCircle2 size={10} className="text-status-completed"/> {completedMissions} Pickup Selesai</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-3">
                    {/* Earnings balance + withdraw — balance self-refreshes after
                        redeem because CollectorEarningsSheet calls getUserProfile(). */}
                    <motion.button
                      onClick={() => setIsEarningsOpen(true)}
                      whileTap={tapScale}
                      transition={transitionFast}
                      className="w-full bg-white p-5 rounded-base border border-primary/40 shadow-soft text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-28 h-28 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-2xl bg-primary/5 border border-primary/15">
                            <Coins className="text-primary" size={22} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Saldo Pendapatan</p>
                            <p className="text-2xl font-black text-neutral-900 tabular-nums">Rp {(userData?.collector_earnings ?? 0).toLocaleString('id-ID')}</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-primary bg-primary/5 border border-primary/20 px-3 py-1.5 rounded-full">Tarik</span>
                      </div>
                    </motion.button>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="bg-white rounded-base border border-neutral-200/80 shadow-soft overflow-hidden flex flex-col">
                      <button onClick={() => setIsPaymentOpen(true)} className="flex items-center justify-between p-4 w-full text-left">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-neutral-100 rounded-base"><Smartphone size={18} className="text-neutral-700"/></div>
                          <div>
                            <span className="font-semibold text-neutral-700 text-sm block">Metode Pembayaran</span>
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Tujuan pendapatan dicairkan</span>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-neutral-300" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="bg-white rounded-base border border-neutral-200/80 shadow-soft overflow-hidden flex flex-col">
                      <div className="flex items-center justify-between p-4 border-b border-neutral-100 w-full text-left">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-neutral-100 rounded-base"><Truck size={18} className="text-neutral-700"/></div>
                          <span className="font-semibold text-neutral-700 text-sm">Jenis Kendaraan</span>
                        </div>
                        <span className="text-sm font-bold text-neutral-900">{userData.vehicle_type || 'Belum diatur'}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 border-b border-neutral-100 w-full text-left">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-neutral-100 rounded-base"><MapPin size={18} className="text-neutral-700"/></div>
                          <span className="font-semibold text-neutral-700 text-sm">Area Operasional</span>
                        </div>
                        <span className="text-sm font-bold text-neutral-900">{userData.service_area || 'Belum diatur'}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 w-full text-left">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-neutral-100 rounded-base"><Wallet size={18} className="text-neutral-700"/></div>
                          <span className="font-semibold text-neutral-700 text-sm">Rekening Pencairan</span>
                        </div>
                        <span className="text-sm font-bold text-neutral-900">{userData.bank_name ? `${userData.bank_name} ${userData.bank_account_number || ''}`.trim() : 'Belum diatur'}</span>
                      </div>
                    </div>
                  </div>

                  <motion.button onClick={openEditProfile} whileTap={tapScale} transition={transitionFast} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-base transition-colors flex items-center justify-center gap-2 shadow-soft mb-6">
                    <Pencil size={18} /> Edit Profil Mitra
                  </motion.button>

                  <motion.button onClick={handleLogout} whileTap={tapScale} transition={transitionFast} className="w-full bg-status-error/5 hover:bg-status-error/10 text-status-error font-bold py-4 rounded-base transition-colors flex items-center justify-center gap-2 border border-status-error/20">
                    <LogOut size={20} /> Akhiri Shift
                  </motion.button>

                  <Dialog
                    isOpen={isEditProfileOpen}
                    onClose={() => setIsEditProfileOpen(false)}
                    title="Edit Profil Mitra"
                    description="Data ini yang dilihat warga saat memilih kamu di radar."
                  >
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1 mb-1 block">Jenis Kendaraan</label>
                        <input
                          type="text"
                          value={profileDraft.vehicleType}
                          onChange={(e) => setProfileDraft({ ...profileDraft, vehicleType: e.target.value })}
                          placeholder="Contoh: Motor Bak, Mobil Pickup"
                          className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3.5 text-neutral-900 font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-soft"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1 mb-1 block">Area Operasional</label>
                        <input
                          type="text"
                          value={profileDraft.serviceArea}
                          onChange={(e) => setProfileDraft({ ...profileDraft, serviceArea: e.target.value })}
                          placeholder="Contoh: Jakarta Pusat"
                          className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3.5 text-neutral-900 font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-soft"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1 mb-1 block">Nama Bank</label>
                          <input
                            type="text"
                            value={profileDraft.bankName}
                            onChange={(e) => setProfileDraft({ ...profileDraft, bankName: e.target.value })}
                            placeholder="BCA"
                            className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3.5 text-neutral-900 font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-soft"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1 mb-1 block">No. Rekening</label>
                          <input
                            type="text"
                            value={profileDraft.bankAccountNumber}
                            onChange={(e) => setProfileDraft({ ...profileDraft, bankAccountNumber: e.target.value })}
                            placeholder="1234567890"
                            className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3.5 text-neutral-900 font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-soft"
                          />
                        </div>
                      </div>
                      <motion.button onClick={saveProfileMitra} whileTap={tapScale} transition={transitionFast} className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3.5 rounded-xl transition-colors mt-4 shadow-md">
                        Simpan Perubahan
                      </motion.button>
                    </div>
                  </Dialog>

                  <Dialog
                    isOpen={isPaymentOpen}
                    onClose={() => setIsPaymentOpen(false)}
                    title="Metode Pembayaran"
                    description="Tujuan saldo pendapatanmu dicairkan."
                  >
                    <PaymentMethodEditor
                      methods={collectorMethods}
                      selectedMethodId={selectedCollectorMethodId}
                      onSelect={setSelectedCollectorMethodId}
                      onAdd={(method) => {
                        addCollectorMethod({ ...method, id: `cmethod-${Date.now()}` })
                        setMessage({ type: 'success', text: 'Metode pembayaran ditambahkan.' })
                      }}
                      onInvalid={() => setMessage({ type: 'error', text: '⚠️ Isi nama dan nomor/akun metode dulu.' })}
                    />
                  </Dialog>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-300">
                  <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                    <ShieldCheck size={28} className="text-neutral-400" strokeWidth={1.5} />
                  </div>
                  <h4 className="text-base font-bold text-neutral-700">Belum masuk sebagai mitra</h4>
                  <p className="text-sm text-neutral-400 mt-1.5 leading-relaxed max-w-[260px] mx-auto mb-4">Silakan masuk untuk melihat profil mitra.</p>
                  <motion.button onClick={openAuthModal} whileTap={tapScale} transition={transitionFast} className="bg-primary text-primary-foreground px-6 py-3 rounded-base font-bold">Masuk Sekarang</motion.button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-4 py-2.5 flex flex-col gap-2 z-20">
          {activeTab === 'radar' && !activeOrder && (
            <motion.button onClick={scanArea} disabled={isScanning} whileTap={tapScale} transition={transitionFast} className="w-full min-h-11 bg-primary text-primary-foreground font-bold rounded-base flex justify-center items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-80 shadow-soft">
              {isScanning ? <Loader2 className="animate-spin" size={18} /> : <><Radar size={18} /> Scan Area</>}
            </motion.button>
          )}
          
          <div className="flex justify-between items-center px-2">
            <button onClick={() => setActiveTab('radar')} className={`flex-1 flex flex-col items-center gap-1 p-1.5 rounded-base transition-colors ${activeTab === 'radar' ? 'text-primary' : 'text-neutral-400 hover:bg-neutral-50'}`}>
              <LayoutDashboard size={20} strokeWidth={activeTab === 'radar' ? 2.5 : 2} />
              <span className="text-[10px] font-bold tracking-wide uppercase">Radar</span>
            </button>
            <button onClick={() => setActiveTab('history')} className={`flex-1 flex flex-col items-center gap-1 p-1.5 rounded-base transition-colors ${activeTab === 'history' ? 'text-primary' : 'text-neutral-400 hover:bg-neutral-50'}`}>
              <History size={20} strokeWidth={activeTab === 'history' ? 2.5 : 2} />
              <span className="text-[10px] font-bold tracking-wide uppercase">Riwayat</span>
            </button>
            <button onClick={() => setActiveTab('profile')} className={`flex-1 flex flex-col items-center gap-1 p-1.5 rounded-base transition-colors ${activeTab === 'profile' ? 'text-primary' : 'text-neutral-400 hover:bg-neutral-50'}`}>
              <UserIcon size={20} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
              <span className="text-[10px] font-bold tracking-wide uppercase">Profil</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}