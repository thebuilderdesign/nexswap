import { create } from 'zustand'

export interface ISlippageStore {
  slippage: number
  setSlippage: (slippage: number) => void
}

// TODO: find a way to fix this lint exception
// biome-ignore lint/style/useNamingConvention: hooks must be constants
export const useSlippage = create<ISlippageStore>((set) => ({
  slippage: 1,
  setSlippage: (slippage: number) => set({ slippage })
}))
