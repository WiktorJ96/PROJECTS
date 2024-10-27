import React, { useState, useEffect } from "react";

const AddProductModal = ({ isOpen, onClose, onAddProduct }) => {
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productLink, setProductLink] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setProductName("");
      setProductPrice("");
      setProductLink("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const validateInputs = () => {
    if (!productName.trim() || !productPrice.trim() || !productLink.trim()) {
      alert("Wszystkie pola są wymagane.");
      return false;
    }
    if (isNaN(productPrice)) {
      alert("Cena powinna być liczbą.");
      return false;
    }
    return true;
  };

  const handleAdd = () => {
    if (!validateInputs()) return;
    onAddProduct({
      name: productName,
      price: productPrice,
      link: productLink,
    });
    onClose();
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleAdd();
    }
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
          Dodaj produkt
        </h2>
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
