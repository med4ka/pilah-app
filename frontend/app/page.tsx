'use client'

import { useState, useEffect, useRef } from 'react'
import EcoTracker from '@/app/components/dashboard/EcoTracker'
import { User as UserIcon, AlertCircle, Hand, Sprout, Loader2 } from 'lucide-react' 
import { usePilahStore } from '@/store/usePilahStore'
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
import MoreServicesSheet from '@/app/components/dashboard/MoreServicesSheet'
import HelpTab from '@/app/components/dashboard/HelpTab'
import ProfileTab from '@/app/components/dashboard/ProfileTab'
import KarmaCalculator from '@/app/components/dashboard/KarmaCalculator'
import HandshakeSheet from '@/app/components/dashboard/HandshakeSheet'
import DonasiSheet from '@/app/components/dashboard/DonasiSheet'
import { createPickupRequest, getUserProfile, getUserHistory } from '@/lib/api'

export default function UserHomeScreen() {
  const { 
    token, userData, setUserData, isSearching, startSearching, stopSearching, 
    openAuthModal, logout, isVerificationOpen, openVerification
  } = usePilahStore()
  
  const [activeTab, setActiveTab] = useState('home')
  const [orderStatus, setOrderStatus] = useState<{ type: 'idle' | 'success' | 'error', message: string }>({ type: 'idle', message: '' })
  const [mounted, setMounted] = useState(false)
  const prevKarmaRef = useRef(userData?.karma_points || 0);

    useEffect(() => {
    if (token && !userData) {
      getUserProfile(token)
        .then((data) => setUserData(data))
        .catch((err) => {
          console.error("Sesi Gagal Dimuat:", err);
          if (err.message.includes('Token') || err.message.includes('Sesi')) {
            logout();
          }
        });
    }
  }, [token, userData, setUserData, logout]);

  useEffect(() => {
    if (userData?.karma_points !== undefined) {
      if (userData.karma_points > prevKarmaRef.current) {
          setOrderStatus({ type: 'idle', message: '' }); 
      }
      prevKarmaRef.current = userData.karma_points; 
    }
  }, [userData?.karma_points]);
  
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!token) return;
  

  const checkPendingOrder = async () => {
      try {
        const history = await getUserHistory(token);
        const pendingOrder = history.find((h: any) => 
          h.status === 'VERIFYING' && !sessionStorage.getItem(`banned_order_${h.id}`)
        );
        
        if (pendingOrder && !isVerificationOpen) {
          openVerification(); 
        }
      } catch (err: any) {
        if (err.message.includes('Token') || err.message.includes('Sesi')) logout();
      }
    };

    checkPendingOrder();

    const onFocus = () => checkPendingOrder();
    window.addEventListener('focus', onFocus);

    return () => window.removeEventListener('focus', onFocus);
  }, [token, isVerificationOpen, openVerification, logout]);

  const handleJemput = async () => {
    if (!token) {
      openAuthModal();
      return;
    }
    
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
          await createPickupRequest(token, latitude, longitude);
          setOrderStatus({ type: 'success', message: 'Permintaan disebar ke kolektor terdekat.' });
          } catch (error: any) {
          if (error.message.includes('Token') || error.message.includes('kedaluwarsa') || error.message.includes('Sesi')) {
            logout();
          } else {
            setOrderStatus({ type: 'error', message: error.message });
          }
        } finally {
          stopSearching(); 
        }
      },
      (error) => {
        stopSearching();
        setOrderStatus({ type: 'error', message: 'Tolong izinkan akses lokasi (GPS) agar Kolektor bisa menemukanmu!' });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  const handleCancelRadar = () => {
    setOrderStatus({ type: 'idle', message: '' });
  }

  const renderContent = () => {
    if (activeTab === 'orders') return <OrderHistory />
    if (activeTab === 'help') return <HelpTab />
    if (activeTab === 'profile') return <ProfileTab />

    return (
      <div className="animate-in fade-in slide-in-from-left-4 duration-300">
        {orderStatus.type === 'success' ? (
          <WaitingRadar onCancel={handleCancelRadar} />
        ) : (
          <KarmaWallet points={userData?.karma_points || 0} onRiwayatClick={() => setActiveTab('orders')} />
        )}
        {orderStatus.type === 'error' && (
          <div className="mb-6 px-4 py-3.5 rounded-2xl flex items-center gap-3 text-sm font-medium bg-red-50 text-red-700 border border-red-100">
            <AlertCircle size={18} className="shrink-0 text-red-600" />
            <p className="leading-snug">{orderStatus.message}</p>
          </div>
        )}

        <ServiceGrid 
          onJemputClick={handleJemput} 
          isSearching={isSearching} 
          disabled={orderStatus.type === 'success'} 
        />

        <EcoTracker />

        <DashboardBanner />
      </div>
    )
  }

  const handleHeaderProfileClick = () => {
    if (token) {
      setActiveTab('profile')
    } else {
      openAuthModal()
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center sm:p-8 selection:bg-emerald-100">
      <main className="w-full max-w-md h-[100dvh] sm:h-[850px] bg-white flex flex-col relative overflow-hidden sm:rounded-[2.5rem] shadow-2xl shadow-black/5 border border-zinc-100 transition-all">
        
        <AuthModal />
        <RewardSheet />
        <PilahPintarSheet />
        <DropPointSheet />
        <MoreServicesSheet />
        <KarmaCalculator />
        <HandshakeSheet />
        <DonasiSheet />

        <header className="px-6 pt-8 pb-4 flex justify-between items-center bg-white z-10 shrink-0">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              {token && userData ? (
                new Date().getHours() < 12 ? 'Selamat Pagi,' : 
                new Date().getHours() < 15 ? 'Selamat Siang,' : 
                new Date().getHours() < 18 ? 'Selamat Sore,' : 'Selamat Malam,'
              ) : 'Pilah App'}
            </span>
            <span className="text-xl font-bold text-zinc-900 tracking-tight mt-0.5 flex items-center gap-2">
              {token && userData ? (
                <>{userData.name} <img src="/hand.png" alt="Hand" className="h-14 w-auto object-contain inline-block -ml-1 -mb-2 drop-shadow-md [image-rendering:pixelated]" /></>
              ) : (
                <>Mulai Aksimu! <Sprout className="text-emerald-500" size={20} /></>
              )}
            </span>
          </div>
          <button 
            onClick={handleHeaderProfileClick} 
            className="w-11 h-11 rounded-full bg-white border border-zinc-200/80 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 transition-all active:scale-95 shadow-sm"
          >
            <UserIcon size={20} strokeWidth={2} />
          </button>
        </header>

        <div className="flex-grow overflow-y-auto px-6 pb-28 pt-2 scrollbar-hide">
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