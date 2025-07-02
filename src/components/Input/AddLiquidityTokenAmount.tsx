import { Box, Input as ChakraInput, HStack, type InputProps, Spinner, Text } from '@chakra-ui/react'
import type { JSX } from 'react'
import { TokenIcon } from '../TokenIcon'

export interface IAddLiquidityTokenAmountInputProps extends InputProps {
  onChangeHandler: (value: string) => void
  tokenAddress: string
  tokenSymbol: string
  loading: boolean
  hasEnough: boolean
}

export function AddLiquidityTokenAmountInput({
  tokenSymbol,
  tokenAddress,
  loading,
  hasEnough,
  onChangeHandler,
  ...props
}: IAddLiquidityTokenAmountInputProps): JSX.Element {
  return (
    <HStack gap="1px" width="full" alignItems="center" color="text-contrast" position="relative">
      {loading ? (
        <HStack
          width="full"
          rounded="lg"
          background="input-liquidity-background"
          height="60px"
          alignItems="center"
          color="text-contrast"
          pl="20px"
          pr="110px"
        >
          <Spinner />
        </HStack>
      ) : (
        <Box width="full">
          <ChakraInput
            height="60px"
            fontSize="xl"
            pl="20px"
            pr="110px"
            type="number"
            textAlign="left"
            background="input-liquidity-background"
            outline="none"
            border="none"
            color={hasEnough ? 'text-contrast' : 'red.600'}
            placeholder="0.00"
            onChange={(e) => onChangeHandler(e.target.value)}
            rounded="lg"
            {...props}
          />
        </Box>
      )}

      <HStack justifyContent="start" alignItems="center" position="absolute" right="0" width="100px">
        <TokenIcon token={tokenAddress} size="25px" />
        <Text fontSize="16px  " fontWeight="700" color="text-contrast">
          {tokenSymbol}
        </Text>
      </HStack>
    </HStack>
  )
}
