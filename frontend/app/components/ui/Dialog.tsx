'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { transitionModal } from '@/lib/motion'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
}

// Reusable centered dialog: backdrop + card in the middle of the screen, height
// capped at 90vh with a scrollable content area when long; closes via backdrop/X/Escape.
export default function Dialog({ isOpen, onClose, children, title, description }: DialogProps) {
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transitionModal}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md max-h-[90vh] flex flex-col bg-white rounded-base shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={transitionModal}
          >
            {title && (
              <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-neutral-100 shrink-0">
                <div>
                  <h2 className="text-xl font-black text-neutral-900 tracking-tight">{title}</h2>
                  {description && (
                    <p className="text-xs font-medium text-neutral-500 mt-0.5 leading-relaxed">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  aria-label="Tutup"
                  className="p-2 bg-neutral-100 hover:bg-neutral-200 rounded-full text-neutral-500 transition-colors active:scale-95 shrink-0 ml-2"
                >
                  <X size={20} />
                </button>
              </div>
            )}

            {!title && (
              <button
                onClick={onClose}
                aria-label="Tutup"
                className="absolute top-4 right-4 z-10 p-2 bg-neutral-100 hover:bg-neutral-200 rounded-full text-neutral-500 transition-colors active:scale-95"
              >
                <X size={20} />
              </button>
            )}

            <div className="overflow-y-auto flex-grow p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}