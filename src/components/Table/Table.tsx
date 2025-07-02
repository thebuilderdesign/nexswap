'use client'

import { Table as ChakraTable, Flex, HStack, Skeleton, Text } from '@chakra-ui/react'
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { type ReactNode, useState } from 'react'
import { IconActionButton } from '../Buttons'
import { ArrowDownIcon, ArrowUpIcon, ChevronLeftIcon, ChevronRightIcon } from '../Icons'

export type TData = Record<never, unknown>

interface ITableProps<RowDataType extends TData> {
  columns: ColumnDef<RowDataType>[]
  data: RowDataType[]
  loading: boolean
}

const SORTED_ICONS: Record<string, ReactNode> = {
  asc: <ArrowUpIcon height="2" width="2" />,
  desc: <ArrowDownIcon height="2" width="2" />
}

export function Table<RowDataType extends TData>({ columns, data, loading }: ITableProps<RowDataType>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    columns,
    data,
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting }
  })

  const headerGroups = table.getHeaderGroups()
  const rows = table.getRowModel().rows
  const { pageIndex } = table.getState().pagination
  const totalPages = table.getPageCount()
  const paginationText = totalPages > 0 ? `Page ${pageIndex + 1} of ${totalPages}` : ''

  return (
    <Flex direction="column" align="start" maxWidth="100vw" width="100%" zIndex="40" py="5">
      <ChakraTable.ScrollArea
        roundedTop="25px"
        maxWidth="100vw"
        width="100%"
        borderTop="1px solid"
        borderLeft="1px solid"
        borderRight="1px solid"
        borderColor="table-border"
        background="table-background"
      >
        <ChakraTable.Root>
          <ChakraTable.Header>
            {headerGroups.map((headerGroup) => (
              <ChakraTable.Row key={headerGroup.id} background="table-outer-background">
                {headerGroup.headers.map((header) => (
                  <ChakraTable.ColumnHeader
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{ width: header.getSize() }}
                  >
                    <HStack
                      align="center"
                      justify="start"
                      cursor={header.column.getCanSort() ? 'pointer' : undefined}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <Text>{SORTED_ICONS[(header.column.getIsSorted() as string) ?? '']}</Text>
                    </HStack>
                  </ChakraTable.ColumnHeader>
                ))}
              </ChakraTable.Row>
            ))}
          </ChakraTable.Header>
          <ChakraTable.Body>
            {loading ? (
              Array.from(Array(7).keys()).map((rowIndex) => (
                <ChakraTable.Row key={`skeleton-${rowIndex}`} background="table-background">
                  {headerGroups[0]?.headers.map((header, cellIndex) => (
                    <ChakraTable.Cell key={`skeleton-${rowIndex}-${cellIndex}`} style={{ width: header.getSize() }}>
                      <Skeleton height="20px" />
                    </ChakraTable.Cell>
                  ))}
                </ChakraTable.Row>
              ))
            ) : rows.length === 0 ? (
              <ChakraTable.Row background="table-background">
                <ChakraTable.Cell width="full" height="100px" colSpan={5}>
                  <HStack justifyContent="center">
                    <Text fontSize="16px" fontWeight="600">
                      No pools
                    </Text>
                  </HStack>
                </ChakraTable.Cell>
              </ChakraTable.Row>
            ) : (
              rows.map((row) => (
                <ChakraTable.Row key={row.id} background="table-background">
                  {row.getVisibleCells().map((cell) => (
                    <ChakraTable.Cell key={cell.id} style={{ width: cell.column.getSize() }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </ChakraTable.Cell>
                  ))}
                </ChakraTable.Row>
              ))
            )}
          </ChakraTable.Body>
        </ChakraTable.Root>
      </ChakraTable.ScrollArea>

      <Flex
        align="center"
        justify="space-between"
        mt={0}
        maxWidth="100vw"
        width="100%"
        background="table-outer-background"
        borderBottom="1px solid"
        borderLeft="1px solid"
        borderRight="1px solid"
        borderColor="table-border"
        roundedBottom="25px"
        px={5}
        py={3}
        mb="5"
      >
        <IconActionButton
          disabled={!table.getCanPreviousPage()}
          rounded="full"
          height="32px"
          icon={<ChevronLeftIcon height="4" width="4" />}
          onClickHandler={() => table.previousPage()}
        />
        <Text>{paginationText}</Text>
        <IconActionButton
          disabled={!table.getCanNextPage()}
          rounded="full"
          height="32px"
          icon={<ChevronRightIcon height="4" width="4" />}
          onClickHandler={() => table.nextPage()}
        />
      </Flex>
    </Flex>
  )
}
