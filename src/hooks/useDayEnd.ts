/**
 * useDayEnd — triggers end-of-day flow and builds the day summary popup.
 */

import { useGameStore } from '../store/useGameStore'

export function useDayEnd() {
  const store = useGameStore()

  /**
   * Finalises the current day:
   * - Calls store.endDay() to compute the summary and switch phase to DAY_END
   * - Pushes a day_end popup with the summary data
   */
  const triggerDayEnd = () => {
    store.endDay()

    // daySummary is written synchronously by endDay(), read it immediately after
    store.pushPopup({
      type: 'day_end',
      priority: 'normal',
      data: store.daySummary,
    })
  }

  const canEndDay =
    store.currentAP === 0 ||
    store.completedTodayTaskIds.length > 0

  return {
    triggerDayEnd,
    canEndDay,
  }
}
