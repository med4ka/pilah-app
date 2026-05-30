'use client'

import { useState } from 'react'
import { X, Mail, Lock, User as UserIcon, Loader2, AlertCircle, Sparkles } from 'lucide-react'
import { usePilahStore } from '@/store/usePilahStore'
import { loginUser, registerUser } from '@/lib/api'

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, setToken } = usePilahStore()
  
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (!isAuthModalOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setIsLoading(true)

    try {
      if (isLogin) {
        const token = await loginUser(email, password)
        setToken(token) 
        closeAuthModal() 
      } else {
        await registerUser(name, email, password)
        const token = await loginUser(email, password)
        setToken(token)
        closeAuthModal()
      }
    } catch (error: any) {
      setErrorMsg(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setErrorMsg('')
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-zinc-900/60 backdrop-blur-md sm:p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={closeAuthModal} />

      <div className="relative w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300 ease-out">
        
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 -right-20 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mt-4 sm:hidden relative z-10" />

        <div className="p-8 pt-6 relative z-10">
          <button onClick={closeAuthModal} className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-900 transition-colors bg-white/50 backdrop-blur-sm border border-zinc-100 hover:bg-zinc-100 p-2 rounded-full active:scale-95 shadow-sm">
            <X size={20} />
          </button>

          <div className="mb-8 mt-2">
            <h2 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
              {isLogin ? 'Welcome Back' : 'Join Pilah'} {isLogin ? '👋' : <Sparkles className="text-emerald-500" size={24}/>}
            </h2>
            <p className="text-sm font-medium text-zinc-500 mt-2 leading-relaxed">
              {isLogin ? 'Masuk kembali untuk melanjutkan misi baikmu hari ini.' : 'Daftar sekarang dan mulailah mengubah sampah jadi berkah.'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-[1rem] flex items-start gap-3 animate-in shake duration-300">
              <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
              <span className="text-xs font-bold text-red-700 leading-relaxed">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500 text-zinc-400">
                  <UserIcon size={18} />
                </div>
                <input 
                  type="text" required={!isLogin} value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Lengkap" 
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 pl-11 pr-4 text-sm font-semibold text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-zinc-400 shadow-inner"
                />
              </div>
            )}

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500 text-zinc-400">
                <Mail size={18} />
              </div>
              <input 
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Alamat Email" 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 pl-11 pr-4 text-sm font-semibold text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-zinc-400 shadow-inner"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500 text-zinc-400">
                <Lock size={18} />
              </div>
              <input 
                type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Kata Sandi (Min. 6 karakter)" 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 pl-11 pr-4 text-sm font-semibold text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-zinc-400 shadow-inner"
              />
            </div>

            <button 
              type="submit" disabled={isLoading}
              className="w-full relative overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-950 hover:from-zinc-900 hover:to-black text-white rounded-2xl py-4 text-sm font-bold transition-all duration-300 active:scale-[0.98] mt-6 flex justify-center items-center shadow-[0_8px_20px_-6px_rgba(0,0,0,0.3)] disabled:opacity-70 group"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : (isLogin ? 'Masuk Akun' : 'Daftar Sekarang')}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-zinc-100">
            <span className="text-xs font-medium text-zinc-500">
              {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            </span>
            <button 
              type="button" onClick={toggleMode}
              className="text-xs font-black text-emerald-600 hover:text-emerald-700 transition-colors tracking-wide underline decoration-emerald-500/30 underline-offset-4"
            >
              {isLogin ? 'Daftar di sini' : 'Masuk di sini'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}