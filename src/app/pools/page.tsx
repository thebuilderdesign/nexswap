'use client'

import { ActionButton, Input, ManagePoolModal, PlusOutlineIcon, SearchIcon, Table, TokenIconGroup } from '@/components'
import { type IPairData, usePools } from '@/services'
import { useTokenBalancesStore } from '@/stores'
import { Box, Button, ButtonGroup, GridItem, HStack, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { matchSorter } from 'match-sorter'
import { useMemo, useState } from 'react'
import { useAccount } from 'wagmi'

interface IPoolData {
  id: string
  poolNumber: number
  poolName: string
  volumeUSD: number
  reserveUSD: number
  token0Symbol: string
  token0Name: string
  token0: string
  token1Symbol: string
  token1Name: string
  token1: string
}

const FILTER_POOLS = (pools: IPoolData[], query: string | undefined): IPoolData[] => {
  if (!query) return pools
  return matchSorter(pools, query, {
    keys: ['token0', 'token1', 'token1Symbol', 'token1Name', 'token0Symbol', 'token0Name']
  })
}

const PARSE_POOL = (pool: IPairData, index: number): IPoolData => ({
  poolNumber: index + 1,
  poolName: `${pool.token0.symbol}/${pool.token1.symbol}`,
  id: pool.id,
  volumeUSD: Number.parseFloat(pool.volumeUSD),
  reserveUSD: Number.parseFloat(pool.reserveUSD),
  token0: pool.token0.id,
  token0Symbol: pool.token0.symbol,
  token0Name: pool.token0.name,
  token1: pool.token1.id,
  token1Symbol: pool.token1.symbol,
  token1Name: pool.token1.name
})

export default function Page() {
  const { data: pools, loading, error } = usePools()

  const { poolBalances, reloadPoolBalances, reloadTokenBalances } = useTokenBalancesStore()

  const { address } = useAccount()

  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined)

  const [allPools, setAllPools] = useState(true)

  const handleSearch = (value: string) => {
    setSearchQuery(value.trim() === '' ? undefined : value)
  }

  const allPoolData = useMemo(() => {
    if (!pools || loading || error) return [] as IPoolData[]
    return pools.map(PARSE_POOL)
  }, [pools, loading, error])

  const filteredAllPoolData = useMemo(() => FILTER_POOLS(allPoolData, searchQuery), [allPoolData, searchQuery])

  const userPoolData = useMemo(() => {
    if (!poolBalances || !pools || loading || error) return [] as IPoolData[]

    const cleanBalances = Object.fromEntries(Object.entries(poolBalances).filter(([, token]) => token.balance !== 0n))

    const userPoolIds = new Set(Object.keys(cleanBalances))

    const filteredPools = pools.filter((pool) => userPoolIds.has(pool.id))

    return filteredPools.map(PARSE_POOL)
  }, [poolBalances, pools, loading, error])

  const filteredUserPoolData = useMemo(() => FILTER_POOLS(userPoolData, searchQuery), [userPoolData, searchQuery])

  const columnHelper = createColumnHelper<IPoolData>()

  const columns = useMemo(() => {
    return [
      columnHelper.accessor('poolNumber', {
        header: () => (
          <HStack justifyContent="center" width="full">
            #
          </HStack>
        ),
        cell: (info) => <HStack justifyContent="center">{info.getValue() as number}</HStack>,
        maxSize: 5,
        enableSorting: false
      }),
      columnHelper.accessor('poolName', {
        header: () => 'Pool',
        cell: (info) => (
          <HStack justifyContent="start" alignItems="center">
            <TokenIconGroup size="35px" token0={info.row.original.token0} token1={info.row.original.token1} />
            {info.getValue() as string}
          </HStack>
        ),
        size: 30,
        enableSorting: false
      }),
      columnHelper.accessor('reserveUSD', {
        header: () => (
          <HStack justifyContent="end" width="full">
            TVL
          </HStack>
        ),
        cell: (info) => <HStack justifyContent="end">{info.getValue().toLocaleString()} USD</HStack>,
        minSize: 50
      }),
      columnHelper.accessor('volumeUSD', {
        header: () => (
          <HStack justifyContent="end" width="full">
            Volume
          </HStack>
        ),
        cell: (info) => <HStack justifyContent="end">{info.getValue().toLocaleString()} USD</HStack>,
        minSize: 50
      }),
      columnHelper.accessor('id', {
        header: () => (
          <HStack justifyContent="center" width="full">
            Action
          </HStack>
        ),
        cell: (info) => (
          <Box height="32px">
            <Stack height="full" justifyContent="end" alignItems="center">
              <ActionButton
                disabled={!address}
                text="Manage"
                rounded="full"
                height="32px"
                width="90px"
                size="sm"
                onClickHandler={() => handlePoolManage(info.getValue() as string)}
              />
            </Stack>
          </Box>
        ),
        minSize: 30,
        enableSorting: false
      })
    ]
  }, [columnHelper, address]) as ColumnDef<IPoolData>[]

  const [managePoolOpen, setManagePoolOpen] = useState(false)

  const [managePool, setManagePoolId] = useState<IPairData | undefined>(undefined)

  const handlePoolManage = (id: string) => {
    if (!pools) return

    setManagePoolOpen(true)

    const pair = pools.find((pool) => pool.id === id)
    if (!pair) return

    setManagePoolId(pair)
  }

  const handlePoolManageClose = async () => {
    if (!address || !managePool) return

    await Promise.all([
      reloadPoolBalances(address, [{ address: managePool.id, decimals: 18 }]),
      reloadTokenBalances(address, [
        { address: managePool.token0.id, decimals: Number(managePool.token0.decimals) },
        { address: managePool.token1.id, decimals: Number(managePool.token1.decimals) }
      ])
    ])

    setManagePoolId(undefined)
  }

  return (
    <>
      {managePool && (
        <ManagePoolModal
          open={managePoolOpen}
          pool={managePool}
          onClose={handlePoolManageClose}
          close={() => setManagePoolOpen(false)}
        />
      )}
      <Box mx={{ base: '15px', md: '20px', xl: '100px' }}>
        <SimpleGrid width="full" columns={{ base: 2, lg: 3 }} gapY="15px" gapX="20px">
          <GridItem colSpan={1}>
            <Box background="button-group-background" rounded="full" p="1.5" width="195px">
              <ButtonGroup size="sm" variant="ghost">
                <Button
                  rounded="full"
                  onClick={() => setAllPools(true)}
                  background={allPools ? 'button-group-button-background' : undefined}
                  color={allPools ? 'button-group-button-active-color' : 'button-group-button-color'}
                >
                  <Text>All Pools</Text>
                </Button>
                <Button
                  rounded="full"
                  onClick={() => setAllPools(false)}
                  background={allPools ? undefined : 'button-group-button-background'}
                  color={allPools ? 'button-group-button-color' : 'button-group-button-active-color'}
                >
                  <Text>My Pools</Text>
                </Button>
              </ButtonGroup>
            </Box>
          </GridItem>
          <GridItem colSpan={1}>
            <HStack width="full" justifyContent="end">
              <ActionButton disabled text="Create Pool" rounded="full" icon={<PlusOutlineIcon h="5" />} />
            </HStack>
          </GridItem>
          <GridItem colSpan={{ base: 2, lg: 1 }}>
            <HStack width="full" justifyContent="center">
              <Input
                placeholder="Search assets or address."
                size="md"
                type="text"
                minWidth="full"
                onChangeHandler={handleSearch}
                icon={<SearchIcon h="5" />}
              />
            </HStack>
          </GridItem>
        </SimpleGrid>

        <Table columns={columns} loading={loading} data={allPools ? filteredAllPoolData : filteredUserPoolData} />
      </Box>
    </>
  )
}
