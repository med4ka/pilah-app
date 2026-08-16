'use client'

import { useEffect, useRef } from 'react'
import { Home, ReceiptText, User } from 'lucide-react'

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Measure the ACTUAL nav height (incl. bottom-6 offset) then expose as a CSS var.
  // The scroll container uses padding-bottom: calc(var(--bottom-nav-height) + 16px)
  // so clearance stays accurate even if the nav resizes — no manual calculation.
  useEffect(() => {
    const wrapper = wrapperRef.current
    const main = wrapper?.parentElement
    if (!wrapper || !main) return

    const update = () => {
      const clearance = main.getBoundingClientRect().bottom - wrapper.getBoundingClientRect().top
      if (clearance > 0) {
        document.documentElement.style.setProperty('--bottom-nav-height', `${clearance}px`)
      }
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(wrapper)
    ro.observe(main)
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])

  const navItems = [
    { id: 'home', name: 'Beranda', icon: Home },
    { id: 'orders', name: 'Pesanan', icon: ReceiptText },
    { id: 'profile', name: 'Profil', icon: User },
  ];

  return (
    <div ref={wrapperRef} className="absolute bottom-6 left-0 right-0 px-6 z-30 flex justify-center pointer-events-none">
      <nav className="w-full max-w-[360px] bg-white/80 backdrop-blur-xl border border-neutral-200/60 px-5 py-2.5 flex justify-between items-center shadow-soft rounded-full pointer-events-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button 
              key={item.id} 
              onClick={() => onTabChange(item.id)}
              className="flex flex-col items-center gap-1 transition-all duration-300 relative group"
            >
              {isActive && (
                <div className="absolute -top-2 w-1 h-1 bg-primary rounded-full animate-in fade-in zoom-in duration-300" />
              )}
              
              <div className={`transition-all duration-300 ${isActive ? 'text-primary -translate-y-1' : 'text-neutral-400 group-hover:text-neutral-600 group-hover:-translate-y-0.5 group-active:scale-95'}`}>
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'drop-shadow-sm' : ''} />
              </div>
              <span className={`text-[10px] transition-all duration-300 ${isActive ? 'font-bold text-primary opacity-100' : 'font-semibold text-neutral-400 opacity-0 absolute -bottom-4'}`}>
                {item.name}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}