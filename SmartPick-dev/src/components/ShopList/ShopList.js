import React from "react";

const ShopList = ({ shops, onSelectShop, onAddShop }) => {
  console.log("Lista sklepów:", shops);

  return (
    <section
      id="menuSection"
      className="bg-white rounded-lg shadow-lg p-6 mb-8"
      aria-labelledby="shopListTitle"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 id="shopListTitle" className="text-2xl font-semibold">
          Twoje sklepy
        </h2>
        <button
          onClick={onAddShop}
          className="btn-primary rounded-full p-3 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Dodaj sklep"
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>
      <div className="custom-scrollbar overflow-x-auto">
        <ul className="flex space-x-4 pb-2">
          {shops.map((shop) => (
            <li
              key={shop.id}
              className="shop-item flex items-center space-x-2 bg-slate-100 p-2 rounded cursor-pointer hover:bg-slate-200"
              onClick={() => onSelectShop(shop)}
              style={{ userSelect: "none" }}
              aria-label={`Wybierz sklep ${shop.name || "Brak nazwy"}`}
            >
              <span>{shop.name || "Brak nazwy"}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default ShopList;
