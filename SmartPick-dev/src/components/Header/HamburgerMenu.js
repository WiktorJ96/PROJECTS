import React, { useState } from "react";
import { FaBars, FaTimes, FaCreditCard, FaHeart, FaStar } from "react-icons/fa";
import FavoriteModal from "../FavouriteModal/FavoriteModal";

const HamburgerMenu = ({
  shops = [],
  openAddCardModal,
  handleSelectShop,
  closeHamburgerMenu,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState(false);
  const [isFavoriteShopsModalOpen, setIsFavoriteShopsModalOpen] =
    useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const favoriteProducts = shops.flatMap((shop) =>
    (shop.products || [])
      .filter((product) => product.isFavorite)
      .map((product) => ({ ...product, shopName: product.shopName || shop.name }))
  );
  const favoriteShops = shops.filter((shop) => shop.isFavorite);

  const openFavoritesModal = () => setIsFavoritesModalOpen(true);
  const closeFavoritesModal = () => setIsFavoritesModalOpen(false);

  const openFavoriteShopsModal = () => setIsFavoriteShopsModalOpen(true);
  const closeFavoriteShopsModal = () => setIsFavoriteShopsModalOpen(false);

  return (
    <>
      {/* Przycisk otwierający menu */}
      <button
        type="button"
        onClick={toggleMenu}
        className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-slate-300 text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
        aria-label={isOpen ? "Zamknij menu" : "Otwórz menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
      </button>

      {/* Menu boczne */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-72 transform border-r border-slate-200 bg-white p-5 shadow-xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <nav aria-label="Menu aplikacji">
          <div className="mb-6 flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Menu
            </span>
            <button
              type="button"
              onClick={toggleMenu}
              className="icon-button"
              aria-label="Zamknij menu"
            >
              <FaTimes aria-hidden="true" />
            </button>
          </div>
          <ul className="flex flex-col gap-2 text-slate-800">
            <li>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-base font-medium transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              onClick={() => {
                openAddCardModal();
                toggleMenu();
              }}
            >
              <FaCreditCard className="text-sky-600" aria-hidden="true" />
              <span>Dodaj kartę płatniczą</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-3 text-left text-base font-medium transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                onClick={openFavoritesModal}
              >
                <span className="flex items-center gap-3">
                  <FaHeart className="text-rose-500" aria-hidden="true" />
                  <span>Ulubione produkty</span>
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {favoriteProducts.length}
                </span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-3 text-left text-base font-medium transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                onClick={openFavoriteShopsModal}
              >
                <span className="flex items-center gap-3">
                  <FaStar className="text-amber-400" aria-hidden="true" />
                  <span>Ulubione sklepy</span>
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {favoriteShops.length}
                </span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Zaciemnienie tła */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={toggleMenu}
          aria-label="Zamknij menu klikając poza nim"
        ></div>
      )}

      {/* Modal z ulubionymi produktami */}
      {isFavoritesModalOpen && (
        <FavoriteModal
          onClose={closeFavoritesModal}
          favoriteItems={favoriteProducts} // Produkty
          type="products"
        />
      )}

      {/* Modal z ulubionymi sklepami */}
      {isFavoriteShopsModalOpen && (
        <FavoriteModal
          onClose={closeFavoriteShopsModal}
          favoriteItems={favoriteShops} // Ulubione sklepy
          type="shops"
          onSelectShop={(shop) => {
            handleSelectShop(shop);
            closeFavoriteShopsModal();
            toggleMenu(); // Zamknięcie menu hamburgerowego
          }}
        />
      )}
    </>
  );
};

export default HamburgerMenu;
