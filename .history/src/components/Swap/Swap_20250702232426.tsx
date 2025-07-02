'use client'

import {
  ERROR_APPROVE,
  ERROR_CALCULATING_TRADE,
  ERROR_ROUTE,
  ERROR_SWAP,
  ERROR_UNWRAP,
  ERROR_WRAP,
  WETH_ADDRESS
} from '@/constants'
import { useColorMode, useERC20Token, useTayaSwapRouter, useWETH } from '@/hooks'
import { type ITokenListToken, usePools } from '@/services'
import { useTokenBalancesStore } from '@/stores'
import { formatTokenBalance } from '@/utils'
import { Box, HStack, IconButton, Text, VStack } from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { parseUnits, zeroAddress } from 'viem'
import { useAccount, useBalance, usePublicClient, useWalletClient } from 'wagmi'
import { SubmitButton } from '../Buttons'
import { ArrowUpArrowDownIcon } from '../Icons/ArrowUpArrowDown'
import { TokenSelectorModal } from '../Modals'
import { SwapToken } from './SwapToken'

const DEFAULT_INITIAL_TOKEN_0: ITokenListToken = {
  address: zeroAddress,
  chainId: 10143,
  name: 'Monad Testnet',
  symbol: 'TMON',
  decimals: 18,
  logoURI: 'https://raw.githubusercontent.com/eabz/tayaswap-frontend/refs/heads/main/public/assets/tokens/mon.jpg'
}

const DEFAULT_INITIAL_TOKEN_1: ITokenListToken = {
  address: '0x88b8e2161dedc77ef4ab7585569d2415a1c1055d',
  chainId: 10143,
  name: 'Tether USDT',
  symbol: 'USDT',
  decimals: 6,
  logoURI: 'https://raw.githubusercontent.com/eabz/taya-assets/master/blockchains/monad/usdt.png'
}

export function Swap() {
  const { colorMode } = useColorMode()

  const { data: pools } = usePools()

  const { address } = useAccount()

  const { refetch: refetchNativeTokenBalance } = useBalance({ address })

  const { data: walletClient } = useWalletClient()

  const publicClient = usePublicClient()

  const { tokenBalances, reloadTokenBalances, updateTokenBalance } = useTokenBalancesStore()

  const { wrap, unwrap } = useWETH()

  const [token0, setToken0] = useState<ITokenListToken>(DEFAULT_INITIAL_TOKEN_0)
  const [loadingToken0Value, setLoadingToken0Value] = useState(false)
  const [token0Value, setToken0Value] = useState('0')

  const [token1, setToken1] = useState<ITokenListToken>(DEFAULT_INITIAL_TOKEN_1)
  const [loadingToken1Value, setLoadingToken1Value] = useState(false)
  const [token1Value, setToken1Value] = useState('0')

  const [tokenSelectorDirection, setTokenSelectorDirection] = useState<'from' | 'to' | undefined>(undefined)
  const [tokenSelectorOpen, setTokenSelectorOpen] = useState(false)

  const { approved, approve } = useERC20Token()
  const { swapExactETHForTokens, swapExactTokensForETH, swapExactTokensForTokens, findBestRoute } = useTayaSwapRouter()

  const getBalance = useCallback(
    (tokenAddress: string): bigint => {
      return tokenAddress === WETH_ADDRESS
        ? tokenBalances[zeroAddress]?.balance || 0n
        : tokenBalances[tokenAddress]?.balance || 0n
    },
    [tokenBalances]
  )

  const token0Balance: bigint = getBalance(token0.address)

  const token0ValueBigInt = useMemo(() => {
    try {
      return parseUnits(token0Value, Number(token0.decimals))
    } catch {
      return 0n
    }
  }, [token0Value, token0.decimals])

  const hasSufficientToken0 = token0ValueBigInt <= token0Balance

  const checkApproved = useCallback(
    async (tokenAddress: string, inputAmount: bigint) => {
      if (!address || !publicClient) return
      if (tokenAddress === zeroAddress) {
        setTokenApproved(true)
      } else {
        const isApproved = await approved(address, tokenAddress, inputAmount, publicClient)
        setTokenApproved(isApproved)
      }
    },
    [address, approved, publicClient]
  )

  const [tokenApproved, setTokenApproved] = useState(true)

  const handleTokenSelectorOpen = useCallback((direction: 'from' | 'to') => {
    setTokenSelectorDirection(direction)
    setTokenSelectorOpen(true)
  }, [])

  const { getFormattedTokenBalance } = useTokenBalancesStore()

  const handleToken0MaxClick = useCallback(() => {
    if (!getFormattedTokenBalance || !pools || !publicClient) return
    const max = getFormattedTokenBalance(token0.address)
    if (!max) return
    handleToken0InputChange(max)
  }, [getFormattedTokenBalance, token0.address, pools, publicClient])

  const handleToken0InputChange = useCallback(
    async (value: string) => {
      setLoadingToken1Value(true)
      setToken0Value(value)

      try {
        if (!pools || !publicClient || !address) return
        const inputAmount = parseUnits(value, token0.decimals)
        if (token0.address !== zeroAddress) {
          await checkApproved(token0.address, inputAmount)
        } else {
          setTokenApproved(true)
        }
        if (
          (token0.address === zeroAddress && token1.address === WETH_ADDRESS) ||
          (token0.address === WETH_ADDRESS && token1.address === zeroAddress)
        ) {
          setToken1Value(value)
        } else {
          const { output } = await findBestRoute(
            inputAmount,
            token0.address === zeroAddress ? WETH_ADDRESS : token0.address,
            token1.address === zeroAddress ? WETH_ADDRESS : token1.address,
            pools,
            publicClient
          )
          const formattedOutput = formatTokenBalance(output, token1.decimals)
          setToken1Value(formattedOutput)
        }
      } catch (err) {
        console.error(ERROR_CALCULATING_TRADE(token0.address, token1.address, err))
      }
      setLoadingToken1Value(false)
    },
    [token0, token1, pools, publicClient, address, checkApproved, findBestRoute]
  )

  const handleToken1InputChange = useCallback(
    async (value: string) => {
      setLoadingToken0Value(true)
      setToken1Value(value)
      try {
        if (!pools || !publicClient) return
        const inputAmount = parseUnits(value, token1.decimals)
        if (
          (token0.address === zeroAddress && token1.address === WETH_ADDRESS) ||
          (token0.address === WETH_ADDRESS && token1.address === zeroAddress)
        ) {
          setToken0Value(value)
        } else {
          const { output } = await findBestRoute(
            inputAmount,
            token1.address === zeroAddress ? WETH_ADDRESS : token1.address,
            token0.address === zeroAddress ? WETH_ADDRESS : token0.address,
            pools,
            publicClient
          )
          const formattedOutput = formatTokenBalance(output, token0.decimals)
          setToken0Value(formattedOutput)
        }
      } catch (err) {
        console.error(ERROR_CALCULATING_TRADE(token0.address, token1.address, err))
      }
      setLoadingToken0Value(false)
    },
    [token0, token1, pools, publicClient, findBestRoute]
  )

  useEffect(() => {
    if (address && pools) {
      reloadTokenBalances(address, [
        { address: token0.address, decimals: token0.decimals },
        { address: token1.address, decimals: token1.decimals }
      ])
    }
  }, [token0, token1, address, pools, reloadTokenBalances])

  const handleSwapClick = useCallback(
    async (token0Value: string, token1Value: string) => {
      if (!address || !publicClient) return

      setToken0(token1)
      setToken1(token0)

      setToken0Value(token1Value)
      setToken1Value(token0Value)

      const inputAmount = parseUnits(token0Value, token0.decimals)
      if (token0.address !== zeroAddress) {
        await checkApproved(token0.address, inputAmount)
      } else {
        setTokenApproved(true)
      }
    },
    [address, publicClient, checkApproved, token0, token1]
  )

  const handleApprove = useCallback(async () => {
    if (!address || !walletClient) return
    const inputAmount = parseUnits(token0Value, token0.decimals)
    try {
      await approve(token0.address, inputAmount, walletClient)
      setTokenApproved(true)
    } catch (err) {
      console.error(ERROR_APPROVE(token0.address, inputAmount.toString(), err))
    }
  }, [address, walletClient, token0.address, token0Value, token0.decimals, approve])

  const handleWrap = useCallback(async () => {
    if (!walletClient || !address) return
    const amount = parseUnits(token0Value, token0.decimals)

    try {
      await wrap(amount, walletClient)
      setToken1Value(token0Value)
    } catch (err) {
      console.error(ERROR_WRAP(err))
    }

    await reloadTokenBalances(address, [
      { address: token0.address, decimals: token0.decimals },
      { address: token1.address, decimals: token1.decimals }
    ])
    const { data } = await refetchNativeTokenBalance()
    if (data) {
      updateTokenBalance(zeroAddress, data.value, data.decimals)
    }
  }, [
    walletClient,
    address,
    token0Value,
    token0,
    token1,
    wrap,
    reloadTokenBalances,
    refetchNativeTokenBalance,
    updateTokenBalance
  ])

  const handleUnwrap = useCallback(async () => {
    if (!walletClient || !address) return
    const amount = parseUnits(token0Value, token0.decimals)

    try {
      await unwrap(amount, walletClient)
      setToken1Value(token0Value)
    } catch (err) {
      console.error(ERROR_UNWRAP(err))
    }
    await reloadTokenBalances(address, [
      { address: token0.address, decimals: token0.decimals },
      { address: token1.address, decimals: token1.decimals }
    ])
    await refetchNativeTokenBalance()
  }, [walletClient, address, token0Value, token0, token1, unwrap, reloadTokenBalances, refetchNativeTokenBalance])

  const handleSwap = useCallback(async () => {
    if (!address || !walletClient || !publicClient || !pools) return
    const inputAmount = parseUnits(token0Value, token0.decimals)

    const { route } = await findBestRoute(
      inputAmount,
      token0.address === zeroAddress ? WETH_ADDRESS : token0.address,
      token1.address === zeroAddress ? WETH_ADDRESS : token1.address,
      pools,
      publicClient
    )
    if (!route || route.length === 0) {
      console.error(ERROR_ROUTE(token0.address, token1.address))

      return
    }
    const amountOutMin = parseUnits(token1Value, token1.decimals)
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 600)
    try {
      if (token0.address === zeroAddress && token1.address === WETH_ADDRESS) {
        await handleWrap()
      } else if (token1.address === zeroAddress && token0.address === WETH_ADDRESS) {
        await handleUnwrap()
      } else if (token0.address === zeroAddress) {
        await swapExactETHForTokens(amountOutMin, route, address, walletClient, deadline, inputAmount, token1)
      } else if (token1.address === zeroAddress) {
        await swapExactTokensForETH(inputAmount, amountOutMin, route, address, walletClient, deadline, token0)
      } else {
        await swapExactTokensForTokens(
          inputAmount,
          amountOutMin,
          route,
          address,
          walletClient,
          deadline,
          token0,
          token1
        )
      }
    } catch (err) {
      console.error(ERROR_SWAP(token0.address, token0Value, token1.address, token1Value, err))
    }
    await reloadTokenBalances(address, [
      { address: token0.address, decimals: token0.decimals },
      { address: token1.address, decimals: token1.decimals }
    ])
  }, [
    address,
    walletClient,
    publicClient,
    pools,
    token0,
    token1,
    token0Value,
    token1Value,
    reloadTokenBalances,
    swapExactETHForTokens,
    swapExactTokensForETH,
    swapExactTokensForTokens,
    handleWrap,
    handleUnwrap,
    findBestRoute
  ])

  const handleTokenSelect = useCallback(
    (token: ITokenListToken) => {
      if (tokenSelectorDirection === 'from') {
        if (token.address === token1.address) {
          return
        }

        setToken0(token)
      }

      if (tokenSelectorDirection === 'to') {
        if (token.address === token0.address) {
          return
        }

        setToken1(token)
      }

      setTokenSelectorOpen(false)
    },
    [tokenSelectorDirection, token0.address, token1.address]
  )

  const conversionMode = useMemo(() => {
    if (token0.address === zeroAddress && token1.address === WETH_ADDRESS) return 'wrap'
    if (token1.address === zeroAddress && token0.address === WETH_ADDRESS) return 'unwrap'
    return 'swap'
  }, [token0.address, token1.address])

  const buttonText = useMemo(() => {
    if (conversionMode === 'wrap') return 'Wrap'
    if (conversionMode === 'unwrap') return 'Unwrap'
    return tokenApproved ? 'Trade' : 'Approve'
  }, [conversionMode, tokenApproved])

  const buttonHandler = useCallback(() => {
    if (conversionMode === 'wrap') return handleWrap
    if (conversionMode === 'unwrap') return handleUnwrap
    return tokenApproved ? handleSwap : handleApprove
  }, [conversionMode, tokenApproved, handleWrap, handleUnwrap, handleSwap, handleApprove])

  return (
    <>
      <TokenSelectorModal
        open={tokenSelectorOpen}
        onSelectToken={handleTokenSelect}
        close={() => setTokenSelectorOpen(false)}
      />
      <Box
        width={{ base: '350px', lg: '430px' }}
        height="500px"
        boxShadow="md"
        borderRadius="25px"
        border="2px solid"
        borderColor="swap-border"
        bgImage={colorMode === 'dark' ? 'linear-gradient(#070E2B, #132E7F)' : 'linear-gradient(#142E78, #4762B9)'}
      >
        <VStack width="full" height="full" px="30px" py="50px">
          <SwapToken
            direction="from"
            tokenAddress={token0.address}
            tokenSymbol={token0.symbol}
            onInputValueChange={handleToken0InputChange}
            onMaxClick={handleToken0MaxClick}
            onTokenSelectorClick={() => handleTokenSelectorOpen('from')}
            inputValue={token0Value}
            loading={loadingToken0Value}
            hasEnough={hasSufficientToken0}
          />
          <HStack width="full" justifyContent="center" mt="-4" mb="-4">
            <IconButton
              onClick={() => handleSwapClick(token0Value, token1Value)}
              color="white"
              size="xl"
              background="swap-token-background"
              border="3px solid"
              borderColor="swap-change-button-border"
              rounded="full"
            >
              <ArrowUpArrowDownIcon height="24px" width="24px" color="text-contrast" />
            </IconButton>
          </HStack>

          <SwapToken
            direction="to"
            tokenAddress={token1.address}
            tokenSymbol={token1.symbol}
            onInputValueChange={handleToken1InputChange}
            onTokenSelectorClick={() => handleTokenSelectorOpen('to')}
            inputValue={token1Value}
            loading={loadingToken1Value}
          />

          <VStack pt="5">
            {!hasSufficientToken0 && (
              <Text color="red.600" fontSize="sm">
                Not enough {token0.symbol} balance.
              </Text>
            )}
          </VStack>

          <SubmitButton
            mt="15px"
            text={buttonText}
            loading={false}
            onClickHandler={buttonHandler()}
            disabled={token0Value === '0' || token1Value === '0' || !hasSufficientToken0}
            width="full"
          />
        </VStack>
      </Box>
    </>
  )
}
