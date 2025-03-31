import React, { useState, useEffect, useCallback } from "react";
import DeleteConfirmationModal from "../DeleteConfirmationModal/DeleteConfirmationModal";
import AddProductModal from "../AddProductModal/AddProductModal";
import {
  FaHeart,
  FaRegHeart,
  FaStickyNote,
  FaStar,
  FaRegStar,
  FaEdit,
} from "react-icons/fa";
import { addProductToBackend } from "../ShopService/ShopService";

// Ustawienie adresu API
const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

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

  // Modal states
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isShopDeleteModalOpen, setIsShopDeleteModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  // Modal state dla edycji produktu
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [editProductName, setEditProductName] = useState("");
  const [editProductPrice, setEditProductPrice] = useState("");
  const [editProductLink, setEditProductLink] = useState("");
  const [editProductNote, setEditProductNote] = useState("");

  // Editing shop state
  const [editedShopName, setEditedShopName] = useState(shop.name);

  // Note state
  const [selectedProductForNote, setSelectedProductForNote] = useState(null);
  const [note, setNote] = useState("");

  // State for rozwijania kontenera produktów
  const [isProductsOpen, setIsProductsOpen] = useState(true);

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
    const updatedProducts = products.filter((p) => p.id !== productToDelete.id);
    onUpdateProducts(updatedProducts);
    setProductToDelete(null);
    setIsDeleteModalOpen(false);
  }, [productToDelete, products, onUpdateProducts]);

  const openDeleteModalForProduct = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  // Funkcja otwierająca modal edycji produktu
  const openEditModalForProduct = (product) => {
    setProductToEdit(product);
    setEditProductName(product.name);
    setEditProductPrice(product.price);
    setEditProductLink(product.link);
    setEditProductNote(product.note || "");
    setIsEditProductModalOpen(true);
  };

  // Zapis edytowanych danych produktu
  const handleSaveEditProduct = () => {
    if (!editProductName.trim()) {
      alert("Nazwa produktu jest wymagana.");
      return;
    }
    const updatedProduct = {
      ...productToEdit,
      name: editProductName,
      price: editProductPrice,
      link: editProductLink,
      note: editProductNote,
    };
    const updatedProducts = products.map((p) =>
      p.id === updatedProduct.id ? updatedProduct : p
    );
    onUpdateProducts(updatedProducts);
    setIsEditProductModalOpen(false);
  };

  // Funkcja dodająca produkt – używa aktualnego shop.id i globalnego apiUrl
  const handleAddProduct = async (product) => {
    console.log(
      "Dodawanie produktu dla sklepu o ID:",
      shop.id,
      "dane:",
      product
    );
    try {
      if (!product.name || product.name.trim() === "") {
        console.error("Brak nazwy produktu!");
        return;
      }
      const addedProduct = await addProductToBackend(apiUrl, shop.id, product);
      console.log("Odpowiedź z backendu:", addedProduct);
      onUpdateProducts([...products, addedProduct]);
    } catch (error) {
      console.error("Błąd przy dodawaniu produktu:", error);
    }
  };

  const toggleFavorite = (index) => {
    const updatedProducts = products.map((product, i) =>
      i === index
        ? { ...product, isFavorite: !product.isFavorite, shopName: shop.name }
        : product
    );
    onUpdateProducts(updatedProducts);
  };

  const toggleShopFavorite = () => {
    const updatedShop = { ...shop, isFavorite: !shop.isFavorite };
    onUpdateShopFavorite(updatedShop);
  };

  const openNoteModal = (product) => {
    setSelectedProductForNote(product);
    setNote(product.note || "");
    setIsNoteModalOpen(true);
  };

  const saveNote = () => {
    const updatedProducts = products.map((p) =>
      p.id === selectedProductForNote.id ? { ...p, note } : p
    );
    onUpdateProducts(updatedProducts);
    setIsNoteModalOpen(false);
  };

  return (
    <section
      id="productSection"
      className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-lg p-6 my-8"
    >
      {/* Nagłówek sklepu i edycji */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        {isEditingShop ? (
          <input
            type="text"
            value={editedShopName}
            onChange={(e) => setEditedShopName(e.target.value)}
            className="w-full sm:w-auto p-2 border border-gray-300 rounded"
          />
        ) : (
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center space-x-4">
            <span>
              Produkty w{" "}
              {shop.name.length > 25
                ? `${shop.name.substring(0, 25)}...`
                : shop.name}
            </span>
            <button
              onClick={toggleShopFavorite}
              className="focus:outline-none"
              aria-label="Oznacz sklep jako ulubiony"
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
          <div className="flex space-x-4 mt-4 sm:mt-0">
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

      {/* Akordeon dla produktów */}
      <div className="mb-6">
        <div
          onClick={() => setIsProductsOpen((prev) => !prev)}
          className="flex justify-between items-center cursor-pointer border-b border-gray-200 pb-2 mb-4"
        >
          <h3 className="text-xl font-semibold text-gray-800">Produkty</h3>
          <span
            className={`transition-transform duration-300 text-gray-600 ${
              isProductsOpen ? "rotate-180" : "rotate-0"
            }`}
          >
            <i className="fas fa-chevron-down"></i>
          </span>
        </div>

        {isProductsOpen && (
          <>
            {/* Przycisk dodania produktu */}
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600 transition-colors duration-200"
              onClick={() => setIsAddProductModalOpen(true)}
            >
              Dodaj produkt
            </button>

            {/* Widok mobilny - karty */}
            <div className="sm:hidden">
              {products.length > 0 ? (
                products.map((product, index) => (
                  <div
                    key={product.id || index}
                    className="bg-white rounded-lg shadow p-4 mb-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-semibold text-gray-700">
                        {product.name}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleFavorite(index)}
                          className="focus:outline-none"
                          aria-label="Przełącz ulubione"
                        >
                          {product.isFavorite ? (
                            <FaHeart className="text-red-500" />
                          ) : (
                            <FaRegHeart className="text-gray-400 hover:text-red-500 transition-colors duration-150" />
                          )}
                        </button>
                        <button
                          onClick={() => openEditModalForProduct(product)}
                          className="text-blue-500 hover:text-blue-700 transition-colors duration-150"
                          aria-label="Edytuj produkt"
                        >
                          <FaEdit />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {product.price} PLN
                    </p>
                    <a
                      href={product.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline transition-colors duration-150 block mb-2"
                    >
                      Zobacz produkt
                    </a>
                    <div className="flex justify-between">
                      <button
                        onClick={() => openNoteModal(product)}
                        className="text-gray-600 hover:text-blue-500 transition-colors duration-150"
                        aria-label="Edytuj notatkę"
                      >
                        <FaStickyNote />
                      </button>
                      <button
                        onClick={() => openDeleteModalForProduct(product)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-150"
                        aria-label="Usuń produkt"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">
                  Brak dostępnych produktów.
                </p>
              )}
            </div>

            {/* Widok desktopowy - tabela */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow-lg">
                <thead>
                  <tr className="bg-gray-200 text-gray-700 border-b">
                    <th className="py-3 px-4 text-left font-semibold">
                      Nazwa produktu
                    </th>
                    <th className="py-3 px-4 text-left font-semibold">Cena</th>
                    <th className="py-3 px-4 text-left font-semibold">Link</th>
                    <th className="py-3 px-4 text-center font-semibold">
                      Notatka
                    </th>
                    <th className="py-3 px-4 text-center font-semibold">
                      Ulubione
                    </th>
                    <th className="py-3 px-4 text-center font-semibold">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? (
                    products.map((product, index) => (
                      <tr
                        key={product.id || index}
                        className="border-b hover:bg-gray-50 transition duration-150"
                      >
                        <td className="py-3 px-4">
                          {product.name.length > 20
                            ? `${product.name.substring(0, 20)}...`
                            : product.name}
                        </td>
                        <td className="py-3 px-4">
                          {product.price && product.price.toString().length > 20
                            ? `${product.price.toString().substring(0, 20)}...`
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
                          <button
                            onClick={() => openNoteModal(product)}
                            aria-label="Edytuj notatkę"
                          >
                            <FaStickyNote
                              className={`${
                                product.note
                                  ? "text-green-500"
                                  : "text-gray-600 hover:text-blue-500 transition-colors duration-150"
                              }`}
                            />
                          </button>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => toggleFavorite(index)}
                            className="focus:outline-none"
                            aria-label="Przełącz ulubione"
                          >
                            {product.isFavorite ? (
                              <FaHeart className="text-red-500" />
                            ) : (
                              <FaRegHeart className="text-gray-400 hover:text-red-500 transition-colors duration-150" />
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => openEditModalForProduct(product)}
                            className="text-blue-500 hover:text-blue-700 transition-colors duration-150"
                            aria-label="Edytuj produkt"
                          >
                            <FaEdit size={20} />
                          </button>
                          <button
                            onClick={() => openDeleteModalForProduct(product)}
                            className="text-red-500 hover:text-red-700 transition-colors duration-150 ml-5"
                            aria-label="Usuń produkt"
                          >
                            <i
                              className="fas fa-times"
                              style={{ fontSize: "20px" }}
                            ></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="py-4 text-center text-gray-500"
                      >
                        Brak dostępnych produktów.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modale */}
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

      {/* Modal edycji produktu */}
      {isEditProductModalOpen && (
        <div
          role="dialog"
          aria-labelledby="edit-product-modal-title"
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        >
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2
              id="edit-product-modal-title"
              className="text-2xl font-semibold mb-4"
            >
              Edytuj produkt
            </h2>
            <input
              type="text"
              value={editProductName}
              onChange={(e) => setEditProductName(e.target.value)}
              placeholder="Nazwa produktu"
              className="w-full p-2 mb-4 border rounded"
            />
            <input
              type="number"
              value={editProductPrice}
              onChange={(e) => setEditProductPrice(e.target.value)}
              placeholder="Cena produktu"
              className="w-full p-2 mb-4 border rounded"
            />
            <input
              type="text"
              value={editProductLink}
              onChange={(e) => setEditProductLink(e.target.value)}
              placeholder="Link do produktu"
              className="w-full p-2 mb-4 border rounded"
            />
            <input
              type="text"
              value={editProductNote}
              onChange={(e) => setEditProductNote(e.target.value)}
              placeholder="Notatka (opcjonalnie)"
              className="w-full p-2 mb-4 border rounded"
            />
            <div className="flex justify-end space-x-2">
              <button
                className="btn-secondary px-4 py-2 rounded"
                onClick={() => setIsEditProductModalOpen(false)}
              >
                Anuluj
              </button>
              <button
                className="btn-primary px-4 py-2 rounded"
                onClick={handleSaveEditProduct}
              >
                Zapisz zmiany
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductList;
