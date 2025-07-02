import { ROUTER_ADDRESS } from '@/constants'
import { WAGMI_CONFIG } from '@/providers'
import { ERC20_ABI } from '@/utils'
import type { Account, PublicClient, WalletClient } from 'viem'
import { waitForTransactionReceipt } from 'wagmi/actions'

type IErc20Token = {
  approved: (owner: string, tokenAddress: string, amount: bigint, client: PublicClient) => Promise<boolean>
  approve: (tokenAddress: string, amount: bigint, client: WalletClient) => Promise<void>
}

export function useERC20Token(): IErc20Token {
  const approved = async (owner: string, tokenAddress: string, amount: bigint, client: PublicClient) => {
    const approved = await client.readContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [owner, ROUTER_ADDRESS]
    })

    return (approved as bigint) >= amount
  }

  const approve = async (tokenAddress: string, amount: bigint, client: WalletClient) => {
    const tx = await client.writeContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [ROUTER_ADDRESS, amount],
      chain: client.chain,
      account: client.account as Account
    })

    await waitForTransactionReceipt(WAGMI_CONFIG, { hash: tx })
  }

  return { approved, approve }
}
