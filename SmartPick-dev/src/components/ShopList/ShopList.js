import React from "react";
import { FaPlus, FaStar } from "react-icons/fa";

const ShopList = ({ shops, selectedShopId, onSelectShop, onAddShop }) => {
  return (
    <section
      id="menuSection"
      className="rounded-lg border border-slate-200 bg-white p-5 text-base font-medium shadow-sm sm:p-6"
      aria-labelledby="shopListTitle"
    >
      <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h2
          id="shopListTitle"
          className="text-xl font-semibold text-slate-900 sm:text-2xl"
        >
          Twoje sklepy
        </h2>
        <button
          type="button"
          onClick={onAddShop}
          className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
          aria-label="Dodaj sklep"
        >
          <FaPlus aria-hidden="true" />
          Dodaj sklep
        </button>
      </div>

      {shops.length > 0 ? (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {shops.map((shop) => {
            const isActive = selectedShopId === shop.id;
            const productCount = shop.products?.length || 0;

            return (
              <li key={shop.id}>
                <button
                  type="button"
                  onClick={() => onSelectShop(shop)}
                  className={`group flex min-h-24 w-full flex-col justify-between rounded-lg border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${
                    isActive
                      ? "border-sky-500 bg-sky-50 shadow-sm"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                  }`}
                  aria-pressed={isActive}
                  aria-label={`Wybierz sklep ${shop.name || "Brak nazwy"}`}
                  title={shop.name || "Brak nazwy"}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="min-w-0 truncate text-base font-semibold text-slate-900">
                      {shop.name || "Brak nazwy"}
                    </span>
                    {shop.isFavorite && (
                      <FaStar
                        className="mt-1 flex-shrink-0 text-amber-400"
                        aria-label="Ulubiony sklep"
                      />
                    )}
                  </span>
                  <span className="mt-4 inline-flex w-fit rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                    {productCount} {productCount === 1 ? "produkt" : "produktów"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <p className="text-sm text-slate-600">
            Nie masz jeszcze żadnego sklepu.
          </p>
          <button
            type="button"
            onClick={onAddShop}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
          >
            <FaPlus aria-hidden="true" />
            Dodaj pierwszy sklep
          </button>
        </div>
      )}
    </section>
  );
};

export default ShopList;
