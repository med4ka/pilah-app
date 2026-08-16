'use client'

import { useCallback, useRef, useState } from 'react'
import { User as UserIcon, AlertCircle, Sprout, Bell } from 'lucide-react' 
import { useAuthStore } from '@/store/useAuthStore'
import { useUIStore } from '@/store/useUIStore'
import { useNotificationStore, selectUnreadCount } from '@/store/useNotificationStore'
import AuthModal from '@/app/components/AuthModal'

import KarmaWallet from '@/app/components/dashboard/KarmaWallet'
import ServiceGrid from '@/app/components/dashboard/ServiceGrid'
import DashboardBanner from '@/app/components/dashboard/DashboardBanner'
import BottomNav from '@/app/components/dashboard/BottomNav'
import WaitingRadar from '@/app/components/dashboard/WaitingRadar'
import RewardSheet from '@/app/components/dashboard/RewardSheet'
import OrderHistory from '@/app/components/dashboard/OrderHistory'
import PilahPintarSheet from '@/app/components/dashboard/PilahPintarSheet'
import DropPointSheet from '@/app/components/dashboard/DropPointSheet'
import ProfileTab from '@/app/components/dashboard/ProfileTab'
import ActivePickupCard from '@/app/components/dashboard/ActivePickupCard'
import NotificationCenter from '@/app/components/dashboard/NotificationCenter'
import HelpCenter from '@/app/components/dashboard/HelpCenter'
import HelpFAB from '@/app/components/dashboard/HelpFAB'

import { createPickupRequest } from '@/lib/api'
import EstimateWeightDialog, { type WeightEstimate } from '@/app/components/dashboard/EstimateWeightDialog'

export default function UserHomeScreen() {
  const userData = useAuthStore((s) => s.userData)
  const { isSearching, startSearching, stopSearching, openAuthModal, openNotificationCenter } = useUIStore()
  const unreadCount = useNotificationStore(selectUnreadCount)
  
  const [activeTab, setActiveTab] = useState('home')
  const [orderStatus, setOrderStatus] = useState<{ type: 'idle' | 'success' | 'error', message: string }>({ type: 'idle', message: '' })
  // ActivePickupCard shows an active/completed pickup card -> disable the grid
  // so the user cannot create a duplicate pickup while an order is active.
  const [hasActivePickup, setHasActivePickup] = useState(false)
  // Optional weight-estimate step before the GPS/createPickupRequest flow.
  const [isEstimateOpen, setIsEstimateOpen] = useState(false)
  const pendingEstimateRef = useRef<WeightEstimate | null>(null)

  // Phase 1: "Jemput Sampah" click -> open estimate dialog first, GPS NOT requested yet.
  const handleJemput = () => {
    if (!userData) {
      openAuthModal();
      return;
    }
    setIsEstimateOpen(true);
  }

  // Phase 2: user presses "Lanjut"/"Lewati" in the dialog -> save the estimate, then
  // proceed to the existing GPS + createPickupRequest flow (sending the estimate too).
  const proceedWithEstimate = (estimate: WeightEstimate) => {
    pendingEstimateRef.current = estimate
    setIsEstimateOpen(false)
    void sendPickupRequest()
  }

  // "Lewati" -> proceed with all estimates at 0 (never force the user to fill them).
  const skipEstimate = () => {
    proceedWithEstimate({ estPlasticWeight: 0, estCardboardWeight: 0, estGlassWeight: 0 })
  }

  const sendPickupRequest = async () => {
    const estimate = pendingEstimateRef.current || { estPlasticWeight: 0, estCardboardWeight: 0, estGlassWeight: 0 }
    pendingEstimateRef.current = null

    startSearching();
    setOrderStatus({ type: 'idle', message: '' });

    if (!navigator.geolocation) {
      setOrderStatus({ type: 'error', message: 'Akses GPS tidak didukung di perangkatmu.' });
      stopSearching();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          await createPickupRequest(latitude, longitude, estimate);
          setOrderStatus({ type: 'success', message: 'Permintaan disebar ke kolektor terdekat.' });
        } catch (error) {
          setOrderStatus({ type: 'error', message: error instanceof Error ? error.message : 'Gagal mengirim permintaan' });
        } finally {
          stopSearching(); 
        }
      },
      () => {
        stopSearching();
        setOrderStatus({ type: 'error', message: 'Tolong izinkan akses lokasi (GPS) agar Kolektor bisa menemukanmu!' });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  const handleCancelRadar = () => {
    setOrderStatus({ type: 'idle', message: '' });
  }

  // Single source of truth: once the pickup card (active/terminal) starts showing,
  // the "searching" phase is over -> reset orderStatus to idle so the WaitingRadar
  // disappears. Synced from ActivePickupCard via callback.
  const handlePickupVisibleChange = useCallback((visible: boolean) => {
    setHasActivePickup(visible)
    if (visible) {
      setOrderStatus({ type: 'idle', message: '' })
      useUIStore.getState().stopSearching()
    }
  }, [])

  const renderContent = () => {
    if (activeTab === 'orders') return <OrderHistory />
    if (activeTab === 'profile') return <ProfileTab />

    return (
      <div className="animate-in fade-in slide-in-from-left-4 duration-300">
        {orderStatus.type === 'success' ? (
          <WaitingRadar onCancel={handleCancelRadar} />
        ) : (
          <KarmaWallet points={userData?.karma_points || 0} onRiwayatClick={() => setActiveTab('orders')} />
        )}
        {orderStatus.type === 'error' && (
          <div className="mb-10 px-4 py-3.5 rounded-base flex items-center gap-3 text-sm font-medium bg-status-error/10 text-status-error border border-status-error/20">
            <AlertCircle size={18} className="shrink-0 text-status-error" />
            <p className="leading-snug">{orderStatus.message}</p>
          </div>
        )}

        <ActivePickupCard onRetry={handleJemput} onPickupVisibleChange={handlePickupVisibleChange} />

        <ServiceGrid 
          onJemputClick={handleJemput} 
          isSearching={isSearching} 
          disabled={orderStatus.type === 'success' || hasActivePickup} 
        />

        <DashboardBanner />
      </div>
    )
  }

  const handleHeaderProfileClick = () => {
    if (userData) {
      setActiveTab('profile')
    } else {
      openAuthModal()
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 selection:bg-primary/20">
      <main className="w-full h-[100dvh] md:max-w-xl md:mx-auto flex flex-col relative overflow-hidden">
        
        <AuthModal />
        <RewardSheet />
        <PilahPintarSheet />
        <DropPointSheet />
        <NotificationCenter />
        <HelpCenter />
        <HelpFAB />
        <EstimateWeightDialog
          isOpen={isEstimateOpen}
          onClose={() => setIsEstimateOpen(false)}
          onContinue={proceedWithEstimate}
          onSkip={skipEstimate}
        />

        <header className="px-6 pt-8 pb-5 flex justify-between items-center bg-white z-10 shrink-0">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
              {userData ? 'Selamat Datang' : 'Pilah App'}
            </span>
            <span className="text-xl font-bold text-neutral-900 tracking-tight mt-0.5 flex items-center gap-2">
              {userData ? (
                <>Halo, {userData.name}!</>
              ) : (
                <>Mulai Aksimu! <Sprout className="text-primary" size={20} /></>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={openNotificationCenter}
              aria-label="Buka notifikasi"
              className="relative w-11 h-11 rounded-full bg-white border border-neutral-200/80 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 transition-all active:scale-95 shadow-soft"
            >
              <Bell size={20} strokeWidth={2} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-status-error text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <button 
              onClick={handleHeaderProfileClick} 
              className="w-11 h-11 rounded-full bg-white border border-neutral-200/80 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 transition-all active:scale-95 shadow-soft"
            >
              <UserIcon size={20} strokeWidth={2} />
            </button>
          </div>
        </header>

        <div className="flex-grow overflow-y-auto px-6 pt-2 scrollbar-hide" style={{ paddingBottom: 'calc(var(--bottom-nav-height, 128px) + 16px)' }}>
          {renderContent()}
        </div>

        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

      </main>
    </div>
  )
}