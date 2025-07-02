import { http, fallback } from 'viem'

type IChainEndpoints = { http: readonly string[]; webSocket?: readonly string[] | undefined }

interface IChainRpcUrl {
  [key: string]: IChainEndpoints
  default: IChainEndpoints
}

const MONAD_RPC_ENDPOINTS = [
  'https://testnet-rpc2.monad.xyz/52227f026fa8fac9e2014c58fbf5643369b3bfc6',
  'https://testnet-rpc.monad.xyz',
  'https://monad-testnet.drpc.org'
]

export function getMonadRpcUrls(): IChainRpcUrl {
  const urls: IChainRpcUrl = { default: { http: [MONAD_RPC_ENDPOINTS[0]] } }

  for (let i = 1; i < MONAD_RPC_ENDPOINTS.length; i++) {
    urls[i] = { http: [MONAD_RPC_ENDPOINTS[i]] }
  }

  return urls
}

export function getMonadRpcUrlsFallback() {
  const urls = []

  for (let i = 0; i < MONAD_RPC_ENDPOINTS.length; i++) {
    urls.push(http(MONAD_RPC_ENDPOINTS[i]))
  }

  return fallback(urls)
}
