import React, { useEffect, useState } from "react";
import { FaCreditCard, FaTrash } from "react-icons/fa";
import DeleteConfirmationModal from "../DeleteConfirmationModal/DeleteConfirmationModal";
import Modal from "../Modal/Modal";

const STORAGE_KEY = "paymentMethods";
const LEGACY_STORAGE_KEY = "cards";

const normalizeMethod = (method) => {
  if (!method) return null;
  const last4Source = method.last4 || method.cardNumber || "";
  const last4 = String(last4Source).replace(/\D/g, "").slice(-4);

  return {
    id: method.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    label: method.label || "Karta płatnicza",
    cardHolder: method.cardHolder || "",
    expiryDate: method.expiryDate || "",
    last4,
  };
};

const loadPaymentMethods = () => {
  const savedMethods = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const legacyCards = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY)) || [];
  const migratedCards = legacyCards.map(normalizeMethod).filter(Boolean);
  const methods = [...savedMethods, ...migratedCards].map(normalizeMethod).filter(Boolean);

  if (legacyCards.length > 0) {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(methods));
  }

  return methods;
};

const AddCardModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("add");
  const [methods, setMethods] = useState([]);
  const [label, setLabel] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [last4, setLast4] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [error, setError] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMethodIndex, setSelectedMethodIndex] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setMethods(loadPaymentMethods());
    };
  }, [isOpen]);

  const saveMethods = (nextMethods) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextMethods));
    setMethods(nextMethods);
  };

  const handleExpiryDateChange = (event) => {
    let value = event.target.value.replace(/\D/g, "");
    if (value.length >= 3) {
      value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
    }
    setExpiryDate(value);
    setError("");
  };

  const handleSaveMethod = () => {
    if (!label.trim() || !last4.trim() || !expiryDate.trim()) {
      setError("Nazwa metody, ostatnie 4 cyfry i ważność są wymagane.");
      return;
    }

    if (!/^\d{4}$/.test(last4)) {
      setError("Podaj dokładnie ostatnie 4 cyfry karty.");
      return;
    }

    const nextMethod = {
      id: `${Date.now()}`,
      label: label.trim(),
      cardHolder: cardHolder.trim(),
      last4,
      expiryDate,
    };
    saveMethods([...methods, nextMethod]);
    setLabel("");
    setCardHolder("");
    setLast4("");
    setExpiryDate("");
    setError("");
    setActiveTab("view");
  };

  const openDeleteConfirmationModal = (index) => {
    setSelectedMethodIndex(index);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteMethod = () => {
    const nextMethods = methods.filter((_, index) => index !== selectedMethodIndex);
    saveMethods(nextMethods);
    setIsDeleteModalOpen(false);
    setSelectedMethodIndex(null);
  };

  return (
    <Modal isOpen={isOpen} title="Metody płatności" onClose={onClose} maxWidth="max-w-2xl">
      <div>
        <div className="mb-4 border-b border-slate-200">
          <div className="flex gap-2">
            <button
              type="button"
              className={`rounded-t-md px-4 py-2 text-sm font-semibold ${
                activeTab === "add"
                  ? "border-b-2 border-sky-600 text-sky-700"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              onClick={() => setActiveTab("add")}
            >
              Dodaj metodę
            </button>
            <button
              type="button"
              className={`rounded-t-md px-4 py-2 text-sm font-semibold ${
                activeTab === "view"
                  ? "border-b-2 border-sky-600 text-sky-700"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              onClick={() => setActiveTab("view")}
            >
              Zapisane metody
            </button>
          </div>
        </div>

        {activeTab === "add" && (
          <div>
            <div className="space-y-3">
              <input
                type="text"
                value={label}
                onChange={(event) => {
                  setLabel(event.target.value);
                  setError("");
                }}
                placeholder="Nazwa metody, np. Karta prywatna"
                className="form-input"
              />
              <input
                type="text"
                value={cardHolder}
                onChange={(event) => setCardHolder(event.target.value)}
                placeholder="Właściciel (opcjonalnie)"
                className="form-input"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={last4}
                  onChange={(event) => {
                    setLast4(event.target.value.replace(/\D/g, "").slice(0, 4));
                    setError("");
                  }}
                  inputMode="numeric"
                  maxLength="4"
                  placeholder="Ostatnie 4 cyfry"
                  className="form-input"
                />
                <input
                  type="text"
                  value={expiryDate}
                  onChange={handleExpiryDateChange}
                  maxLength="5"
                  placeholder="MM/YY"
                  className="form-input"
                />
              </div>
              {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
              <button
                type="button"
                onClick={handleSaveMethod}
                className="btn-primary w-full px-4 py-2"
              >
                Zapisz metodę
              </button>
            </div>
          </div>
        )}

        {activeTab === "view" && (
          <div>
            {methods.length > 0 ? (
              <ul className="max-h-72 space-y-3 overflow-y-auto">
                {methods.map((method, index) => (
                  <li
                    key={method.id || index}
                    className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        <FaCreditCard className="mr-2 inline text-sky-600" />
                        {method.label} **** {method.last4}
                      </p>
                      {method.cardHolder && (
                        <p className="text-sm text-slate-600">
                          Właściciel: {method.cardHolder}
                        </p>
                      )}
                      <p className="text-sm text-slate-600">
                        Ważność: {method.expiryDate}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openDeleteConfirmationModal(index)}
                      className="icon-button text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      aria-label="Usuń metodę płatności"
                    >
                      <FaTrash />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
                Brak zapisanych metod płatności.
              </p>
            )}
          </div>
        )}

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteMethod}
          item="metodę płatności"
          itemType="metodę"
        />
      </div>
    </Modal>
  );
};

export default AddCardModal;
