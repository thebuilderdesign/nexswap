import { Header, Sidebar, SwapToaster } from '@/components'
import { HEADER_HEIGHT, SIDEBAR_WIDTH } from '@/constants'
import { StateProvider, ThemeProvider, WalletProvider } from '@/providers'
import { Box } from '@chakra-ui/react'
import { GoogleAnalytics } from '@next/third-parties/google'
import type { Metadata } from 'next'
import { Inter, Nunito } from 'next/font/google'
import localFont from 'next/font/local'

const INTER = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

const NUNITO = Nunito({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nunito'
})

const GEIST_SANS = localFont({
  src: './fonts/geist.woff',
  variable: '--font-geist-sans',
  weight: '100 900'
})
const GEIST_MONO = localFont({
  src: './fonts/geist-mono.woff',
  variable: '--font-geist-mono',
  weight: '100 900'
})

export const METADATA: Metadata = {
  title: 'Taya Finance',
  description: 'TAYA | AMM Dex For Customizable DeFi',
  openGraph: {
    title: 'Taya Finance',
    description: 'TAYA | AMM Dex For Customizable DeFi',
    url: 'https://tayaswap.xyz/',
    images: [
      {
        url: 'https://i.postimg.cc/xT9rcn0X/taya-meta-black.png',
        width: 1200,
        height: 630,
        alt: 'og image taya'
      }
    ],
    siteName: 'Taya Finance',
    locale: 'en_US',
    type: 'website'
  }
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${GEIST_SANS.variable} ${GEIST_MONO.variable} ${INTER.variable} ${NUNITO.variable} antialiased`}
      suppressHydrationWarning
    >
      <body>
        <GoogleAnalytics gaId="G-NS2ZG22J02" />
        <ThemeProvider>
          <WalletProvider>
            <StateProvider>
              <main style={{ position: 'relative', overflowX: 'hidden' }}>
                <Header />
                <Sidebar />
                <SwapToaster />
                <Box
                  background="background"
                  ml={{ base: 0, lg: SIDEBAR_WIDTH }}
                  w={{ base: '100%', lg: `calc(100vw - ${SIDEBAR_WIDTH})` }}
                  height={`calc(100dvh - ${HEADER_HEIGHT})`}
                  pt="15px"
                >
                  {children}
                </Box>
              </main>
            </StateProvider>
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
