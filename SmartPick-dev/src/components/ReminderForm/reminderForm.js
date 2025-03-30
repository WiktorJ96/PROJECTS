// useReminderForm.js
import { useState } from "react";

function useReminderForm(
  onAddReminder,
  initialValues = { productName: "", frequency: "" },
  maxChars = 50,
  maxFrequency = 1000
) {
  const [formData, setFormData] = useState(initialValues);

  // Obsługuje zmiany w polach formularza
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "productName") {
      // Ograniczenie do określonej liczby znaków
      setFormData((prev) => ({
        ...prev,
        productName: value.slice(0, maxChars),
      }));
    } else if (name === "frequency") {
      const num = parseInt(value || "0", 10);
      // Jeśli liczba jest większa od 0, ograniczamy do maxFrequency
      setFormData((prev) => ({
        ...prev,
        frequency: num > 0 ? Math.min(num, maxFrequency) : "",
      }));
    }
  };

  // Obsługuje wysyłanie formularza z walidacją
  const handleSubmit = () => {
    const { productName, frequency } = formData;
    if (productName && frequency) {
      if (frequency > maxFrequency) {
        alert(`Częstotliwość nie może przekraczać ${maxFrequency} dni.`);
        return;
      }
      onAddReminder({ productName, frequency });
      setFormData(initialValues); // Reset formularza
    } else {
      alert("Wypełnij wszystkie pola.");
    }
  };

  return { formData, handleChange, handleSubmit, setFormData };
}

export default useReminderForm;
