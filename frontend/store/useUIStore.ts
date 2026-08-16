import { create } from 'zustand'

interface UIState {
  isSearching: boolean;
  startSearching: () => void;
  stopSearching: () => void;

  // Completed pickup id the user has dismissed ("Close" on the finished card).
  // Stored GLOBALLY (here, not a component ref) so it is still recognized even
  // if ActivePickupCard fully unmounts when switching tabs and back — polling must
  // not re-show a terminal card that was already dismissed.
  dismissedPickupId: string | null;
  setDismissedPickupId: (id: string | null) => void;

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
  openDropPointSheet: () => void;
  closeDropPointSheet: () => void;

  isNotificationCenterOpen: boolean;
  openNotificationCenter: () => void;
  closeNotificationCenter: () => void;

  isHelpCenterOpen: boolean;
  openHelpCenter: () => void;
  closeHelpCenter: () => void;
}

// Transient UI state — NOT persisted to localStorage because it only tracks
// open/closed modals & sheets, not data that needs to survive a refresh.
export const useUIStore = create<UIState>()((set) => ({
  isSearching: false,
  startSearching: () => set({ isSearching: true }),
  stopSearching: () => set({ isSearching: false }),

  dismissedPickupId: null,
  setDismissedPickupId: (id) => set({ dismissedPickupId: id }),

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
  openDropPointSheet: () => set({ isDropPointSheetOpen: true }),
  closeDropPointSheet: () => set({ isDropPointSheetOpen: false }),

  isNotificationCenterOpen: false,
  openNotificationCenter: () => set({ isNotificationCenterOpen: true }),
  closeNotificationCenter: () => set({ isNotificationCenterOpen: false }),

  isHelpCenterOpen: false,
  openHelpCenter: () => set({ isHelpCenterOpen: true }),
  closeHelpCenter: () => set({ isHelpCenterOpen: false }),
}))
