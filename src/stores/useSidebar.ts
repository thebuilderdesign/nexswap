import { create } from 'zustand'

interface ISidebarStore {
  open: boolean
  setOpen: (open: boolean) => void
}

// TODO: find a way to fix this lint exception for store hooks
// biome-ignore lint/style/useNamingConvention: hooks must be constants
export const useSidebarStore = create<ISidebarStore>()((set) => ({
  open: false,
  setOpen: (open: boolean) => set(() => ({ open }))
}))
