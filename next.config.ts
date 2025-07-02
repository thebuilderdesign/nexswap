import type { NextConfig } from 'next'

const NEXT_CONFIG: NextConfig = {
  experimental: {
    optimizePackageImports: ['@chakra-ui/react']
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com'
      }
    ]
  }
}

export default NEXT_CONFIG
