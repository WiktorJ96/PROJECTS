import React, { useState, useEffect } from "react";
import DeleteConfirmationModal from "../DeleteConfirmationModal/DeleteConfirmationModal";

const EditShopModal = ({
  isOpen,
  onClose,
  shop,
  onUpdateShopName,
  onDeleteShop,
}) => {
  const [editedShopName, setEditedShopName] = useState(shop);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) setEditedShopName(shop);
  }, [isOpen, shop]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Enter") handleSave();
      if (event.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isOpen, onClose]);

  const handleSave = () => {
    if (editedShopName.trim() === "") {
      setError("Nazwa sklepu nie może być pusta.");
      return;
    }
    onUpdateShopName(editedShopName);
    onClose();
  };

  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteShop = () => {
    onDeleteShop(shop);
    setIsDeleteModalOpen(false);
    onClose();
  };

  const handleInputChange = (e) => {
    setEditedShopName(e.target.value);
    if (error) setError(""); // Usuwanie błędu przy edytowaniu
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="edit-shop-title"
      aria-modal="true"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ease-out"
    >
      <div className="bg-white rounded-lg p-8 w-full max-w-md transition-transform transform-gpu duration-300 ease-out">
        <h2 id="edit-shop-title" className="text-2xl font-semibold mb-4">
          Edytuj sklep
        </h2>
        <input
          type="text"
          value={editedShopName}
          onChange={handleInputChange}
          className="w-full p-2 mb-2 border rounded"
        />
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="btn-secondary px-4 py-2 rounded">
            Anuluj
          </button>
          <button
            onClick={handleSave}
            className="btn-primary px-4 py-2 rounded"
          >
            Zapisz
          </button>
          <button
            onClick={openDeleteModal}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Usuń
          </button>
        </div>
      </div>

      {/* Modal potwierdzenia usunięcia */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteShop}
        item={shop}
        itemType="sklep"
      />
    </div>
  );
};

export default EditShopModal;
