import { create } from 'zustand'
import { persist } from 'zustand/middleware' 

export interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  karma_points: number;
}

interface PilahState {
  token: string | null;
  userData: UserData | null;
  setToken: (token: string) => void;
  setUserData: (data: UserData) => void;
  logout: () => void;

  isCalculatorOpen: boolean;
  openCalculator: () => void;
  closeCalculator: () => void;

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

  isDropPointSheetOpen: boolean;
  openDropPoint: () => void;
  closeDropPointSheet: () => void;

  isMoreSheetOpen: boolean;
  openMoreSheet: () => void;
  closeMoreSheet: () => void;

  isVerificationOpen: boolean;
  openVerification: () => void;
  closeVerification: () => void;

  isDonasiOpen: boolean;
  openDonasi: () => void;
  closeDonasi: () => void;
}

export const usePilahStore = create<PilahState>()(
  persist(
    (set) => ({
      token: null, 
      userData: null,
      setToken: (token) => set({ token }),
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

      isDropPointSheetOpen: false,
      openDropPoint: () => set({ isDropPointSheetOpen: true }),
      closeDropPointSheet: () => set({ isDropPointSheetOpen: false }),

      isMoreSheetOpen: false,
      openMoreSheet: () => set({ isMoreSheetOpen: true }),
      closeMoreSheet: () => set({ isMoreSheetOpen: false }),

      isCalculatorOpen: false,
      openCalculator: () => set({ isCalculatorOpen: true }),
      closeCalculator: () => set({ isCalculatorOpen: false }),

      isVerificationOpen: false,
      openVerification: () => set({ isVerificationOpen: true }),
      closeVerification: () => set({ isVerificationOpen: false }),

      isDonasiOpen: false,
      openDonasi: () => set({ isDonasiOpen: true }),
      closeDonasi: () => set({ isDonasiOpen: false }),
    }),
    {
      name: 'pilah-app-auth', 
      partialize: (state) => ({ 
        token: state.token, 
        userData: state.userData 
      }),
    }
  )
)