import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface ChallanItem {
  id: string
  challanNumber: string
  amount: number
  violation: string
  date: string
  location: string
  type: 'online' | 'court'
  pendingSince?: string
  premiumEligible?: boolean
}

export type ResolutionMethod = 'regular' | 'premium'

export const ONLINE_CONVENIENCE_FEE = 200
export const COURT_CONVENIENCE_FEE = 2000
export const EXPRESS_FEE = 1000
export const EXPRESS_CONVENIENCE_FEE = 3000
export const PLEDGE_REWARD = 1000

interface ChallanState {
  challans: ChallanItem[]
  selectedChallanIds: string[]
  submittedChallans: ChallanItem[]
  lastTransactionId: string | null
  lastTransactionAmount: number | null
  lastTransactionChallanCount: number | null
  pledgeConfettiShown: boolean
  activeTab: 'pending' | 'paid'
  resolutionMethod: ResolutionMethod
  setChallans: (challans: ChallanItem[]) => void
  toggleChallan: (id: string) => void
  selectAll: (ids: string[]) => void
  clearSelection: () => void
  setActiveTab: (tab: 'pending' | 'paid') => void
  setResolutionMethod: (method: ResolutionMethod) => void
  recordTransaction: (id: string, amount: number, challanCount: number) => void
  markSubmitted: (ids: string[]) => void
  markPledgeConfettiShown: () => void
}

export const useChallanStore = create<ChallanState>()(
  persist(
    (set) => ({
      challans: [],
      selectedChallanIds: [],
      submittedChallans: [],
      lastTransactionId: null,
      lastTransactionAmount: null,
      lastTransactionChallanCount: null,
      pledgeConfettiShown: false,
      activeTab: 'pending',
      resolutionMethod: 'regular',
      setChallans: (challans) => set({ challans }),
      toggleChallan: (id) =>
        set((state) => ({
          selectedChallanIds: state.selectedChallanIds.includes(id)
            ? state.selectedChallanIds.filter((cid) => cid !== id)
            : [...state.selectedChallanIds, id],
        })),
      selectAll: (ids) => set({ selectedChallanIds: ids }),
      clearSelection: () => set({ selectedChallanIds: [] }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setResolutionMethod: (method) => set({ resolutionMethod: method }),
      recordTransaction: (id, amount, challanCount) => set({ lastTransactionId: id, lastTransactionAmount: amount, lastTransactionChallanCount: challanCount }),
      markSubmitted: (ids) =>
        set((state) => {
          const idSet = new Set(ids)
          const snapshots = state.challans.filter((c) => idSet.has(c.id))
          const existingIds = new Set(state.submittedChallans.map((c) => c.id))
          const fresh = snapshots.filter((c) => !existingIds.has(c.id))
          return { submittedChallans: [...state.submittedChallans, ...fresh] }
        }),
      markPledgeConfettiShown: () => set({ pledgeConfettiShown: true }),
    }),
    {
      name: 'challanpay-challans',
      storage: createJSONStorage(() => sessionStorage),
      version: 3,
      migrate: (persisted: unknown, version: number) => {
        if (!persisted || typeof persisted !== 'object') return persisted as never
        const state = persisted as Record<string, unknown>
        if (version < 2) {
          const renameTatkalKey = (c: Record<string, unknown>) => {
            if ('tatkalEligible' in c) {
              c.premiumEligible = c.tatkalEligible
              delete c.tatkalEligible
            }
            return c
          }
          if (Array.isArray(state.challans)) state.challans = state.challans.map(renameTatkalKey)
          if (Array.isArray(state.submittedChallans)) state.submittedChallans = state.submittedChallans.map(renameTatkalKey)
          if (state.resolutionMethod === 'tatkal') state.resolutionMethod = 'premium'
        }
        if (version < 3) {
          const dropRetiredChallan = (list: unknown) =>
            Array.isArray(list)
              ? list.filter((c) => !(c && typeof c === 'object' && (c as Record<string, unknown>).challanNumber === 'DL07838230627114381'))
              : list
          state.challans = dropRetiredChallan(state.challans)
          state.submittedChallans = dropRetiredChallan(state.submittedChallans)
        }
        return state as never
      },
      partialize: (state) => ({
        challans: state.challans,
        selectedChallanIds: state.selectedChallanIds,
        submittedChallans: state.submittedChallans,
        lastTransactionId: state.lastTransactionId,
        lastTransactionAmount: state.lastTransactionAmount,
        lastTransactionChallanCount: state.lastTransactionChallanCount,
        pledgeConfettiShown: state.pledgeConfettiShown,
        resolutionMethod: state.resolutionMethod,
      }),
    }
  )
)
