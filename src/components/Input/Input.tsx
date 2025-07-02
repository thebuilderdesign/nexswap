import { Input as ChakraInput, HStack, InputElement, type InputProps } from '@chakra-ui/react'
import type { HTMLInputTypeAttribute, JSX, ReactNode } from 'react'

export interface IInputProps extends InputProps {
  placeholder: string
  onChangeHandler: (value: string) => void
  icon?: ReactNode
  type: HTMLInputTypeAttribute
  rightElement?: ReactNode
}

export function Input({ placeholder, type, onChangeHandler, rightElement, icon, ...props }: IInputProps): JSX.Element {
  return (
    <HStack gap="1px" width="full">
      {icon && <InputElement pointerEvents="none">{icon}</InputElement>}
      <ChakraInput
        pl={icon ? '40px' : '0px'}
        height="45px"
        fontSize="sm"
        type={type}
        background="input-background"
        outline="none"
        border="1px solid"
        borderColor="input-border"
        placeholder={placeholder}
        onChange={(e) => onChangeHandler(e.target.value)}
        rounded="full"
        {...props}
      />
    </HStack>
  )
}
