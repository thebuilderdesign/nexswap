import type { ITokenListToken } from '@/services'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface ITokenListStore {
  defaultTokenList: ITokenListToken[]
  setDefaultTokenList: (tokens: ITokenListToken[]) => void
  userTokenList: ITokenListToken[]
  addUserToken: (token: ITokenListToken) => void
  removeUserToken: (token: ITokenListToken) => void
  fullTokenList: () => ITokenListToken[]
}

function computeFullTokenList(userList: ITokenListToken[], defaultList: ITokenListToken[]): ITokenListToken[] {
  const updatedUserList = userList.map((token) => ({ ...token, user: true }))
  const updatedDefaultList = defaultList.map((token) => ({ ...token, user: false }))

  return updatedUserList.concat(updatedDefaultList)
}

// TODO: find a way to fix this lint exception for store hooks
// biome-ignore lint/style/useNamingConvention: hooks must be constants
export const useTokenListStore = create<ITokenListStore>()(
  persist(
    (set, get) => ({
      defaultTokenList: [],
      userTokenList: [],
      addUserToken: (token: ITokenListToken) =>
        set((state) => {
          if (state.userTokenList.some((t) => t.address === token.address)) {
            return state
          }
          return { userTokenList: [...state.userTokenList, token] }
        }),
      removeUserToken: (token: ITokenListToken) =>
        set((state) => ({
          userTokenList: state.userTokenList.filter((listToken) => listToken.address !== token.address)
        })),
      setDefaultTokenList: (tokens: ITokenListToken[]) => set({ defaultTokenList: tokens }),
      fullTokenList: () => {
        const { userTokenList, defaultTokenList } = get()
        return computeFullTokenList(userTokenList, defaultTokenList)
      }
    }),
    {
      name: 'token-list',
      storage: createJSONStorage(() => localStorage)
    }
  )
)
