import React, { useState } from "react";
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

  // Funkcja do zapisania edytowanej nazwy sklepu
  const handleSave = () => {
    onUpdateShopName(editedShopName); // Zaktualizuj nazwę sklepu
    onClose(); // Zamknij modal edycji
  };

  // Otwórz modal potwierdzający usunięcie sklepu
  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  // Funkcja do obsługi usunięcia sklepu
  const handleDeleteShop = () => {
    onDeleteShop(shop); // Wywołaj funkcję usunięcia sklepu
    setIsDeleteModalOpen(false); // Zamknij modal potwierdzenia
    onClose(); // Zamknij modal edycji
  };

  if (!isOpen) return null; // Ukryj modal, gdy nie jest otwarty

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Edytuj sklep</h2>
        <input
          type="text"
          value={editedShopName}
          onChange={(e) => setEditedShopName(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
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
            onClick={openDeleteModal} // Otwiera modal usuwania
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Usuń
          </button>
        </div>
      </div>

      {/* Modal potwierdzenia usunięcia */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)} // Zamknij modal bez usunięcia
        onConfirm={handleDeleteShop} // Funkcja do potwierdzenia usunięcia
        item={shop} // Nazwa sklepu do wyświetlenia
        itemType="sklep" // Typ obiektu do usunięcia
      />
    </div>
  );
};

export default EditShopModal;