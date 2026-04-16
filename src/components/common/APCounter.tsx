interface APCounterProps {
  current: number
  max: number
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'text-sm gap-0.5',
  md: 'text-base gap-1',
  lg: 'text-lg gap-1.5',
}

export function APCounter({ current, max, size = 'md' }: APCounterProps) {
  return (
    <div className={`flex items-center ${sizeMap[size]}`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < current ? 'text-amber-500' : 'text-gray-300'}>
          {i < current ? '●' : '○'}
        </span>
      ))}
    </div>
  )
}

export default APCounter
