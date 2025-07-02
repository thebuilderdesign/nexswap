import type { SWRConfiguration } from 'swr'
import useSwr from 'swr'
import { tayaswapSubpgrah } from './constants'
import { GET_POOLS_QUERY } from './queries'

export interface IPairTokenData {
  decimals: string
  id: string
  name: string
  symbol: string
}

export interface IPairData {
  id: string
  reserve0: string
  reserve1: string
  token0: IPairTokenData
  token1: IPairTokenData
  totalSupply: string
  volumeUSD: string
  reserveUSD: string
}

interface IPoolsResponse {
  pairs: IPairData[]
}

async function getPools() {
  const { pairs } = (await tayaswapSubpgrah(GET_POOLS_QUERY, {})) as IPoolsResponse

  return pairs
}

export function usePools(config?: SWRConfiguration): {
  data: IPairData[] | undefined
  loading: boolean
  error: boolean
} {
  const { data, isLoading: loading, error } = useSwr('pools', () => getPools(), config)

  return { data, loading, error: error !== undefined }
}
