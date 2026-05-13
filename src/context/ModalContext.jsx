import { createContext, useContext, useState } from "react";

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    message: "",
    onConfirm: null,
    onCancel: null
  });

  const showModal = (message, onConfirm, onCancel) => {
    setModalConfig({ message, onConfirm, onCancel });
    setModalOpen(true);
  };

  const hideModal = () => {
    setModalOpen(false);
    setModalConfig({ message: "", onConfirm: null, onCancel: null });
  };

  const handleConfirm = () => {
    if (modalConfig.onConfirm) modalConfig.onConfirm();
    hideModal();
  };

  const handleCancel = () => {
    if (modalConfig.onCancel) modalConfig.onCancel();
    hideModal();
  };

  return (
    <ModalContext.Provider value={{ showModal }}>
      {children}
      {modalOpen && (
        <div className="warning-modal-overlay">
          <div className="warning-modal">
            <p>{modalConfig.message}</p>
            <div className="warning-modal-buttons">
              <button onClick={handleConfirm} className="warning-confirm-btn">Leave</button>
              <button onClick={handleCancel} className="warning-cancel-btn">Stay</button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export const useModal = () => useContext(ModalContext);