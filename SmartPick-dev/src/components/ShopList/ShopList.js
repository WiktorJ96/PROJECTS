import React, { useState } from "react";
import FavoriteProductsModal from "./FavoriteProductsModal";
import { FaHeart } from "react-icons/fa";

const ShopList = ({ shops, onSelectShop, onAddShop }) => {
  console.log("Lista sklepów:", shops);

  const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState(false);

  // Pobieramy ulubione produkty z notatkami
  const favoriteProducts = shops.flatMap((shop) =>
    shop.products
      .filter((product) => product.isFavorite)
      .map((product) => ({
        ...product,
        note: product.note || "", // Dodajemy notatkę (jeśli istnieje)
      }))
  );

  return (
    <section
      id="menuSection"
      className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-lg p-7 mb-8 text-lg font-medium"
      aria-labelledby="shopListTitle"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <h2 id="shopListTitle" className="text-3xl font-bold text-blue-800">
            Twoje sklepy
          </h2>
          <button
            onClick={() => setIsFavoritesModalOpen(true)}
            aria-label="Pokaż ulubione produkty"
            className="text-red-500 hover:text-red-600 transition duration-200"
          >
            <FaHeart size={24} />
          </button>
        </div>
        <button
          onClick={onAddShop}
          className="bg-blue-600 text-white p-3 rounded-full shadow-md hover:bg-blue-700 transition-transform transform hover:scale-110"
          aria-label="Dodaj sklep"
        >
          <i className="fas fa-plus text-xl"></i>
        </button>
      </div>

      <div className="custom-scrollbar overflow-x-auto pb-4">
        <ul className="flex space-x-4">
          {shops.map((shop) => (
            <li
              key={shop.id}
              className="flex items-center space-x-3 bg-white p-3 rounded-lg shadow-md border border-blue-200 cursor-pointer hover:bg-blue-50 hover:shadow-lg transition duration-200 transform"
              onClick={() => onSelectShop(shop)}
              style={{ userSelect: "none" }}
              aria-label={`Wybierz sklep ${shop.name || "Brak nazwy"}`}
            >
              <span className="text-blue-700 font-semibold text-lg">
                {shop.name || "Brak nazwy"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal z ulubionymi produktami */}
      {isFavoritesModalOpen && (
        <FavoriteProductsModal
          onClose={() => setIsFavoritesModalOpen(false)}
          favoriteProducts={favoriteProducts} // Przekazujemy notatki
        />
      )}
    </section>
  );
};

export default ShopList;
