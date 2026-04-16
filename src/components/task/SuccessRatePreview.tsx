import type { SuccessRateBreakdown } from '../../utils/taskFormula'

interface SuccessRatePreviewProps {
  successRate: number
  breakdown: SuccessRateBreakdown
}

function RingChart({ value }: { value: number }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const dash = (value / 100) * circ

  const color = value >= 70 ? '#22c55e' : value >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#f3f4f6" strokeWidth="7" />
      <circle
        cx="36" cy="36" r={r}
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
      />
      <text x="36" y="40" textAnchor="middle" fontSize="13" fontWeight="700" fill={color}>
        {Math.round(value)}%
      </text>
    </svg>
  )
}

export function SuccessRatePreview({ successRate, breakdown }: SuccessRatePreviewProps) {
  const rows = [
    { label: '基础成功率', value: breakdown.baseRate, sign: '' },
    { label: '能力加成', value: breakdown.statBonus, sign: '+' },
    { label: '模板加成', value: breakdown.templateBonus, sign: '+' },
    { label: '状态加成', value: breakdown.statusBonus, sign: '+' },
  ]

  return (
    <div className="flex items-center gap-4">
      <RingChart value={successRate} />
      <div className="flex-1 space-y-1">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between text-xs">
            <span className="text-gray-500">{r.label}</span>
            <span className={r.value > 0 && r.sign ? 'text-green-600' : 'text-gray-600'}>
              {r.sign}{Math.round(r.value)}%
            </span>
          </div>
        ))}
        <div className="border-t border-gray-100 pt-1 flex justify-between text-xs font-medium">
          <span className="text-gray-600">预计区间</span>
          <span className="text-amber-600">{breakdown.displayMin}%~{breakdown.displayMax}%</span>
        </div>
      </div>
    </div>
  )
}

export default SuccessRatePreview
