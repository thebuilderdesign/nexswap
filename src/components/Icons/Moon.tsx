import { type HTMLChakraProps, chakra } from '@chakra-ui/react'

export function MoonIcon(props: HTMLChakraProps<'svg'>) {
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
      <title>MoonIcon</title>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </chakra.svg>
  )
}
