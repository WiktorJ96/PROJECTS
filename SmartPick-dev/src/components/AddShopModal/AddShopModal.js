import React, { useState } from "react";

const AddShopModal = ({ isOpen, onClose, onAddShop }) => {
  const [shopName, setShopName] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (shopName.trim() === "") {
      setError("Nazwa sklepu jest wymagana.");
      return;
    }
    onAddShop(shopName);
    setShopName(""); // Czyścimy input
    onClose(); // Zamykamy modal
  };

  const handleInputChange = (e) => {
    setShopName(e.target.value);
    if (error) setError(""); // Usuwamy błąd po rozpoczęciu wpisywania
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="modal-title"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <h2 id="modal-title" className="text-2xl font-semibold mb-4">
          Dodaj sklep
        </h2>
        <input
          type="text"
          value={shopName}
          onChange={handleInputChange}
          placeholder="Nazwa sklepu"
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
        </div>
      </div>
    </div>
  );
};

export default AddShopModal;
