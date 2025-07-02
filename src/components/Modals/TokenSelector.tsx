'use client'

import type { ITokenListToken } from '@/services'
import { useTokenBalancesStore, useTokenListStore } from '@/stores'
import {
  Box,
  Center,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  HStack,
  IconButton,
  Spinner,
  Text,
  VStack
} from '@chakra-ui/react'
import { matchSorter } from 'match-sorter'
import { useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { CloseIcon, SearchIcon } from '../Icons'
import { Input } from '../Input'
import { TokenIcon } from '../TokenIcon'

function TokenItem({
  token,
  onSelectToken
}: { token: ITokenListToken; onSelectToken: (token: ITokenListToken) => void }) {
  const { address } = useAccount()

  const { getFormattedTokenBalance } = useTokenBalancesStore()

  const balance = useMemo(() => getFormattedTokenBalance(token.address), [getFormattedTokenBalance, token.address])

  return (
    <HStack
      height="50px"
      justifyContent="space-between"
      px="3"
      py="2"
      width="full"
      cursor="pointer"
      _hover={{ background: 'token-selector-item-hover' }}
      onClick={() => onSelectToken(token)}
    >
      <HStack justifyContent="start" height="40px">
        <TokenIcon token={token.address} size="30px" />
        <VStack gap="0" justifyContent="start" alignItems="start">
          <Text color="text-contrast">{token.symbol}</Text>
          <Text fontSize="12px">{token.name}</Text>
        </VStack>
      </HStack>

      <Text textAlign="end" color="text-contrast">
        {address ? balance ? balance : <Spinner /> : '0'}
      </Text>
    </HStack>
  )
}

const FILTER_TOKENS = (tokens: ITokenListToken[], query: string | undefined): ITokenListToken[] => {
  if (!query) return tokens
  return matchSorter(tokens, query, {
    keys: ['symbol', 'name', 'address']
  })
}

export interface ITokenSelectorModalProps {
  open: boolean
  close: () => void
  onSelectToken: (token: ITokenListToken) => void
}

export function TokenSelectorModal({ open, onSelectToken, close }: ITokenSelectorModalProps) {
  const { defaultTokenList, userTokenList } = useTokenListStore()

  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined)

  const handleSearch = (value: string) => {
    setSearchQuery(value.trim() === '' ? undefined : value)
  }

  const filteredTokens = useMemo(
    () => FILTER_TOKENS(userTokenList.concat(defaultTokenList), searchQuery),
    [userTokenList, defaultTokenList, searchQuery]
  )

  const handleTokenSelect = (token: ITokenListToken) => {
    onSelectToken(token)
    close()
  }

  return (
    <Box position="absolute" top="0" left="0" width="full" height="full" px="5">
      <Center height="full" width="full">
        <DialogRoot open={open} size="xs" motionPreset="scale">
          <DialogBackdrop />
          <DialogContent
            rounded="25px"
            background="token-selector-modal-background"
            border="2px solid"
            borderColor="modal-border"
          >
            <DialogCloseTrigger />

            <DialogHeader>
              <HStack justifyContent="space-between">
                <DialogTitle>
                  <Text color="text-contrast" fontWeight="400">
                    Select a Token
                  </Text>
                </DialogTitle>
                <IconButton
                  onClick={close}
                  variant="ghost"
                  size="xs"
                  rounded="xl"
                  _hover={{ background: 'button-group-button-background' }}
                  background="modal-selector-button-background"
                >
                  <CloseIcon />
                </IconButton>
              </HStack>
            </DialogHeader>
            <DialogBody>
              <Box height="400px" position="relative">
                <VStack width="full">
                  <Input
                    placeholder="Search assets or address."
                    size="md"
                    type="text"
                    rounded="xl"
                    minWidth="full"
                    borderColor="token-selector-input-border"
                    background="token-selector-input-background"
                    onChangeHandler={handleSearch}
                    icon={<SearchIcon h="5" />}
                  />
                  <Box
                    mt="2"
                    rounded="xl"
                    background="token-selector-input-background"
                    outline="none"
                    border="1px solid"
                    borderColor="token-selector-input-border"
                    height="338px"
                    width="full"
                    overflow="scroll"
                  >
                    {filteredTokens.map((token, i) => (
                      <TokenItem key={i} token={token} onSelectToken={handleTokenSelect} />
                    ))}
                  </Box>
                </VStack>
              </Box>
            </DialogBody>
          </DialogContent>
        </DialogRoot>
      </Center>
    </Box>
  )
}
