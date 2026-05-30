import React, { useState } from "react";
import Modal from "../Modal/Modal";

const AddShopModal = ({ isOpen, onClose, onAddShop }) => {
  const [shopName, setShopName] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (shopName.trim() === "") {
      setError("Nazwa sklepu jest wymagana.");
      return;
    }
    onAddShop(shopName.trim());
    setShopName("");
    onClose();
  };

  const handleInputChange = (event) => {
    setShopName(event.target.value);
    if (error) setError("");
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Dodaj sklep"
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary px-4 py-2">
            Anuluj
          </button>
          <button type="button" onClick={handleSave} className="btn-primary px-4 py-2">
            Zapisz
          </button>
        </>
      }
    >
      <label className="block">
        <span className="form-label">Nazwa sklepu</span>
        <input
          type="text"
          value={shopName}
          onChange={handleInputChange}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleSave();
          }}
          className="form-input mt-1"
          placeholder="Nazwa sklepu"
        />
      </label>
      {error && <p className="mt-3 text-sm font-medium text-rose-600">{error}</p>}
    </Modal>
  );
};

export default AddShopModal;
