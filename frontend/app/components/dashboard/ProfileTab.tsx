'use client'

import { useState } from 'react'
import { User as UserIcon, Bell, Settings, LogOut, ShieldCheck, ChevronRight, MapPin, Wallet, HelpCircle, Info, X, CheckCircle2, CreditCard, Smartphone } from 'lucide-react'
import { usePilahStore } from '@/store/usePilahStore'

export default function ProfileTab() {
  const { userData, logout } = usePilahStore()
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleLogout = () => {
    if (window.confirm('Yakin ingin keluar dari akun?')) logout()
  }

  if (!userData) return null

  const SlideOver = ({ title, id, children }: { title: string, id: string, children: React.ReactNode }) => {
    if (activeModal !== id) return null;
    return (
      <div className="absolute inset-0 z-50 bg-zinc-50 flex flex-col animate-in slide-in-from-right-full duration-300 ease-out">
        <div className="flex items-center justify-between p-6 border-b border-zinc-200/50 shrink-0 bg-white/80 backdrop-blur-xl">
          <h2 className="text-xl font-black text-zinc-900 tracking-tight">{title}</h2>
          <button onClick={() => setActiveModal(null)} className="p-2 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200/50 rounded-full text-zinc-600 transition-colors active:scale-95">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-grow">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 pb-8 relative h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Profil Saya</h2>
        <p className="text-sm text-zinc-500 font-medium mt-1">Kelola akun dan preferensimu.</p>
      </div>

      {/* ✨ PREMIUM VIP CARD */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-800 to-black p-6 rounded-[2rem] shadow-lg shadow-black/10 flex items-center gap-5 mb-8 text-white border border-zinc-800">
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center shrink-0 border border-zinc-700 backdrop-blur-sm relative z-10">
          <UserIcon size={28} className="text-emerald-400" />
        </div>
        <div className="overflow-hidden relative z-10">
          <h3 className="text-xl font-black flex items-center gap-1.5 truncate tracking-tight">
            {userData.name} <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
          </h3>
          <p className="text-sm font-medium text-zinc-400 truncate mt-0.5">{userData.email}</p>
          <div className="inline-block mt-2 bg-white/10 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-md">
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
              Role: {userData.role}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 px-2">Pengaturan Akun</p>
        <div className="bg-white rounded-[1.5rem] border border-zinc-100 shadow-sm overflow-hidden flex flex-col">
          {[
            { id: 'editProfile', icon: UserIcon, label: 'Edit Data Diri' },
            { id: 'address', icon: MapPin, label: 'Alamat Tersimpan' },
            { id: 'wallet', icon: Wallet, label: 'Metode Penarikan Karma' }
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveModal(item.id)} className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors border-b border-zinc-50 w-full text-left group">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-zinc-100 rounded-xl group-hover:bg-white group-hover:shadow-sm transition-all"><item.icon size={18} className="text-zinc-600"/></div>
                <span className="font-bold text-zinc-700 text-sm">{item.label}</span>
              </div>
              <ChevronRight size={18} className="text-zinc-300 group-hover:text-zinc-500 group-hover:translate-x-1 transition-all" />
            </button>
          ))}
          <button onClick={() => showToast('🔔 Fitur notifikasi sedang dalam pengembangan.')} className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors w-full text-left group">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-zinc-100 rounded-xl group-hover:bg-white group-hover:shadow-sm transition-all"><Bell size={18} className="text-zinc-600"/></div>
              <span className="font-bold text-zinc-700 text-sm">Notifikasi & Radar</span>
            </div>
            <ChevronRight size={18} className="text-zinc-300 group-hover:text-zinc-500 group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 px-2">Bantuan & Info</p>
        <div className="bg-white rounded-[1.5rem] border border-zinc-100 shadow-sm overflow-hidden flex flex-col">
          <button onClick={() => showToast('💬 Membuka Pusat Bantuan.')} className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors border-b border-zinc-50 w-full text-left group">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-zinc-100 rounded-xl group-hover:bg-white group-hover:shadow-sm transition-all"><HelpCircle size={18} className="text-zinc-600"/></div>
              <span className="font-bold text-zinc-700 text-sm">Pusat Bantuan</span>
            </div>
            <ChevronRight size={18} className="text-zinc-300 group-hover:text-zinc-500 group-hover:translate-x-1 transition-all" />
          </button>
          <button className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors w-full text-left">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-zinc-100 rounded-xl"><Info size={18} className="text-zinc-600"/></div>
              <span className="font-bold text-zinc-700 text-sm">Tentang Pilah App</span>
            </div>
            <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-1 rounded-md">v1.0 MVP</span>
          </button>
        </div>
      </div>

      <button onClick={handleLogout} className="w-full mt-6 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 border border-red-100 mb-32">
        <LogOut size={18} strokeWidth={2.5} /> Keluar Akun
      </button>

      {/* SUB-PAGES SLIDE-OVER TETAP SAMA */}
      <SlideOver title="Edit Data Diri" id="editProfile">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider ml-1 mb-1 block">Nama Lengkap</label>
            <input type="text" defaultValue={userData.name} className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3.5 text-zinc-900 font-bold focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider ml-1 mb-1 block">Email (Tidak bisa diubah)</label>
            <input type="email" defaultValue={userData.email} disabled className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3.5 text-zinc-400 font-bold cursor-not-allowed" />
          </div>
          <button onClick={() => { showToast('✅ Profil berhasil diperbarui!'); setActiveModal(null) }} className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] mt-4 shadow-md">
            Simpan Perubahan
          </button>
        </div>
      </SlideOver>

      <SlideOver title="Alamat Tersimpan" id="address">
        <div className="space-y-4">
          <div className="bg-white border border-emerald-500 rounded-[1.5rem] p-5 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider shadow-sm">Utama</div>
            <div className="flex items-start gap-4 mt-2">
              <div className="p-2.5 bg-emerald-50 rounded-full shrink-0 group-hover:scale-110 transition-transform">
                <MapPin className="text-emerald-500" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 text-lg">Rumah</h4>
                <p className="text-sm text-zinc-500 mt-1.5 leading-relaxed font-medium">Jl. Kebon Jeruk Raya No. 27, RT 01/RW 03, Jakarta Barat, 11530.</p>
              </div>
            </div>
          </div>
          <button onClick={() => showToast('📍 Fitur tambah alamat segera hadir!')} className="w-full border-2 border-dashed border-zinc-200 text-zinc-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 font-bold py-4 rounded-[1.5rem] transition-all flex items-center justify-center gap-2 active:scale-95">
            + Tambah Alamat Baru
          </button>
        </div>
      </SlideOver>

      <SlideOver title="Metode Penarikan" id="wallet">
        <div className="space-y-3">
          <p className="text-sm text-zinc-500 font-medium mb-6">Pilih ke mana poin Karma-mu akan dicairkan saat sudah mencapai batas minimum.</p>
          
          <div className="bg-white border-2 border-emerald-500 rounded-[1.5rem] p-4 shadow-sm flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-2xl"><Smartphone className="text-emerald-600" size={20}/></div>
              <div>
                <h4 className="font-bold text-zinc-900 text-lg leading-tight">GoPay</h4>
                <p className="text-[11px] font-bold text-zinc-400 mt-1 tracking-wider">0812-3456-7890</p>
              </div>
            </div>
            <CheckCircle2 className="text-emerald-500" size={24} />
          </div>

          <div className="bg-white border-2 border-zinc-100 rounded-[1.5rem] p-4 flex items-center justify-between cursor-pointer hover:border-zinc-300 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-2xl"><CreditCard className="text-blue-600" size={20}/></div>
              <div>
                <h4 className="font-bold text-zinc-900 text-lg leading-tight">Bank Transfer</h4>
                <p className="text-[11px] font-bold text-zinc-400 mt-1 tracking-wider">Belum disambungkan</p>
              </div>
            </div>
          </div>

          <button onClick={() => showToast('💳 Fitur tambah e-wallet segera hadir!')} className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] mt-6 shadow-md">
            + Tambah Metode Baru
          </button>
        </div>
      </SlideOver>

      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-zinc-900 text-white px-5 py-3 rounded-full shadow-xl text-sm font-semibold whitespace-nowrap border border-zinc-700/50">
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  )
}