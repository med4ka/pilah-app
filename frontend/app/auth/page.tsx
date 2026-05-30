'use client'

import { useState } from 'react'
import { ArrowRight, Leaf } from 'lucide-react'

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <main className="min-h-screen bg-zinc-50 flex flex-col justify-center items-center p-6 font-sans text-zinc-900 selection:bg-emerald-200">
      
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 transition-all duration-500">
        
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
            <Leaf size={24} strokeWidth={2.5} />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center tracking-tight mb-2">
          {isLogin ? 'Selamat Datang Kembali' : 'Mulai Perjalanan Anda'}
        </h1>
        <p className="text-sm text-zinc-500 text-center mb-8 font-medium">
          {isLogin ? 'Masuk untuk melanjutkan sirkular ekonomi.' : 'Daftar untuk menjadi pahlawan lingkungan.'}
        </p>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1">
              Nomor HP
            </label>
            <input
              type="tel"
              placeholder="Contoh: 081234567890"
              className="w-full px-5 py-3.5 rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Minimal 6 karakter"
              className="w-full px-5 py-3.5 rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
            />
          </div>

          <button className="w-full bg-zinc-900 text-white py-4 rounded-xl font-bold text-sm hover:bg-zinc-800 active:scale-[0.98] transition-all mt-8 flex justify-center items-center gap-2 shadow-xl shadow-zinc-900/10">
            {isLogin ? 'Masuk Sekarang' : 'Daftar Sekarang'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-zinc-500 font-medium">
            {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors ml-1"
            >
              {isLogin ? 'Daftar di sini' : 'Masuk di sini'}
            </button>
          </p>
        </div>

      </div>
    </main>
  )
}