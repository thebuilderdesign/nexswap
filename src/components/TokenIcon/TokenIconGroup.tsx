'use client'
import { HStack } from '@chakra-ui/react'
import { TokenIcon } from './TokenIcon'

interface ITokenIconGroup {
  token0: string
  token1: string
  size?: string
}

export function TokenIconGroup({ size = '40px', token0, token1 }: ITokenIconGroup) {
  return (
    <HStack alignItems="center" position="relative" justifyContent="center">
      <TokenIcon mr="-4" token={token0} size={size} />
      <TokenIcon token={token1} size={size} />
    </HStack>
  )
}
