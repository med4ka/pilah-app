'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Sparkles, User } from 'lucide-react'

export default function HelpTab() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Halo Pahlawan Pilah! Ada yang bisa saya bantu hari ini? Kamu bisa nanya cara memilah sampah, info Karma, atau jadwal kolektor di areamu.", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }
  useEffect(() => scrollToBottom(), [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();

    setMessages(prev => [...prev, { id: Date.now(), text: userMsg, sender: "user" }]);
    setInput("");

    setTimeout(() => {
      let botReply = "Maaf, Pilah AI masih dalam tahap belajar. Tapi kamu bisa coba tanya soal 'botol kaca', 'kardus', 'jadwal jemput', atau 'karma' ya!";
      const lowerInput = userMsg.toLowerCase();
      
      if (lowerInput.includes("botol kaca") || lowerInput.includes("sirup")) {
        botReply = "Wah, pertanyaan bagus! Botol kaca bekas sirup masuk kategori Daur Ulang. Pastikan kamu mencuci bersih sisa sirupnya dulu ya, lalu request 'Jemput Sampah'. Kolektor kita siap angkut! (+15 Poin/kg)";
      } else if (lowerInput.includes("kardus") || lowerInput.includes("kertas")) {
        botReply = "Kardus dan kertas itu harta karun! Pastikan tetap kering dan dilipat rapi biar hemat tempat sebelum dikasih ke Kolektor. Nilainya lumayan, +7 Karma per kg loh!";
      } else if (lowerInput.includes("jadwal") || lowerInput.includes("lama") || lowerInput.includes("kapan")) {
        botReply = "Kolektor kami biasanya standby patroli dari jam 08:00 sampai 17:00. Kalau kamu request jemput sekarang, rata-rata butuh waktu 15-30 menit buat mereka sampai ke lokasimu! ";
      } else if (lowerInput.includes("karma") || lowerInput.includes("poin") || lowerInput.includes("tukar")) {
        botReply = "Karma Points itu reward buat aksi baikmu menyelamatkan bumi! Poin ini bisa kamu kumpulkan dan ditukar jadi e-wallet (Gopay/OVO), voucher diskon, atau donasi di menu Beranda.";
      }

      setMessages(prev => [...prev, { id: Date.now(), text: botReply, sender: "bot" }]);
    }, 1000);
  }

  return (
    <div className="animate-in fade-in duration-300 h-[calc(100vh-180px)] sm:h-[650px] flex flex-col">
      <div className="mb-4 shrink-0">
        <h2 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
          Pilah AI <Sparkles size={20} className="text-emerald-500" />
        </h2>
        <p className="text-sm font-medium text-zinc-500 mt-1">Asisten cerdas pendamping daur ulangmu.</p>
      </div>

      <div className="flex-grow bg-white rounded-[1.5rem] border border-zinc-100 shadow-inner p-4 overflow-y-auto mb-4 flex flex-col gap-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-zinc-100 text-zinc-500' : 'bg-emerald-50 text-emerald-500'}`}>
              {msg.sender === 'user' ? <User size={16} /> : <Bot size={18} />}
            </div>
            <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
              msg.sender === 'user' ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-white border border-zinc-100 text-zinc-700 rounded-tl-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Tanya Pilah AI..." 
          className="flex-grow bg-white border border-zinc-200 rounded-full px-5 py-3.5 text-sm font-medium text-zinc-900 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
        />
        <button 
          onClick={handleSend}
          disabled={!input.trim()}
          className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shrink-0 hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-50 shadow-md"
        >
          <Send size={18} className="ml-1" />
        </button>
      </div>
    </div>
  )
}