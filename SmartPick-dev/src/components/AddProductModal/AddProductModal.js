import React, { useEffect, useState } from "react";
import Modal from "../Modal/Modal";

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

  const validateInputs = () => {
    if (!productName.trim() || !productPrice.trim() || !productLink.trim()) {
      setError("Wszystkie pola są wymagane.");
      return false;
    }

    const price = Number(productPrice);
    if (!Number.isFinite(price) || price < 0) {
      setError("Cena powinna być liczbą większą lub równą 0.");
      return false;
    }

    try {
      const url = new URL(productLink);
      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch (validationError) {
      setError("Link powinien być poprawnym adresem http lub https.");
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

  const handleKeyDown = (event) => {
    if (event.key === "Enter") handleAdd();
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Dodaj produkt"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-secondary px-4 py-2" onClick={onClose}>
            Anuluj
          </button>
          <button type="button" className="btn-primary px-4 py-2" onClick={handleAdd}>
            Dodaj produkt
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <label className="block">
          <span className="form-label">Nazwa produktu</span>
          <input
            type="text"
            value={productName}
            onChange={(event) => {
              setProductName(event.target.value);
              setError("");
            }}
            className="form-input mt-1"
            placeholder="Nazwa produktu"
            onKeyDown={handleKeyDown}
          />
        </label>
        <label className="block">
          <span className="form-label">Cena</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={productPrice}
            onChange={(event) => {
              setProductPrice(event.target.value);
              setError("");
            }}
            className="form-input mt-1"
            placeholder="Cena produktu"
            onKeyDown={handleKeyDown}
          />
        </label>
        <label className="block">
          <span className="form-label">Link do produktu</span>
          <input
            type="url"
            value={productLink}
            onChange={(event) => {
              setProductLink(event.target.value);
              setError("");
            }}
            className="form-input mt-1"
            placeholder="Link do produktu"
            onKeyDown={handleKeyDown}
          />
        </label>
        {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
      </div>
    </Modal>
  );
};

export default AddProductModal;
