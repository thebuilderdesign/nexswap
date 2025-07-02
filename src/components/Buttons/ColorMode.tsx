'use client'

import { useColorMode } from '@/hooks'
import { ClientOnly, HStack, Skeleton, Switch } from '@chakra-ui/react'
import { MoonIcon, SunIcon } from '../Icons'

export function ColorModeButton() {
  const { toggleColorMode, colorMode } = useColorMode()

  const thumbLabel = {
    off: <SunIcon h={5} />,
    on: <MoonIcon h={5} />
  }

  return (
    <HStack alignItems="center">
      <ClientOnly fallback={<Skeleton height="24px" width="48px" rounded="48px" />}>
        <Switch.Root size="lg" onChange={toggleColorMode} checked={colorMode === 'dark'}>
          <Switch.HiddenInput />
          <Switch.Control>
            <Switch.Thumb>
              <Switch.ThumbIndicator fallback={thumbLabel.off}>{thumbLabel.on}</Switch.ThumbIndicator>
            </Switch.Thumb>
          </Switch.Control>
        </Switch.Root>
      </ClientOnly>
    </HStack>
  )
}
