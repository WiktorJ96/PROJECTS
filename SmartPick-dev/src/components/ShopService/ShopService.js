// shopService.js
import { v4 as uuidv4 } from "uuid";

// Funkcja pobierająca sklepy z backendu
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

// Funkcja dodająca sklep do backendu
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

// Funkcja usuwająca sklep z backendu
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

// Obsługa localStorage
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
