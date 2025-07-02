import { type HTMLChakraProps, chakra } from '@chakra-ui/react'

export function PlusIcon(props: HTMLChakraProps<'svg'>) {
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
      <title>PlusIcon</title>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </chakra.svg>
  )
}
