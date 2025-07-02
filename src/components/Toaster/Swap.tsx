'use client'

import { Toaster as ChakraToaster, HStack, Portal, Spinner, Text, Toast, VStack, createToaster } from '@chakra-ui/react'

export const SWAP_TOASTER = createToaster({
  placement: 'top-end',
  pauseOnPageIdle: true
})

export function SwapToaster() {
  return (
    <Portal>
      <ChakraToaster toaster={SWAP_TOASTER} background="modal-background">
        {(toast) => (
          <Toast.Root width={{ md: 'sm' }}>
            <HStack justifyContent="space-between" height="full" alignItems="center">
              {toast.type === 'loading' ? <Spinner size="md" color="blue.solid" /> : <Toast.Indicator />}
              <VStack maxWidth="100%" mx="5" gap="0" alignItems="start">
                {toast.title && (
                  <Toast.Title>
                    <Text fontWeight="700" fontSize="14px">
                      {toast.title}
                    </Text>
                  </Toast.Title>
                )}
                {toast.description && <Toast.Description>{toast.description}</Toast.Description>}
              </VStack>
              {toast.action && <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>}
              {toast.meta?.closable && <Toast.CloseTrigger />}
            </HStack>
          </Toast.Root>
        )}
      </ChakraToaster>
    </Portal>
  )
}
