import React, { useState, useEffect } from "react";

const AddShopModal = ({ isOpen, onClose, onAddShop }) => {
  const [shopName, setShopName] = useState(""); // Nazwa nowego sklepu

  const handleSave = () => {
    if (shopName.trim() !== "") {
      onAddShop(shopName); // Dodaj nowy sklep
      setShopName(""); // Wyczyść pole input po dodaniu
      onClose(); // Zamknij modal
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSave(); // Zatwierdź zapisanie, jeśli wciśnięto Enter
    } else if (event.key === "Escape") {
      onClose(); // Zamknij modal, jeśli wciśnięto Escape
    }
  };

  useEffect(() => {
    // Dodajemy nasłuchiwanie klawiszy na całym dokumencie dla Escape
    const handleGlobalKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose(); // Zamknij modal przy wciśnięciu Escape
      }
    };
    document.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [onClose]);

  if (!isOpen) return null; // Ukryj modal, jeśli nie jest otwarty

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Dodaj sklep</h2>
        <input
          type="text"
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
          onKeyDown={handleKeyDown} // Dodaj nasłuch na Enter i Escape
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
