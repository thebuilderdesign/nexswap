'use client'
import { Button, type ButtonProps, Spinner, Text } from '@chakra-ui/react'

interface IActionButton extends ButtonProps {
  text: string
  loading: boolean
  onClickHandler: () => void
  height?: string
  disabled: boolean
}

export function SubmitButton({ height = '45px', disabled, loading, text, onClickHandler, ...props }: IActionButton) {
  return (
    <Button
      boxShadow="xs"
      onClick={onClickHandler}
      variant="outline"
      height={height}
      background="custom-blue"
      color="white"
      border="1px solid"
      fontSize="16px"
      disabled={loading ? true : disabled}
      borderColor="custom-blue"
      rounded="25px"
      {...props}
    >
      {loading ? (
        <Spinner />
      ) : (
        <Text fontWeight="700" fontSize="18px">
          {text}
        </Text>
      )}
    </Button>
  )
}
