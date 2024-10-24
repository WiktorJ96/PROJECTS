import React, { useState, useEffect } from "react";
import DeleteConfirmationModal from "../DeleteConfirmationModal/DeleteConfirmationModal";
import AddProductModal from "../AddProductModal/AddProductModal";

const ProductList = ({
  shop,
  isEditingShop,
  setIsEditingShop,
  onUpdateShopName,
  onDeleteShop,
  onUpdateProducts,
}) => {
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Modal potwierdzający usunięcie produktu
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false); // Modal dodawania produktu
  const [editedShopName, setEditedShopName] = useState(shop.name); // Przechowuje edytowaną nazwę sklepu
  const [isShopDeleteModalOpen, setIsShopDeleteModalOpen] = useState(false); // Modal potwierdzający usunięcie sklepu

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Enter") {
        if (isEditingShop && editedShopName.trim() !== "") {
          handleEditShopName(); // Zapisz zmiany w nazwie sklepu
        } else if (isDeleteModalOpen && productToDelete) {
          handleDeleteProduct(); // Potwierdź usunięcie produktu
        } else if (isShopDeleteModalOpen) {
          handleConfirmDeleteShop(); // Potwierdź usunięcie sklepu
        }
      } else if (event.key === "Escape") {
        if (isEditingShop) {
          setIsEditingShop(false); // Wyjdź z trybu edycji
        } else if (isDeleteModalOpen) {
          setIsDeleteModalOpen(false); // Zamknij modal usunięcia produktu
        } else if (isShopDeleteModalOpen) {
          setIsShopDeleteModalOpen(false); // Zamknij modal usunięcia sklepu
        }
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [
    isEditingShop,
    isDeleteModalOpen,
    isShopDeleteModalOpen,
    productToDelete,
    editedShopName,
  ]);

  // Funkcja do zapisu nowej nazwy sklepu
  const handleEditShopName = () => {
    setIsEditingShop(false);
    onUpdateShopName(editedShopName); // Zaktualizuj nazwę sklepu
  };

  // Funkcja do otwarcia modala potwierdzającego usunięcie sklepu
  const openDeleteModalForShop = () => {
    setIsShopDeleteModalOpen(true);
  };

  // Funkcja do potwierdzenia usunięcia sklepu
  const handleConfirmDeleteShop = () => {
    // Najpierw usuń sklep, a potem zamknij modal
    onDeleteShop(shop); // Usuń sklep
    setIsShopDeleteModalOpen(false); // Zamknij modal po usunięciu sklepu
  };



  // Funkcja do otwarcia modala potwierdzającego usunięcie produktu
  const openDeleteModalForProduct = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  // Funkcja do usunięcia produktu
 const handleDeleteProduct = () => {
   if (productToDelete) {
     const updatedProducts = shop.products.filter(
       (p) => p.name !== productToDelete.name
     );
     onUpdateProducts(updatedProducts);
     setIsDeleteModalOpen(false);
   }
 };

  // Funkcja do dodania produktu
  const handleAddProduct = (product) => {
    // Upewniamy się, że dodajemy nowy produkt do listy
    const updatedProducts = [
      ...shop.products,
      { name: product.name, price: product.price, link: product.link },
    ];
    onUpdateProducts(updatedProducts);
  };

  return (
    <section id="productSection" className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        {isEditingShop ? (
          <input
            type="text"
            value={editedShopName}
            onChange={(e) => setEditedShopName(e.target.value)}
            className="w-full p-2 border rounded"
          />
        ) : (
          <h2 className="text-2xl font-semibold">Produkty w {shop.name}</h2>
        )}

        {isEditingShop ? (
          <div className="flex space-x-4">
            <button
              className="btn-primary px-4 py-2 rounded"
              onClick={handleEditShopName}
            >
              Zapisz
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              onClick={openDeleteModalForShop}
            >
              Usuń
            </button>
          </div>
        ) : (
          <button
            className="btn-secondary px-4 py-2 rounded"
            onClick={() => setIsEditingShop(true)}
            disabled={isEditingShop}
          >
            <i className="fas fa-edit mr-2"></i>Edytuj sklep
          </button>
        )}
      </div>

      <button
        className="btn-primary px-4 py-2 rounded mb-4"
        onClick={() => setIsAddProductModalOpen(true)} // Otwórz modal dodawania produktu
      >
        Dodaj produkt
      </button>

      <ul className="space-y-2">
        {shop.products.map((product, index) => (
          <li key={index} className="flex justify-between items-center">
            <span>
              {product.name} - {product.price} PLN
            </span>
            <a
              href={product.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500"
            >
              Zobacz produkt
            </a>
            <button
              className="text-red-500"
              onClick={() => openDeleteModalForProduct(product)}
            >
              <i className="fas fa-times"></i>
            </button>
          </li>
        ))}
      </ul>

      {/* Modal potwierdzający usunięcie produktu */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteProduct} // Wywołujemy funkcję usunięcia produktu
        item={productToDelete ? productToDelete.name : ""} // Sprawdzamy, czy productToDelete istnieje
        itemType="produkt"
      />

      {/* Modal dodawania produktu */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onAddProduct={handleAddProduct}
      />

      {/* Modal potwierdzający usunięcie sklepu */}
      <DeleteConfirmationModal
        isOpen={isShopDeleteModalOpen}
        onClose={() => setIsShopDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteShop}
        item={shop.name}
        itemType="sklep"
      />
    </section>
  );
};

export default ProductList;