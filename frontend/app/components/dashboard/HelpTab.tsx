'use client'

import { useState } from 'react'
import { Bot, Send, Sparkles, User } from 'lucide-react'

export default function HelpTab() {
  const [input, setInput] = useState('')

  return (
    <section className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col h-[calc(100vh-180px)] sm:h-[650px] pb-4">
      <div className="flex justify-between items-end mb-6 px-1 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            Pilah AI <Sparkles size={20} className="text-emerald-500" />
          </h2>
          <p className="text-sm font-medium text-zinc-500 mt-1">Asisten cerdas pendamping daur ulangmu.</p>
        </div>
      </div>

      <div className="flex-grow bg-zinc-50/50 border border-zinc-100 rounded-3xl p-4 flex flex-col gap-5 overflow-y-auto mb-4 shadow-inner">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 shadow-sm">
            <Bot size={18} className="text-emerald-600" />
          </div>
          <div className="bg-white border border-zinc-100 p-3.5 rounded-2xl rounded-tl-none shadow-sm text-sm text-zinc-700 leading-relaxed max-w-[85%]">
            Halo Pahlawan Pilah! Ada yang bisa saya bantu hari ini? Kamu bisa nanya cara memilah sampah elektronik atau jadwal kolektor di areamu.
          </div>
        </div>

        <div className="flex gap-3 flex-row-reverse">
          <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center shrink-0 shadow-sm">
            <User size={18} className="text-zinc-600" />
          </div>
          <div className="bg-emerald-600 p-3.5 rounded-2xl rounded-tr-none shadow-sm text-sm text-white leading-relaxed max-w-[85%]">
            Kalo botol kaca bekas sirup buangnya ke mana ya min?
          </div>
        </div>

        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 shadow-sm">
            <Bot size={18} className="text-emerald-600" />
          </div>
          <div className="bg-white border border-zinc-100 p-3.5 rounded-2xl rounded-tl-none shadow-sm text-sm text-zinc-700 leading-relaxed max-w-[85%]">
            Wah, pertanyaan bagus! Botol kaca bekas sirup masuk ke kategori <b className="text-emerald-700">Daur Ulang</b>. <br/><br/>
            Pastikan kamu mencuci bersih sisa sirupnya dulu ya, lalu masukkan ke Pilah Box terdekat atau request "Jemput Sampah". Kolektor kami siap mengangkutnya!
          </div>
        </div>
      </div>

      <div className="shrink-0 relative">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tanya Pilah AI..." 
          className="w-full bg-white border border-zinc-200 rounded-full py-3.5 pl-5 pr-12 text-sm font-medium text-zinc-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm"
        />
        <button className="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-md">
          <Send size={16} className="-ml-0.5" />
        </button>
      </div>
    </section>
  )
}