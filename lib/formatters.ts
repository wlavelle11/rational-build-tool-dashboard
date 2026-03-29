export function formatCurrency(value: number, decimals = 0): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value)
}

export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}

export function formatMultiple(value: number): string {
  return `${value.toFixed(2)}x`
}
