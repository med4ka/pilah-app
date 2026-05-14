import { create } from 'zustand'
import { persist } from 'zustand/middleware' // [+] VIBE CODE: Fitur sakti untuk menyimpan sesi

interface UserData {
  id: number;
  name: string;
  email: string;
  karma_points: number;
  role: string;
}

interface PilahState {
  token: string | null;
  setToken: (token: string | null) => void;
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
  logout: () => void;

  isSearching: boolean;
  startSearching: () => void;
  stopSearching: () => void;

  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;

  isRewardSheetOpen: boolean;
  openRewardSheet: () => void;
  closeRewardSheet: () => void;

  isPilahPintarOpen: boolean;
  openPilahPintar: () => void;
  closePilahPintar: () => void;

  isDropPointOpen: boolean;
  openDropPoint: () => void;
  closeDropPoint: () => void;
}

// [+] IMPLEMENTASI PERSIST MIDDLEWARE (Lightweight Session Management)
export const usePilahStore = create<PilahState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      userData: null,
      setUserData: (data) => set({ userData: data }),
      logout: () => set({ token: null, userData: null }),

      isSearching: false,
      startSearching: () => set({ isSearching: true }),
      stopSearching: () => set({ isSearching: false }),

      isAuthModalOpen: false,
      openAuthModal: () => set({ isAuthModalOpen: true }),
      closeAuthModal: () => set({ isAuthModalOpen: false }),

      isRewardSheetOpen: false,
      openRewardSheet: () => set({ isRewardSheetOpen: true }),
      closeRewardSheet: () => set({ isRewardSheetOpen: false }),

      isPilahPintarOpen: false,
      openPilahPintar: () => set({ isPilahPintarOpen: true }),
      closePilahPintar: () => set({ isPilahPintarOpen: false }),

      isDropPointOpen: false,
      openDropPoint: () => set({ isDropPointOpen: true }),
      closeDropPoint: () => set({ isDropPointOpen: false }),
    }),
    {
      name: 'pilah-session', // Nama kunci di localStorage
      // OPTIMIZED RENDERING: Kita hanya menyimpan token dan userData agar memori tidak berat
      partialize: (state) => ({ token: state.token, userData: state.userData }), 
    }
  )
)