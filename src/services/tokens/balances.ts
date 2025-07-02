import { WAGMI_CONFIG } from '@/providers'
import type { ITokenBalance } from '@/stores'
import { ERC20_ABI } from '@/utils'
import chunk from 'lodash/chunk'
import { zeroAddress } from 'viem'
import { multicall } from 'wagmi/actions'

export async function fetchBalances(
  owner: string,
  tokens: { address: string; decimals: number }[],
  onBatchComplete: (batchBalances: Record<string, ITokenBalance>) => void
): Promise<Record<string, ITokenBalance>> {
  const batchSize = 10

  const filteredTokens = tokens.filter((token) => token.address !== zeroAddress)

  const batches = chunk(filteredTokens, batchSize)

  let aggregatedBalances: Record<string, ITokenBalance> = {}

  for (const batch of batches) {
    const batchBalances = await getMulticallBalances(owner, batch)

    aggregatedBalances = { ...aggregatedBalances, ...batchBalances }

    onBatchComplete(aggregatedBalances)
  }

  return aggregatedBalances
}

export async function getMulticallBalances(
  owner: string,
  tokens: { address: string; decimals: number }[]
): Promise<Record<string, ITokenBalance>> {
  const contracts = tokens.map((token) => ({
    address: token.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [owner]
  }))

  const results = await multicall(WAGMI_CONFIG, { contracts })

  const balances: Record<string, ITokenBalance> = {}

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]

    const balance: bigint = (results[i]?.result as bigint) ?? 0n

    balances[token.address] = { balance, decimals: token.decimals }
  }

  return balances
}
