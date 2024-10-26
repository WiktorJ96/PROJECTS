// App.js
import React, { useState, useEffect, useCallback } from "react";
import "./styles/App.css";
import Header from "./components/Header/Header";
import ShopList from "./components/ShopList/ShopList";
import ProductList from "./components/ProductList/ProductList";
import Footer from "./components/Footer/Footer";
import AddShopModal from "./components/AddShopModal/AddShopModal";
import {
  fetchShopsFromBackend,
  addShopToBackend,
  deleteShopFromBackend,
  loadShopsFromLocalStorage,
  saveShopsToLocalStorage,
  createNewShop,
} from "./components/ShopService/ShopService";

function App() {
  const apiUrl = process.env.REACT_APP_API_URL || null;
  const [isBackendActive, setIsBackendActive] = useState(apiUrl !== null);
  const [notification, setNotification] = useState("");
  const [shops, setShops] = useState(() =>
    isBackendActive ? [] : loadShopsFromLocalStorage()
  );
  const [loading, setLoading] = useState(true); // Stan wskaźnika ładowania
  const [selectedShop, setSelectedShop] = useState(null);
  const [isAddShopModalOpen, setIsAddShopModalOpen] = useState(false);
  const [isEditingShop, setIsEditingShop] = useState(false);

  const fetchShops = useCallback(async () => {
    setLoading(true); // Ustawienie ładowania na true
    if (isBackendActive) {
      try {
        const shopsFromServer = await fetchShopsFromBackend(apiUrl);
        setShops(shopsFromServer);
      } catch {
        setNotification("Serwer niedostępny. Przełączono na tryb offline.");
        setIsBackendActive(false);
        setShops(loadShopsFromLocalStorage());
      } finally {
        setLoading(false); // Ustawienie ładowania na false po zakończeniu
      }
    } else {
      setShops(loadShopsFromLocalStorage());
      setLoading(false); // Ustawienie ładowania na false, gdy dane są pobrane z localStorage
    }
  }, [apiUrl, isBackendActive]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  useEffect(() => {
    if (!isBackendActive) {
      saveShopsToLocalStorage(shops);
    }
  }, [shops, isBackendActive]);

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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {notification && (
        <div className="bg-yellow-200 text-yellow-800 p-3 text-center">
          {notification}
        </div>
      )}
      <main className="flex-grow container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center">
            <p>Loading...</p>{" "}
            {/* Może być też spinner lub inna animacja ładowania */}
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
              />
            )}
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
