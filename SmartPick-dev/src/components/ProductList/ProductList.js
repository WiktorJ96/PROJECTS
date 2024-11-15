import React, { useState, useEffect, useCallback } from "react";
import DeleteConfirmationModal from "../DeleteConfirmationModal/DeleteConfirmationModal";
import AddProductModal from "../AddProductModal/AddProductModal";
import {
  FaHeart,
  FaRegHeart,
  FaStickyNote,
  FaStar,
  FaRegStar,
} from "react-icons/fa";

const ProductList = ({
  shop,
  isEditingShop,
  setIsEditingShop,
  onUpdateShopName,
  onDeleteShop,
  onUpdateProducts,
  onUpdateShopFavorite,
}) => {
  const products = shop.products || [];

  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [editedShopName, setEditedShopName] = useState(shop.name);
  const [isShopDeleteModalOpen, setIsShopDeleteModalOpen] = useState(false);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [selectedProductForNote, setSelectedProductForNote] = useState(null);
  const [note, setNote] = useState("");

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

  const openDeleteModalForProduct = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleAddProduct = (product) => {
    const updatedProducts = [
      ...products,
      {
        name: product.name,
        price: product.price,
        link: product.link,
        note: "",
      },
    ];
    onUpdateProducts(updatedProducts);
  };

  const toggleFavorite = (index) => {
    const updatedProducts = products.map((product, i) =>
      i === index ? { ...product, isFavorite: !product.isFavorite } : product
    );
    onUpdateProducts(updatedProducts);
  };

  const toggleShopFavorite = () => {
    const updatedShop = { ...shop, isFavorite: !shop.isFavorite };
    onUpdateShopFavorite(updatedShop); // Aktualizacja stanu w komponencie nadrzędnym
  };


  const openNoteModal = (product) => {
    setSelectedProductForNote(product);
    setNote(product.note || "");
    setIsNoteModalOpen(true);
  };

  const saveNote = () => {
    const updatedProducts = products.map((p) =>
      p.name === selectedProductForNote.name ? { ...p, note } : p
    );
    onUpdateProducts(updatedProducts);
    setIsNoteModalOpen(false);
  };

  return (
    <section
      id="productSection"
      className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-lg p-8"
    >
      <div className="flex justify-between items-center mb-4">
        {isEditingShop ? (
          <input
            type="text"
            value={editedShopName}
            onChange={(e) => setEditedShopName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        ) : (
          <h2 className="text-3xl font-bold text-gray-800 flex items-center space-x-4">
            <span>
              Produkty w{" "}
              {shop.name.length > 25
                ? `${shop.name.substring(0, 25)}...`
                : shop.name}
            </span>
            <button
              onClick={toggleShopFavorite}
              className="focus:outline-none"
              aria-label="Mark as favorite shop"
            >
              {shop.isFavorite ? (
                <FaStar className="text-yellow-500 transition-colors duration-200" />
              ) : (
                <FaRegStar className="text-gray-400 hover:text-yellow-500 transition-colors duration-200" />
              )}
            </button>
          </h2>
        )}
        {isEditingShop ? (
          <div className="flex space-x-4">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
              onClick={handleEditShopName}
            >
              Zapisz
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-200"
              onClick={() => setIsShopDeleteModalOpen(true)}
            >
              Usuń
            </button>
          </div>
        ) : (
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors duration-200"
            onClick={() => setIsEditingShop(true)}
          >
            <i className="fas fa-edit mr-2"></i>Edytuj sklep
          </button>
        )}
      </div>

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600 transition-colors duration-200"
        onClick={() => setIsAddProductModalOpen(true)}
      >
        Dodaj produkt
      </button>

      <div className="w-full overflow-x-auto">
        <table className="w-full bg-white shadow-lg rounded-lg overflow-hidden border">
          <thead>
            <tr className="bg-gray-200 text-gray-700 border-b">
              <th className="py-3 px-4 text-left font-semibold">
                Nazwa produktu
              </th>
              <th className="py-3 px-4 text-left font-semibold">Cena</th>
              <th className="py-3 px-4 text-left font-semibold">Link</th>
              <th className="py-3 px-4 text-center font-semibold">Notatka</th>
              <th className="py-3 px-4 text-center font-semibold">Ulubione</th>
              <th className="py-3 px-4 text-center font-semibold">Usuń</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-gray-50 transition duration-150"
                >
                  <td className="py-3 px-4">
                    {product.name.length > 20
                      ? `${product.name.substring(0, 20)}...`
                      : product.name}
                  </td>
                  <td className="py-3 px-4">
                    {product.price.length > 20
                      ? `${product.price.substring(0, 20)}...`
                      : product.price}{" "}
                    PLN
                  </td>
                  <td className="py-3 px-4">
                    <a
                      href={product.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline transition-colors duration-150"
                    >
                      Zobacz produkt
                    </a>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button onClick={() => openNoteModal(product)}>
                      <FaStickyNote
                        className={`${
                          product.note
                            ? "text-green-500"
                            : "text-gray-600 hover:text-blue-500"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => toggleFavorite(index)}
                      className="focus:outline-none"
                    >
                      {product.isFavorite ? (
                        <FaHeart className="text-red-500" />
                      ) : (
                        <FaRegHeart />
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      className="text-red-500 hover:text-red-700 transition-colors duration-150"
                      onClick={() => openDeleteModalForProduct(product)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-4 text-center text-gray-500">
                  Brak dostępnych produktów.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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

      {isNoteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
            <h2 className="text-2xl font-semibold mb-4">Dodaj notatkę</h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded mb-4"
              rows="4"
              placeholder="Wpisz swoją notatkę..."
            ></textarea>
            <div className="flex justify-end space-x-4">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
                onClick={saveNote}
              >
                Zapisz
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors duration-200"
                onClick={() => setIsNoteModalOpen(false)}
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductList;
