import React from "react";

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  item,
  itemType,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Potwierdź usunięcie</h2>
        <p className="mb-4">
          Czy na pewno chcesz usunąć {itemType} "{item}"?
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
