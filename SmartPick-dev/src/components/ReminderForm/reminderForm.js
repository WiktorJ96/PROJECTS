import { useState } from "react";

function useReminderForm(
  onAddReminder,
  initialValues = { productName: "", frequency: "" },
  maxChars = 50,
  maxFrequency = 1000
) {
  const [formData, setFormData] = useState(initialValues);

  // Obsługa zmian w formularzu
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "productName") {
      setFormData((prev) => ({
        ...prev,
        productName: value.slice(0, maxChars),
      }));
    } else if (name === "frequency") {
      const num = parseInt(value || "0", 10);
      setFormData((prev) => ({
        ...prev,
        frequency: num > 0 ? Math.min(num, maxFrequency) : "",
      }));
    }
  };

  // Obsługa wysłania formularza
  const handleSubmit = async () => {
    const { productName, frequency } = formData;
    if (productName && frequency) {
      if (frequency > maxFrequency) {
        alert(`Częstotliwość nie może przekraczać ${maxFrequency} dni.`);
        return;
      }
      // Tworzymy tymczasowy rekord przypomnienia
      const temporaryReminder = {
        productName,
        frequency,
        id: Date.now(), // tymczasowe id
        startDate: new Date().toISOString(),
        remainingDays: parseInt(frequency, 10),
        isLoading: true,
      };
      // Wywołujemy funkcję onAddReminder z parametrem informującym o optymistycznej aktualizacji
      await onAddReminder(temporaryReminder, true);
      setFormData(initialValues);
    } else {
      alert("Wypełnij wszystkie pola.");
    }
  };

  return { formData, handleChange, handleSubmit, setFormData };
}

export default useReminderForm;
