import { User as UserIcon, ShieldCheck, Star, Truck, MapPin, Wallet, LogOut } from 'lucide-react'

interface CollectorProfileProps {
  userData: any;
  onLogout: () => void;
}

export default function CollectorProfileView({ userData, onLogout }: CollectorProfileProps) {
  if (!userData) return null;

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-800 to-black p-6 rounded-[2rem] shadow-lg shadow-black/10 flex items-center gap-5 mb-8 text-white border border-zinc-800">
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center shrink-0 border border-zinc-700 backdrop-blur-sm relative z-10">
          <UserIcon size={28} className="text-emerald-400" />
        </div>
        <div className="overflow-hidden relative z-10">
          <h3 className="text-xl font-black flex items-center gap-1.5 truncate tracking-tight">
            {userData.name} <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
          </h3>
          <p className="text-sm font-medium text-zinc-400 truncate mt-0.5">{userData.email}</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[10px] font-bold text-zinc-900 bg-white px-2.5 py-1 rounded-md uppercase tracking-wider">Mitra Aktif</span>
            <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md flex items-center gap-1 uppercase tracking-wider"><Star size={10} className="fill-amber-500"/> 4.9 Rating</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-8">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2">Detail Operasional</p>
        <div className="bg-white rounded-[1.5rem] border border-zinc-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-zinc-50 w-full text-left">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-zinc-50 rounded-xl"><Truck size={18} className="text-zinc-600"/></div>
              <span className="font-bold text-zinc-600 text-sm">Jenis Kendaraan</span>
            </div>
            <span className="text-sm font-black text-zinc-900 bg-zinc-100 px-3 py-1.5 rounded-lg">Motor Bak</span>
          </div>
          <div className="flex items-center justify-between p-4 border-b border-zinc-50 w-full text-left">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-zinc-50 rounded-xl"><MapPin size={18} className="text-zinc-600"/></div>
              <span className="font-bold text-zinc-600 text-sm">Area Operasional</span>
            </div>
            <span className="text-sm font-black text-zinc-900">Jakarta Pusat</span>
          </div>
          <div className="flex items-center justify-between p-4 w-full text-left">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-zinc-50 rounded-xl"><Wallet size={18} className="text-zinc-600"/></div>
              <span className="font-bold text-zinc-600 text-sm">Rekening Pencairan</span>
            </div>
            <span className="text-sm font-black text-zinc-900">BCA ****1234</span>
          </div>
        </div>
      </div>

      <button onClick={onLogout} className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 border border-red-100">
        <LogOut size={18} strokeWidth={2.5} /> Akhiri Shift (Logout)
      </button>
    </div>
  )
}