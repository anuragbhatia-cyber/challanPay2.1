import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface UserState {
  userName: string | null
  userMobile: string | null
  vehicleNumber: string | null
  isVerificationModalOpen: boolean
  setUser: (name: string, mobile: string) => void
  setVehicleNumber: (vn: string | null) => void
  openVerificationModal: () => void
  closeVerificationModal: () => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userName: null,
      userMobile: null,
      vehicleNumber: null,
      isVerificationModalOpen: false,
      setUser: (name, mobile) => set({ userName: name, userMobile: mobile }),
      setVehicleNumber: (vn) => set({ vehicleNumber: vn }),
      openVerificationModal: () => set({ isVerificationModalOpen: true }),
      closeVerificationModal: () => set({ isVerificationModalOpen: false }),
      logout: () => set({ userName: null, userMobile: null, vehicleNumber: null }),
    }),
    {
      name: 'challanpay-user',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        userName: state.userName,
        userMobile: state.userMobile,
        vehicleNumber: state.vehicleNumber,
      }),
    }
  )
)
