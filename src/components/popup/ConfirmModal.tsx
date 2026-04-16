import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '../common/Button'

interface ConfirmModalProps {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  isOpen: boolean
}

export function ConfirmModal({
  title, message, confirmLabel = '确认', cancelLabel = '取消',
  onConfirm, onCancel, isOpen,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl p-5 w-full max-w-xs"
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <h3 className="text-base font-bold text-gray-800 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 mb-5">{message}</p>
              <div className="flex gap-3">
                <Button variant="secondary" fullWidth onClick={onCancel}>{cancelLabel}</Button>
                <Button variant="primary" fullWidth onClick={onConfirm}>{confirmLabel}</Button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ConfirmModal
