interface CoinDisplayProps {
  amount: number
  showLabel?: boolean
}

export function CoinDisplay({ amount, showLabel = false }: CoinDisplayProps) {
  return (
    <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
      <span>🪙</span>
      <span>{amount.toLocaleString()}</span>
      {showLabel && <span className="text-xs text-gray-400">金币</span>}
    </span>
  )
}

export default CoinDisplay
