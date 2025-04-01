import React, { useState, useEffect, useCallback } from "react";
import "./styles/App.css";
import Header from "./components/Header/Header";
import ShopList from "./components/ShopList/ShopList";
import ProductList from "./components/ProductList/ProductList";
import Footer from "./components/Footer/Footer";
import AddShopModal from "./components/AddShopModal/AddShopModal";
import AddCardModal from "./components/Header/AddCardModal";
import Reminders from "./components/Reminders/Reminders";
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
  const [isBackendActive, setIsBackendActive] = useState(apiUrl !== null);
  const [notification, setNotification] = useState("");
  const [shops, setShops] = useState(loadShopsFromLocalStorage());
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState(null);
  const [isAddShopModalOpen, setIsAddShopModalOpen] = useState(false);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isEditingShop, setIsEditingShop] = useState(false);

  const fetchShops = useCallback(async () => {
    setLoading(true);
    try {
      const shopsFromServer = await fetchShopsFromBackend(apiUrl);
      setShops(shopsFromServer);
      saveShopsToLocalStorage(shopsFromServer);
    } catch (error) {
      console.error("Błąd pobierania sklepów:", error);
      setNotification(
        "Błąd połączenia z serwerem. Dane pobrane z pamięci lokalnej."
      );
      setShops(loadShopsFromLocalStorage());
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    const loadReminders = async () => {
      try {
        const remindersFromServer = await fetchRemindersFromBackend(apiUrl);
        setReminders(remindersFromServer);
        saveRemindersToLocalStorage(remindersFromServer);
      } catch (error) {
        console.error("Błąd podczas ładowania przypomnień z backendu:", error);
        setNotification(
          "Błąd połączenia z serwerem. Dane przypomnień pobrane z pamięci lokalnej."
        );
        setReminders(loadRemindersFromLocalStorage());
      }
    };
    loadReminders();
  }, [apiUrl]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  useEffect(() => {
    saveShopsToLocalStorage(shops);
    saveRemindersToLocalStorage(reminders);
  }, [shops, reminders]);

  const handleSelectShop = (shop) => {
    setSelectedShop(shop);
    setIsEditingShop(false);
  };

  const handleAddShop = async (newShopName) => {
    const newShop = createNewShop(newShopName);
    try {
      const savedShop = await addShopToBackend(apiUrl, newShopName);
      const updatedShops = [...shops, { ...newShop, id: savedShop.id }];
      setShops(updatedShops);
      saveShopsToLocalStorage(updatedShops);
    } catch (error) {
      console.error("Błąd podczas dodawania sklepu:", error);
      const updatedShops = [...shops, newShop];
      setShops(updatedShops);
      saveShopsToLocalStorage(updatedShops);
    }
    setIsAddShopModalOpen(false);
  };

  const handleUpdateShopName = (newName) => {
    const updatedShops = shops.map((shop) =>
      shop.id === selectedShop.id ? { ...shop, name: newName } : shop
    );
    setShops(updatedShops);
    setSelectedShop({ ...selectedShop, name: newName });
    saveShopsToLocalStorage(updatedShops);
  };

  const handleUpdateShopFavorite = (updatedShop) => {
    const updatedShops = shops.map((shop) =>
      shop.id === updatedShop.id ? updatedShop : shop
    );
    setShops(updatedShops);
    if (selectedShop && selectedShop.id === updatedShop.id) {
      setSelectedShop(updatedShop);
    }
    saveShopsToLocalStorage(updatedShops);
  };

  const handleDeleteShop = async (shopId) => {
    try {
      await deleteShopFromBackend(apiUrl, shopId);
      const updatedShops = shops.filter((shop) => shop.id !== shopId);
      setShops(updatedShops);
      saveShopsToLocalStorage(updatedShops);
    } catch (error) {
      console.error("Błąd podczas usuwania sklepu:", error);
      const updatedShops = shops.filter((shop) => shop.id !== shopId);
      setShops(updatedShops);
      saveShopsToLocalStorage(updatedShops);
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
    saveShopsToLocalStorage(updatedShops);
  };

  const handleAddReminder = async (newReminder) => {
    const reminderWithDate = {
      ...newReminder,
      startDate: new Date().toISOString(),
      remainingDays: parseInt(newReminder.frequency, 10),
    };

    try {
      const savedReminder = await addReminderToBackend(
        apiUrl,
        reminderWithDate
      );
      const updatedReminders = [...reminders, savedReminder];
      setReminders(updatedReminders);
      saveRemindersToLocalStorage(updatedReminders);
    } catch (error) {
      console.error("Błąd podczas zapisywania przypomnienia:", error);
      const offlineReminder = { ...reminderWithDate, id: Date.now() };
      const updatedReminders = [...reminders, offlineReminder];
      setReminders(updatedReminders);
      saveRemindersToLocalStorage(updatedReminders);
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    try {
      await deleteReminderFromBackend(apiUrl, reminderId);
      const updatedReminders = reminders.filter(
        (reminder) => reminder.id !== reminderId
      );
      setReminders(updatedReminders);
      saveRemindersToLocalStorage(updatedReminders);
    } catch (error) {
      console.error("Błąd podczas usuwania przypomnienia:", error);
      const updatedReminders = reminders.filter(
        (reminder) => reminder.id !== reminderId
      );
      setReminders(updatedReminders);
      saveRemindersToLocalStorage(updatedReminders);
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
        handleSelectShop={(shop) => {
          setSelectedShop(shop);
          setIsEditingShop(false);
        }}
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
              onSelectShop={(shop) => {
                setSelectedShop(shop);
                setIsEditingShop(false);
              }}
              onAddShop={() => setIsAddShopModalOpen(true)}
            />
            {selectedShop && (
              <ProductList
                key={selectedShop.id}
                shop={selectedShop}
                isEditingShop={isEditingShop}
                setIsEditingShop={setIsEditingShop}
                onUpdateShopName={handleUpdateShopName}
                onDeleteShop={handleDeleteShop}
                onUpdateProducts={handleUpdateProducts}
                onUpdateShopFavorite={handleUpdateShopFavorite}
              />
            )}
            <Reminders
              onAddReminder={handleAddReminder}
              reminders={reminders}
              onDeleteReminder={handleDeleteReminder}
            />
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
