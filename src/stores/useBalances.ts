import { fetchBalances } from '@/services'
import { formatTokenBalance } from '@/utils'
import { create } from 'zustand'
import {} from 'zustand/middleware'

export interface ITokenBalance {
  balance: bigint
  decimals: number
}

interface ITokenBalancesStore {
  tokenBalances: Record<string, ITokenBalance>
  poolBalances: Record<string, ITokenBalance>
  reloadTokenBalances: (owner: string, tokens: { address: string; decimals: number }[]) => Promise<void>
  reloadPoolBalances: (owner: string, tokens: { address: string; decimals: number }[]) => Promise<void>
  updateTokenBalance: (address: string, balance: bigint, decimals: number) => void
  getFormattedTokenBalance: (address: string) => string | undefined
  getFormattedPoolBalance: (address: string) => string | undefined
}

function reload(
  key: 'tokenBalances' | 'poolBalances',
  set: (fn: (state: ITokenBalancesStore) => Partial<ITokenBalancesStore>) => void
) {
  return async (owner: string, tokens: { address: string; decimals: number }[]) => {
    await fetchBalances(owner, tokens, (batchBalances) => {
      set((state: ITokenBalancesStore) => ({
        [key]: { ...state[key], ...batchBalances }
      }))
    })
  }
}

// TODO: find a way to fix this lint exception
// biome-ignore lint/style/useNamingConvention: hooks must be constants
export const useTokenBalancesStore = create<ITokenBalancesStore>((set, get) => ({
  tokenBalances: {},
  poolBalances: {},
  reloadTokenBalances: reload('tokenBalances', set),
  reloadPoolBalances: reload('poolBalances', set),
  updateTokenBalance: (address, balance, decimals) =>
    set((state) => ({
      tokenBalances: { ...state.tokenBalances, [address]: { balance, decimals } }
    })),
  getFormattedTokenBalance: (address: string) => {
    const tokenBalance = get().tokenBalances[address]
    if (!tokenBalance) return undefined

    return formatTokenBalance(tokenBalance.balance, tokenBalance.decimals)
  },
  getFormattedPoolBalance: (address: string) => {
    const balance = get().poolBalances[address]
    if (!balance) return undefined

    return formatTokenBalance(balance.balance, balance.decimals)
  }
}))
