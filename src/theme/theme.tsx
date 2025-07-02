import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const TOKENS = {
  colors: {
    'custom-blue': { value: '#0C68E9' },
    'custom-green': { value: '#32AE60' },
    'custom-gray': {
      100: { value: '#FAFAFA' },
      200: { value: '#F5F5F5' },
      300: { value: '#EDEDED' },
      400: { value: '#D7D8DC' },
      500: { value: '#B6BAC3' },
      600: { value: '#A7ACB0' },
      700: { value: '#808287' },
      800: { value: '#6F767E' },
      900: { value: '#1A1D1F' }
    }
  }
}

const SEMANTIC_TOKENS = {
  colors: {
    'menu-bg': {
      value: { _light: 'white', _dark: '#141B21' }
    },
    background: {
      value: { _light: '#F3F4F6', _dark: '#111315' }
    },
    'accent-button-background': {
      value: { _light: '#F3F4F6', _dark: '#ffffff1a' }
    },
    'accent-button-color': {
      value: { _light: '{colors.custom-blue}', _dark: 'white' }
    },
    'text-color': {
      value: { _light: '{colors.custom-gray.800}', _dark: '#9FA2A4' }
    },
    'input-background': {
      value: { _light: 'white', _dark: '#fcfcfc0d' }
    },
    'input-border': {
      value: { _light: 'white', _dark: '#EFEFEF47' }
    },
    'button-group-background': {
      value: { _light: 'white', _dark: '#fcfcfc08' }
    },
    'button-group-button-background': {
      value: { _light: '#F3F4F6', _dark: '#efefef26' }
    },
    'button-group-button-color': {
      value: { _light: '{colors.custom-gray.800}', _dark: '#9FA2A4' }
    },
    'button-group-button-active-color': {
      value: { _light: 'black', _dark: 'white' }
    },
    'table-background': {
      value: { _light: 'white', _dark: '#141B21' }
    },
    'table-border': {
      value: { _light: 'white', _dark: '#1D2946' }
    },
    'table-outer-background': {
      value: { _light: 'white', _dark: '#232B3B' }
    },
    'modal-background': {
      value: { _light: 'white', _dark: '#141B21' }
    },
    'modal-border': {
      value: { _light: 'white', _dark: '#1D2946' }
    },
    'text-contrast': {
      value: { _light: 'black', _dark: 'white' }
    },
    'modal-selector-button-background': {
      value: { _light: '#FAFAFA', _dark: '#131624' }
    },
    'input-liquidity-background': {
      value: { _light: '#FAFAFA', _dark: '#131624' }
    },
    'swap-border': {
      value: { _light: '#F3F4F6', _dark: '#1D2946' }
    },
    'swap-token-background': {
      value: { _light: '#FAFAFA', _dark: '#131624' }
    },
    'swap-change-button-border': {
      value: { _light: 'white', _dark: '#141B21' }
    },
    'swap-change-background': {
      value: { _light: 'white', _dark: '#141B21' }
    },
    'token-selector-button-background': {
      value: { _light: 'white', _dark: '#ffffff1a' }
    },
    'token-selector-border': {
      value: { _light: '#E4E6E8', _dark: '#252C34' }
    },
    'token-selector-chevron-color': {
      value: '#A7ACB0'
    },
    'token-selector-modal-background': {
      value: { _light: '#F2F3F7', _dark: '#141B21' }
    },
    'token-selector-modal-border': {
      value: { _light: '#F2F3F7', _dark: '#1D2946' }
    },
    'token-selector-input-background': {
      value: { _light: '#FDFDFD', _dark: '#131624' }
    },
    'token-selector-input-border': {
      value: { _light: '#EDEDED', _dark: '#243350' }
    },
    'token-selector-item-hover': {
      value: { _light: '#F2F3F7', _dark: '#141B21' }
    }
  }
}

const CONFIG = defineConfig({
  globalCss: {
    body: {
      fontFamily: 'Nunito',
      color: 'text-color',
      fontWeight: '600',
      background: 'background'
    },
    '.swap-gradient': {
      backgroundImage: 'linear-gradient(#142E78 #4762B9, var(--tw-gradient-stops))'
    }
  },
  theme: {
    tokens: TOKENS,
    semanticTokens: SEMANTIC_TOKENS
  }
})

export const SYSTEM = createSystem(CONFIG, defaultConfig)
