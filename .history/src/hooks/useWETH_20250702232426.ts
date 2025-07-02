import { SWAP_TOASTER } from '@/components'
import { WETH_ADDRESS } from '@/constants'
import { WAGMI_CONFIG } from '@/providers'
import { WETH_ABI } from '@/utils'
import { type Account, type WalletClient, formatUnits } from 'viem'
import { waitForTransactionReceipt } from 'wagmi/actions'

interface IWeth {
  wrap: (amountETH: bigint, client: WalletClient) => Promise<void>
  unwrap: (amountWETH: bigint, client: WalletClient) => Promise<void>
}
export function useWETH(): IWeth {
  const wrap = async (amountETH: bigint, client: WalletClient): Promise<void> => {
    return new Promise((resolve, reject) => {
      client
        .writeContract({
          address: WETH_ADDRESS,
          abi: WETH_ABI,
          functionName: 'deposit',
          args: [],
          value: amountETH,
          chain: client.chain,
          account: client.account as Account
        })
        .then((tx) => {
          const parsed = formatUnits(amountETH, 18)

          SWAP_TOASTER.promise(waitForTransactionReceipt(WAGMI_CONFIG, { hash: tx }), {
            success: { title: `Wrapped ${parsed} TMON` },
            loading: { title: `Wrapping ${parsed} TMON` },
            error: { title: 'Unable to wrap TMON' },
            finally: resolve
          })
        })
        .catch(reject)
    })
  }

  const unwrap = async (amountWETH: bigint, client: WalletClient): Promise<void> => {
    return new Promise((resolve, reject) => {
      client
        .writeContract({
          address: WETH_ADDRESS,
          abi: WETH_ABI,
          functionName: 'withdraw',
          args: [amountWETH],
          chain: client.chain,
          account: client.account as Account
        })
        .then((tx) => {
          const parsed = formatUnits(amountWETH, 18)

          SWAP_TOASTER.promise(waitForTransactionReceipt(WAGMI_CONFIG, { hash: tx }), {
            success: { title: `Unwrapped ${parsed} WMON` },
            loading: { title: `Unwrapping ${parsed} WMON` },
            error: { title: 'Unable to unwrap WMON' },
            finally: resolve
          })
        })
        .catch(reject)
    })
  }

  return { wrap, unwrap }
}
