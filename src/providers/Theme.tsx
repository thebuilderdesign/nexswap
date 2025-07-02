'use client'

import '@rainbow-me/rainbowkit/styles.css'
import '@/theme/global.css'

import { SYSTEM } from '@/theme'
import { ChakraProvider, ClientOnly } from '@chakra-ui/react'
import { ThemeProvider as NextThemeProvider } from 'next-themes'
import type { ReactNode } from 'react'

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider value={SYSTEM}>
      <ClientOnly>
        <NextThemeProvider attribute="class" disableTransitionOnChange>
          {children}
        </NextThemeProvider>
      </ClientOnly>
    </ChakraProvider>
  )
}
