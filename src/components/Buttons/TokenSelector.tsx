'use client'

import { Button, type ButtonProps, HStack, Text } from '@chakra-ui/react'
import { ChevronDownIcon } from '../Icons'
import { TokenIcon } from '../TokenIcon'

interface ITokenSelectorButtonProps extends ButtonProps {
  tokenAddress: string
  tokenSymbol: string
  onClickHandler: () => void
  height?: string
  fontSize?: string
}

export function TokenSelectorButton({
  tokenSymbol,
  tokenAddress,
  fontSize = '16px',
  height = '35px',
  onClickHandler,
  ...props
}: ITokenSelectorButtonProps) {
  return (
    <Button
      onClick={onClickHandler}
      variant="outline"
      height={height}
      background="token-selector-button-background"
      border="1px solid"
      fontSize={fontSize}
      borderColor="token-selector-border"
      rounded="full"
      px="3"
      {...props}
    >
      <HStack width="full" justifyContent="space-between" alignItems="center">
        <TokenIcon token={tokenAddress} size="16px" />
        <Text fontSize="14px" color="text-contrast" fontWeight="600">
          {tokenSymbol}
        </Text>
        <ChevronDownIcon height="10px" color="token-selector-chevron-color" />
      </HStack>
    </Button>
  )
}
