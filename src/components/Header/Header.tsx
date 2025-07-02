'use client'

import { HEADER_HEIGHT } from '@/constants'
import { useMobile } from '@/hooks'
import { useSidebarStore } from '@/stores'
import { Flex, IconButton } from '@chakra-ui/react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { MenuIcon } from '../Icons'

export function Header() {
  const { mobile } = useMobile()
  const { open, setOpen } = useSidebarStore()

  return (
    <Flex
      as="header"
      align="center"
      justify={mobile ? 'space-between' : 'end'}
      h={HEADER_HEIGHT}
      px={mobile ? 4 : 8}
      bg="menu-bg"
      w="100%"
      position="sticky"
      top="0"
      zIndex="1000"
    >
      {mobile && (
        <IconButton aria-label="Toggle Sidebar" onClick={() => setOpen(!open)} variant="ghost" size="xs">
          <MenuIcon />
        </IconButton>
      )}
      <ConnectButton />
    </Flex>
  )
}
