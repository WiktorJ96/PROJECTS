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
  const isBackendActive = Boolean(apiUrl);
  const [notification, setNotification] = useState("");
  const [shops, setShops] = useState(loadShopsFromLocalStorage());
  const [reminders, setReminders] = useState(
    loadRemindersFromLocalStorage() || []
  );
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState(null);
  const [isAddShopModalOpen, setIsAddShopModalOpen] = useState(false);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isEditingShop, setIsEditingShop] = useState(false);

  // Pobieramy dane ze serwera i scalamy je z rekordami offline (unsynced)
  const fetchShops = useCallback(async () => {
    setLoading(true);
    if (!isBackendActive) {
      setShops(loadShopsFromLocalStorage());
      setLoading(false);
      return;
    }

    try {
      const shopsFromServer = await fetchShopsFromBackend(apiUrl);
      const localShops = loadShopsFromLocalStorage();
      const offlineShops = localShops.filter((shop) => shop.unsynced);
      const mergedShops = [...shopsFromServer, ...offlineShops];
      setShops(mergedShops);
      saveShopsToLocalStorage(mergedShops);
    } catch (error) {
      console.error("Błąd pobierania sklepów:", error);
      setNotification(
        "Błąd połączenia z serwerem. Dane pobrane z pamięci lokalnej."
      );
      setShops(loadShopsFromLocalStorage());
    } finally {
      setLoading(false);
    }
  }, [apiUrl, isBackendActive]);

  useEffect(() => {
    const loadReminders = async () => {
      if (!isBackendActive) {
        setReminders(loadRemindersFromLocalStorage());
        return;
      }

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
  }, [apiUrl, isBackendActive]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  // Przy każdej zmianie listy sklepów i przypomnień zapisujemy je w localStorage
  useEffect(() => {
    saveShopsToLocalStorage(shops);
    saveRemindersToLocalStorage(reminders);
  }, [shops, reminders]);

  const handleSelectShop = useCallback((shop) => {
    setSelectedShop(shop);
    setIsEditingShop(false);
  }, []);

  const handleAddShop = async (newShopName) => {
    let newShop = createNewShop(newShopName);
    if (!isBackendActive) {
      newShop = { ...newShop, unsynced: true };
      const updatedShops = [...shops, newShop];
      setShops(updatedShops);
      saveShopsToLocalStorage(updatedShops);
    } else {
      try {
        const savedShop = await addShopToBackend(apiUrl, newShopName);
        const updatedShop = { ...newShop, id: savedShop.id };
        const updatedShops = [...shops, updatedShop];
        setShops(updatedShops);
        saveShopsToLocalStorage(updatedShops);
      } catch (error) {
        console.error("Błąd podczas dodawania sklepu:", error);
        newShop = { ...newShop, unsynced: true };
        const updatedShops = [...shops, newShop];
        setShops(updatedShops);
        saveShopsToLocalStorage(updatedShops);
      }
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
    if (!isBackendActive) {
      const updatedShops = shops.filter((shop) => shop.id !== shopId);
      setShops(updatedShops);
      if (selectedShop?.id === shopId) setSelectedShop(null);
      saveShopsToLocalStorage(updatedShops);
      return;
    }

    try {
      await deleteShopFromBackend(apiUrl, shopId);
      const updatedShops = shops.filter((shop) => shop.id !== shopId);
      setShops(updatedShops);
      if (selectedShop?.id === shopId) setSelectedShop(null);
      saveShopsToLocalStorage(updatedShops);
    } catch (error) {
      console.error("Błąd podczas usuwania sklepu:", error);
      const updatedShops = shops.filter((shop) => shop.id !== shopId);
      setShops(updatedShops);
      if (selectedShop?.id === shopId) setSelectedShop(null);
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

    if (!isBackendActive) {
      const offlineReminder = {
        ...reminderWithDate,
        id: Date.now(),
        unsynced: true,
      };
      const updatedReminders = [...reminders, offlineReminder];
      setReminders(updatedReminders);
      saveRemindersToLocalStorage(updatedReminders);
      return;
    }

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
      const offlineReminder = {
        ...reminderWithDate,
        id: Date.now(),
        unsynced: true,
      };
      const updatedReminders = [...reminders, offlineReminder];
      setReminders(updatedReminders);
      saveRemindersToLocalStorage(updatedReminders);
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    if (!isBackendActive) {
      const updatedReminders = reminders.filter(
        (reminder) => reminder.id !== reminderId
      );
      setReminders(updatedReminders);
      saveRemindersToLocalStorage(updatedReminders);
      return;
    }

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

  // Aktualizacja przypomnień – co 24 godziny
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
    <div className="min-h-screen flex flex-col bg-slate-50">
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
        <div className="border-b border-amber-200 bg-amber-50 p-3 text-center text-sm font-medium text-amber-800">
          {notification}
        </div>
      )}
      <main className="mx-auto w-full max-w-6xl flex-grow px-4 py-6">
        {loading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-600">
            <p>Ładowanie danych...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <ShopList
              shops={shops}
              selectedShopId={selectedShop?.id}
              onSelectShop={handleSelectShop}
              onAddShop={() => setIsAddShopModalOpen(true)}
            />
            {selectedShop ? (
              <ProductList
                key={selectedShop.id}
                shop={selectedShop}
                isEditingShop={isEditingShop}
                setIsEditingShop={setIsEditingShop}
                onUpdateShopName={handleUpdateShopName}
                onDeleteShop={handleDeleteShop}
                onUpdateProducts={handleUpdateProducts}
                onUpdateShopFavorite={handleUpdateShopFavorite}
                onAddReminder={handleAddReminder}
              />
            ) : (
              shops.length > 0 && (
                <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">
                  Wybierz sklep, aby zobaczyć produkty i akcje zakupowe.
                </div>
              )
            )}
            <Reminders
              onAddReminder={handleAddReminder}
              reminders={reminders}
              onDeleteReminder={handleDeleteReminder}
            />
          </div>
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
