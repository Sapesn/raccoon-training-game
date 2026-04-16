import { useGameStore } from '../../store/useGameStore'
import { APCounter } from '../common/APCounter'
import { CoinDisplay } from '../common/CoinDisplay'
import { ProgressBar } from '../common/ProgressBar'

export function TopBar() {
  const { gameDay, currentAP, maxAP, player } = useGameStore()

  return (
    <div className="bg-white border-b border-gray-100 px-4 pt-safe-top">
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            Day {gameDay}
          </span>
          <APCounter current={currentAP} max={maxAP} size="sm" />
        </div>
        <CoinDisplay amount={player.coins} />
      </div>

      <div className="pb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-400">Lv.{player.level} {player.nickname}</span>
          <span className="text-xs text-gray-400">{player.exp}/{player.expToNext}</span>
        </div>
        <ProgressBar
          value={player.exp}
          max={player.expToNext}
          color="bg-gradient-to-r from-amber-400 to-orange-500"
          animated={false}
          className="h-1"
        />
      </div>
    </div>
  )
}

export default TopBar
