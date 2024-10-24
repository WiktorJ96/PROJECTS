import React, { useState } from "react";
import "./styles/App.css";
import Header from "./components/Header/Header";
import ShopList from "./components/ShopList/ShopList";
import ProductList from "./components/ProductList/ProductList";
import Footer from "./components/Footer/Footer";
import AddShopModal from "./components/AddShopModal/AddShopModal";
import { v4 as uuidv4 } from "uuid"; // Generowanie unikalnych identyfikatorów

function App() {
  const [shops, setShops] = useState([
    { id: uuidv4(), name: "Sklep 1", products: ["Produkt 1", "Produkt 2"] },
    { id: uuidv4(), name: "Sklep 2", products: ["Produkt A", "Produkt B"] },
  ]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [isAddShopModalOpen, setIsAddShopModalOpen] = useState(false);
  const [isEditingShop, setIsEditingShop] = useState(false); // Stan śledzący tryb edycji

  const handleSelectShop = (shop) => {
    setSelectedShop(shop); // Ustaw wybrany sklep
    setIsEditingShop(false); // Wyłącz tryb edycji po zmianie sklepu
  };

  const handleAddShop = (newShopName) => {
    setShops([...shops, { id: uuidv4(), name: newShopName, products: [] }]);
    setIsAddShopModalOpen(false); // Zamknij modal po dodaniu
  };

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

  const handleDeleteShop = (shopToDelete) => {
    setShops(shops.filter((shop) => shop.id !== shopToDelete.id)); // Usuń sklep po ID
    setSelectedShop(null); // Zresetuj wybrany sklep
  };

  const handleUpdateProducts = (updatedProducts) => {
    setShops(
      shops.map((shop) =>
        shop.id === selectedShop.id
          ? { ...shop, products: updatedProducts }
          : shop
      )
    );
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
            isEditingShop={isEditingShop} // Przekazanie stanu edycji
            setIsEditingShop={setIsEditingShop} // Przekazanie funkcji ustawiającej tryb edycji
            onUpdateShopName={handleUpdateShopName} // Przekazanie funkcji aktualizacji nazwy sklepu
            onDeleteShop={handleDeleteShop} // Funkcja do usuwania sklepu
            onUpdateProducts={handleUpdateProducts} // Funkcja do aktualizacji produktów
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