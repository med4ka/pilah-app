'use client'

import { useState } from 'react'
import { Scale, ArrowRight } from 'lucide-react'
import Dialog from '@/app/components/ui/Dialog'

const KG_FORMAT = 'kg'

export interface WeightEstimate {
  estPlasticWeight: number
  estCardboardWeight: number
  estGlassWeight: number
}

interface EstimateWeightDialogProps {
  isOpen: boolean
  onClose: () => void
  // Called when the user presses "Continue" with the filled values.
  onContinue: (estimate: WeightEstimate) => void
  // Called when the user presses "Skip" -> all estimate values 0.
  onSkip: () => void
}

// Optional resident weight-estimate step dialog. Wraps the existing Dialog.tsx.
// Values are NOT enforced — the user can "Skip" and continue with all 0.
export default function EstimateWeightDialog({ isOpen, onClose, onContinue, onSkip }: EstimateWeightDialogProps) {
  const [plastic, setPlastic] = useState('')
  const [cardboard, setCardboard] = useState('')
  const [glass, setGlass] = useState('')

  const parse = (v: string) => {
    const n = parseFloat(v)
    return Number.isFinite(n) && n > 0 ? n : 0
  }

  // Reset inputs every time the dialog opens so they don't leak from previous state.
  const handleClose = () => {
    setPlastic('')
    setCardboard('')
    setGlass('')
    onClose()
  }

  const handleContinue = () => {
    onContinue({
      estPlasticWeight: parse(plastic),
      estCardboardWeight: parse(cardboard),
      estGlassWeight: parse(glass),
    })
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Estimasi Berat Sampah"
      description="Opsional — bantu kolektor nebak muatan sebelum datang."
    >
      <div className="space-y-4">
        <div className="flex items-start gap-2.5 bg-neutral-50 border border-neutral-100 rounded-base p-3.5">
          <Scale size={16} className="shrink-0 mt-0.5 text-primary" />
          <p className="text-xs font-medium text-neutral-500 leading-relaxed">
            Estimasi aja, gak perlu presisi — kolektor bakal timbang ulang pas di lokasi.
          </p>
        </div>

        <div className="space-y-3">
          <EstimateField
            label="Plastik"
            value={plastic}
            onChange={setPlastic}
            autoFocus
          />
          <EstimateField
            label="Kardus"
            value={cardboard}
            onChange={setCardboard}
          />
          <EstimateField
            label="Kaca"
            value={glass}
            onChange={setGlass}
          />
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={handleContinue}
            className="w-full min-h-11 rounded-base font-bold flex items-center justify-center gap-2 transition-all bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98] shadow-soft"
          >
            Lanjut <ArrowRight size={18} />
          </button>
          <button
            onClick={onSkip}
            className="w-full min-h-11 rounded-base font-bold flex items-center justify-center gap-2 transition-all bg-white hover:bg-neutral-50 text-neutral-500 border border-neutral-200 active:scale-[0.98]"
          >
            Lewati
          </button>
        </div>
      </div>
    </Dialog>
  )
}

function EstimateField({
  label,
  value,
  onChange,
  autoFocus,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  autoFocus?: boolean
}) {
  return (
    <label className="flex items-center justify-between gap-3 bg-white rounded-base border border-neutral-200 px-4 py-3 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
      <span className="text-sm font-semibold text-neutral-700">{label}</span>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={0.1}
          placeholder="0"
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 text-right text-sm font-bold text-neutral-900 bg-transparent outline-none placeholder:font-medium placeholder:text-neutral-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{KG_FORMAT}</span>
      </div>
    </label>
  )
}