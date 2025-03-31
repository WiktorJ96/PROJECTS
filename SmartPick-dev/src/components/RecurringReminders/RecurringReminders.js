// RecurringReminders.js
import React, { useState } from "react";
import useReminderForm from "../ReminderForm/reminderForm";

function RecurringReminders({ onAddReminder }) {
  // Stan do kontroli widoczności formularza (akordeonu)
  const [isOpen, setIsOpen] = useState(false);
  // Używamy custom hooka useReminderForm, który zarządza stanem formularza, obsługą zmian oraz wysyłaniem danych
  const { formData, handleChange, handleSubmit } =
    useReminderForm(onAddReminder);

  // Funkcja przełączająca widoczność formularza
  const handleToggle = () => {
    setIsOpen(!isOpen);
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
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              maxLength={50}
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
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              placeholder="Podaj liczbę dni (max 1000)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
            />
          </div>
          <button
            onClick={handleSubmit}
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
