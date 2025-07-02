'use client'

import { useTokensList } from '@/services'
import { useTokenListStore } from '@/stores'
import { useEffect } from 'react'

export function TokenListProvider({ children }: { children: React.ReactNode }) {
  const { data: tokenList, loading, error } = useTokensList()

  const { setDefaultTokenList } = useTokenListStore()

  useEffect(() => {
    if (loading || error || !tokenList) return

    setDefaultTokenList(tokenList)
  }, [tokenList, loading, error, setDefaultTokenList])

  return <>{children}</>
}
