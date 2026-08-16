'use client'

import { useState } from 'react'
import { User as UserIcon, Bell, LogOut, ShieldCheck, ChevronRight, MapPin, Wallet, HelpCircle, Info, Plus } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useUIStore } from '@/store/useUIStore'
import { usePaymentMethodStore, type PaymentMethod } from '@/store/usePaymentMethodStore'
import { updateProfile } from '@/lib/api'
import Dialog from '@/app/components/ui/Dialog'
import PaymentMethodEditor from '@/app/components/ui/PaymentMethodEditor'

interface SavedAddress {
  id: string;
  label: string;
  detail: string;
  isPrimary: boolean;
}

export default function ProfileTab() {
  const { userData, setUserData, logout } = useAuthStore()
  const { openNotificationCenter, openHelpCenter } = useUIStore()
  // Payout methods live in a global store (not local state) so that RewardSheet
  // (Cuan Exchange) can read the same methods.
  const { paymentMethods, selectedMethodId, setSelectedMethodId, addPaymentMethod: addPaymentMethodToStore } = usePaymentMethodStore()
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [nameDraft, setNameDraft] = useState('')

  const [addresses, setAddresses] = useState<SavedAddress[]>([
    { id: 'rumah', label: 'Rumah', detail: 'Jl. Kebon Jeruk Raya No. 27, RT 01/RW 03, Jakarta Barat, 11530.', isPrimary: true },
  ])

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleLogout = () => {
    if (window.confirm('Yakin ingin keluar dari akun?')) logout()
  }

  const closeModal = () => setActiveModal(null)

  const openProfileModal = (id: string) => {
    if (id === 'editProfile' && userData) setNameDraft(userData.name)
    setActiveModal(id)
  }

  const saveProfile = async () => {
    if (!userData) return
    const trimmed = nameDraft.trim()
    if (trimmed === '') {
      showToast('⚠️ Nama tidak boleh kosong.')
      return
    }
    try {
      const updated = await updateProfile({ name: trimmed })
      setUserData({ ...userData, name: updated.name })
      showToast('✅ Profil berhasil diperbarui!')
      closeModal()
    } catch {
      showToast('⚠️ Gagal menyimpan. Coba lagi.')
    }
  }

  const addPaymentMethod = (method: Omit<PaymentMethod, 'id'>) => {
    addPaymentMethodToStore({ ...method, id: `method-${Date.now()}` })
    showToast('✅ Metode penarikan ditambahkan.')
  }

  if (!userData) return null

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 pb-8 relative">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Profil Saya</h2>
        <p className="text-sm text-neutral-500 font-medium mt-1">Kelola akun dan preferensimu.</p>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-br from-neutral-800 to-neutral-900 p-6 rounded-[2rem] shadow-lg shadow-black/10 flex items-center gap-5 mb-8 text-white border border-neutral-700">
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-16 h-16 rounded-full bg-neutral-800/50 flex items-center justify-center shrink-0 border border-neutral-700 backdrop-blur-sm relative z-10">
          <UserIcon size={28} className="text-primary" />
        </div>
        <div className="overflow-hidden relative z-10">
          <h3 className="text-xl font-black flex items-center gap-1.5 truncate tracking-tight">
            {userData.name} <ShieldCheck size={18} className="text-primary shrink-0" />
          </h3>
          <p className="text-sm font-medium text-neutral-400 truncate mt-0.5">{userData.email}</p>
          <div className="inline-block mt-2 bg-white/10 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-md">
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
              Role: {userData.role}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3 px-2">Pengaturan Akun</p>
        <div className="bg-white rounded-[1.5rem] border border-neutral-100 shadow-soft overflow-hidden flex flex-col">
          {[
            { id: 'editProfile', icon: UserIcon, label: 'Edit Data Diri' },
            { id: 'address', icon: MapPin, label: 'Alamat Tersimpan' },
            { id: 'wallet', icon: Wallet, label: 'Metode Penarikan Karma' }
          ].map((item) => (
            <button key={item.id} onClick={() => openProfileModal(item.id)} className="flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors border-b border-neutral-50 w-full text-left group">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-neutral-100 rounded-xl group-hover:bg-white group-hover:shadow-soft transition-all"><item.icon size={18} className="text-neutral-600"/></div>
                <span className="font-bold text-neutral-700 text-sm">{item.label}</span>
              </div>
              <ChevronRight size={18} className="text-neutral-300 group-hover:text-neutral-500 group-hover:translate-x-1 transition-all" />
            </button>
          ))}
          <button onClick={openNotificationCenter} className="flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors w-full text-left group">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-neutral-100 rounded-xl group-hover:bg-white group-hover:shadow-soft transition-all"><Bell size={18} className="text-neutral-600"/></div>
              <span className="font-bold text-neutral-700 text-sm">Notifikasi & Radar</span>
            </div>
            <ChevronRight size={18} className="text-neutral-300 group-hover:text-neutral-500 group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3 px-2">Bantuan & Info</p>
        <div className="bg-white rounded-[1.5rem] border border-neutral-100 shadow-soft overflow-hidden flex flex-col">
          <button onClick={openHelpCenter} className="flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors border-b border-neutral-50 w-full text-left group">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-neutral-100 rounded-xl group-hover:bg-white group-hover:shadow-soft transition-all"><HelpCircle size={18} className="text-neutral-600"/></div>
              <span className="font-bold text-neutral-700 text-sm">Pusat Bantuan</span>
            </div>
            <ChevronRight size={18} className="text-neutral-300 group-hover:text-neutral-500 group-hover:translate-x-1 transition-all" />
          </button>
          <button className="flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors w-full text-left">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-neutral-100 rounded-xl"><Info size={18} className="text-neutral-600"/></div>
              <span className="font-bold text-neutral-700 text-sm">Tentang Pilah App</span>
            </div>
            <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 px-2 py-1 rounded-md">v1.0 MVP</span>
          </button>
        </div>
      </div>

      <button onClick={handleLogout} className="w-full mt-6 bg-status-error/5 hover:bg-status-error/10 text-status-error font-bold py-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 border border-status-error/20">
        <LogOut size={18} strokeWidth={2.5} /> Keluar Akun
      </button>

      <Dialog
        isOpen={activeModal === 'editProfile'}
        onClose={closeModal}
        title="Edit Data Diri"
        description="Perbarui informasi akunmu."
      >
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1 mb-1 block">Nama Lengkap</label>
              <input
                type="text"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3.5 text-neutral-900 font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-soft"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1 mb-1 block">Email (Tidak bisa diubah)</label>
              <input type="email" defaultValue={userData.email} disabled className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3.5 text-neutral-400 font-bold cursor-not-allowed" />
            </div>
            <button onClick={saveProfile} className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] mt-4 shadow-md">
              Simpan Perubahan
            </button>
          </div>
      </Dialog>

      <Dialog
        isOpen={activeModal === 'address'}
        onClose={closeModal}
        title="Alamat Tersimpan"
        description="Alamat yang kamu pakai untuk penjemputan."
      >
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div key={addr.id} className="bg-white border border-neutral-200 rounded-[1.5rem] p-5 shadow-soft relative overflow-hidden group">
                {addr.isPrimary && (
                  <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider shadow-soft">Utama</div>
                )}
                <div className="flex items-start gap-4 mt-2">
                  <div className="p-2.5 bg-primary/5 rounded-full shrink-0 group-hover:scale-110 transition-transform">
                    <MapPin className="text-primary" size={20} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-neutral-900 text-lg">{addr.label}</h4>
                    <p className="text-sm text-neutral-500 mt-1.5 leading-relaxed font-medium">{addr.detail}</p>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => showToast('📍 Fitur tambah alamat segera hadir!')} className="w-full border-2 border-dashed border-neutral-200 text-neutral-500 hover:text-primary hover:border-primary/30 hover:bg-primary/5 font-bold py-4 rounded-[1.5rem] transition-all flex items-center justify-center gap-2 active:scale-95">
              <Plus size={18} /> Tambah Alamat Baru
            </button>
          </div>
      </Dialog>

      <Dialog
        isOpen={activeModal === 'wallet'}
        onClose={closeModal}
        title="Metode Penarikan"
        description="Pilih ke mana poin Karma-mu dicairkan saat sudah mencapai batas minimum."
      >
        <PaymentMethodEditor
          methods={paymentMethods}
          selectedMethodId={selectedMethodId}
          onSelect={setSelectedMethodId}
          onAdd={(method) => addPaymentMethod(method)}
          onInvalid={() => showToast('⚠️ Isi nama dan nomor/akun metode dulu.')}
        />
      </Dialog>

      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[80] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-neutral-900 text-white px-5 py-3 rounded-full shadow-soft text-sm font-semibold whitespace-nowrap border border-neutral-700/50">
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  )
}