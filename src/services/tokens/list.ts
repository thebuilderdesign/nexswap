import type { SWRConfiguration } from 'swr'
import useSwr from 'swr'

const TOKENS_LIST = '/assets/tokenlist.json'

export interface ITokenListToken {
  address: string
  chainId: number
  name: string
  symbol: string
  decimals: number
  logoURI?: string
  user?: boolean
}

interface ITokenListResponse {
  name: string
  timestamp: string
  version: {
    major: number
    minor: number
    patch: number
  }
  logoURI: string
  keywords: string[]
  tokens: ITokenListToken[]
}

async function getTokensList() {
  const response = await fetch(TOKENS_LIST)

  const { tokens }: ITokenListResponse = await response.json()

  return tokens
}

export function useTokensList(config?: SWRConfiguration): {
  data: ITokenListToken[] | undefined
  loading: boolean
  error: boolean
} {
  const { data, isLoading: loading, error } = useSwr('tokens_list', () => getTokensList(), config)

  return { data, loading, error: error !== undefined }
}
