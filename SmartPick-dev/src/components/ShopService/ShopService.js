import { v4 as uuidv4 } from "uuid";

// --- Funkcje dla sklepów ---
export const fetchShopsFromBackend = async (apiUrl) => {
  try {
    const response = await fetch(`${apiUrl}/api/shops`);
    if (response.ok) {
      const shopsFromServer = await response.json();
      return shopsFromServer.map((shop) => ({
        ...shop,
        products: shop.products || [],
      }));
    } else {
      throw new Error("Backend not available");
    }
  } catch (error) {
    console.error("Serwer niedostępny. Przełączanie na localStorage.");
    throw error;
  }
};

export const addShopToBackend = async (apiUrl, shopName) => {
  try {
    const response = await fetch(`${apiUrl}/api/shops`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: shopName }),
    });
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error("Error adding shop");
    }
  } catch (error) {
    console.error("Error connecting to server:", error);
    throw error;
  }
};

export const deleteShopFromBackend = async (apiUrl, shopId) => {
  try {
    const response = await fetch(`${apiUrl}/api/shops/${shopId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Error deleting shop");
  } catch (error) {
    console.error("Error connecting to server:", error);
    throw error;
  }
};

// Obsługa Local Storage dla sklepów
export const loadShopsFromLocalStorage = () => {
  const localShops = localStorage.getItem("shops");
  return localShops ? JSON.parse(localShops) : [];
};

export const saveShopsToLocalStorage = (shops) => {
  localStorage.setItem("shops", JSON.stringify(shops));
};

export const createNewShop = (name) => ({
  id: uuidv4(),
  name,
  products: [],
});

// --- Funkcje dla przypomnień ---
export const fetchRemindersFromBackend = async (apiUrl) => {
  try {
    const response = await fetch(`${apiUrl}/api/reminders`);
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error("Backend not available");
    }
  } catch (error) {
    console.error("Error fetching reminders from backend:", error);
    throw error;
  }
};

export const addReminderToBackend = async (apiUrl, reminder) => {
  try {
    const response = await fetch(`${apiUrl}/api/reminders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reminder),
    });
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error("Error adding reminder");
    }
  } catch (error) {
    console.error("Error connecting to server:", error);
    throw error;
  }
};

export const deleteReminderFromBackend = async (apiUrl, reminderId) => {
  try {
    const response = await fetch(`${apiUrl}/api/reminders/${reminderId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Error deleting reminder");
  } catch (error) {
    console.error("Error connecting to server:", error);
    throw error;
  }
};

// Obsługa Local Storage dla przypomnień
export const loadRemindersFromLocalStorage = () => {
  const localReminders = localStorage.getItem("reminders");
  return localReminders ? JSON.parse(localReminders) : [];
};

export const saveRemindersToLocalStorage = (reminders) => {
  localStorage.setItem("reminders", JSON.stringify(reminders));
};

export const createNewReminder = (name, frequency) => ({
  id: uuidv4(),
  productName: name,
  frequency,
  startDate: new Date().toISOString(),
  remainingDays: parseInt(frequency, 10),
});
