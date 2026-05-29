import React, { useEffect, useState } from "react";

const AddProductModal = ({ isOpen, onClose, onAddProduct }) => {
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productLink, setProductLink] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setProductName("");
      setProductPrice("");
      setProductLink("");
      setError("");
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
      setError("Wszystkie pola sa wymagane.");
      return false;
    }

    const price = Number(productPrice);
    if (!Number.isFinite(price) || price < 0) {
      setError("Cena powinna byc liczba wieksza lub rowna 0.");
      return false;
    }

    try {
      const url = new URL(productLink);
      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch (validationError) {
      setError("Link powinien byc poprawnym adresem http lub https.");
      return false;
    }

    return true;
  };

  const handleAdd = () => {
    if (!validateInputs()) return;

    onAddProduct({
      name: productName.trim(),
      price: Number(productPrice),
      link: productLink.trim(),
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
      aria-modal="true"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <h2 id="modal-title" className="text-2xl font-semibold mb-4">
          Dodaj produkt
        </h2>
        <input
          type="text"
          value={productName}
          onChange={(event) => {
            setProductName(event.target.value);
            setError("");
          }}
          placeholder="Nazwa produktu"
          className="w-full p-2 mb-4 border rounded"
          onKeyDown={handleKeyPress}
        />
        <input
          type="number"
          min="0"
          step="0.01"
          value={productPrice}
          onChange={(event) => {
            setProductPrice(event.target.value);
            setError("");
          }}
          placeholder="Cena produktu"
          className="w-full p-2 mb-4 border rounded"
          onKeyDown={handleKeyPress}
        />
        <input
          type="url"
          value={productLink}
          onChange={(event) => {
            setProductLink(event.target.value);
            setError("");
          }}
          placeholder="Link do produktu"
          className="w-full p-2 mb-4 border rounded"
          onKeyDown={handleKeyPress}
        />
        {error && <p className="text-red-500 mb-4">{error}</p>}
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
