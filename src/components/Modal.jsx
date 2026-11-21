import { motion, AnimatePresence } from 'framer-motion';

export default function Modal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'YA, LANJUT',
  cancelText = 'BATAL',
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="modal-content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{title}</h2>
            <p>{message}</p>
            <div className="modal-buttons">
              <button className="arcade-btn" onClick={onCancel}>
                {cancelText}
              </button>
              <button className="arcade-btn accent" onClick={onConfirm}>
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
