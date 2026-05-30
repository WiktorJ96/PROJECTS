import React, { useState } from "react";
import { FaBell, FaChevronDown, FaPlus, FaTrash } from "react-icons/fa";
import useReminderForm from "../ReminderForm/reminderForm";

function Reminders({ onAddReminder, reminders, onDeleteReminder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { formData, handleChange, handleSubmit } = useReminderForm(onAddReminder);

  const submitReminder = async () => {
    const didSubmit = await handleSubmit();
    if (didSubmit !== false) setIsFormOpen(false);
  };

  return (
    <section className="mb-8 rounded-lg border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus:outline-none focus:ring-2 focus:ring-sky-500"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-sky-50 text-sky-700">
            <FaBell aria-hidden="true" />
          </span>
          <span>
            <span className="block text-xl font-semibold text-slate-900">
              Przypomnienia
            </span>
            <span className="text-sm text-slate-500">
              {reminders.length} aktywnych
            </span>
          </span>
        </span>
        <FaChevronDown
          className={`text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="border-t border-slate-200 px-5 py-4">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <h3 className="text-base font-semibold text-slate-900">
              Lista przypomnień
            </h3>
            <button
              type="button"
              onClick={() => setIsFormOpen((prev) => !prev)}
              className="btn-primary px-4 py-2"
            >
              <FaPlus aria-hidden="true" />
              {isFormOpen ? "Ukryj formularz" : "Dodaj przypomnienie"}
            </button>
          </div>

          {isFormOpen && (
            <div className="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto] sm:items-end">
                <label className="block">
                  <span className="form-label">Nazwa produktu</span>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    maxLength={50}
                    placeholder="Np. kawa, karma, filtr"
                    className="form-input mt-1"
                  />
                </label>
                <label className="block">
                  <span className="form-label">Co ile dni</span>
                  <input
                    type="number"
                    name="frequency"
                    min="1"
                    max="1000"
                    value={formData.frequency}
                    onChange={handleChange}
                    placeholder="30"
                    className="form-input mt-1"
                  />
                </label>
                <button type="button" onClick={submitReminder} className="btn-primary px-4 py-2">
                  Zapisz
                </button>
              </div>
            </div>
          )}

          {reminders.length > 0 ? (
            <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200">
              {reminders.map((reminder) => (
                <li
                  key={reminder.id}
                  className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-slate-900">
                      {reminder.productName}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="status-badge bg-sky-50 text-sky-700 ring-sky-200">
                        Co {reminder.frequency} dni
                      </span>
                      <span className="status-badge bg-emerald-50 text-emerald-700 ring-emerald-200">
                        Pozostało: {reminder.remainingDays} dni
                      </span>
                      {reminder.unsynced && <span className="status-badge">Offline</span>}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteReminder(reminder.id)}
                    className="icon-button self-end text-rose-600 hover:bg-rose-50 hover:text-rose-700 sm:self-auto"
                    aria-label={`Usuń przypomnienie ${reminder.productName}`}
                    title="Usuń"
                  >
                    <FaTrash aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <p className="text-sm text-slate-600">
                Nie masz jeszcze przypomnień.
              </p>
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="btn-primary mx-auto mt-4 px-4 py-2"
              >
                <FaPlus aria-hidden="true" />
                Dodaj pierwsze przypomnienie
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default Reminders;
