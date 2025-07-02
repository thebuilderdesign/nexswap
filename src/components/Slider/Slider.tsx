'use client'

import { Slider as ChakraSlider, HStack, useSlider } from '@chakra-ui/react'

interface ISliderProps {
  value: number
  onChange: (value: number) => void
}

export function Slider({ value, onChange }: ISliderProps) {
  const slider = useSlider({
    defaultValue: [50],
    value: [value],
    thumbAlignment: 'center',
    step: 10,
    onValueChange: (e) => onChange(e.value[0])
  })

  return (
    <HStack width="full" px="5">
      <ChakraSlider.RootProvider value={slider} width="full" size="sm">
        <ChakraSlider.Control>
          <ChakraSlider.Track>
            <ChakraSlider.Range background="custom-blue" />
          </ChakraSlider.Track>
          <ChakraSlider.Thumb index={0} background="custom-blue" border="0px">
            <ChakraSlider.HiddenInput />
          </ChakraSlider.Thumb>
        </ChakraSlider.Control>
      </ChakraSlider.RootProvider>
    </HStack>
  )
}
