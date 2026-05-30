'use client'

import { useEffect, useState } from 'react'
import { X, ShieldCheck, Scale, Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react'
import { usePilahStore } from '@/store/usePilahStore'
import { getUserHistory, confirmPickupUser } from '@/lib/api'

export default function HandshakeSheet() {
   const { isVerificationOpen, closeVerification, userData, setUserData, token } = usePilahStore()
   const [loading, setLoading] = useState(false)
   const [success, setSuccess] = useState(false)
   const [orderData, setOrderData] = useState<any>(null)

useEffect(() => {
   if (isVerificationOpen && token) {
      getUserHistory(token).then((history) => {
         const target = history.find((h: any) => h.status === 'VERIFYING');
         if (target) setOrderData(target);
      }).catch(console.error);
   }
   }, [isVerificationOpen, token]);

   if (!isVerificationOpen) return null

   const totalKarma = orderData ? 
    (orderData.plastic_weight * 10) + (orderData.cardboard_weight * 7) + (orderData.glass_weight * 15) 
   : 0;

   const handleApprove = async () => {
   setLoading(true);
   try {
      if (!token) throw new Error("Sesi tidak valid");
      
      // 1. Tarik Data Terbaru
      const history = await getUserHistory(token);
      const targetOrder = history.find((h: any) => h.status === 'VERIFYING');
      
      if (!targetOrder) throw new Error("Data order tidak ditemukan di database");

      // 2. TEMBAK BACKEND (Proses ini WAJIB lolos dulu!)
      await confirmPickupUser(token, targetOrder.id.toString());

      // 3. JIKA BACKEND SUKSES, BARU UPDATE POIN LOKAL
      setSuccess(true);
      if (userData) {
      setUserData({
         ...userData,
         karma_points: (userData.karma_points || 0) + totalKarma 
      });
      }
   } catch (error: any) {
      console.error("Anti-Fraud System Blocked:", error);
      alert(`Transaksi Gagal: ${error.message || 'Koneksi ke server terputus.'}`);
   } finally {
      setLoading(false);
      }
   }

   const handleReject = () => {
      if (orderData?.id) {
      sessionStorage.setItem(`banned_order_${orderData.id}`, 'true');
   }
   closeVerification();
   };

   return (
      <div className="fixed inset-0 z-[70] flex justify-center items-end sm:items-center bg-zinc-900/70 backdrop-blur-md animate-in fade-in duration-300">
         <div className="absolute inset-0" onClick={success ? () => { setSuccess(false); closeVerification(); } : closeVerification} />

         <div className="relative w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2rem] p-6 pb-12 sm:p-8 shadow-2xl animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300 ease-out">
            <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mb-6 sm:hidden" />

         {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in-95 duration-500">
               <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-6 shadow-inner border border-emerald-100">
                  <CheckCircle2 size={44} strokeWidth={2.5} className="animate-bounce" />
               </div>
               <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Jabat Tangan Sukses!</h3>
               <p className="text-sm font-medium text-zinc-500 mt-2 leading-relaxed px-4">
                  Saldo wallet utama kamu otomatis ter-update.<br />
                  <span className="text-emerald-600 font-bold">+{totalKarma} Karma Points</span> resmi dicairkan!
               </p>
               <button 
                  onClick={() => { setSuccess(false); closeVerification(); }} 
                  className="w-full mt-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm rounded-2xl active:scale-95 transition-all shadow-md"
               >
                  Kembali ke Beranda
               </button>
            </div>
         ) : (
            <>
            <div className="flex justify-between items-start mb-6">
               <div>
                  <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2 tracking-tight">
                     Sistem Anti-Fraud <ShieldCheck size={22} className="text-emerald-500" />
                  </h2>
                  <p className="text-sm font-medium text-zinc-500 mt-1">Konfirmasi timbangan sampah dari Kolektor.</p>
               </div>
            </div>

            <div className="mb-5 relative rounded-2xl h-44 bg-zinc-900 overflow-hidden border border-zinc-200 shadow-inner group">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=500')] bg-cover bg-center opacity-80" />
               <div className="absolute top-3 left-3 bg-zinc-900/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <ImageIcon size={12} /> Bukti Kamera Kolektor
               </div>
            </div>

            <div className="bg-blue-50/40 border-x-0 border-y-2 border-y-blue-500 p-5 w-full flex flex-col gap-3 mb-6 shadow-sm">
               <p className="text-[10px] font-bold text-blue-800 uppercase tracking-widest px-0.5">Hasil Timbangan Lapangan Asli</p>
               
               <div className="flex justify-between items-center text-sm font-bold text-zinc-700">
                  <span className="flex items-center gap-2.5 text-zinc-900">
                     <img src="/botol.png" alt="Plastik" className="w-5 h-5 object-contain [image-rendering:pixelated]" />
                     {orderData?.plastic_weight || 0} kg Botol Plastik
                     </span>
                  <span className="text-blue-600">+{(orderData?.plastic_weight || 0) * 10} Poin</span>
               </div>

               <div className="flex justify-between items-center text-sm font-bold text-zinc-700 pt-2 border-t border-blue-200/50">
                  <span className="flex items-center gap-2.5 text-zinc-900">
                     <img src="/kardus.png" alt="Kardus" className="w-5 h-5 object-contain [image-rendering:pixelated]" />
                     {orderData?.cardboard_weight || 0} kg Kardus
                  </span>
                  <span className="text-blue-600">+{(orderData?.cardboard_weight || 0) * 7} Poin</span>
                     </div>

               <div className="flex justify-between items-center text-sm font-bold text-zinc-700 pt-2 border-t border-blue-200/50">
                  <span className="flex items-center gap-2.5 text-zinc-900">
                     <img src="/jar.png" alt="Kaca" className="w-5 h-5 object-contain [image-rendering:pixelated]" />
                     {orderData?.glass_weight || 0} kg Botol Kaca
                  </span>
                    <span className="text-blue-600">+{(orderData?.glass_weight || 0) * 15} Poin</span>
               </div>
            </div>

            <div className="bg-gradient-to-br from-zinc-800 to-black text-white p-5 rounded-2xl flex items-center justify-between shadow-xl shadow-zinc-900/20 mb-6 border border-zinc-800">
               <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Total Karma Masuk</p>
                  <p className="text-2xl font-black tracking-tight text-emerald-400">+{totalKarma} Karma</p>
               </div>
                  <div className="text-right">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Metode Keamanan</p>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">2-Way Secure</span>
               </div>
            </div>

            <div className="flex gap-3">
                  <button onClick={handleReject} disabled={loading} className="flex-1 py-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-bold text-sm rounded-xl active:scale-95 transition-all disabled:opacity-50">
                     Tolak (Beda)
                  </button>
                  <button onClick={handleApprove} disabled={loading} className="flex-[2] py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl active:scale-95 transition-all shadow-md flex justify-center items-center gap-2 disabled:opacity-50">
                     {loading ? <Loader2 className="animate-spin" size={18} /> : <><ShieldCheck size={18} /> Ya, Sesuai!</>}
                  </button>
               </div>
            </>
         )}
      </div>
   </div>
   )
}