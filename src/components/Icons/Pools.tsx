import { type HTMLChakraProps, chakra } from '@chakra-ui/react'

export function PoolsIcon(props: HTMLChakraProps<'svg'>) {
  return (
    <chakra.svg
      fill="none"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeWidth="2"
      strokeLinejoin="round"
      {...props}
    >
      <title>PoolsIcon</title>
      <circle cx="9" cy="9" r="7" />
      <circle cx="15" cy="15" r="7" />
    </chakra.svg>
  )
}
