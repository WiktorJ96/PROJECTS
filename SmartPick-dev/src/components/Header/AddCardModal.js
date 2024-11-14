import React, { useState, useEffect } from "react";
import { FaTimes, FaCreditCard } from "react-icons/fa";
import DeleteConfirmationModal from "../DeleteConfirmationModal/DeleteConfirmationModal";

const AddCardModal = ({ isOpen, onClose, isBackendActive }) => {
  const [activeTab, setActiveTab] = useState("add");
  const [cards, setCards] = useState([]);
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (isBackendActive) {
        const fetchCards = async () => {
          try {
            const response = await fetch("/api/get-cards");
            const data = await response.json();
            setCards(data);
          } catch (error) {
            console.error("Błąd połączenia z serwerem:", error);
          }
        };
        fetchCards();
      } else {
        const storedCards = JSON.parse(localStorage.getItem("cards")) || [];
        setCards(storedCards);
      }
    }
  }, [isOpen, isBackendActive]);

  const handleExpiryDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length >= 3) {
      value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
    }
    setExpiryDate(value);
  };

  const handleSaveCard = async () => {
    const newCard = { cardNumber, cardHolder, expiryDate, cvv };

    if (isBackendActive) {
      try {
        const response = await fetch("/api/save-card", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCard),
        });
        if (response.ok) {
          setCards((prevCards) => [...prevCards, newCard]);
        }
      } catch (error) {
        console.error("Błąd zapisu na serwerze:", error);
      }
    } else {
      const updatedCards = [...cards, newCard];
      localStorage.setItem("cards", JSON.stringify(updatedCards));
      setCards(updatedCards);
    }

    setCardNumber("");
    setCardHolder("");
    setExpiryDate("");
    setCvv("");
    setActiveTab("view");
  };

  const openDeleteConfirmationModal = (index) => {
    setSelectedCardIndex(index);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCard = () => {
    const updatedCards = cards.filter(
      (_, cardIndex) => cardIndex !== selectedCardIndex
    );

    if (isBackendActive) {
      fetch(`/api/delete-card/${cards[selectedCardIndex].id}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (response.ok) {
            setCards(updatedCards);
          }
        })
        .catch((error) => console.error("Błąd usuwania z serwera:", error));
    } else {
      localStorage.setItem("cards", JSON.stringify(updatedCards));
      setCards(updatedCards);
    }

    setIsDeleteModalOpen(false);
    setSelectedCardIndex(null);
  };

  return isOpen ? (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div
        className={`bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full transition-all duration-300 transform ${
          isOpen ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        {/* Nagłówek */}
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
              Dodaj kartę
            </button>
            <button
              className={`text-lg font-semibold ${
                activeTab === "view"
                  ? "text-blue-500 border-b-2 border-blue-500"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("view")}
            >
              Twoje karty płatnicze
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition-colors duration-200"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Dodawanie karty */}
        {activeTab === "add" && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              Dodaj nową kartę
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                maxLength="16"
                placeholder="Numer karty"
                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                placeholder="Właściciel karty"
                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-400"
              />
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={expiryDate}
                  onChange={handleExpiryDateChange}
                  maxLength="5"
                  placeholder="MM/YY"
                  className="w-1/2 p-3 border rounded focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  maxLength="3"
                  placeholder="CVV"
                  className="w-1/2 p-3 border rounded focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <button
                onClick={handleSaveCard}
                className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600 transition-colors duration-200"
              >
                Zapisz kartę
              </button>
            </div>
          </div>
        )}

        {/* Wyświetlanie kart */}
        {activeTab === "view" && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              Twoje karty płatnicze
            </h2>
            {cards.length > 0 ? (
              <ul className="space-y-4 max-h-60 overflow-y-auto">
                {cards.map((card, index) => (
                  <li
                    key={index}
                    className="p-4 border rounded shadow-sm flex justify-between items-center"
                  >
                    <div>
                      <p className="text-sm text-gray-600">
                        <FaCreditCard className="inline mr-2 text-blue-500" />
                        {card.cardNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        Właściciel: {card.cardHolder}
                      </p>
                      <p className="text-sm text-gray-600">
                        Ważność: {card.expiryDate}
                      </p>
                      <p className="text-sm text-gray-600">
                        CVV: {card.cvv}
                      </p>
                    </div>
                    <button
                      onClick={() => openDeleteConfirmationModal(index)}
                      className="text-gray-500 hover:text-red-500 transition-colors duration-200"
                    >
                      <FaTimes />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500">Brak zapisanych kart.</p>
            )}
          </div>
        )}

        {/* Modal potwierdzenia usunięcia */}
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteCard}
          item="kartę płatniczą"
          itemType="kartę"
        />
      </div>
    </div>
  ) : null;
};

export default AddCardModal;
