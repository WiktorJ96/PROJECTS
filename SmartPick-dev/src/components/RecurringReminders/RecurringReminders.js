import React, { useState } from "react";

function RecurringReminders({ onAddReminder }) {
  const [productName, setProductName] = useState("");
  const [frequency, setFrequency] = useState("");
  const [isOpen, setIsOpen] = useState(false); // Stan informujący, czy formularz jest otwarty

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleAddReminder = () => {
    if (productName && frequency) {
      if (frequency > 1000) {
        alert("Częstotliwość nie może przekraczać 1000 dni.");
        return;
      }

      onAddReminder({ productName, frequency });
      setProductName("");
      setFrequency("");
    } else {
      alert("Wypełnij wszystkie pola.");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold text-gray-800">
          Ustaw przypomnienie o zakupie
        </h3>
        <button
          onClick={handleToggle}
          className="text-gray-600 hover:text-gray-800 focus:outline-none"
          aria-label="Toggle reminders settings"
        >
          {isOpen ? (
            <i className="fas fa-chevron-up"></i>
          ) : (
            <i className="fas fa-chevron-down"></i>
          )}
        </button>
      </div>
      {isOpen && (
        <div className="mt-4">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nazwa produktu
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value.slice(0, 50))} // Ograniczenie do 50 znaków
              maxLength={50} // Ograniczenie z poziomu HTML
              placeholder="Wpisz nazwę produktu (max 50 znaków)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Częstotliwość (dni)
            </label>
            <input
              type="number"
              value={frequency}
              onChange={(e) => {
                const value = Math.min(1000, parseInt(e.target.value || 0, 10));
                setFrequency(value > 0 ? value : "");
              }}
              placeholder="Podaj liczbę dni (max 1000)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
            />
          </div>
          <button
            onClick={handleAddReminder}
            className="w-full px-4 py-2 bg-blue-500 text-white text-center font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            Dodaj przypomnienie
          </button>
        </div>
      )}
    </div>
  );
}

export default RecurringReminders;
