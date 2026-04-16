import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../common/Button'
import type { GameEvent } from '../../types/event'

interface EventPopupProps {
  event: GameEvent
  onChoice: (choiceId: string) => void
  onDismiss: () => void
}

export function EventPopup({ event, onChoice, onDismiss }: EventPopupProps) {
  const hasChoices = event.choices && event.choices.length > 0

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onDismiss} />
      <motion.div
        className="relative w-full bg-white rounded-t-3xl p-6 pb-8"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">{event.emoji}</div>
          <h2 className="text-base font-bold text-gray-800">{event.title}</h2>
        </div>

        <p className="text-sm text-gray-500 text-center mb-5">{event.description}</p>

        {hasChoices ? (
          <div className="space-y-2">
            {event.choices!.map((choice) => (
              <Button
                key={choice.id}
                variant="secondary"
                fullWidth
                onClick={() => onChoice(choice.id)}
              >
                {choice.label}
              </Button>
            ))}
          </div>
        ) : (
          <Button variant="primary" fullWidth onClick={onDismiss}>
            好的
          </Button>
        )}
      </motion.div>
    </motion.div>
  )
}

export default EventPopup
