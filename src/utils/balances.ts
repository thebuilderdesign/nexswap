export function formatTokenBalance(balance: bigint, decimals: number): string {
  const balanceStr = balance.toString()

  if (balance === 0n) return '0'

  const padded = balanceStr.padStart(decimals + 1, '0')
  const intPart = padded.slice(0, padded.length - decimals)
  let fractionPart = padded.slice(padded.length - decimals)

  const decimalsToShow = Math.min(fractionPart.length, 6)
  fractionPart = fractionPart.slice(0, decimalsToShow)

  fractionPart = fractionPart.replace(/0+$/, '')

  return fractionPart ? `${intPart}.${fractionPart}` : intPart
}
