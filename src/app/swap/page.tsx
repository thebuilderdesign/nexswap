'use client'

import { Swap } from '@/components'
import { Box, Center } from '@chakra-ui/react'

export default function Page() {
  return (
    <Box mx={{ base: '15px', md: '20px', xl: '100px' }} height="100%">
      <Center width="100%" height="95%">
        <Swap />
      </Center>
    </Box>
  )
}
