import request, { type RequestDocument } from 'graphql-request'

export async function tayaswapSubpgrah(query: RequestDocument, variables = {}) {
  return await request('https://graph-monad.kindynos.mx/subgraphs/name/tayaswap-v2-subgraph', query, variables)
}
