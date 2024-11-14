import React, { useEffect } from "react";

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
      if (event.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyPress);
    } else {
      document.removeEventListener("keydown", handleKeyPress);
    }
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isOpen, onClose, onConfirm]);

  if (!isOpen) return null;

  const truncatedItem =
    item && item.length > 30 ? `${item.substring(0, 30)}...` : item;

  return (
    <div
      role="dialog"
      aria-labelledby="modal-title"
      aria-modal="true"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ease-out"
    >
      <div className="bg-white rounded-lg p-8 w-full max-w-md transition-transform transform-gpu duration-300 ease-out">
        <h2 id="modal-title" className="text-2xl font-semibold mb-4">
          Potwierdź usunięcie
        </h2>
        <p className="mb-4">
          Czy na pewno chcesz usunąć {itemType} "{truncatedItem}"?
        </p>
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="btn-secondary px-4 py-2 rounded">
            Anuluj
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Usuń
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
