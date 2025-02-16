import React from "react";

const ShopList = ({ shops, onSelectShop, onAddShop }) => {
  console.log("Lista sklepów:", shops);

  return (
    <section
      id="menuSection"
      className="bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 rounded-lg shadow-lg p-6 sm:p-8 mb-8 text-base font-medium"
      aria-labelledby="shopListTitle"
    >
      {/* Nagłówek sekcji */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2
          id="shopListTitle"
          className="text-2xl sm:text-3xl font-bold text-blue-800 mb-4 sm:mb-0"
        >
          Twoje sklepy
        </h2>
        <button
          onClick={onAddShop}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-full shadow-md hover:bg-blue-700 transition transform hover:scale-105"
          aria-label="Dodaj sklep"
        >
          <i className="fas fa-plus text-xl mr-2"></i>
          Dodaj sklep
        </button>
      </div>

      {/* Lista sklepów w responsywnej siatce */}
      <div className="overflow-auto">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {shops.map((shop) => (
            <li
              key={shop.id}
              onClick={() => onSelectShop(shop)}
              className="relative group bg-white p-4 rounded-md shadow border border-gray-200 cursor-pointer hover:bg-gray-50 transition transform hover:scale-102"
              style={{ userSelect: "none" }}
              aria-label={`Wybierz sklep ${shop.name || "Brak nazwy"}`}
            >
              <span className="block text-gray-700 font-semibold text-sm sm:text-base truncate">
                {shop.name || "Brak nazwy"}
              </span>
              {shop.name && shop.name.length > 20 && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-700 text-white text-xs rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                  {shop.name}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default ShopList;
