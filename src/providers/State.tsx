import { TokenBalancesProvider } from './Balances'
import { TokenListProvider } from './TokenList'

export function StateProvider({ children }: { children: React.ReactNode }) {
  return (
    <TokenListProvider>
      <TokenBalancesProvider>{children}</TokenBalancesProvider>
    </TokenListProvider>
  )
}
