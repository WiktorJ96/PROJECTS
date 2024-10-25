import React from "react";

const ShopList = ({ shops, onSelectShop, onAddShop }) => {
  // W ShopList.js, przed return
  console.log("Lista sklepów:", shops);

  return (
    <section
      id="menuSection"
      className="bg-white rounded-lg shadow-lg p-6 mb-8"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Twoje sklepy</h2>
        <button onClick={onAddShop} className="btn-primary rounded-full p-3">
          <i className="fas fa-plus"></i>
        </button>
      </div>
      <div className="custom-scrollbar overflow-x-auto">
        <ul className="flex space-x-4 pb-2">
          {shops.map((shop) => (
            <li
              key={shop.id}
              className="shop-item flex items-center space-x-2 bg-slate-100 p-2 rounded"
            >
              <span
                className="cursor-pointer"
                style={{ userSelect: "none" }}
                onClick={() => onSelectShop(shop)}
              >
                {shop.name || "Brak nazwy"}{" "}
                {/* Dodaj sprawdzenie, czy shop.name istnieje */}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default ShopList;
