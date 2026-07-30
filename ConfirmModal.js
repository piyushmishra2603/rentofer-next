export default function ConfirmModal({ modal, onClose }) {
  if (!modal) {
    return (
      <div className="modal-overlay">
        <div className="modal" />
      </div>
    );
  }
  return (
    <div className="modal-overlay open">
      <div className="modal">
        <div className="modal-title">{modal.title}</div>
        <div className="modal-sub">{modal.sub}</div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className={modal.danger ? "btn-primary-red" : "btn-primary-green"}
            onClick={() => {
              onClose();
              modal.onConfirm();
            }}
          >
            {modal.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
