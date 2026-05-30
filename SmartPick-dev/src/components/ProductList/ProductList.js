import React, { useState, useEffect, useCallback, useMemo } from "react";
import DeleteConfirmationModal from "../DeleteConfirmationModal/DeleteConfirmationModal";
import AddProductModal from "../AddProductModal/AddProductModal";
import NoteModal from "../AddNoteModal/AddNoteModal";
import Modal from "../Modal/Modal";
import {
  FaBell,
  FaEdit,
  FaExternalLinkAlt,
  FaFilter,
  FaHeart,
  FaPlus,
  FaRegHeart,
  FaRegStar,
  FaSearch,
  FaSortAmountDown,
  FaStar,
  FaStickyNote,
  FaTrash,
} from "react-icons/fa";
import {
  addProductToBackend,
  deleteProductFromBackend,
} from "../ShopService/ShopService";

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

const PRODUCT_FILTERS = [
  { value: "all", label: "Wszystkie" },
  { value: "favorites", label: "Ulubione" },
  { value: "notes", label: "Z notatką" },
  { value: "offline", label: "Offline" },
];

const PRODUCT_SORTS = [
  { value: "name-asc", label: "Nazwa A-Z" },
  { value: "name-desc", label: "Nazwa Z-A" },
  { value: "price-asc", label: "Cena rosnąco" },
  { value: "price-desc", label: "Cena malejąco" },
];

const getProductKey = (product, index) => product.id ?? `${product.name}-${index}`;

const ProductList = ({
  shop,
  isEditingShop,
  setIsEditingShop,
  onUpdateShopName,
  onDeleteShop,
  onUpdateProducts,
  onUpdateShopFavorite,
  onAddReminder,
}) => {
  const products = useMemo(() => shop.products || [], [shop.products]);

  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isShopDeleteModalOpen, setIsShopDeleteModalOpen] = useState(false);

  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [editProductName, setEditProductName] = useState("");
  const [editProductPrice, setEditProductPrice] = useState("");
  const [editProductLink, setEditProductLink] = useState("");
  const [editProductNote, setEditProductNote] = useState("");
  const [editError, setEditError] = useState("");

  const [editedShopName, setEditedShopName] = useState(shop.name);
  const [selectedProductForNote, setSelectedProductForNote] = useState(null);
  const [note, setNote] = useState("");
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [reminderProduct, setReminderProduct] = useState(null);
  const [reminderFrequency, setReminderFrequency] = useState("30");
  const [reminderError, setReminderError] = useState("");

  useEffect(() => {
    setEditedShopName(shop.name);
  }, [shop]);

  const visibleProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return products
      .filter((product) => {
        const matchesSearch =
          !normalizedSearch ||
          product.name?.toLowerCase().includes(normalizedSearch) ||
          product.note?.toLowerCase().includes(normalizedSearch);

        if (!matchesSearch) return false;
        if (filter === "favorites") return product.isFavorite;
        if (filter === "notes") return Boolean(product.note);
        if (filter === "offline") return Boolean(product.unsynced);
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "name-asc") return a.name.localeCompare(b.name, "pl");
        if (sortBy === "name-desc") return b.name.localeCompare(a.name, "pl");
        if (sortBy === "price-asc") return Number(a.price) - Number(b.price);
        if (sortBy === "price-desc") return Number(b.price) - Number(a.price);
        return 0;
      });
  }, [filter, products, searchTerm, sortBy]);

  const handleEditShopName = useCallback(() => {
    if (editedShopName.trim()) {
      setIsEditingShop(false);
      onUpdateShopName(editedShopName.trim());
    }
  }, [editedShopName, onUpdateShopName, setIsEditingShop]);

  const handleConfirmDeleteShop = useCallback(() => {
    onDeleteShop(shop.id);
    setIsShopDeleteModalOpen(false);
  }, [shop.id, onDeleteShop]);

  const handleDeleteProduct = useCallback(async () => {
    if (!productToDelete) return;

    try {
      await deleteProductFromBackend(apiUrl, Number(shop.id), Number(productToDelete.id));
    } catch (error) {
      console.error("Błąd przy usuwaniu produktu:", error);
    } finally {
      const updated = products.filter((p) => p.id !== productToDelete.id);
      onUpdateProducts(updated);
      setProductToDelete(null);
      setIsDeleteModalOpen(false);
    }
  }, [productToDelete, products, onUpdateProducts, shop.id]);

  const openDeleteModalForProduct = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const openEditModalForProduct = (product) => {
    setProductToEdit(product);
    setEditProductName(product.name || "");
    setEditProductPrice(product.price ?? "");
    setEditProductLink(product.link || "");
    setEditProductNote(product.note || "");
    setEditError("");
    setIsEditProductModalOpen(true);
  };

  const handleSaveEditProduct = () => {
    if (!editProductName.trim()) {
      setEditError("Nazwa produktu jest wymagana.");
      return;
    }

    const updatedProduct = {
      ...productToEdit,
      name: editProductName.trim(),
      price: editProductPrice,
      link: editProductLink.trim(),
      note: editProductNote.trim(),
    };

    const updated = products.map((p) =>
      p.id === updatedProduct.id ? updatedProduct : p
    );
    onUpdateProducts(updated);
    setIsEditProductModalOpen(false);
  };

  const handleAddProduct = async (product) => {
    if (!product.name?.trim()) return;

    const temporaryProduct = { ...product, id: Date.now(), isLoading: true };
    const updatedProducts = [...products, temporaryProduct];
    onUpdateProducts(updatedProducts);
    setIsAddProductModalOpen(false);

    try {
      const addedProduct = await addProductToBackend(apiUrl, shop.id, product);
      onUpdateProducts(
        updatedProducts.map((p) => (p.id === temporaryProduct.id ? addedProduct : p))
      );
    } catch (error) {
      console.error("Błąd przy dodawaniu produktu:", error);
      const fallbackProduct = { ...product, id: Date.now(), unsynced: true };
      onUpdateProducts(
        updatedProducts.map((p) => (p.id === temporaryProduct.id ? fallbackProduct : p))
      );
    }
  };

  const toggleFavorite = (product) => {
    const updated = products.map((prod) =>
      prod.id === product.id
        ? { ...prod, isFavorite: !prod.isFavorite, shopName: shop.name }
        : prod
    );
    onUpdateProducts(updated);
  };

  const toggleShopFavorite = () => {
    onUpdateShopFavorite({ ...shop, isFavorite: !shop.isFavorite });
  };

  const openNoteModal = (product) => {
    setSelectedProductForNote(product);
    setNote(product.note || "");
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = (newNote) => {
    const updated = products.map((p) =>
      p.id === selectedProductForNote.id ? { ...p, note: newNote } : p
    );
    onUpdateProducts(updated);
    setIsNoteModalOpen(false);
  };

  const openReminderModal = (product) => {
    setReminderProduct(product);
    setReminderFrequency("30");
    setReminderError("");
  };

  const handleAddProductReminder = async () => {
    const frequency = Number(reminderFrequency);
    if (!frequency || frequency < 1 || frequency > 1000) {
      setReminderError("Podaj liczbę dni od 1 do 1000.");
      return;
    }

    await onAddReminder?.({
      productName: reminderProduct.name,
      frequency,
    });
    setReminderProduct(null);
  };

  const renderProductActions = (product) => (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => toggleFavorite(product)}
        className="icon-button"
        aria-label={product.isFavorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
        title={product.isFavorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
      >
        {product.isFavorite ? (
          <FaHeart className="text-rose-500" aria-hidden="true" />
        ) : (
          <FaRegHeart aria-hidden="true" />
        )}
      </button>
      <button
        type="button"
        onClick={() => openNoteModal(product)}
        className="icon-button"
        aria-label="Edytuj notatkę"
        title="Notatka"
      >
        <FaStickyNote
          className={product.note ? "text-emerald-600" : ""}
          aria-hidden="true"
        />
      </button>
      <button
        type="button"
        onClick={() => openReminderModal(product)}
        className="icon-button"
        aria-label="Dodaj przypomnienie"
        title="Dodaj przypomnienie"
      >
        <FaBell aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => openEditModalForProduct(product)}
        className="icon-button"
        aria-label="Edytuj produkt"
        title="Edytuj"
      >
        <FaEdit aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => openDeleteModalForProduct(product)}
        className="icon-button text-rose-600 hover:bg-rose-50 hover:text-rose-700"
        aria-label="Usuń produkt"
        title="Usuń"
      >
        <FaTrash aria-hidden="true" />
      </button>
    </div>
  );

  return (
    <section
      id="productSection"
      className="my-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        {isEditingShop ? (
          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={editedShopName}
              onChange={(e) => setEditedShopName(e.target.value)}
              className="form-input sm:max-w-sm"
              aria-label="Nazwa sklepu"
            />
            <div className="flex gap-2">
              <button type="button" className="btn-primary px-4 py-2" onClick={handleEditShopName}>
                Zapisz
              </button>
              <button
                type="button"
                className="btn-danger px-4 py-2"
                onClick={() => setIsShopDeleteModalOpen(true)}
              >
                Usuń
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500">
                Wybrany sklep
              </p>
              <h2 className="mt-1 flex min-w-0 items-center gap-3 text-2xl font-semibold text-slate-950">
                <span className="truncate" title={shop.name}>
                  {shop.name}
                </span>
                <button
                  type="button"
                  onClick={toggleShopFavorite}
                  className="icon-button flex-shrink-0"
                  aria-label={
                    shop.isFavorite ? "Usuń sklep z ulubionych" : "Dodaj sklep do ulubionych"
                  }
                  title={shop.isFavorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
                >
                  {shop.isFavorite ? (
                    <FaStar className="text-amber-400" aria-hidden="true" />
                  ) : (
                    <FaRegStar aria-hidden="true" />
                  )}
                </button>
              </h2>
            </div>
            <button
              type="button"
              className="btn-muted px-4 py-2"
              onClick={() => setIsEditingShop(true)}
            >
              <FaEdit aria-hidden="true" />
              Edytuj sklep
            </button>
          </>
        )}
      </div>

      <div className="rounded-lg border border-slate-200">
        <button
          type="button"
          onClick={() => setIsProductsOpen((p) => !p)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-sky-500"
          aria-expanded={isProductsOpen}
        >
          <span>
            <span className="block text-lg font-semibold text-slate-900">
              Produkty
            </span>
            <span className="text-sm text-slate-500">
              {products.length} wszystkich, {visibleProducts.length} widocznych
            </span>
          </span>
          <span
            className={`text-slate-500 transition-transform ${
              isProductsOpen ? "rotate-180" : "rotate-0"
            }`}
            aria-hidden="true"
          >
            <i className="fas fa-chevron-down" />
          </span>
        </button>

        {isProductsOpen && (
          <div className="border-t border-slate-200 p-4">
            <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
              <label className="relative block">
                <span className="sr-only">Szukaj produktu</span>
                <FaSearch
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="form-input pl-10"
                  placeholder="Szukaj po nazwie lub notatce"
                />
              </label>
              <label className="relative block">
                <span className="sr-only">Filtr produktów</span>
                <FaFilter
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <select
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  className="form-input min-w-40 pl-10"
                >
                  {PRODUCT_FILTERS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="relative block">
                <span className="sr-only">Sortowanie produktów</span>
                <FaSortAmountDown
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="form-input min-w-44 pl-10"
                >
                  {PRODUCT_SORTS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="btn-primary justify-center px-4 py-2"
                onClick={() => setIsAddProductModalOpen(true)}
              >
                <FaPlus aria-hidden="true" />
                Dodaj produkt
              </button>
            </div>

            {products.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="text-sm text-slate-600">
                  Ten sklep nie ma jeszcze produktów.
                </p>
                <button
                  type="button"
                  className="btn-primary mx-auto mt-4 px-4 py-2"
                  onClick={() => setIsAddProductModalOpen(true)}
                >
                  <FaPlus aria-hidden="true" />
                  Dodaj pierwszy produkt
                </button>
              </div>
            ) : visibleProducts.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
                Brak produktów pasujących do filtrów.
              </div>
            ) : (
              <>
                <div className="grid gap-3 sm:hidden">
                  {visibleProducts.map((product, index) => (
                    <article
                      key={getProductKey(product, index)}
                      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="break-words text-base font-semibold text-slate-900">
                            {product.name}
                          </h3>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="price-badge">{product.price} PLN</span>
                            {product.unsynced && (
                              <span className="status-badge">Offline</span>
                            )}
                            {product.note && (
                              <span className="status-badge bg-emerald-50 text-emerald-700 ring-emerald-200">
                                Notatka
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {product.link && (
                        <a
                          href={product.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-sky-700 hover:text-sky-900 hover:underline"
                        >
                          Zobacz produkt
                          <FaExternalLinkAlt aria-hidden="true" />
                        </a>
                      )}
                      <div className="mt-4 flex justify-end">
                        {renderProductActions(product)}
                      </div>
                    </article>
                  ))}
                </div>

                <div className="hidden overflow-x-auto sm:block">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Produkt</th>
                        <th className="px-4 py-3">Cena</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Link</th>
                        <th className="px-4 py-3 text-right">Akcje</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {visibleProducts.map((product, index) => (
                        <tr key={getProductKey(product, index)} className="hover:bg-slate-50">
                          <td className="max-w-xs px-4 py-3">
                            <span className="block truncate font-medium text-slate-900" title={product.name}>
                              {product.name}
                            </span>
                            {product.note && (
                              <span className="mt-1 block truncate text-xs text-slate-500" title={product.note}>
                                {product.note}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="price-badge">{product.price} PLN</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              {product.unsynced && <span className="status-badge">Offline</span>}
                              {product.isFavorite && (
                                <span className="status-badge bg-rose-50 text-rose-700 ring-rose-200">
                                  Ulubiony
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {product.link ? (
                              <a
                                href={product.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 font-medium text-sky-700 hover:text-sky-900 hover:underline"
                              >
                                Otwórz
                                <FaExternalLinkAlt aria-hidden="true" />
                              </a>
                            ) : (
                              <span className="text-slate-400">Brak</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end">{renderProductActions(product)}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteProduct}
        item={productToDelete?.name || ""}
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

      <NoteModal
        isOpen={isNoteModalOpen}
        initialNote={note}
        onSave={handleSaveNote}
        onClose={() => setIsNoteModalOpen(false)}
      />

      <Modal
        isOpen={isEditProductModalOpen}
        title="Edytuj produkt"
        onClose={() => setIsEditProductModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="btn-secondary px-4 py-2"
              onClick={() => setIsEditProductModalOpen(false)}
            >
              Anuluj
            </button>
            <button type="button" className="btn-primary px-4 py-2" onClick={handleSaveEditProduct}>
              Zapisz zmiany
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="block">
            <span className="form-label">Nazwa produktu</span>
            <input
              type="text"
              value={editProductName}
              onChange={(e) => {
                setEditProductName(e.target.value);
                setEditError("");
              }}
              className="form-input mt-1"
            />
          </label>
          <label className="block">
            <span className="form-label">Cena</span>
            <input
              type="number"
              value={editProductPrice}
              onChange={(e) => setEditProductPrice(e.target.value)}
              className="form-input mt-1"
            />
          </label>
          <label className="block">
            <span className="form-label">Link do produktu</span>
            <input
              type="url"
              value={editProductLink}
              onChange={(e) => setEditProductLink(e.target.value)}
              className="form-input mt-1"
            />
          </label>
          <label className="block">
            <span className="form-label">Notatka</span>
            <textarea
              value={editProductNote}
              onChange={(e) => setEditProductNote(e.target.value)}
              className="form-input mt-1 min-h-24"
            />
          </label>
          {editError && <p className="text-sm font-medium text-rose-600">{editError}</p>}
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(reminderProduct)}
        title="Dodaj przypomnienie"
        onClose={() => setReminderProduct(null)}
        footer={
          <>
            <button
              type="button"
              className="btn-secondary px-4 py-2"
              onClick={() => setReminderProduct(null)}
            >
              Anuluj
            </button>
            <button type="button" className="btn-primary px-4 py-2" onClick={handleAddProductReminder}>
              Dodaj przypomnienie
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Produkt: <span className="font-semibold text-slate-900">{reminderProduct?.name}</span>
          </p>
          <label className="block">
            <span className="form-label">Przypomnij za ile dni</span>
            <input
              type="number"
              min="1"
              max="1000"
              value={reminderFrequency}
              onChange={(event) => {
                setReminderFrequency(event.target.value);
                setReminderError("");
              }}
              className="form-input mt-1"
            />
          </label>
          {reminderError && (
            <p className="text-sm font-medium text-rose-600">{reminderError}</p>
          )}
        </div>
      </Modal>
    </section>
  );
};

export default ProductList;
