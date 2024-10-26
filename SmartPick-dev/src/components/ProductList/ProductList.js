import React, { useState, useEffect, useCallback } from "react";
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
  const products = shop.products || [];

  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [editedShopName, setEditedShopName] = useState(shop.name);
  const [isShopDeleteModalOpen, setIsShopDeleteModalOpen] = useState(false);

  useEffect(() => {
    setEditedShopName(shop.name);
  }, [shop]);

  const handleEditShopName = useCallback(() => {
    if (editedShopName.trim()) {
      setIsEditingShop(false);
      onUpdateShopName(editedShopName);
    }
  }, [editedShopName, onUpdateShopName, setIsEditingShop]);

  const handleConfirmDeleteShop = useCallback(() => {
    onDeleteShop(shop.id);
    setIsShopDeleteModalOpen(false);
  }, [shop.id, onDeleteShop]);

  const handleDeleteProduct = useCallback(() => {
    const updatedProducts = products.filter(
      (p) => p.name !== productToDelete.name
    );
    onUpdateProducts(updatedProducts);
    setProductToDelete(null);
    setIsDeleteModalOpen(false);
  }, [productToDelete, products, onUpdateProducts]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Enter") {
        if (isEditingShop) handleEditShopName();
        else if (isDeleteModalOpen) handleDeleteProduct();
        else if (isShopDeleteModalOpen) handleConfirmDeleteShop();
      } else if (event.key === "Escape") {
        if (isEditingShop) setIsEditingShop(false);
        else if (isDeleteModalOpen) setIsDeleteModalOpen(false);
        else if (isShopDeleteModalOpen) setIsShopDeleteModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [
    isEditingShop,
    isDeleteModalOpen,
    isShopDeleteModalOpen,
    handleEditShopName,
    handleDeleteProduct,
    handleConfirmDeleteShop,
  ]);

  // Funkcja otwierająca modal potwierdzający usunięcie dla produktu
  const openDeleteModalForProduct = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  // Funkcja do dodawania nowego produktu
  const handleAddProduct = (product) => {
    const updatedProducts = [
      ...products,
      { name: product.name, price: product.price, link: product.link },
    ];
    onUpdateProducts(updatedProducts);
  };

  const renderEditButtons = () => (
    <div className="flex space-x-4">
      <button
        className="btn-primary px-4 py-2 rounded"
        onClick={handleEditShopName}
      >
        Zapisz
      </button>
      <button
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        onClick={() => setIsShopDeleteModalOpen(true)}
      >
        Usuń
      </button>
    </div>
  );

  const renderProductList = () =>
    products.length > 0 ? (
      products.map((product, index) => (
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
      ))
    ) : (
      <p>No products available.</p>
    );

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
          renderEditButtons()
        ) : (
          <button
            className="btn-secondary px-4 py-2 rounded"
            onClick={() => setIsEditingShop(true)}
          >
            <i className="fas fa-edit mr-2"></i>Edytuj sklep
          </button>
        )}
      </div>

      <button
        className="btn-primary px-4 py-2 rounded mb-4"
        onClick={() => setIsAddProductModalOpen(true)}
      >
        Dodaj produkt
      </button>

      <ul className="space-y-2">{renderProductList()}</ul>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteProduct}
        item={productToDelete ? productToDelete.name : ""}
        itemType="produkt"
      />

      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onAddProduct={handleAddProduct}
      />

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
