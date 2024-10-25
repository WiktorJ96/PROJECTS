import React, { useState } from "react";

const AddShopModal = ({ isOpen, onClose, onAddShop }) => {
  const [shopName, setShopName] = useState("");

  const handleSave = () => {
    if (shopName.trim() !== "") {
      onAddShop(shopName); // Przekazujemy nazwę sklepu do App.js
      setShopName(""); // Czyścimy input
      onClose(); // Zamykamy modal
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Dodaj sklep</h2>
        <input
          type="text"
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
          placeholder="Nazwa sklepu"
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
        </div>
      </div>
    </div>
  );
};

export default AddShopModal;
