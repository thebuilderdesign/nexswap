'use client'

import { useTokenBalancesStore } from '@/stores'
import { Box, HStack, Spinner, Text, VStack } from '@chakra-ui/react'
import { useAccount } from 'wagmi'
import { ActionButton, TokenSelectorButton } from '../Buttons'
import { SwapTokenAmountInput } from '../Input'

interface ISwapTokenProps {
  direction: 'from' | 'to'
  tokenAddress: string
  tokenSymbol: string
  onTokenSelectorClick: () => void
  onMaxClick?: () => void
  onInputValueChange: (value: string) => void
  inputValue: string
  loading: boolean
  hasEnough?: boolean
}

export function SwapToken({
  direction,
  tokenAddress,
  tokenSymbol,
  onTokenSelectorClick,
  onMaxClick,
  onInputValueChange,
  loading,
  inputValue,
  hasEnough = true
}: ISwapTokenProps) {
  const { address } = useAccount()

  const { getFormattedTokenBalance } = useTokenBalancesStore()

  const max = getFormattedTokenBalance(tokenAddress)

  return (
    <Box width="full">
      <VStack background="swap-token-background" width="full" height="140px" borderRadius="25px" px="20px" py="3">
        <HStack justifyContent="space-between" width="full">
          <Text fontWeight="400" fontSize="14px">
            {direction === 'from' ? 'From' : 'To'}
          </Text>
          <TokenSelectorButton
            tokenAddress={tokenAddress}
            tokenSymbol={tokenSymbol}
            onClickHandler={onTokenSelectorClick}
          />
        </HStack>
        <SwapTokenAmountInput
          loading={loading}
          onChangeHandler={onInputValueChange}
          inputValue={inputValue}
          hasEnough={hasEnough}
        />
        <HStack justifyContent="space-between" width="full" alignItems="center">
          <Text fontWeight="400" fontSize="14px">
            {address ? max ? max : <Spinner /> : '0'}
          </Text>
          {direction === 'from' && onMaxClick && (
            <ActionButton
              text="Max"
              rounded="full"
              height="20px"
              fontSize="12px"
              width="40px"
              size="xs"
              onClickHandler={onMaxClick}
            />
          )}
        </HStack>
      </VStack>
    </Box>
  )
}
