import React, { useEffect, useState } from "react";
import { FaCreditCard, FaTimes } from "react-icons/fa";
import DeleteConfirmationModal from "../DeleteConfirmationModal/DeleteConfirmationModal";

const STORAGE_KEY = "paymentMethods";
const LEGACY_STORAGE_KEY = "cards";

const normalizeMethod = (method) => {
  if (!method) return null;
  const last4Source = method.last4 || method.cardNumber || "";
  const last4 = String(last4Source).replace(/\D/g, "").slice(-4);

  return {
    id: method.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    label: method.label || "Karta platnicza",
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
      document.body.classList.add("overflow-hidden");
      setMethods(loadPaymentMethods());
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
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
      setError("Nazwa metody, ostatnie 4 cyfry i waznosc sa wymagane.");
      return;
    }

    if (!/^\d{4}$/.test(last4)) {
      setError("Podaj dokladnie ostatnie 4 cyfry karty.");
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full transition-all duration-300 transform scale-100 opacity-100">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <div className="flex space-x-4">
            <button
              className={`text-lg font-semibold ${
                activeTab === "add"
                  ? "text-blue-500 border-b-2 border-blue-500"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("add")}
            >
              Dodaj metode
            </button>
            <button
              className={`text-lg font-semibold ${
                activeTab === "view"
                  ? "text-blue-500 border-b-2 border-blue-500"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("view")}
            >
              Metody platnosci
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition-colors duration-200"
            aria-label="Zamknij"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {activeTab === "add" && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              Dodaj metode platnosci
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                value={label}
                onChange={(event) => {
                  setLabel(event.target.value);
                  setError("");
                }}
                placeholder="Nazwa metody, np. Karta prywatna"
                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                value={cardHolder}
                onChange={(event) => setCardHolder(event.target.value)}
                placeholder="Wlasciciel (opcjonalnie)"
                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-400"
              />
              <div className="flex space-x-4">
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
                  className="w-1/2 p-3 border rounded focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="text"
                  value={expiryDate}
                  onChange={handleExpiryDateChange}
                  maxLength="5"
                  placeholder="MM/YY"
                  className="w-1/2 p-3 border rounded focus:ring-2 focus:ring-blue-400"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                onClick={handleSaveMethod}
                className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600 transition-colors duration-200"
              >
                Zapisz metode
              </button>
            </div>
          </div>
        )}

        {activeTab === "view" && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              Metody platnosci
            </h2>
            {methods.length > 0 ? (
              <ul className="space-y-4 max-h-60 overflow-y-auto">
                {methods.map((method, index) => (
                  <li
                    key={method.id || index}
                    className="p-4 border rounded shadow-sm flex justify-between items-center"
                  >
                    <div>
                      <p className="text-sm text-gray-600">
                        <FaCreditCard className="inline mr-2 text-blue-500" />
                        {method.label} **** {method.last4}
                      </p>
                      {method.cardHolder && (
                        <p className="text-sm text-gray-600">
                          Wlasciciel: {method.cardHolder}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        Waznosc: {method.expiryDate}
                      </p>
                    </div>
                    <button
                      onClick={() => openDeleteConfirmationModal(index)}
                      className="text-gray-500 hover:text-red-500 transition-colors duration-200"
                      aria-label="Usun metode platnosci"
                    >
                      <FaTimes />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500">
                Brak zapisanych metod platnosci.
              </p>
            )}
          </div>
        )}

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteMethod}
          item="metode platnosci"
          itemType="metode"
        />
      </div>
    </div>
  );
};

export default AddCardModal;
