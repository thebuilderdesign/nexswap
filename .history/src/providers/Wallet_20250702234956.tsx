'use client'

import { useColorMode } from '@/hooks'
import { getMonadRpcUrls, getMonadRpcUrlsFallback } from '@/utils'
import { ClientOnly } from '@chakra-ui/react'
import { RainbowKitProvider, darkTheme, getDefaultConfig, lightTheme } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { defineChain } from 'viem'
import { WagmiProvider } from 'wagmi'

const NEXUS_TESTNET = defineChain({
  id: 3940,
  name: 'Nexus Testnet',
  network: 'nexus-testnet',
  nativeCurrency: {
    name: 'Nexus',
    symbol: 'NEX',
    decimals: 18
  },
  rpcUrls: getMonadRpcUrls(),
  testnet: true,
  contracts: {
    multicall3: {
      address: '0xacA6700Ff8f9b9E42E89436cB5be204FBA3D87Ba',
      blockCreated: 1636713
    }
  }
})

export const WAGMI_CONFIG = getDefaultConfig({
  appName: 'NexSwap',
  projectId: '13ca0a8f6705e2642fbd4eda3ffa76cc',
  chains: [NEXUS_TESTNET],
  transports: {
    [NEXUS_TESTNET.id]: getMonadRpcUrlsFallback()
  },
  ssr: true
})

const QUERY_CLIENT = new QueryClient()

export function WalletProvider({ children }: { children: ReactNode }) {
  const { colorMode } = useColorMode()

  return (
    <WagmiProvider config={WAGMI_CONFIG}>
      <QueryClientProvider client={QUERY_CLIENT}>
        <ClientOnly>
          <RainbowKitProvider theme={colorMode === 'dark' ? darkTheme() : lightTheme()} modalSize="compact">
            {children}
          </RainbowKitProvider>
        </ClientOnly>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
