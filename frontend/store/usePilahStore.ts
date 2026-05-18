import { create } from 'zustand'

interface PilahState {
  // 👤 Auth & User Data
  token: string | null;
  userData: any | null;
  setToken: (token: string) => void;
  setUserData: (data: any) => void;
  logout: () => void;

  // 🗺️ Radar & Searching State
  isSearching: boolean;
  startSearching: () => void;
  stopSearching: () => void;

  // 🪟 Modals & Sheets State (Ini yang bikin Error tadi!)
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;

  isRewardSheetOpen: boolean;
  openRewardSheet: () => void;
  closeRewardSheet: () => void;

  isPilahPintarOpen: boolean;
  openPilahPintar: () => void;
  closePilahPintar: () => void;

  isDropPointSheetOpen: boolean;
  openDropPoint: () => void;
  closeDropPointSheet: () => void;
}

export const usePilahStore = create<PilahState>((set) => ({
  // 👤 Auth & User Implementation
  token: null, // Kalau lu pakai localStorage sebelumnya buat init, sesuaikan aja
  userData: null,
  setToken: (token) => set({ token }),
  setUserData: (data) => set({ userData: data }),
  logout: () => set({ token: null, userData: null }),

  // 🗺️ Radar & Searching Implementation
  isSearching: false,
  startSearching: () => set({ isSearching: true }),
  stopSearching: () => set({ isSearching: false }),

  // 🪟 Modals & Sheets Implementation
  isAuthModalOpen: false,
  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),

  isRewardSheetOpen: false,
  openRewardSheet: () => set({ isRewardSheetOpen: true }),
  closeRewardSheet: () => set({ isRewardSheetOpen: false }),

  isPilahPintarOpen: false,
  openPilahPintar: () => set({ isPilahPintarOpen: true }),
  closePilahPintar: () => set({ isPilahPintarOpen: false }),

  isDropPointSheetOpen: false,
  openDropPoint: () => set({ isDropPointSheetOpen: true }),
  closeDropPointSheet: () => set({ isDropPointSheetOpen: false }),
}))