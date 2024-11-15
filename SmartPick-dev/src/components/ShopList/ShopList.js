import React from "react";

const ShopList = ({ shops, onSelectShop, onAddShop }) => {
  console.log("Lista sklepów:", shops);

  return (
    <section
      id="menuSection"
      className="bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 rounded-lg shadow-lg p-7 mb-8 text-lg font-medium"
      aria-labelledby="shopListTitle"
    >
      {/* Nagłówek sekcji */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <h2 id="shopListTitle" className="text-3xl font-bold text-blue-800">
            Twoje sklepy
          </h2>
        </div>
        <button
          onClick={onAddShop}
          className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105"
          aria-label="Dodaj sklep"
        >
          <i className="fas fa-plus text-xl"></i> Dodaj sklep
        </button>
      </div>

      {/* Lista sklepów */}
      <div className="custom-scrollbar overflow-visible pb-4">
        <ul className="flex flex-wrap gap-2">
          {shops.map((shop) => (
            <li
              key={shop.id}
              className="relative group inline-flex items-center justify-center bg-gray-50 px-4 py-3 rounded-md shadow-sm border border-gray-300 cursor-pointer hover:bg-gray-100 hover:shadow-md transition duration-150 transform hover:scale-102 min-w-[120px] max-w-[150px] truncate"
              onClick={() => onSelectShop(shop)}
              style={{ userSelect: "none" }}
              aria-label={`Wybierz sklep ${shop.name || "Brak nazwy"}`}
            >
              {/* Nazwa sklepu */}
              <span className="text-gray-700 font-medium text-base truncate">
                {shop.name || "Brak nazwy"}
              </span>

              {/* Tooltip dla długich nazw */}
              {shop.name && shop.name.length > 20 && (
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-700 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
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
