'use client'

import { Home, ReceiptText, MessageCircle, User } from 'lucide-react'

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const navItems = [
    { id: 'home', name: 'Beranda', icon: Home },
    { id: 'orders', name: 'Pesanan', icon: ReceiptText },
    { id: 'help', name: 'Bantuan', icon: MessageCircle }, 
    { id: 'profile', name: 'Profil', icon: User },
  ];

  return (
    <div className="absolute bottom-6 left-0 right-0 px-6 z-30 flex justify-center pointer-events-none">
      <nav className="w-full max-w-[360px] bg-white/80 backdrop-blur-xl border border-white/60 px-6 py-3.5 flex justify-between items-center shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] rounded-full pointer-events-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button 
              key={item.id} 
              onClick={() => onTabChange(item.id)}
              className="flex flex-col items-center gap-1 transition-all duration-300 relative group"
            >
              {isActive && (
                <div className="absolute -top-3 w-1 h-1 bg-emerald-500 rounded-full animate-in fade-in zoom-in duration-300" />
              )}
              
              <div className={`transition-all duration-300 ${isActive ? 'text-emerald-600 -translate-y-1' : 'text-zinc-400 group-hover:text-zinc-600 group-hover:-translate-y-0.5 group-active:scale-95'}`}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'drop-shadow-sm' : ''} />
              </div>
              <span className={`text-[10px] transition-all duration-300 ${isActive ? 'font-bold text-emerald-700 opacity-100' : 'font-semibold text-zinc-400 opacity-0 absolute -bottom-4'}`}>
                {item.name}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}