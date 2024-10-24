import React, { useState } from "react";

const AddProductModal = ({ isOpen, onClose, onAddProduct }) => {
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productLink, setProductLink] = useState("");

  const handleAdd = () => {
    if (productName.trim() && productPrice.trim() && productLink.trim()) {
      // Dodaj produkt
      onAddProduct({
        name: productName,
        price: productPrice,
        link: productLink,
      });
      onClose(); // Zamknij modal
      // Wyczyszczenie pól po dodaniu
      setProductName("");
      setProductPrice("");
      setProductLink("");
    } else {
      alert("Wszystkie pola są wymagane.");
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleAdd(); // Zatwierdź dodanie produktu po naciśnięciu Enter
    } else if (event.key === "Escape") {
      onClose(); // Zamknij modal po naciśnięciu Escape
    }
  };

  if (!isOpen) return null; // Nie renderuj modala, gdy jest zamknięty

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Dodaj produkt</h2>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Nazwa produktu"
          className="w-full p-2 mb-4 border rounded"
          onKeyDown={handleKeyPress}
        />
        <input
          type="text"
          value={productPrice}
          onChange={(e) => setProductPrice(e.target.value)}
          placeholder="Cena produktu"
          className="w-full p-2 mb-4 border rounded"
          onKeyDown={handleKeyPress}
        />
        <input
          type="text"
          value={productLink}
          onChange={(e) => setProductLink(e.target.value)}
          placeholder="Link do produktu"
          className="w-full p-2 mb-4 border rounded"
          onKeyDown={handleKeyPress}
        />
        <div className="flex justify-end space-x-2">
          <button className="btn-secondary px-4 py-2 rounded" onClick={onClose}>
            Anuluj
          </button>
          <button className="btn-primary px-4 py-2 rounded" onClick={handleAdd}>
            Dodaj produkt
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
