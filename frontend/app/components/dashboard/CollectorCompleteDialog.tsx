'use client'

import { useState } from 'react'
import { Scale, CheckCircle2, Loader2 } from 'lucide-react'
import Dialog from '@/app/components/ui/Dialog'

// Collector weight-input form (REQUIRED) before the pickup moves from ACCEPTED
// to VERIFYING. Differs from the resident-owned EstimateWeightDialog (optional/skip) —
// here at least one material weight must be > 0, because these values are the
// basis for computing resident karma & collector earnings (see pickup_service.go).
const KG_FORMAT = 'kg'

export interface CollectorVerificationInput {
  plasticWeight: number
  cardboardWeight: number
  glassWeight: number
}

interface CollectorCompleteDialogProps {
  isOpen: boolean
  onClose: () => void
  isProcessing: boolean
  onSubmit: (input: CollectorVerificationInput) => void
}

export default function CollectorCompleteDialog({ isOpen, onClose, isProcessing, onSubmit }: CollectorCompleteDialogProps) {
  const [plastic, setPlastic] = useState('')
  const [cardboard, setCardboard] = useState('')
  const [glass, setGlass] = useState('')
  const [error, setError] = useState('')

  const parse = (v: string) => {
    const n = parseFloat(v)
    return Number.isFinite(n) && n > 0 ? n : 0
  }

  const handleClose = () => {
    setPlastic('')
    setCardboard('')
    setGlass('')
    setError('')
    onClose()
  }

  const handleSubmit = () => {
    const plasticWeight = parse(plastic)
    const cardboardWeight = parse(cardboard)
    const glassWeight = parse(glass)
    if (plasticWeight + cardboardWeight + glassWeight <= 0) {
      setError('Isi minimal 1 jenis berat sebelum menyelesaikan')
      return
    }
    setError('')
    onSubmit({ plasticWeight, cardboardWeight, glassWeight })
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Timbang Sampah"
      description="Wajib isi berat tiap material hasil penimbangan di lokasi."
    >
      <div className="space-y-4">
        <div className="flex items-start gap-2.5 bg-neutral-50 border border-neutral-100 rounded-base p-3.5">
          <Scale size={16} className="shrink-0 mt-0.5 text-primary" />
          <p className="text-xs font-medium text-neutral-500 leading-relaxed">
            Angka inilah yang dipakai warga untuk konfirmasi — dan jadi dasar
            hitung karma warga plus pendapatan kamu.
          </p>
        </div>

        <div className="space-y-3">
          <WeightField label="Plastik" value={plastic} onChange={setPlastic} autoFocus />
          <WeightField label="Kardus" value={cardboard} onChange={setCardboard} />
          <WeightField label="Kaca" value={glass} onChange={setGlass} />
        </div>

        {error && (
          <p className="text-xs font-semibold text-status-error bg-status-error/5 border border-status-error/20 rounded-base px-3 py-2.5">
            {error}
          </p>
        )}

        <div className="pt-2">
          <button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="w-full min-h-11 rounded-base font-bold flex items-center justify-center gap-2 transition-all bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98] shadow-soft disabled:opacity-70"
          >
            {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle2 size={18} /> Kirim & Selesaikan</>}
          </button>
        </div>
      </div>
    </Dialog>
  )
}

function WeightField({
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
