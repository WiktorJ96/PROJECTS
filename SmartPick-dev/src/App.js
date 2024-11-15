import React, { useState, useEffect, useCallback } from "react";
import "./styles/App.css";
import Header from "./components/Header/Header";
import ShopList from "./components/ShopList/ShopList";
import ProductList from "./components/ProductList/ProductList";
import Footer from "./components/Footer/Footer";
import AddShopModal from "./components/AddShopModal/AddShopModal";
import AddCardModal from "./components/Header/AddCardModal";
import RecurringReminders from "./components/RecurringReminders/RecurringReminders";
import {
  fetchShopsFromBackend,
  addShopToBackend,
  deleteShopFromBackend,
  loadShopsFromLocalStorage,
  saveShopsToLocalStorage,
  createNewShop,
  fetchRemindersFromBackend,
  addReminderToBackend,
  deleteReminderFromBackend,
  loadRemindersFromLocalStorage,
  saveRemindersToLocalStorage,
} from "./components/ShopService/ShopService";

function App() {
  const apiUrl = process.env.REACT_APP_API_URL || null;
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isBackendActive, setIsBackendActive] = useState(apiUrl !== null);
  const [notification, setNotification] = useState("");
  const [shops, setShops] = useState(() =>
    isBackendActive ? [] : loadShopsFromLocalStorage()
  );
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState(null);
  const [isAddShopModalOpen, setIsAddShopModalOpen] = useState(false);
  const [isEditingShop, setIsEditingShop] = useState(false);

  // Pobieranie sklepów
  const fetchShops = useCallback(async () => {
    setLoading(true);
    if (isBackendActive) {
      try {
        const shopsFromServer = await fetchShopsFromBackend(apiUrl);
        setShops(shopsFromServer);
      } catch {
        setNotification("Serwer niedostępny. Przełączono na tryb offline.");
        setIsBackendActive(false);
        setShops(loadShopsFromLocalStorage());
      } finally {
        setLoading(false);
      }
    } else {
      setShops(loadShopsFromLocalStorage());
      setLoading(false);
    }
  }, [apiUrl, isBackendActive]);

  // Pobieranie przypomnień
  useEffect(() => {
    const loadReminders = async () => {
      if (isBackendActive) {
        try {
          const remindersFromServer = await fetchRemindersFromBackend(apiUrl);
          setReminders(remindersFromServer);
        } catch (error) {
          console.error(
            "Błąd podczas ładowania przypomnień z backendu:",
            error
          );
          setReminders(loadRemindersFromLocalStorage());
        }
      } else {
        setReminders(loadRemindersFromLocalStorage());
      }
    };
    loadReminders();
  }, [isBackendActive, apiUrl]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  // Zapis do Local Storage
  useEffect(() => {
    if (!isBackendActive) {
      saveShopsToLocalStorage(shops);
      saveRemindersToLocalStorage(reminders);
    }
  }, [shops, reminders, isBackendActive]);

  const handleSelectShop = (shop) => {
    setSelectedShop(shop);
    setIsEditingShop(false);
  };

  const handleAddShop = async (newShopName) => {
    const newShop = createNewShop(newShopName);
    if (isBackendActive) {
      try {
        const savedShop = await addShopToBackend(apiUrl, newShopName);
        setShops([...shops, { ...newShop, id: savedShop.id }]);
      } catch (error) {
        console.error("Błąd podczas dodawania sklepu:", error);
      }
    } else {
      setShops([...shops, newShop]);
    }
    setIsAddShopModalOpen(false);
  };

  const handleUpdateShopName = (newName) => {
    const updatedShops = shops.map((shop) =>
      shop.id === selectedShop.id ? { ...shop, name: newName } : shop
    );
    setShops(updatedShops);
    setSelectedShop({ ...selectedShop, name: newName });
  };

  const handleUpdateShopFavorite = (updatedShop) => {
    const updatedShops = shops.map((shop) =>
      shop.id === updatedShop.id ? updatedShop : shop
    );
    setShops(updatedShops);

    if (selectedShop && selectedShop.id === updatedShop.id) {
      setSelectedShop(updatedShop);
    }
  };

  const handleDeleteShop = async (shopId) => {
    if (isBackendActive) {
      try {
        await deleteShopFromBackend(apiUrl, shopId);
        setShops((prevShops) => prevShops.filter((shop) => shop.id !== shopId));
      } catch (error) {
        console.error("Błąd podczas usuwania sklepu:", error);
      }
    } else {
      setShops(shops.filter((shop) => shop.id !== shopId));
    }
  };

  const handleUpdateProducts = (updatedProducts) => {
    const updatedShops = shops.map((shop) =>
      shop.id === selectedShop.id
        ? { ...shop, products: updatedProducts }
        : shop
    );
    setShops(updatedShops);
    setSelectedShop({ ...selectedShop, products: updatedProducts });
  };

  const handleAddReminder = async (newReminder) => {
    const reminderWithDate = {
      ...newReminder,
      startDate: new Date().toISOString(),
      remainingDays: parseInt(newReminder.frequency, 10),
    };

    if (isBackendActive) {
      try {
        const savedReminder = await addReminderToBackend(
          apiUrl,
          reminderWithDate
        );
        setReminders((prevReminders) => [...prevReminders, savedReminder]);
      } catch (error) {
        console.error(
          "Błąd podczas zapisywania przypomnienia w backendzie:",
          error
        );
      }
    } else {
      setReminders((prevReminders) => [...prevReminders, reminderWithDate]);
    }
  };

  const handleDeleteReminder = async (index) => {
    const reminderToDelete = reminders[index];

    if (isBackendActive) {
      try {
        await deleteReminderFromBackend(apiUrl, reminderToDelete.id);
        setReminders((prevReminders) =>
          prevReminders.filter((_, i) => i !== index)
        );
      } catch (error) {
        console.error("Błąd podczas usuwania przypomnienia z backendu:", error);
      }
    } else {
      setReminders((prevReminders) =>
        prevReminders.filter((_, i) => i !== index)
      );
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setReminders((prevReminders) =>
        prevReminders.map((reminder) => {
          const now = new Date();
          const startDate = new Date(reminder.startDate);
          const daysPassed = Math.floor(
            (now - startDate) / (1000 * 60 * 60 * 24)
          );

          const remainingDays = reminder.frequency - daysPassed;

          if (remainingDays <= 0) {
            return {
              ...reminder,
              startDate: new Date().toISOString(),
              remainingDays: parseInt(reminder.frequency, 10),
            };
          }

          return {
            ...reminder,
            remainingDays: remainingDays > 0 ? remainingDays : 0,
          };
        })
      );
    }, 86400000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        shops={shops}
        openAddCardModal={() => setIsAddCardModalOpen(true)}
        handleSelectShop={handleSelectShop}
      />
      <AddCardModal
        isOpen={isAddCardModalOpen}
        onClose={() => setIsAddCardModalOpen(false)}
        isBackendActive={isBackendActive}
      />
      {notification && (
        <div className="bg-yellow-200 text-yellow-800 p-3 text-center">
          {notification}
        </div>
      )}
      <main className="flex-grow container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center">
            <p>Loading...</p>
          </div>
        ) : (
          <>
            <ShopList
              shops={shops}
              onSelectShop={handleSelectShop}
              onAddShop={() => setIsAddShopModalOpen(true)}
            />
            {selectedShop && (
              <ProductList
                shop={selectedShop}
                isEditingShop={isEditingShop}
                setIsEditingShop={setIsEditingShop}
                onUpdateShopName={handleUpdateShopName}
                onDeleteShop={handleDeleteShop}
                onUpdateProducts={handleUpdateProducts}
                onUpdateShopFavorite={handleUpdateShopFavorite}
              />
            )}
            <RecurringReminders onAddReminder={handleAddReminder} />
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-lg p-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Twoje przypomnienia
              </h2>
              {reminders.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {reminders.map((reminder, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between py-4 px-2 hover:bg-gray-50 transition-colors duration-150"
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
                        onClick={() => handleDeleteReminder(index)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-150"
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
          </>
        )}
      </main>
      <Footer />
      <AddShopModal
        isOpen={isAddShopModalOpen}
        onClose={() => setIsAddShopModalOpen(false)}
        onAddShop={handleAddShop}
      />
    </div>
  );
}

export default App;
