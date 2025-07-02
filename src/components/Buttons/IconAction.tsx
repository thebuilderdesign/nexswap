'use client'
import { Button, type ButtonProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface IActionButton extends ButtonProps {
  icon: ReactNode
  onClickHandler: () => void
  height?: string
}

export function IconActionButton({ height = '45px', icon, onClickHandler, ...props }: IActionButton) {
  return (
    <Button
      onClick={onClickHandler}
      variant="outline"
      height={height}
      px="0"
      background="accent-button-background"
      color="accent-button-color"
      border="1px solid"
      borderColor="custom-blue"
      _hover={{ background: 'custom-blue', color: 'white' }}
      {...props}
    >
      {icon}
    </Button>
  )
}
