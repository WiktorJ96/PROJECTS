import React, { useState } from "react";
import useReminderForm from "../ReminderForm/reminderForm";

function Reminders({ onAddReminder, reminders, onDeleteReminder }) {
  const [isOpen, setIsOpen] = useState(false); // Stan akordeonu
  const [isFormOpen, setIsFormOpen] = useState(false); // Stan widoczności formularza

  // Używamy hooka do obsługi formularza
  const { formData, handleChange, handleSubmit } =
    useReminderForm(onAddReminder);

  const toggleAccordion = () => {
    setIsOpen((prev) => !prev);
  };

  const toggleForm = () => {
    setIsFormOpen((prev) => !prev);
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-lg overflow-hidden mb-8">
      {/* Nagłówek akordeonu */}
      <div
        onClick={toggleAccordion}
        className="px-6 py-4 from-gray-50 to-gray-100 cursor-pointer flex justify-between items-center"
      >
        <h2 className="text-3xl font-bold text-gray-800">Przypomnienia</h2>
        <span
          className={`transition-transform duration-300 text-xl text-gray-600 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        >
          <i className="fas fa-chevron-down"></i>
        </span>
      </div>

      {/* Zawartość akordeonu */}
      {isOpen && (
        <div className="px-6 py-4">
          {/* Sekcja dodawania przypomnienia */}
          <div className="mb-8 border-b border-gray-300 pb-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl font-semibold text-gray-800">
                Dodaj przypomnienie
              </span>
              <button
                onClick={toggleForm}
                className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
              >
                {isFormOpen ? "Ukryj formularz" : "Pokaż formularz"}
              </button>
            </div>
            {isFormOpen && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  onClick={() => {
                    handleSubmit();
                    setIsFormOpen(false);
                  }}
                  className="w-full px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200"
                >
                  Dodaj przypomnienie
                </button>
              </div>
            )}
          </div>

          {/* Sekcja wyświetlania przypomnień */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Lista przypomnień
            </h3>
            {reminders.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {reminders.map((reminder) => (
                  <li
                    key={reminder.id} // Używamy unikalnego identyfikatora jako klucza
                    className="flex flex-col sm:flex-row sm:items-center justify-between py-4 px-2 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div>
                      <p className="text-lg font-medium text-gray-700">
                        {reminder.productName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Przypomnienie co {reminder.frequency} dni
                      </p>
                      <p className="text-sm text-blue-500">
                        Pozostało: {reminder.remainingDays} dni
                      </p>
                    </div>
                    <button
                      onClick={() => onDeleteReminder(reminder.id)} // Przekazujemy unikalny identyfikator
                      className="mt-2 sm:mt-0 text-red-500 hover:text-red-700 transition-colors duration-150"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 py-6">
                Nie masz jeszcze przypomnień.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Reminders;
