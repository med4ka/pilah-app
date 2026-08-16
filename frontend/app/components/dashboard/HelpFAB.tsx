'use client'

import { motion } from 'framer-motion'
import { MessageCircleQuestion } from 'lucide-react'
import { useUIStore } from '@/store/useUIStore'
import { hoverScale, tapScale, transitionFast } from '@/lib/motion'

// Floating action button entry to the Help Center (existing decision-tree).
// Fixed at the bottom-right, ABOVE BottomNav using the --bottom-nav-height CSS
// variable (computed by BottomNav) so it never covers the nav.
// z-40: above content (z-10) & nav (z-30), but below Dialog (z-[70]).
export default function HelpFAB() {
  const openHelpCenter = useUIStore((s) => s.openHelpCenter)

  return (
    <motion.button
      type="button"
      onClick={openHelpCenter}
      aria-label="Buka Pusat Bantuan"
      whileHover={hoverScale}
      whileTap={tapScale}
      transition={transitionFast}
      className="fixed right-4 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-soft flex items-center justify-center hover:bg-primary/90 active:bg-primary/90"
      style={{ bottom: 'calc(var(--bottom-nav-height, 128px) + 20px)' }}
    >
      <MessageCircleQuestion size={24} strokeWidth={2} />
    </motion.button>
  )
}