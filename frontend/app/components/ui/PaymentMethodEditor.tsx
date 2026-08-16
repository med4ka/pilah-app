'use client'

import { useState } from 'react'
import { CheckCircle2, CreditCard, Smartphone, Plus, Landmark } from 'lucide-react'
import type { PaymentMethod } from '@/store/usePaymentMethodStore'

interface PaymentMethodEditorProps {
  methods: PaymentMethod[];
  selectedMethodId: string | null;
  onSelect: (id: string) => void;
  onAdd: (method: Omit<PaymentMethod, 'id'>) => void;
  onInvalid?: () => void;
}

// Reusable payout/payment method editor — used by residents (ProfileTab → Cuan
// Exchange) AND collectors (Profile tab → Earnings). All state (store) is read
// through props so this component doesn't know which store is used; the method id
// is created by the parent when onAdd is called.
export default function PaymentMethodEditor({
  methods,
  selectedMethodId,
  onSelect,
  onAdd,
  onInvalid,
}: PaymentMethodEditorProps) {
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDetail, setNewDetail] = useState('')
  const [newKind, setNewKind] = useState<'ewallet' | 'bank'>('ewallet')

  const handleAdd = () => {
    const name = newName.trim()
    const detail = newDetail.trim()
    if (name === '' || detail === '') {
      onInvalid?.()
      return
    }
    onAdd({ name, detail, kind: newKind })
    setShowAdd(false)
    setNewName('')
    setNewDetail('')
    setNewKind('ewallet')
  }

  return (
    <div className="space-y-3">
      {methods.length === 0 && (
        <p className="text-sm font-medium text-neutral-400 text-center py-3">
          Belum ada metode. Tambah metode pertama-mu.
        </p>
      )}
      {methods.map((method) => {
        const isSelected = selectedMethodId === method.id
        const isConnected = method.kind === 'ewallet' || method.detail !== 'Belum disambungkan'
        return (
          <div
            key={method.id}
            onClick={() => onSelect(method.id)}
            className={`bg-white rounded-[1.5rem] p-4 flex items-center justify-between cursor-pointer transition-all ${
              isSelected ? 'border-2 border-primary shadow-soft' : 'border-2 border-neutral-100 hover:border-neutral-300'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${method.kind === 'bank' ? 'bg-status-accepted/10' : 'bg-primary/5'}`}>
                {method.kind === 'bank'
                  ? <CreditCard className="text-status-accepted" size={20} />
                  : <Smartphone className="text-primary" size={20} />}
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 text-lg leading-tight">{method.name}</h4>
                <p className={`text-[11px] font-bold mt-1 tracking-wider ${isConnected ? 'text-neutral-400' : 'text-neutral-300'}`}>
                  {isConnected ? method.detail : 'Belum disambungkan'}
                </p>
              </div>
            </div>
            <CheckCircle2 className={isSelected ? 'text-primary' : 'text-neutral-200'} size={24} />
          </div>
        )
      })}

      {showAdd && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-[1.5rem] p-5 space-y-4 animate-in fade-in duration-200">
          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1 mb-1 block">Jenis Metode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setNewKind('ewallet')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                  newKind === 'ewallet' ? 'border-primary bg-primary/5 text-primary' : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300'
                }`}
              >
                <Smartphone size={16} /> E-Wallet
              </button>
              <button
                type="button"
                onClick={() => setNewKind('bank')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                  newKind === 'bank' ? 'border-status-accepted bg-status-accepted/5 text-status-accepted' : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300'
                }`}
              >
                <Landmark size={16} /> Bank
              </button>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1 mb-1 block">Nama Metode</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={newKind === 'bank' ? 'Contoh: BCA, Mandiri' : 'Contoh: DANA, OVO'}
              className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3.5 text-neutral-900 font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-soft"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1 mb-1 block">
              {newKind === 'bank' ? 'Nomor Rekening' : 'Nomor HP / ID Akun'}
            </label>
            <input
              type="text"
              value={newDetail}
              onChange={(e) => setNewDetail(e.target.value)}
              placeholder="Isi nomor mulai dengan 0"
              className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3.5 text-neutral-900 font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-soft"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleAdd} className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-md">
              Simpan Metode
            </button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-3.5 bg-white border border-neutral-200 text-neutral-500 font-bold rounded-xl hover:bg-neutral-50 transition-all active:scale-[0.98]">
              Batal
            </button>
          </div>
        </div>
      )}

      {!showAdd && (
        <button onClick={() => setShowAdd(true)} className="w-full border-2 border-dashed border-neutral-200 text-neutral-500 hover:text-primary hover:border-primary/30 hover:bg-primary/5 font-bold py-4 rounded-[1.5rem] transition-all flex items-center justify-center gap-2 active:scale-95 mt-2 flex-1">
          <Plus size={18} /> Tambah Metode Baru
        </button>
      )}
    </div>
  )
}
