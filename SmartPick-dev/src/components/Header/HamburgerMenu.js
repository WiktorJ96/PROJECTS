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

  // Zbieramy ulubione produkty i sklepy
  const favoriteProducts = shops.flatMap((shop) =>
    shop.products.filter((product) => product.isFavorite)
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
        onClick={toggleMenu}
        className="text-white border border-white rounded-full p-3 shadow-lg hover:shadow-2xl focus:outline-none"
        aria-label="Toggle menu"
      >
        {isOpen ? <FaTimes size={25} /> : <FaBars size={25} />}
      </button>

      {/* Menu boczne */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl p-8 z-50 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-500 ease-in-out rounded-r-lg`}
      >
        <nav>
          <ul className="flex flex-col space-y-8 text-gray-800">
            <li
              className="flex items-center space-x-4 text-lg font-medium hover:text-blue-600 cursor-pointer transition-transform duration-200 hover:scale-105"
              onClick={() => {
                openAddCardModal();
                toggleMenu();
              }}
            >
              <FaCreditCard className="text-blue-500 hover:rotate-6 transition-transform duration-300" />
              <span>Dodaj kartę płatniczą</span>
            </li>
            <li
              className="flex items-center space-x-4 text-lg font-medium hover:text-red-500 cursor-pointer transition-transform duration-200 hover:scale-105"
              onClick={openFavoritesModal}
            >
              <FaHeart className="text-red-500 hover:rotate-6 transition-transform duration-300" />
              <span>Ulubione produkty</span>
            </li>
            <li
              className="flex items-center space-x-4 text-lg font-medium hover:text-green-500 cursor-pointer transition-transform duration-200 hover:scale-105"
              onClick={openFavoriteShopsModal}
            >
              <FaStar className="text-yellow-500 hover:rotate-6 transition-transform duration-300" />
              <span>Ulubione sklepy</span>
            </li>
          </ul>
        </nav>
      </div>

      {/* Zaciemnienie tła */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={toggleMenu}
          aria-label="Close menu by clicking outside"
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
