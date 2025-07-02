'use client'

import { useColorMode } from '@/hooks'
import { ClientOnly, HStack } from '@chakra-ui/react'
import Image from 'next/image'

export function SideBarLogo() {
  const { colorMode } = useColorMode()

  return (
    <HStack justifyContent="center" width="full">
      <ClientOnly fallback={<Image src={'/logo.png'} width="89" height="37" alt="TayaSwap Interface" priority />}>
        <Image
          src={colorMode === 'dark' ? '/logo.png' : '/logo.png'}
          width="89"
          height="37"
          alt="TayaSwap Interface"
          priority
        />
      </ClientOnly>
    </HStack>
  )
}
