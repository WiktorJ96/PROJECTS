import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
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
          console.log("Dane karty zapisane na serwerze.");
        }
      } catch (error) {
        console.error("Błąd zapisu na serwerze:", error);
      }
    } else {
      const updatedCards = [...cards, newCard];
      localStorage.setItem("cards", JSON.stringify(updatedCards));
      setCards(updatedCards);
      console.log("Dane karty zapisane lokalnie.");
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
            console.log("Karta usunięta z serwera.");
          }
        })
        .catch((error) => console.error("Błąd usuwania z serwera:", error));
    } else {
      localStorage.setItem("cards", JSON.stringify(updatedCards));
      setCards(updatedCards);
      console.log("Karta usunięta lokalnie.");
    }

    setIsDeleteModalOpen(false);
    setSelectedCardIndex(null);
  };

  return isOpen ? (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between border-b pb-4 mb-4">
          <button
            className={`text-lg font-semibold ${
              activeTab === "add" ? "text-blue-500" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("add")}
          >
            Dodaj kartę
          </button>
          <button
            className={`text-lg font-semibold ${
              activeTab === "view" ? "text-blue-500" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("view")}
          >
            Twoje karty płatnicze
          </button>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Zamknij modal"
          >
            <FaTimes size={20} className="text-gray-500 hover:text-red-500" />
          </button>
        </div>

        {activeTab === "add" && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Dodaj nową kartę</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                maxLength="16"
                placeholder="Numer karty"
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                placeholder="Właściciel karty"
                className="w-full p-2 border rounded"
              />
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={expiryDate}
                  onChange={handleExpiryDateChange}
                  maxLength="5"
                  placeholder="MM/YY"
                  className="w-1/2 p-2 border rounded"
                />
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  maxLength="3"
                  placeholder="CVV"
                  className="w-1/2 p-2 border rounded"
                />
              </div>
              <button
                onClick={handleSaveCard}
                className="w-full bg-blue-500 text-white p-2 rounded mt-4 hover:bg-blue-600"
              >
                Zapisz kartę
              </button>
            </div>
          </div>
        )}

        {activeTab === "view" && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">
              Twoje karty płatnicze
            </h2>
            {cards.length > 0 ? (
              <ul className="space-y-4 max-h-60 overflow-y-auto">
                {cards.map((card, index) => (
                  <li
                    key={index}
                    className="border p-4 rounded shadow-sm relative"
                  >
                    <button
                      onClick={() => openDeleteConfirmationModal(index)}
                      className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                      aria-label="Usuń kartę"
                    >
                      <FaTimes />
                    </button>
                    <p>
                      <strong>Numer karty:</strong> {card.cardNumber}
                    </p>
                    <p>
                      <strong>Właściciel:</strong> {card.cardHolder}
                    </p>
                    <p>
                      <strong>Data ważności:</strong> {card.expiryDate}
                    </p>
                    <p>
                      <strong>CVV:</strong> {card.cvv}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Brak zapisanych kart.</p>
            )}
          </div>
        )}

        {/* DeleteConfirmationModal */}
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
