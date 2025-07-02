import { http, fallback } from 'viem'

type IChainEndpoints = { http: readonly string[]; webSocket?: readonly string[] | undefined }

interface IChainRpcUrl {
  [key: string]: IChainEndpoints
  default: IChainEndpoints
}

const NEXUS_RPC_ENDPOINTS = [
  'https://testnet3.rpc.nexus.xyz',
]

export function getMonadRpcUrls(): IChainRpcUrl {
  const urls: IChainRpcUrl = { default: { http: [NEXUS_RPC_ENDPOINTS[0]] } }

  for (let i = 1; i < NEXUS_RPC_ENDPOINTS.length; i++) {
    urls[i] = { http: [NEXUS_RPC_ENDPOINTS[i]] }
  }

  return urls
}

export function getMonadRpcUrlsFallback() {
  const urls = []

  for (let i = 0; i < NEXUS_RPC_ENDPOINTS.length; i++) {
    urls.push(http(NEXUS_RPC_ENDPOINTS[i]))
  }

  return fallback(urls)
}
