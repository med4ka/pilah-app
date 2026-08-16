'use client'

import { useState } from 'react'
import { Mail, Lock, User as UserIcon, Loader2, AlertCircle, Sparkles, Truck } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useUIStore } from '@/store/useUIStore'
import { loginUser, registerUser, getUserProfile } from '@/lib/api'
import Dialog from '@/app/components/ui/Dialog'

export default function AuthModal() {
  const setUserData = useAuthStore((s) => s.setUserData)
  const { isAuthModalOpen, closeAuthModal } = useUIStore()
  
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'user' | 'collector'>('user')

  const syncUser = async () => {
    const data = await getUserProfile()
    setUserData(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setIsLoading(true)

    try {
      if (isLogin) {
        await loginUser(email, password)
        await syncUser()
        closeAuthModal() 
      } else {
        await registerUser(name, email, password, role)
        await loginUser(email, password)
        await syncUser()
        closeAuthModal()
      }
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Terjadi kesalahan, coba lagi')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setErrorMsg('')
  }

  return (
    <Dialog
      isOpen={isAuthModalOpen}
      onClose={closeAuthModal}
      title={<span className="flex items-center gap-2">{isLogin ? 'Welcome Back' : 'Join Pilah'} {!isLogin && <Sparkles className="text-primary" size={24}/>}</span>}
      description={isLogin ? 'Masuk kembali untuk melanjutkan misi baikmu hari ini.' : 'Daftar sekarang dan mulailah mengubah sampah jadi berkah.'}
    >
      {errorMsg && (
        <div className="mb-6 p-4 bg-status-error/10 border border-status-error/20 rounded-[1rem] flex items-start gap-3 animate-in shake duration-300">
          <AlertCircle size={18} className="text-status-error shrink-0 mt-0.5" />
          <span className="text-xs font-bold text-status-error leading-relaxed">{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary text-neutral-400">
              <UserIcon size={18} />
            </div>
            <input 
              type="text" required={!isLogin} value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Nama Lengkap" 
              className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-4 pl-11 pr-4 text-sm font-semibold text-neutral-900 focus:bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-neutral-400 shadow-inner"
            />
          </div>
        )}

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary text-neutral-400">
            <Mail size={18} />
          </div>
          <input 
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="Alamat Email" 
            className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-4 pl-11 pr-4 text-sm font-semibold text-neutral-900 focus:bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-neutral-400 shadow-inner"
          />
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary text-neutral-400">
            <Lock size={18} />
          </div>
          <input 
            type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Kata Sandi (Min. 6 karakter)" 
            className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-4 pl-11 pr-4 text-sm font-semibold text-neutral-900 focus:bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-neutral-400 shadow-inner"
          />
        </div>

        {!isLogin && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-1">Daftar sebagai</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3.5 text-sm font-bold transition-all duration-200 active:scale-[0.98] ${role === 'user' ? 'border-primary/40 bg-primary/5 text-primary ring-4 ring-primary/10' : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300'}`}
              >
                <UserIcon size={18} /> Warga
              </button>
              <button
                type="button"
                onClick={() => setRole('collector')}
                className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3.5 text-sm font-bold transition-all duration-200 active:scale-[0.98] ${role === 'collector' ? 'border-primary/40 bg-primary/5 text-primary ring-4 ring-primary/10' : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300'}`}
              >
                <Truck size={18} /> Mitra
              </button>
            </div>
            <p className="text-[11px] font-medium text-neutral-400 px-1">
              {role === 'collector' ? 'Sebagai Mitra kamu bisa mengambil tugas jemput di area kamu.' : 'Sebagai Warga kamu bisa meminta penjemputan sampah.'}
            </p>
          </div>
        )}

        <button 
          type="submit" disabled={isLoading}
          className="w-full relative overflow-hidden bg-gradient-to-br from-neutral-800 to-neutral-900 hover:from-neutral-800 hover:to-black text-white rounded-2xl py-4 text-sm font-bold transition-all duration-300 active:scale-[0.98] mt-6 flex justify-center items-center shadow-soft disabled:opacity-70 group"
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : (isLogin ? 'Masuk Akun' : 'Daftar Sekarang')}
        </button>
      </form>

      <div className="mt-8 text-center pt-6 border-t border-neutral-100">
        <span className="text-xs font-medium text-neutral-500">
          {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
        </span>
        <button 
          type="button" onClick={toggleMode}
          className="text-xs font-black text-primary hover:text-primary transition-colors tracking-wide underline decoration-primary/30 underline-offset-4"
        >
          {isLogin ? 'Daftar di sini' : 'Masuk di sini'}
        </button>
      </div>
    </Dialog>
  )
}