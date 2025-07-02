'use client'

import type { ITokenListToken } from '@/services'
import { useTokenListStore } from '@/stores'
import { Box } from '@chakra-ui/react'
import Image from 'next/image'
import { useMemo } from 'react'

interface ITokenIcon {
  token: string
  size: string
  mr?: string
  ml?: string
}

export function TokenIcon({ mr, ml, token, size }: ITokenIcon) {
  const { defaultTokenList } = useTokenListStore()

  const image = useMemo(() => {
    const tokenListData: ITokenListToken | undefined = defaultTokenList.find(
      (listToken) => listToken.address.toLowerCase() === token.toLowerCase()
    )

    if (!tokenListData || !tokenListData.logoURI) return '/assets/unknown.svg'

    return tokenListData.logoURI
  }, [token, defaultTokenList])

  return (
    <Box ml={ml} mr={mr} height={size} width={size} position="relative" borderRadius="full" overflow="hidden">
      <Image fill src={image} alt="Token Icon Image" sizes="(max-width: 50px)" />
    </Box>
  )
}
