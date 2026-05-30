import React, { useEffect } from "react";
import Modal from "../Modal/Modal";

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  item,
  itemType,
}) => {
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Enter") onConfirm();
    };

    if (isOpen) document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isOpen, onConfirm]);

  const truncatedItem =
    item && item.length > 30 ? `${item.substring(0, 30)}...` : item;

  return (
    <Modal
      isOpen={isOpen}
      title="Potwierdź usunięcie"
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary px-4 py-2">
            Anuluj
          </button>
          <button type="button" onClick={onConfirm} className="btn-danger px-4 py-2">
            Usuń
          </button>
        </>
      }
    >
      <p className="text-slate-700">
        Czy na pewno chcesz usunąć {itemType} "{truncatedItem}"?
      </p>
    </Modal>
  );
};

export default DeleteConfirmationModal;
