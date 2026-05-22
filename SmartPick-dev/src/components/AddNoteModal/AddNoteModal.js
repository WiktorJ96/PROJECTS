import React, { useState, useEffect } from "react";

// NoteModal (okno modalne) – komponent do dodawania/edycji notatki
const NoteModal = ({ isOpen, initialNote = "", onSave, onClose }) => {
  const [note, setNote] = useState(initialNote);

  useEffect(() => {
    setNote(initialNote);
  }, [initialNote]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
        <h2 className="text-2xl font-semibold mb-4">Dodaj notatkę</h2>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded mb-4"
          rows="4"
          placeholder="Wpisz swoją notatkę..."
        />
        <div className="flex justify-end space-x-4">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
            onClick={() => onSave(note)}
          >
            Zapisz
          </button>
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors duration-200"
            onClick={onClose}
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteModal;
