import NextLink from 'next/link'
import type { JSX } from 'react'

export interface ILinkProps {
  children: JSX.Element
  href: string
  external?: boolean
  rel?: string
}

export function Link({ children, href, external = false, rel, ...props }: ILinkProps) {
  return (
    <NextLink
      rel={external ? 'noopener noreferrer' : rel}
      target={external ? '_blank' : '_self'}
      href={href}
      style={{ display: 'block', width: '100%' }}
      {...props}
    >
      {children}
    </NextLink>
  )
}
