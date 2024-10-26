import React, { useState, useEffect } from "react";
import "./styles/App.css";
import Header from "./components/Header/Header";
import ShopList from "./components/ShopList/ShopList";
import ProductList from "./components/ProductList/ProductList";
import Footer from "./components/Footer/Footer";
import AddShopModal from "./components/AddShopModal/AddShopModal";
import { v4 as uuidv4 } from "uuid";

function App() {
  const apiUrl = process.env.REACT_APP_API_URL || null;
  const [useBackend, setUseBackend] = useState(apiUrl !== null);
  const [notification, setNotification] = useState("");

  const [shops, setShops] = useState(() => {
    const localShops = localStorage.getItem("shops");
    return useBackend ? [] : localShops ? JSON.parse(localShops) : [];
  });

  // Ładowanie sklepów z backendu lub localStorage
  useEffect(() => {
    const fetchShops = async () => {
      if (useBackend) {
        try {
          const response = await fetch(`${apiUrl}/api/shops`);
          if (response.ok) {
            const shopsFromServer = await response.json();
            const shopsWithProducts = shopsFromServer.map((shop) => ({
              ...shop,
              products: shop.products || [],
            }));
            setShops(shopsWithProducts);
          } else {
            throw new Error("Backend not available");
          }
        } catch (error) {
          console.error("Serwer niedostępny. Przełączanie na localStorage.");
          setNotification("Serwer niedostępny. Przełączono na tryb offline.");
          setUseBackend(false);
          const localShops = localStorage.getItem("shops");
          setShops(localShops ? JSON.parse(localShops) : []);
        }
      }
    };
    fetchShops();
  }, [apiUrl, useBackend]);

  // Zapis do localStorage, gdy backend nie jest używany
  useEffect(() => {
    if (!useBackend) {
      localStorage.setItem("shops", JSON.stringify(shops));
    }
  }, [shops, useBackend]);

  const [selectedShop, setSelectedShop] = useState(null);
  const [isAddShopModalOpen, setIsAddShopModalOpen] = useState(false);
  const [isEditingShop, setIsEditingShop] = useState(false);

  const handleSelectShop = (shop) => {
    setSelectedShop(shop);
    setIsEditingShop(false);
  };

  const handleAddShop = async (newShopName) => {
    const newShop = {
      id: uuidv4(),
      name: newShopName,
      products: [],
    };
    if (useBackend) {
      try {
        const response = await fetch(`${apiUrl}/api/shops`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: newShopName }),
        });
        if (response.ok) {
          const savedShop = await response.json();
          setShops([...shops, { ...newShop, id: savedShop.id }]);
          setIsAddShopModalOpen(false);
        } else {
          console.error("Error adding shop");
        }
      } catch (error) {
        console.error("Error connecting to server:", error);
      }
    } else {
      setShops([...shops, newShop]);
      setIsAddShopModalOpen(false);
    }
  };

  const handleUpdateShopName = (newName) => {
    const updatedShops = shops.map((shop) => {
      if (shop.id === selectedShop.id) {
        return { ...shop, name: newName };
      }
      return shop;
    });
    setShops(updatedShops);
    setSelectedShop({ ...selectedShop, name: newName });
  };

  const handleDeleteShop = async (shopId) => {
    if (useBackend) {
      try {
        const response = await fetch(`${apiUrl}/api/shops/${shopId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setShops((prevShops) =>
            prevShops.filter((shop) => shop.id !== shopId)
          );
        } else {
          console.error("Error deleting shop");
        }
      } catch (error) {
        console.error("Error connecting to server:", error);
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
