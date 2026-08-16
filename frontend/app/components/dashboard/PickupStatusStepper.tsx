'use client'

import { Check } from 'lucide-react'

export type PickupStatus = 'PENDING' | 'ACCEPTED' | 'VERIFYING' | 'COMPLETED'

interface PickupStatusStepperProps {
  currentStatus: PickupStatus;
}

const STEPS: { status: PickupStatus; label: string }[] = [
  { status: 'PENDING', label: 'Menunggu' },
  { status: 'ACCEPTED', label: 'Diambil' },
  { status: 'VERIFYING', label: 'Verifikasi' },
  { status: 'COMPLETED', label: 'Selesai' },
]

// Active node color follows the status token in globals.css (not new hardcoded hex).
const STATUS_COLORS: Record<PickupStatus, string> = {
  PENDING: 'var(--color-status-pending)',
  ACCEPTED: 'var(--color-status-accepted)',
  VERIFYING: 'var(--color-status-verifying)',
  COMPLETED: 'var(--color-status-completed)',
}

const BASE_NODE = 26
const ACTIVE_NODE = 32

export default function PickupStatusStepper({ currentStatus }: PickupStatusStepperProps) {
  const currentIndex = STEPS.findIndex((s) => s.status === currentStatus)

  return (
    <div className="relative w-full" role="progressbar" aria-valuenow={currentIndex + 1} aria-valuemin={1} aria-valuemax={4} aria-label="Status pickup">
      <div className="absolute -z-10 left-0 right-0 top-[17px] h-[2px]">
        {STEPS.slice(0, -1).map((_, i) => {
          const passed = i < currentIndex
          return (
            <div
              key={`segment-${i}`}
              className="absolute h-full"
              style={{
                left: `${i * 25 + 12.5}%`,
                width: '25%',
                backgroundColor: passed ? 'var(--color-primary)' : 'var(--color-neutral-300)',
                transition: 'background-color 300ms ease-out',
              }}
            />
          )
        })}
      </div>

      <div className="flex">
        {STEPS.map((step, i) => {
          const isPassed = i < currentIndex
          const isActive = i === currentIndex
          const isCompletedActive = isActive && currentStatus === 'COMPLETED'

          let nodeBg = 'var(--color-neutral-300)'
          if (isPassed) nodeBg = 'var(--color-primary)'
          else if (isActive) nodeBg = STATUS_COLORS[currentStatus]

          const showCheck = isPassed || isCompletedActive

          return (
            <div key={step.status} className="flex-1 flex flex-col items-center">
              <div
                className="relative flex items-center justify-center rounded-full shadow-soft"
                style={{
                  width: isActive ? ACTIVE_NODE : BASE_NODE,
                  height: isActive ? ACTIVE_NODE : BASE_NODE,
                  backgroundColor: nodeBg,
                  animation: isActive && currentStatus !== 'COMPLETED' ? 'pulse 2s ease-in-out infinite' : undefined,
                }}
              >
                {showCheck && <Check size={14} strokeWidth={3} className="text-white" />}
              </div>
              <span
                className={`mt-2 text-[11px] font-bold text-center leading-tight tracking-tight ${
                  isPassed ? 'text-neutral-700' : isActive ? 'text-neutral-900' : 'text-neutral-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}