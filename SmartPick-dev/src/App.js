import React, { useState, useEffect } from "react";
import "./styles/App.css";
import Header from "./components/Header/Header";
import ShopList from "./components/ShopList/ShopList";
import ProductList from "./components/ProductList/ProductList";
import Footer from "./components/Footer/Footer";
import AddShopModal from "./components/AddShopModal/AddShopModal";
import { v4 as uuidv4 } from "uuid";

function App() {
  const apiUrl = "http://localhost:5000";
  const [shops, setShops] = useState([
    {
      id: uuidv4(),
      name: "Sklep 1",
      products: [
        { name: "Produkt 1", price: 10, link: "http://example.com" },
        { name: "Produkt 2", price: 20, link: "http://example.com" },
      ],
    },
    {
      id: uuidv4(),
      name: "Sklep 2",
      products: [
        { name: "Produkt A", price: 15, link: "http://example.com" },
        { name: "Produkt B", price: 25, link: "http://example.com" },
      ],
    },
  ]);

  useEffect(() => {
    const fetchShops = async () => {
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
          console.error("Error fetching shops from server");
        }
      } catch (error) {
        console.error("Error connecting to server:", error);
      }
    };

    fetchShops();
  }, [apiUrl]);

  const [selectedShop, setSelectedShop] = useState(null);
  const [isAddShopModalOpen, setIsAddShopModalOpen] = useState(false);
  const [isEditingShop, setIsEditingShop] = useState(false);

  const handleSelectShop = (shop) => {
    setSelectedShop(shop);
    setIsEditingShop(false);
  };

  const handleAddShop = async (newShopName) => {
    try {
      const response = await fetch(`${apiUrl}/api/shops`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newShopName }),
      });

      if (response.ok) {
        const newShop = await response.json();

        const shopToAdd = {
          ...newShop,
          products: newShop.products || [],
        };

        setShops([...shops, shopToAdd]);
        setIsAddShopModalOpen(false);
      } else {
        console.error("Error adding shop");
      }
    } catch (error) {
      console.error("Error connecting to server:", error);
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
    try {
      const response = await fetch(`${apiUrl}/api/shops/${shopId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setShops((prevShops) => prevShops.filter((shop) => shop.id !== shopId));
      } else {
        console.error("Nie udało się usunąć sklepu.");
      }
    } catch (error) {
      console.error("Błąd połączenia z serwerem:", error);
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
