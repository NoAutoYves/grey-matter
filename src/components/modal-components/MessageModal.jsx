function MessageModal({ isOpen, message, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="warning-modal-overlay">
      <div className="warning-modal">
        <p>{message}</p>
        <div className="warning-modal-buttons">
          <button onClick={onClose} className="warning-confirm-btn">OK</button>
        </div>
      </div>
    </div>
  );
}

export default MessageModal;