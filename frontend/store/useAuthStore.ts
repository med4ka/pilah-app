import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { logoutUser } from '@/lib/api'

export interface UserData {
  id: number;
  name: string;
  email: string;
  karma_points: number;
  collector_earnings?: number;
  role: string;
  vehicle_type?: string;
  service_area?: string;
  bank_name?: string;
  bank_account_number?: string;
}

interface AuthState {
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
  logout: () => void;
}

// Session auth. Only userData is persisted as a UI cache — the JWT token is
// NEVER stored client-side (login detected via cookie + GET /users/me).
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userData: null,
      setUserData: (data) => set({ userData: data }),
      // Clear the cookie on the server first, then reset local state
      logout: async () => {
        try {
          await logoutUser()
        } catch {
          // Still reset local state even if the logout request fails
        }
        set({ userData: null })
      },
    }),
    {
      name: 'pilah-session',
      partialize: (state) => ({ userData: state.userData }),
    }
  )
)
