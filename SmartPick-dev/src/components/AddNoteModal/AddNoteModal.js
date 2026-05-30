import React, { useState, useEffect } from "react";
import Modal from "../Modal/Modal";

const NoteModal = ({ isOpen, initialNote = "", onSave, onClose }) => {
  const [note, setNote] = useState(initialNote);

  useEffect(() => {
    setNote(initialNote);
  }, [initialNote]);

  return (
    <Modal
      isOpen={isOpen}
      title="Notatka produktu"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-secondary px-4 py-2" onClick={onClose}>
            Anuluj
          </button>
          <button type="button" className="btn-primary px-4 py-2" onClick={() => onSave(note)}>
            Zapisz
          </button>
        </>
      }
    >
      <label className="block">
        <span className="form-label">Treść notatki</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="form-input mt-1 min-h-32"
          rows="5"
        />
      </label>
    </Modal>
  );
};

export default NoteModal;
