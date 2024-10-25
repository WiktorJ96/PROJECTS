import React, { useState, useEffect } from "react";
import "./styles/App.css";
import Header from "./components/Header/Header";
import ShopList from "./components/ShopList/ShopList";
import ProductList from "./components/ProductList/ProductList";
import Footer from "./components/Footer/Footer";
import AddShopModal from "./components/AddShopModal/AddShopModal";
import { v4 as uuidv4 } from "uuid"; // Generowanie unikalnych identyfikatorów

function App() {
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
        const response = await fetch("http://localhost:5000/api/shops");
        if (response.ok) {
          const shopsFromServer = await response.json();

          // Ensure each shop has a products array
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
  }, []);


  const [selectedShop, setSelectedShop] = useState(null);
  const [isAddShopModalOpen, setIsAddShopModalOpen] = useState(false);
  const [isEditingShop, setIsEditingShop] = useState(false); // Stan śledzący tryb edycji

  // Obsługa wyboru sklepu
  const handleSelectShop = (shop) => {
    setSelectedShop(shop); // Ustaw wybrany sklep
    setIsEditingShop(false); // Wyłącz tryb edycji po zmianie sklepu
  };

  // Dodawanie nowego sklepu
  const handleAddShop = async (newShopName) => {
    try {
      const response = await fetch("http://localhost:5000/api/shops", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newShopName }),
      });

      if (response.ok) {
        const newShop = await response.json();

        // Ensure the new shop has a products array
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



  // Aktualizacja nazwy sklepu
  const handleUpdateShopName = (newName) => {
    const updatedShops = shops.map((shop) => {
      if (shop.id === selectedShop.id) {
        return { ...shop, name: newName };
      }
      return shop;
    });
    setShops(updatedShops); // Zaktualizuj stan wszystkich sklepów
    setSelectedShop({ ...selectedShop, name: newName }); // Zaktualizuj wybrany sklep
  };

  // Usuwanie sklepu
  const handleDeleteShop = async (shopId) => {
    try {
      console.log("Próba usunięcia sklepu o ID:", shopId); // Debug
      const response = await fetch(
        `http://localhost:5000/api/shops/${shopId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        console.log("Usunięto sklep o ID:", shopId); // Debug
        setShops((prevShops) => prevShops.filter((shop) => shop.id !== shopId));
      } else {
        console.error("Nie udało się usunąć sklepu.");
      }
    } catch (error) {
      console.error("Błąd połączenia z serwerem:", error);
    }
  };

  // Aktualizacja produktów sklepu
  const handleUpdateProducts = (updatedProducts) => {
    const updatedShops = shops.map((shop) =>
      shop.id === selectedShop.id
        ? { ...shop, products: updatedProducts }
        : shop
    );
    setShops(updatedShops); // Zaktualizuj produkty sklepu w stanie
    setSelectedShop({ ...selectedShop, products: updatedProducts }); // Zaktualizuj wybrany sklep z nowymi produktami
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Lista sklepów */}
        <ShopList
          shops={shops}
          onSelectShop={handleSelectShop}
          onAddShop={() => setIsAddShopModalOpen(true)}
        />
        {/* Lista produktów dla wybranego sklepu */}
        {selectedShop && (
          <ProductList
            shop={selectedShop}
            isEditingShop={isEditingShop} // Przekazanie stanu edycji
            setIsEditingShop={setIsEditingShop} // Przekazanie funkcji ustawiającej tryb edycji
            onUpdateShopName={handleUpdateShopName} // Przekazanie funkcji aktualizacji nazwy sklepu
            onDeleteShop={handleDeleteShop} // Funkcja do usuwania sklepu
            onUpdateProducts={handleUpdateProducts} // Funkcja do aktualizacji produktów
          />
        )}
      </main>
      <Footer />
      {/* Modal do dodawania sklepu */}
      <AddShopModal
        isOpen={isAddShopModalOpen}
        onClose={() => setIsAddShopModalOpen(false)}
        onAddShop={handleAddShop}
      />
    </div>
  );
}

export default App;
