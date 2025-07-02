import { SWAP_TOASTER } from '@/components'
import { ERROR_TOKEN_POOL, HARDCODED_LIQUIDITY_SLIPAGE, ROUTER_ADDRESS } from '@/constants'
import { WAGMI_CONFIG } from '@/providers'
import type { IPairData, IPairTokenData, ITokenListToken } from '@/services'
import { ROUTER_ABI } from '@/utils'
import { type Account, type PublicClient, type WalletClient, formatUnits, parseUnits } from 'viem'
import { waitForTransactionReceipt } from 'wagmi/actions'

interface ITayaSwapRouter {
  findBestRoute(
    inputAmount: bigint,
    tokenIn: string,
    tokenOut: string,
    pools: IPairData[],
    client: PublicClient
  ): Promise<{ route: string[]; output: bigint }>
  calculateLiquidityCounterAmount: (inputAmount: bigint, inputToken: string, pool: IPairData) => bigint
  calculateTradeOutput: (inputAmount: bigint, path: string[], client: PublicClient) => Promise<bigint>
  removeLiquidityWithPermit: (
    token0: IPairTokenData,
    token1: IPairTokenData,
    liquidity: bigint,
    toAddress: string,
    client: WalletClient,
    pool: IPairData,
    v: bigint,
    r: string,
    s: string,
    deadline: bigint
  ) => Promise<void>
  removeLiquidityETHWithPermit: (
    token: IPairTokenData,
    liquidity: bigint,
    toAddress: string,
    client: WalletClient,
    pool: IPairData,
    v: bigint,
    r: string,
    s: string,
    deadline: bigint
  ) => Promise<void>
  addLiquidity: (
    token0: IPairTokenData,
    token1: IPairTokenData,
    amountADesired: bigint,
    amountBDesired: bigint,
    toAddress: string,
    client: WalletClient,
    deadline: bigint
  ) => Promise<void>
  addLiquidityETH: (
    token: IPairTokenData,
    amountTokenDesired: bigint,
    amountETHDesired: bigint,
    toAddress: string,
    client: WalletClient,
    deadline: bigint
  ) => Promise<void>
  swapExactTokensForTokens: (
    amountIn: bigint,
    amountOutMin: bigint,
    path: string[],
    toAddress: string,
    client: WalletClient,
    deadline: bigint,
    tokenTo: ITokenListToken,
    tokenFrom: ITokenListToken
  ) => Promise<void>
  swapExactETHForTokens: (
    amountOutMin: bigint,
    path: string[],
    toAddress: string,
    client: WalletClient,
    deadline: bigint,
    ethAmount: bigint,
    tokenTo: ITokenListToken
  ) => Promise<void>
  swapExactTokensForETH: (
    amountIn: bigint,
    amountOutMin: bigint,
    path: string[],
    toAddress: string,
    client: WalletClient,
    deadline: bigint,
    tokenFrom: ITokenListToken
  ) => Promise<void>
}

export function useTayaSwapRouter(): ITayaSwapRouter {
  const calculateLiquidityCounterAmount = (inputAmount: bigint, inputToken: string, pool: IPairData): bigint => {
    if (inputAmount === 0n) return 0n

    const reserve0 = parseUnits(pool.reserve0, Number(pool.token0.decimals))
    const reserve1 = parseUnits(pool.reserve1, Number(pool.token1.decimals))

    let idealCounter: bigint

    if (inputToken === pool.token0.id) {
      idealCounter = (inputAmount * reserve1 + reserve0 - 1n) / reserve0
    } else if (inputToken === pool.token1.id) {
      idealCounter = (inputAmount * reserve0 + reserve1 - 1n) / reserve1
    } else {
      throw new Error(ERROR_TOKEN_POOL(inputToken, pool.id))
    }

    return idealCounter
  }

  const removeLiquidityWithPermit = async (
    token0: IPairTokenData,
    token1: IPairTokenData,
    liquidity: bigint,
    toAddress: string,
    client: WalletClient,
    pool: IPairData,
    v: bigint,
    r: string,
    s: string,
    deadline: bigint
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const totalSupply = parseUnits(pool.totalSupply, 18)
      const reserve0 = parseUnits(pool.reserve0, Number(pool.token0.decimals))
      const reserve1 = parseUnits(pool.reserve1, Number(pool.token1.decimals))

      const expectedAmount0 = (liquidity * reserve0) / totalSupply
      const expectedAmount1 = (liquidity * reserve1) / totalSupply

      const minAmount0 = (expectedAmount0 * BigInt(100 - HARDCODED_LIQUIDITY_SLIPAGE)) / 100n
      const minAmount1 = (expectedAmount1 * BigInt(100 - HARDCODED_LIQUIDITY_SLIPAGE)) / 100n

      client
        .writeContract({
          address: ROUTER_ADDRESS,
          abi: ROUTER_ABI,
          functionName: 'removeLiquidityWithPermit',
          args: [token0.id, token1.id, liquidity, minAmount0, minAmount1, toAddress, deadline, false, v, r, s],
          chain: client.chain,
          account: client.account as Account
        })
        .then((tx) => {
          const formatted = parseUnits(liquidity.toString(), 18)

          SWAP_TOASTER.promise(waitForTransactionReceipt(WAGMI_CONFIG, { hash: tx }), {
            success: { title: `Withdrawn ${formatted} from pool` },
            loading: { title: `Withdrawing ${formatted} from pool` },
            error: { title: 'Unable to withdraw tokens from pool' },
            finally: resolve
          })
        })
        .catch(reject)
    })
  }

  const removeLiquidityETHWithPermit = async (
    token: IPairTokenData,
    liquidity: bigint,
    toAddress: string,
    client: WalletClient,
    pool: IPairData,
    v: bigint,
    r: string,
    s: string,
    deadline: bigint
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const totalSupply = parseUnits(pool.totalSupply, 18)
      const reserve0 = parseUnits(pool.reserve0, Number(pool.token0.decimals))
      const reserve1 = parseUnits(pool.reserve1, Number(pool.token1.decimals))

      let expectedTokenAmount: bigint
      let expectedETHAmount: bigint

      if (token.id === pool.token0.id) {
        expectedTokenAmount = (liquidity * reserve0) / totalSupply
        expectedETHAmount = (liquidity * reserve1) / totalSupply
      } else if (token.id === pool.token1.id) {
        expectedTokenAmount = (liquidity * reserve1) / totalSupply
        expectedETHAmount = (liquidity * reserve0) / totalSupply
      } else {
        throw new Error(ERROR_TOKEN_POOL(token.id, pool.id))
      }

      const minTokenAmount = (expectedTokenAmount * BigInt(100 - HARDCODED_LIQUIDITY_SLIPAGE)) / 100n
      const minETHAmount = (expectedETHAmount * BigInt(100 - HARDCODED_LIQUIDITY_SLIPAGE)) / 100n

      client
        .writeContract({
          address: ROUTER_ADDRESS,
          abi: ROUTER_ABI,
          functionName: 'removeLiquidityETHWithPermit',
          args: [token.id, liquidity, minTokenAmount, minETHAmount, toAddress, deadline, false, v, r, s],
          chain: client.chain,
          account: client.account as Account
        })
        .then((tx) => {
          const formatted = parseUnits(liquidity.toString(), 18)

          SWAP_TOASTER.promise(waitForTransactionReceipt(WAGMI_CONFIG, { hash: tx }), {
            success: { title: `Withdrawn ${formatted} from pool` },
            loading: { title: `Withdrawing ${formatted} from pool` },
            error: { title: 'Unable to withdraw tokens from pool' },
            finally: resolve
          })
        })
        .catch(reject)
    })
  }

  async function calculateTradeOutput(inputAmount: bigint, path: string[], client: PublicClient): Promise<bigint> {
    if (inputAmount === 0n) return 0n

    const amounts = (await client.readContract({
      address: ROUTER_ADDRESS,
      abi: ROUTER_ABI,
      functionName: 'getAmountsOut',
      args: [inputAmount, path]
    })) as bigint[]

    return amounts[amounts.length - 1]
  }

  async function findBestRoute(
    inputAmount: bigint,
    tokenIn: string,
    tokenOut: string,
    pools: IPairData[],
    client: PublicClient
  ): Promise<{ route: string[]; output: bigint; priceImpact: number }> {
    if (inputAmount === 0n) return { route: [], output: 0n, priceImpact: 0 }

    function existsPool(tokenA: string, tokenB: string): boolean {
      for (let i = 0; i < pools.length; i++) {
        const p = pools[i]
        if (
          (p.token0.id.toLowerCase() === tokenA.toLowerCase() && p.token1.id.toLowerCase() === tokenB.toLowerCase()) ||
          (p.token0.id.toLowerCase() === tokenB.toLowerCase() && p.token1.id.toLowerCase() === tokenA.toLowerCase())
        ) {
          return true
        }
      }
      return false
    }

    const routes: string[][] = []

    if (existsPool(tokenIn, tokenOut)) {
      routes.push([tokenIn, tokenOut])
    }

    const candidateSet = new Set<string>()
    for (let i = 0; i < pools.length; i++) {
      candidateSet.add(pools[i].token0.id)
      candidateSet.add(pools[i].token1.id)
    }
    candidateSet.delete(tokenIn)
    candidateSet.delete(tokenOut)

    const candidates = Array.from(candidateSet)

    for (let i = 0; i < candidates.length; i++) {
      const x = candidates[i]
      if (existsPool(tokenIn, x) && existsPool(x, tokenOut)) {
        routes.push([tokenIn, x, tokenOut])
      }
    }

    for (let i = 0; i < candidates.length; i++) {
      for (let j = i + 1; j < candidates.length; j++) {
        const x = candidates[i]
        const y = candidates[j]
        if (existsPool(tokenIn, x) && existsPool(x, y) && existsPool(y, tokenOut)) {
          routes.push([tokenIn, x, y, tokenOut])
        }
        if (existsPool(tokenIn, y) && existsPool(y, x) && existsPool(x, tokenOut)) {
          routes.push([tokenIn, y, x, tokenOut])
        }
      }
    }

    function getPool(tokenA: string, tokenB: string): IPairData | undefined {
      return pools.find(
        (p) =>
          (p.token0.id.toLowerCase() === tokenA.toLowerCase() && p.token1.id.toLowerCase() === tokenB.toLowerCase()) ||
          (p.token0.id.toLowerCase() === tokenB.toLowerCase() && p.token1.id.toLowerCase() === tokenA.toLowerCase())
      )
    }

    let bestRoute: string[] = []
    let bestOutput = 0n

    for (const route of routes) {
      let amount = inputAmount
      let valid = true

      for (let i = 0; i < route.length - 1; i++) {
        const tokenA = route[i]

        const tokenB = route[i + 1]

        const pool = getPool(tokenA, tokenB)

        if (!pool) {
          valid = false
          break
        }

        amount = await calculateTradeOutput(inputAmount, route, client)
      }

      if (!valid) continue

      if (amount > bestOutput) {
        bestOutput = amount
        bestRoute = route
      }
    }

    let idealOutput = inputAmount

    for (let i = 0; i < bestRoute.length - 1; i++) {
      const pool = getPool(bestRoute[i], bestRoute[i + 1])
      if (!pool) continue

      let reserveIn: bigint
      let reserveOut: bigint

      if (bestRoute[i].toLowerCase() === pool.token0.id.toLowerCase()) {
        reserveIn = parseUnits(pool.reserve0, Number(pool.token0.decimals))
        reserveOut = parseUnits(pool.reserve1, Number(pool.token1.decimals))
      } else {
        reserveIn = parseUnits(pool.reserve1, Number(pool.token1.decimals))
        reserveOut = parseUnits(pool.reserve0, Number(pool.token0.decimals))
      }

      idealOutput = (idealOutput * reserveOut) / reserveIn
    }

    const priceImpact = idealOutput > 0n ? Number(idealOutput - bestOutput) / Number(idealOutput) : 0

    const totalSlippageBips = Math.floor(priceImpact * 10000)

    const minOutput = (bestOutput * BigInt(10000 - totalSlippageBips)) / 10000n

    return { route: bestRoute, output: minOutput, priceImpact }
  }

  const addLiquidity = async (
    token0: IPairTokenData,
    token1: IPairTokenData,
    amountADesired: bigint,
    amountBDesired: bigint,
    toAddress: string,
    client: WalletClient,
    deadline: bigint
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const minAmountA = (amountADesired * BigInt(100 - HARDCODED_LIQUIDITY_SLIPAGE)) / 100n
      const minAmountB = (amountBDesired * BigInt(100 - HARDCODED_LIQUIDITY_SLIPAGE)) / 100n

      client
        .writeContract({
          address: ROUTER_ADDRESS,
          abi: ROUTER_ABI,
          functionName: 'addLiquidity',
          args: [token0.id, token1.id, amountADesired, amountBDesired, minAmountA, minAmountB, toAddress, deadline],
          chain: client.chain,
          account: client.account as Account
        })
        .then((tx) => {
          const token1Formatted = formatUnits(amountADesired, Number(token0.decimals))
          const token0Formatted = formatUnits(amountBDesired, Number(token1.decimals))

          SWAP_TOASTER.promise(waitForTransactionReceipt(WAGMI_CONFIG, { hash: tx }), {
            success: {
              title: `Added ${token0Formatted} ${token0.symbol} and ${token1Formatted} ${token1.symbol} to the pool`
            },
            loading: {
              title: `Adding ${token0Formatted} ${token0.symbol} and ${token1Formatted} ${token1.symbol} to the pool`
            },
            error: { title: 'Unable to add tokens to the pool' },
            finally: resolve
          })
        })
        .catch(reject)
    })
  }

  const addLiquidityETH = async (
    token: IPairTokenData,
    amountTokenDesired: bigint,
    amountETHDesired: bigint,
    toAddress: string,
    client: WalletClient,
    deadline: bigint
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const minTokenAmount = (amountTokenDesired * BigInt(100 - HARDCODED_LIQUIDITY_SLIPAGE)) / 100n
      const minETHAmount = (amountETHDesired * BigInt(100 - HARDCODED_LIQUIDITY_SLIPAGE)) / 100n

      client
        .writeContract({
          address: ROUTER_ADDRESS,
          abi: ROUTER_ABI,
          functionName: 'addLiquidityETH',
          args: [token.id, amountTokenDesired, minTokenAmount, minETHAmount, toAddress, deadline],
          chain: client.chain,
          account: client.account as Account,
          value: amountETHDesired
        })
        .then((tx) => {
          const tokenAmount = formatUnits(amountTokenDesired, Number(token.decimals))
          const ethAmount = formatUnits(amountETHDesired, 18)

          SWAP_TOASTER.promise(waitForTransactionReceipt(WAGMI_CONFIG, { hash: tx }), {
            success: {
              title: `Added ${tokenAmount} ${token.symbol} and ${ethAmount} WNEX to the pool`
            },
            loading: {
              title: `Adding ${tokenAmount} ${token.symbol} and ${ethAmount} TMON to the pool`
            },
            error: { title: 'Unable to add tokens to the pool' },
            finally: resolve
          })
        })
        .catch(reject)
    })
  }

  const swapExactTokensForTokens = async (
    amountIn: bigint,
    amountOutMin: bigint,
    path: string[],
    toAddress: string,
    client: WalletClient,
    deadline: bigint,
    tokenFrom: ITokenListToken,
    tokenTo: ITokenListToken
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      client
        .writeContract({
          address: ROUTER_ADDRESS,
          abi: ROUTER_ABI,
          functionName: 'swapExactTokensForTokens',
          args: [amountIn, amountOutMin, path, toAddress, deadline],
          chain: client.chain,
          account: client.account as Account
        })
        .then((tx) => {
          const tokenAmount = formatUnits(amountIn, Number(tokenFrom.decimals))

          SWAP_TOASTER.promise(waitForTransactionReceipt(WAGMI_CONFIG, { hash: tx }), {
            success: {
              title: `Swapped ${tokenAmount} ${tokenFrom.symbol} for ${tokenTo.symbol}`
            },
            loading: {
              title: `Swapping ${tokenAmount} ${tokenFrom.symbol} for ${tokenTo.symbol}`
            },
            error: { title: `Unable to swap ${tokenAmount} ${tokenFrom.symbol}` },
            finally: resolve
          })
        })
        .catch(reject)
    })
  }

  const swapExactEthForTokens = async (
    amountOutMin: bigint,
    path: string[],
    toAddress: string,
    client: WalletClient,
    deadline: bigint,
    ethAmount: bigint,
    tokenTo: ITokenListToken
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      client
        .writeContract({
          address: ROUTER_ADDRESS,
          abi: ROUTER_ABI,
          functionName: 'swapExactETHForTokens',
          args: [amountOutMin, path, toAddress, deadline],
          chain: client.chain,
          account: client.account as Account,
          value: ethAmount
        })
        .then((tx) => {
          const formattedEthAmount = formatUnits(ethAmount, 18)

          SWAP_TOASTER.promise(waitForTransactionReceipt(WAGMI_CONFIG, { hash: tx }), {
            success: {
              title: `Swapped ${formattedEthAmount} MON for ${tokenTo.symbol}`
            },
            loading: {
              title: `Swapping ${formattedEthAmount} MON for ${tokenTo.symbol}`
            },
            error: { title: `Unable to swap ${formattedEthAmount} MON` },
            finally: resolve
          })
        })
        .catch(reject)
    })
  }

  const swapExactTokensForEth = async (
    amountIn: bigint,
    amountOutMin: bigint,
    path: string[],
    toAddress: string,
    client: WalletClient,
    deadline: bigint,
    tokenFrom: ITokenListToken
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      client
        .writeContract({
          address: ROUTER_ADDRESS,
          abi: ROUTER_ABI,
          functionName: 'swapExactTokensForETH',
          args: [amountIn, amountOutMin, path, toAddress, deadline],
          chain: client.chain,
          account: client.account as Account
        })
        .then((tx) => {
          const parsedTokenAmount = formatUnits(amountIn, Number(tokenFrom.decimals))

          SWAP_TOASTER.promise(waitForTransactionReceipt(WAGMI_CONFIG, { hash: tx }), {
            success: {
              title: `Swapped ${parsedTokenAmount} ${tokenFrom.symbol} for MON`
            },
            loading: {
              title: `Swapping ${parsedTokenAmount} ${tokenFrom.symbol} for MON`
            },
            error: { title: `Unable to swap ${parsedTokenAmount} ${tokenFrom.symbol}` },
            finally: resolve
          })
        })
        .catch(reject)
    })
  }

  return {
    calculateLiquidityCounterAmount,
    removeLiquidityWithPermit,
    removeLiquidityETHWithPermit,
    calculateTradeOutput,
    addLiquidity,
    addLiquidityETH,
    swapExactTokensForTokens,
    swapExactETHForTokens: swapExactEthForTokens,
    swapExactTokensForETH: swapExactTokensForEth,
    findBestRoute
  }
}
