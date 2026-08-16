import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PaymentMethod {
  id: string;
  name: string;
  detail: string;
  kind: 'ewallet' | 'bank';
}

interface PaymentMethodState {
  paymentMethods: PaymentMethod[];
  selectedMethodId: string | null;
  addPaymentMethod: (method: PaymentMethod) => void;
  setSelectedMethodId: (id: string | null) => void;
}

// Payout method preferences for the Redeem Cuan simulation. PERSISTED to
// localStorage because these are only UI preferences (not real financial data) —
// payouts are never actually sent, so there is no security risk.
export const usePaymentMethodStore = create<PaymentMethodState>()(
  persist(
    (set) => ({
      paymentMethods: [
        { id: 'gopay', name: 'GoPay', detail: '0812-3456-7890', kind: 'ewallet' },
        { id: 'bank', name: 'Bank Transfer', detail: 'Belum disambungkan', kind: 'bank' },
      ],
      selectedMethodId: 'gopay',
      addPaymentMethod: (method) =>
        set((s) => ({
          paymentMethods: [...s.paymentMethods, method],
          selectedMethodId: method.id,
        })),
      setSelectedMethodId: (id) => set({ selectedMethodId: id }),
    }),
    {
      name: 'pilah-payment-methods',
    }
  )
)
