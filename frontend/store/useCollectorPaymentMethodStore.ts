import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PaymentMethod } from './usePaymentMethodStore'

interface CollectorPaymentMethodState {
  collectorMethods: PaymentMethod[];
  selectedCollectorMethodId: string | null;
  addCollectorMethod: (method: PaymentMethod) => void;
  setSelectedCollectorMethodId: (id: string | null) => void;
}

// Collector earnings payout preferences. Deliberately persisted under a SEPARATE
// storage key (`collector-payment-methods`) so it does not clash with citizen
// methods (`pilah-payment-methods`) — they are different accounts.
// PaymentMethod type is reused from the citizen store (not duplicated).
export const useCollectorPaymentMethodStore = create<CollectorPaymentMethodState>()(
  persist(
    (set) => ({
      collectorMethods: [
        { id: 'gopay', name: 'GoPay', detail: '0812-3456-7890', kind: 'ewallet' },
        { id: 'bank', name: 'Bank Transfer', detail: 'Belum disambungkan', kind: 'bank' },
      ],
      selectedCollectorMethodId: 'gopay',
      addCollectorMethod: (method) =>
        set((s) => ({
          collectorMethods: [...s.collectorMethods, method],
          selectedCollectorMethodId: method.id,
        })),
      setSelectedCollectorMethodId: (id) => set({ selectedCollectorMethodId: id }),
    }),
    {
      name: 'collector-payment-methods',
    }
  )
)