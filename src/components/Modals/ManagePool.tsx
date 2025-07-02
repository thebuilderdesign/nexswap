'use client'

import {
  ERROR_APPROVE,
  ERROR_CALCULATING_LIQUIDITY,
  ERROR_LIQUIDITY,
  ERROR_SIGNATURE,
  ERROR_WITHDRAWAL,
  ROUTER_ADDRESS,
  TRANSITION_VARIANTS,
  WETH_ADDRESS
} from '@/constants'
import { useERC20Token, usePermitSignature, useTayaSwapRouter } from '@/hooks'
import type { IPairData, IPairTokenData } from '@/services'
import { useTokenBalancesStore } from '@/stores'
import { formatTokenBalance } from '@/utils'
import {
  Box,
  Button,
  Center,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  HStack,
  IconButton,
  Text,
  VStack
} from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { parseUnits, zeroAddress } from 'viem'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { ActionButton, SubmitButton } from '../Buttons'
import { ChevronLeftIcon, CloseIcon, PlusIcon } from '../Icons'
import { AddLiquidityTokenAmountInput } from '../Input'
import { Slider } from '../Slider'
import { TokenIconGroup } from '../TokenIcon'

enum View {
  Selector = 0,
  AddLiquidity = 1,
  RemoveLiquidity = 2
}

export function calculateWithdrawAmounts(
  userBalance: string,
  totalSupply: string,
  token0: { reserve: string; decimals: string },
  token1: { reserve: string; decimals: string }
): { amountToken0: string; amountToken1: string } {
  if (totalSupply === '0') {
    return { amountToken0: '0', amountToken1: '0' }
  }

  const userLiquidity = parseUnits(userBalance, 18)
  const totalSupplyAmount = parseUnits(totalSupply, 18)
  const token0Decimals = Number(token0.decimals)
  const token1Decimals = Number(token1.decimals)
  const token0Reserve = parseUnits(token0.reserve, token0Decimals)
  const token1Reserve = parseUnits(token1.reserve, token1Decimals)

  return {
    amountToken0: formatTokenBalance((userLiquidity * token0Reserve) / totalSupplyAmount, token0Decimals),
    amountToken1: formatTokenBalance((userLiquidity * token1Reserve) / totalSupplyAmount, token1Decimals)
  }
}

interface IViewProps {
  direction: number
  changeView?: (view: View) => void
  pool: IPairData
  close: () => void
}

function SelectActionView({ direction, changeView }: IViewProps) {
  return (
    <motion.div
      key="selector"
      custom={direction}
      variants={TRANSITION_VARIANTS}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3 }}
      style={{ position: 'absolute', width: '100%' }}
    >
      <VStack height="400px" justifyContent="center" alignItems="center" gap="30px">
        <Button
          background="modal-selector-button-background"
          color="button-group-button-active-color"
          _hover={{ background: 'button-group-button-background' }}
          onClick={() => changeView?.(View.AddLiquidity)}
          rounded="15px"
          width="300px"
          height="120px"
        >
          <VStack width="full" alignItems="start" height="full" justifyContent="center">
            <Text fontSize="18px" fontWeight="600">
              Add Liquidity
            </Text>
            <Text fontWeight="300">Increase the amount of tokens in the pool.</Text>
          </VStack>
        </Button>
        <Button
          background="modal-selector-button-background"
          color="button-group-button-active-color"
          _hover={{ background: 'button-group-button-background' }}
          onClick={() => changeView?.(View.RemoveLiquidity)}
          width="300px"
          rounded="15px"
          height="120px"
        >
          <VStack width="full" alignItems="start" height="full" justifyContent="center">
            <Text fontSize="18px" fontWeight="600">
              Remove Liquidity
            </Text>
            <Text fontWeight="300">Reduce the amount of tokens in the pool.</Text>
          </VStack>
        </Button>
      </VStack>
    </motion.div>
  )
}

function AddLiquidityView({ direction, pool, close }: IViewProps) {
  const [token0Value, setToken0Value] = useState('0')

  const [token1Value, setToken1Value] = useState('0')

  const [loadingToken0, setLoadingToken0] = useState(false)

  const [loadingToken1, setLoadingToken1] = useState(false)

  const [loadingApproveToken0, setLoadingApproveToken0] = useState(false)

  const [loadingApproveToken1, setLoadingApproveToken1] = useState(false)

  const [loadingAddLiquidity, setLoadingAddLiquidity] = useState(false)

  const [token0Approved, setToken0Approved] = useState(true)

  const [token1Approved, setToken1Approved] = useState(true)

  const { tokenBalances, getFormattedTokenBalance } = useTokenBalancesStore()

  const { approved, approve } = useERC20Token()

  const { address } = useAccount()

  const { data: walletClient } = useWalletClient()

  const publicClient = usePublicClient()

  const { calculateLiquidityCounterAmount, addLiquidity, addLiquidityETH } = useTayaSwapRouter()

  const getBalance = useCallback(
    (tokenAddress: string): bigint => {
      return tokenAddress === WETH_ADDRESS
        ? tokenBalances[zeroAddress]?.balance || 0n
        : tokenBalances[tokenAddress]?.balance || 0n
    },
    [tokenBalances]
  )

  const getFormattedBalance = useCallback(
    (tokenAddress: string): string | undefined => {
      return tokenAddress === WETH_ADDRESS
        ? getFormattedTokenBalance(zeroAddress)
        : getFormattedTokenBalance(tokenAddress)
    },
    [getFormattedTokenBalance]
  )

  useEffect(() => {
    if (!address || !token0Value || token0Value === '0' || !publicClient || pool.token0.id === WETH_ADDRESS) {
      setToken0Approved(true)
      return
    }

    const amount = parseUnits(token0Value, Number(pool.token0.decimals))
    approved(address, pool.token0.id, amount, publicClient).then(setToken0Approved)
  }, [address, token0Value, pool.token0.id, pool.token0.decimals, publicClient, approved])

  useEffect(() => {
    if (!address || !token1Value || token1Value === '0' || !publicClient || pool.token1.id === WETH_ADDRESS) {
      setToken1Approved(true)
      return
    }

    const amount = parseUnits(token1Value, Number(pool.token1.decimals))
    approved(address, pool.token1.id, amount, publicClient).then(setToken1Approved)
  }, [address, token1Value, pool.token1.id, pool.token1.decimals, publicClient, approved])

  const handleToken0ValueChange = useCallback(
    (value: string) => {
      setLoadingToken1(true)
      setToken0Value(value)
      try {
        const inputAmount = parseUnits(value, Number(pool.token0.decimals))

        const outputAmount = calculateLiquidityCounterAmount(inputAmount, pool.token0.id, pool)

        const formattedOutput = formatTokenBalance(outputAmount, Number(pool.token1.decimals))

        setToken1Value(formattedOutput)
      } catch (err) {
        console.error(ERROR_CALCULATING_LIQUIDITY(pool.token0.id, pool.token1.id, err))
      }

      setLoadingToken1(false)
    },
    [pool, calculateLiquidityCounterAmount]
  )

  const handleToken1ValueChange = useCallback(
    (value: string) => {
      setLoadingToken0(true)
      setToken1Value(value)

      try {
        const inputAmount = parseUnits(value, Number(pool.token1.decimals))

        const outputAmount = calculateLiquidityCounterAmount(inputAmount, pool.token1.id, pool)

        const formattedOutput = formatTokenBalance(outputAmount, Number(pool.token0.decimals))

        setToken0Value(formattedOutput)
      } catch (err) {
        console.error(ERROR_CALCULATING_LIQUIDITY(pool.token0.id, pool.token1.id, err))
      }
      setLoadingToken0(false)
    },
    [pool, calculateLiquidityCounterAmount]
  )

  const handleApproveToken0 = useCallback(async () => {
    if (!walletClient || !publicClient || !address) return

    setLoadingApproveToken0(true)

    const amount = parseUnits(token0Value, Number(pool.token0.decimals))

    try {
      await approve(pool.token0.id, amount, walletClient)

      setToken0Approved(true)
    } catch (err) {
      console.error(ERROR_APPROVE(pool.token0.id, amount.toString(), err))
    }
    setLoadingApproveToken0(false)
  }, [token0Value, pool.token0, walletClient, publicClient, address, approve])

  const handleApproveToken1 = useCallback(async () => {
    if (!walletClient || !publicClient || !address) return

    setLoadingApproveToken1(true)

    const amount = parseUnits(token1Value, Number(pool.token1.decimals))

    try {
      await approve(pool.token1.id, amount, walletClient)

      setToken1Approved(true)
    } catch (err) {
      console.error(ERROR_APPROVE(pool.token1.id, amount.toString(), err))
    }

    setLoadingApproveToken1(false)
  }, [token1Value, pool.token1, walletClient, publicClient, address, approve])

  const token0Balance: bigint = getBalance(pool.token0.id)
  const token1Balance: bigint = getBalance(pool.token1.id)

  const token0ValueBigInt = useMemo(() => {
    try {
      return parseUnits(token0Value, Number(pool.token0.decimals))
    } catch {
      return 0n
    }
  }, [token0Value, pool.token0.decimals])

  const token1ValueBigInt = useMemo(() => {
    try {
      return parseUnits(token1Value, Number(pool.token1.decimals))
    } catch {
      return 0n
    }
  }, [token1Value, pool.token1.decimals])

  const hasSufficientToken0 = token0ValueBigInt <= token0Balance
  const hasSufficientToken1 = token1ValueBigInt <= token1Balance

  const canAddLiquidity =
    token0Value !== '0' &&
    token1Value !== '0' &&
    token0Approved &&
    token1Approved &&
    hasSufficientToken0 &&
    hasSufficientToken1

  const handleAddLiquidity = useCallback(async () => {
    if (!walletClient || !address) return
    setLoadingAddLiquidity(true)

    const token0Amount = parseUnits(token0Value, Number(pool.token0.decimals))

    const token1Amount = parseUnits(token1Value, Number(pool.token1.decimals))

    try {
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 100_000)

      if (pool.token0.id === WETH_ADDRESS || pool.token1.id === WETH_ADDRESS) {
        let token: IPairTokenData
        let tokenAmount: bigint
        let ethAmount: bigint
        if (pool.token0.id === WETH_ADDRESS) {
          token = pool.token1
          tokenAmount = token1Amount
          ethAmount = token0Amount
        } else {
          token = pool.token0
          tokenAmount = token0Amount
          ethAmount = token1Amount
        }
        await addLiquidityETH(token, tokenAmount, ethAmount, address, walletClient, deadline)
      } else {
        await addLiquidity(pool.token0, pool.token1, token0Amount, token1Amount, address, walletClient, deadline)
      }

      close()
    } catch (err) {
      console.error(
        ERROR_LIQUIDITY(pool.token0.id, token0Amount.toString(), pool.token1.id, token1Amount.toString(), err)
      )
    }
    setLoadingAddLiquidity(false)
  }, [walletClient, address, token0Value, token1Value, pool, addLiquidity, addLiquidityETH, close])

  const handleToken0MaxClick = useCallback(() => {
    if (!getFormattedBalance || !pool) return

    const max = getFormattedBalance(pool.token0.id)
    if (!max) return

    handleToken0ValueChange(max)
  }, [getFormattedBalance, handleToken0ValueChange, pool])

  const handleToken1MaxClick = useCallback(() => {
    if (!getFormattedBalance || !pool) return

    const max = getFormattedBalance(pool.token1.id)
    if (!max) return

    handleToken1ValueChange(max)
  }, [getFormattedBalance, handleToken1ValueChange, pool])

  return (
    <motion.div
      key="addLiquidity"
      custom={direction}
      variants={TRANSITION_VARIANTS}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3 }}
      style={{ position: 'absolute', width: '100%' }}
    >
      <VStack height="400px" width="full" gap="15px" mt="20px">
        <HStack width="full" position="relative">
          <Box onClick={handleToken0MaxClick} position="absolute" cursor="pointer" top="-25px" right="0" zIndex="30">
            <Text fontSize="xs" color="text-contrast">
              Available: {getFormattedBalance(pool.token0.id)}
            </Text>
          </Box>
          <AddLiquidityTokenAmountInput
            hasEnough={hasSufficientToken0}
            loading={loadingToken0}
            value={token0Value}
            tokenSymbol={pool.token0.symbol}
            tokenAddress={pool.token0.id}
            onChangeHandler={handleToken0ValueChange}
          />
        </HStack>
        <HStack width="full" justifyContent="center">
          <IconButton
            variant="ghost"
            size="lg"
            cursor="default"
            rounded="full"
            background="modal-selector-button-background"
          >
            <PlusIcon />
          </IconButton>
        </HStack>
        <HStack width="full" position="relative">
          <Box onClick={handleToken1MaxClick} position="absolute" cursor="pointer" top="-25px" right="0" zIndex="30">
            <Text fontSize="xs" color="text-contrast">
              Available: {getFormattedBalance(pool.token1.id)}
            </Text>
          </Box>
          <AddLiquidityTokenAmountInput
            hasEnough={hasSufficientToken1}
            loading={loadingToken1}
            value={token1Value}
            tokenSymbol={pool.token1.symbol}
            tokenAddress={pool.token1.id}
            onChangeHandler={handleToken1ValueChange}
          />
        </HStack>

        {(!hasSufficientToken0 || !hasSufficientToken1) && (
          <VStack>
            {!hasSufficientToken0 && (
              <Text color="red.600" fontSize="sm">
                Not enough {pool.token0.symbol} balance.
              </Text>
            )}
            {!hasSufficientToken1 && (
              <Text color="red.600" fontSize="sm">
                Not enough {pool.token1.symbol} balance.
              </Text>
            )}
          </VStack>
        )}

        <Center width="full" height="full">
          <VStack width="full" gap="10px">
            {pool.token0.id !== WETH_ADDRESS && (
              <SubmitButton
                width="full"
                disabled={token0Approved || !hasSufficientToken0}
                loading={loadingApproveToken0}
                text={`Approve ${pool.token0.symbol}`}
                onClickHandler={handleApproveToken0}
              />
            )}

            {pool.token1.id !== WETH_ADDRESS && (
              <SubmitButton
                width="full"
                disabled={token1Approved || !hasSufficientToken1}
                loading={loadingApproveToken1}
                text={`Approve ${pool.token1.symbol}`}
                onClickHandler={handleApproveToken1}
              />
            )}

            {hasSufficientToken0 && hasSufficientToken1 && (
              <SubmitButton
                width="full"
                loading={loadingAddLiquidity}
                text="Add Liquidity"
                onClickHandler={handleAddLiquidity}
                disabled={!token0Approved || !token1Approved || !canAddLiquidity}
              />
            )}
          </VStack>
        </Center>
      </VStack>
    </motion.div>
  )
}

function RemoveLiquidityView({ direction, pool, close }: IViewProps) {
  const { address, chainId } = useAccount()

  const { poolBalances, getFormattedPoolBalance } = useTokenBalancesStore()

  const [withdrawValue, setWithdrawValue] = useState(50)

  const { data: walletClient } = useWalletClient()

  const { getPermitSignature } = usePermitSignature({ chainId, pool, owner: address })

  const { removeLiquidityWithPermit, removeLiquidityETHWithPermit } = useTayaSwapRouter()

  const [signature, setSignature] = useState<
    { v: bigint | undefined; r: `0x${string}`; s: `0x${string}`; deadline: bigint } | undefined
  >(undefined)

  const { amountToken0, amountToken1 } = useMemo(() => {
    const poolBalance = getFormattedPoolBalance(pool.id)

    if (!poolBalance) return { amountToken0: '0', amountToken1: '0' }

    const { amountToken0, amountToken1 } = calculateWithdrawAmounts(
      poolBalance,
      pool.totalSupply,
      { reserve: pool.reserve0, decimals: pool.token0.decimals },
      { reserve: pool.reserve1, decimals: pool.token1.decimals }
    )
    return { amountToken0, amountToken1 }
  }, [getFormattedPoolBalance, pool])

  const handleSliderChange = useCallback((value: number) => {
    setSignature(undefined)
    setWithdrawValue(value)
  }, [])

  const amount0Withdraw = useMemo(() => {
    const token0Balance = parseUnits(amountToken0, Number(pool.token0.decimals))
    return (token0Balance * BigInt(withdrawValue)) / 100n
  }, [amountToken0, pool.token0.decimals, withdrawValue])

  const amount1Withdraw = useMemo(() => {
    const token1Balance = parseUnits(amountToken1, Number(pool.token1.decimals))
    return (token1Balance * BigInt(withdrawValue)) / 100n
  }, [amountToken1, pool.token1.decimals, withdrawValue])

  const poolBalanceWithdraw = useMemo(() => {
    return (poolBalances[pool.id].balance * BigInt(withdrawValue)) / 100n
  }, [poolBalances, withdrawValue, pool.id])

  const handleWithdraw = useCallback(async () => {
    if (!address || !walletClient || !signature || !signature.v) return

    try {
      if (pool.token0.id === WETH_ADDRESS || pool.token1.id === WETH_ADDRESS) {
        const token = pool.token0.id === WETH_ADDRESS ? pool.token1 : pool.token0

        await removeLiquidityETHWithPermit(
          token,
          poolBalanceWithdraw,
          address,
          walletClient,
          pool,
          signature.v,
          signature.r,
          signature.s,
          signature.deadline
        )
      } else {
        await removeLiquidityWithPermit(
          pool.token0,
          pool.token1,
          poolBalanceWithdraw,
          address,
          walletClient,
          pool,
          signature.v,
          signature.r,
          signature.s,
          signature.deadline
        )
      }

      close()
    } catch (err) {
      console.error(ERROR_WITHDRAWAL(poolBalanceWithdraw.toString(), pool.token0.id, pool.token1.id, err))
    }
  }, [
    address,
    walletClient,
    signature,
    pool,
    poolBalanceWithdraw,
    removeLiquidityETHWithPermit,
    removeLiquidityWithPermit,
    close
  ])

  const [loadingSign, setLoadingSign] = useState(false)

  const handleSign = useCallback(async () => {
    if (!walletClient || !chainId || !address) return
    setLoadingSign(true)
    try {
      const sig = await getPermitSignature(chainId, pool, {
        owner: address,
        spender: ROUTER_ADDRESS,
        value: poolBalanceWithdraw
      })
      setSignature(sig)
    } catch (err) {
      console.error(ERROR_SIGNATURE(err))
    }
    setLoadingSign(false)
  }, [walletClient, chainId, address, getPermitSignature, pool, poolBalanceWithdraw])

  return (
    <motion.div
      key="removeLiquidity"
      custom={direction}
      variants={TRANSITION_VARIANTS}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3 }}
      style={{ position: 'absolute', width: '100%' }}
    >
      <VStack width="full" gap="10px">
        <HStack justifyContent="space-between" width="full" px="5">
          <Text fontSize="14px" fontWeight="400">
            Your position
          </Text>
          <HStack alignItems="center">
            <TokenIconGroup token0={pool.token0.id} token1={pool.token1.id} size="25px" />
            <Text fontSize="xs" fontWeight="400">
              {pool.token0.symbol}/{pool.token1.symbol}
            </Text>
          </HStack>
        </HStack>
        <HStack
          background="modal-selector-button-background"
          height="100px"
          width="full"
          borderRadius="10px"
          px="5"
          justifyContent="space-between"
        >
          <VStack>
            <Text>{pool.token0.symbol}</Text>
            <Text color="custom-green">{amountToken0}</Text>
          </VStack>
          <VStack>
            <Text>{pool.token1.symbol}</Text>
            <Text color="custom-green">{amountToken1}</Text>
          </VStack>
          <VStack>
            <Text>Pool Tokens</Text>
            <Text color="custom-green">{getFormattedPoolBalance(pool.id)}</Text>
          </VStack>
        </HStack>
        <HStack justifyContent="space-between" width="full" px="5">
          <Text fontSize="14px" fontWeight="400">
            Withdraw Amount
          </Text>
        </HStack>
        <HStack justifyContent="start" width="full" px="5">
          <Text fontSize="20px" fontWeight="600" color="text-contrast">
            {withdrawValue}%
          </Text>
        </HStack>
        <Box width="full">
          <Slider value={withdrawValue} onChange={handleSliderChange} />
        </Box>
        <HStack justifyContent="space-between" alignItems="center" width="full" px="5">
          <ActionButton
            text="25%"
            rounded="full"
            height="25px"
            width="60px"
            size="xs"
            onClickHandler={() => handleSliderChange(25)}
          />
          <ActionButton
            text="50%"
            rounded="full"
            height="25px"
            width="60px"
            size="xs"
            onClickHandler={() => handleSliderChange(50)}
          />
          <ActionButton
            text="75%"
            rounded="full"
            height="25px"
            width="60px"
            size="xs"
            onClickHandler={() => handleSliderChange(75)}
          />
          <ActionButton
            text="100%"
            rounded="full"
            height="25px"
            width="60px"
            size="xs"
            onClickHandler={() => handleSliderChange(100)}
          />
        </HStack>
        <VStack width="full" mt="5">
          <SubmitButton
            onClickHandler={handleSign}
            text={'Sign'}
            loading={loadingSign}
            disabled={!!signature || amount0Withdraw === 0n || amount1Withdraw === 0n}
            width="full"
            px="5"
          />
          <SubmitButton
            onClickHandler={handleWithdraw}
            text={'Withdraw'}
            loading={false}
            disabled={!signature || amount0Withdraw === 0n || amount1Withdraw === 0n}
            width="full"
            px="5"
          />
        </VStack>
      </VStack>
    </motion.div>
  )
}

export interface IManagePoolModalProps {
  pool: IPairData
  open: boolean
  onClose: () => void
  close: () => void
}

export function ManagePoolModal({ pool, open, onClose, close }: IManagePoolModalProps) {
  const [view, setView] = useState(View.Selector)
  const [direction, setDirection] = useState(0)

  const changeView = useCallback(
    (newView: View) => {
      setDirection(newView > view ? 1 : -1)
      setView(newView)
    },
    [view]
  )

  return (
    <Box position="absolute" top="0" left="0" width="full" height="full" px="5">
      <Center height="full" width="full">
        <DialogRoot open={open} size="xs" motionPreset="scale" onExitComplete={onClose}>
          <DialogBackdrop />
          <DialogContent rounded="25px" background="modal-background" border="1px solid" borderColor="modal-border">
            <DialogCloseTrigger />
            <DialogHeader>
              <HStack justifyContent="space-between">
                <HStack justifyContent="start" alignItems="center" gap="15px">
                  {(view === View.AddLiquidity || view === View.RemoveLiquidity) && (
                    <IconButton
                      onClick={() => changeView(View.Selector)}
                      variant="ghost"
                      size="xs"
                      rounded="full"
                      _hover={{ background: 'button-group-button-background' }}
                      background="modal-selector-button-background"
                    >
                      <ChevronLeftIcon />
                    </IconButton>
                  )}
                  <DialogTitle>
                    <Text color="text-contrast" fontWeight="400">
                      {view === View.Selector && 'Manage Pool'}
                      {view === View.AddLiquidity && 'Add Liquidity'}
                      {view === View.RemoveLiquidity && 'Remove Liquidity'}
                    </Text>
                  </DialogTitle>
                </HStack>
                <IconButton
                  onClick={close}
                  variant="ghost"
                  size="xs"
                  rounded="full"
                  _hover={{ background: 'button-group-button-background' }}
                  background="modal-selector-button-background"
                >
                  <CloseIcon />
                </IconButton>
              </HStack>
            </DialogHeader>
            <DialogBody>
              <Box height="400px" position="relative" overflow="hidden">
                <AnimatePresence initial={false} custom={direction}>
                  {view === View.Selector && (
                    <SelectActionView direction={direction} changeView={changeView} pool={pool} close={close} />
                  )}
                  {view === View.AddLiquidity && (
                    <AddLiquidityView direction={direction} changeView={changeView} pool={pool} close={close} />
                  )}
                  {view === View.RemoveLiquidity && (
                    <RemoveLiquidityView direction={direction} changeView={changeView} pool={pool} close={close} />
                  )}
                </AnimatePresence>
              </Box>
            </DialogBody>
          </DialogContent>
        </DialogRoot>
      </Center>
    </Box>
  )
}
