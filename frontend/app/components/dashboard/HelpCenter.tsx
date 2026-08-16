'use client'

import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Truck,
  Gem,
  ShieldCheck,
  FileCheck,
  Recycle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Home,
  Search,
  X,
} from 'lucide-react'
import { useUIStore } from '@/store/useUIStore'
import { helpCategories, type HelpCategory, type HelpAnswer } from '@/lib/helpContent'
import Dialog from '@/app/components/ui/Dialog'
import { transitionModal } from '@/lib/motion'

// Map icon names in the helpContent data to Lucide components.
const ICON_MAP: Record<string, LucideIcon> = {
  Truck,
  Gem,
  ShieldCheck,
  FileCheck,
  Recycle,
}

type Level = 'category' | 'question' | 'answer'

// Directional horizontal slide: new content enters from the right when advancing
// (drill-down), leaves to the right when going back — feels like native navigation.
const slideVariants = {
  enter: (dir: number) => ({ x: dir >= 0 ? 56 : -56, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir >= 0 ? -56 : 56, opacity: 0 }),
}

// Decision-tree based Help Center (not AI/chatbot):
// Category → Question → Answer, with back navigation at each level.
export default function HelpCenter() {
  const isOpen = useUIStore((s) => s.isHelpCenterOpen)
  const close = useUIStore((s) => s.closeHelpCenter)

  const [level, setLevel] = useState<Level>('category')
  const [category, setCategory] = useState<HelpCategory | null>(null)
  const [question, setQuestion] = useState<HelpAnswer | null>(null)
  const [direction, setDirection] = useState(1)
  const [query, setQuery] = useState('')

  const openCategory = (cat: HelpCategory) => {
    setDirection(1)
    setQuestion(null)
    setCategory(cat)
    setLevel('question')
  }

  const openQuestion = (q: HelpAnswer) => {
    setDirection(1)
    setQuestion(q)
    setLevel('answer')
  }

  const backToCategories = () => {
    setDirection(-1)
    setLevel('category')
  }

  const backToQuestions = () => {
    setDirection(-1)
    setLevel('question')
  }

  const backAllTheWay = () => {
    setDirection(-1)
    setCategory(null)
    setQuestion(null)
    setLevel('category')
  }

  // Full reset on close so the next open starts from level 1.
  const handleClose = () => {
    close()
    setLevel('category')
    setCategory(null)
    setQuestion(null)
    setQuery('')
  }

  const q = query.trim().toLowerCase()
  const filteredCategories = q
    ? helpCategories.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.questions.some((a) => a.question.toLowerCase().includes(q))
      )
    : helpCategories

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Pusat Bantuan"
      description="Pilih topik lalu temukan jawabannya."
    >
      <div className="relative">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          {level === 'category' && (
            <motion.div
              key="category"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transitionModal}
              className="flex flex-col min-h-[300px]"
            >
              <div className="relative mb-4">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari pertanyaan..."
                  className="w-full bg-white border border-neutral-200 rounded-base pl-10 pr-9 py-3 text-sm text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-soft"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    aria-label="Bersihkan pencarian"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {filteredCategories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center flex-1">
                  <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
                    <Search size={28} className="text-neutral-400" strokeWidth={1.5} />
                  </div>
                  <h4 className="text-base font-bold text-neutral-700">Tidak ada yang cocok</h4>
                  <p className="text-sm text-neutral-400 mt-1 leading-relaxed max-w-[260px] mx-auto">
                    Coba kata kunci lain soal pickup, karma, akun, atau bukti transaksi.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredCategories.map((cat) => {
                    const CategoryIcon = ICON_MAP[cat.icon] ?? HelpCircle
                    return (
                      <button
                        key={cat.id}
                        onClick={() => openCategory(cat)}
                        className="w-full flex items-center justify-between p-4 bg-white rounded-base border border-neutral-200/80 shadow-soft hover:border-primary/30 hover:bg-neutral-50 transition-all text-left group active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="p-2.5 bg-neutral-100 rounded-xl group-hover:bg-white group-hover:text-primary text-neutral-600 transition-all shrink-0">
                            <CategoryIcon size={18} />
                          </div>
                          <div className="min-w-0">
                            <span className="block font-bold text-neutral-700 text-sm">{cat.title}</span>
                            <span className="block text-[11px] font-medium text-neutral-400 mt-0.5">
                              {cat.questions.length} pertanyaan umum
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-neutral-300 group-hover:text-neutral-500 group-hover:translate-x-1 transition-all shrink-0" />
                      </button>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {level === 'question' && category && (
            <motion.div
              key="question"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transitionModal}
              className="flex flex-col min-h-[300px]"
            >
              <button
                onClick={backToCategories}
                className="self-start inline-flex items-center gap-1 text-xs font-bold text-neutral-500 hover:text-neutral-700 transition-colors mb-4"
              >
                <ChevronLeft size={16} /> Kategori
              </button>

              <div className="flex flex-col gap-3">
                {category.questions.map((qa) => (
                  <button
                    key={qa.id}
                    onClick={() => openQuestion(qa)}
                    className="w-full flex items-center justify-between p-4 bg-white rounded-base border border-neutral-200/80 shadow-soft hover:border-primary/30 hover:bg-neutral-50 transition-all text-left group active:scale-[0.99]"
                  >
                    <span className="flex-1 min-w-0 pr-3 font-bold text-neutral-700 text-sm">{qa.question}</span>
                    <ChevronRight size={18} className="text-neutral-300 group-hover:text-neutral-500 group-hover:translate-x-1 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {level === 'answer' && category && question && (
            <motion.div
              key="answer"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transitionModal}
              className="flex flex-col min-h-[300px]"
            >
              <button
                onClick={backToQuestions}
                className="self-start inline-flex items-center gap-1 text-xs font-bold text-neutral-500 hover:text-neutral-700 transition-colors mb-4"
              >
                <ChevronLeft size={16} /> {category.title}
              </button>

              <div className="bg-neutral-50 border border-neutral-200/80 rounded-base p-5 shadow-soft">
                <h4 className="text-base font-bold text-neutral-900 tracking-tight">{question.question}</h4>
                <p className="text-sm font-medium text-neutral-500 leading-relaxed mt-3">{question.answer}</p>
              </div>

              <button
                onClick={backAllTheWay}
                className="w-full mt-4 border border-neutral-200 text-neutral-600 hover:text-primary hover:border-primary/30 hover:bg-primary/5 font-bold py-3.5 rounded-base transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Home size={16} /> Kembali ke semua kategori
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Dialog>
  )
}