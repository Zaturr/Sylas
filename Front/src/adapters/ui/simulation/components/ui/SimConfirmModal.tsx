import '../simulationSteps.css';

type SimConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function SimConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isSubmitting = false,
  onConfirm,
  onCancel,
}: SimConfirmModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="sim-modal" role="presentation">
      <button
        type="button"
        className="sim-modal__backdrop"
        aria-label="Cerrar"
        disabled={isSubmitting}
        onClick={onCancel}
      />
      <div className="sim-modal__panel" role="dialog" aria-modal="true" aria-labelledby="sim-modal-title">
        <h3 id="sim-modal-title" className="sim-modal__title">
          {title}
        </h3>
        <p className="sim-modal__message">{message}</p>
        <div className="sim-modal__actions">
          <button
            type="button"
            className="sim-mobile-btn sim-mobile-btn--ghost"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="sim-mobile-btn sim-mobile-btn--primary"
            disabled={isSubmitting}
            onClick={onConfirm}
          >
            {isSubmitting ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
