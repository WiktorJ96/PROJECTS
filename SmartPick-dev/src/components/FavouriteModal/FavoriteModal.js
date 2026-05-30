import React from "react";
import Modal from "../Modal/Modal";
import { FaExternalLinkAlt, FaStore } from "react-icons/fa";

const FavoriteProductsModal = ({ onClose, favoriteItems, type, onSelectShop }) => {
  const isProducts = type === "products";

  const renderContent = () => {
    if (favoriteItems.length === 0) {
      return (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
          Brak ulubionych {isProducts ? "produktów" : "sklepów"}.
        </div>
      );
    }

    return (
      <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
        {favoriteItems.map((item, index) => {
          const content = (
            <>
              <div className="flex items-start justify-between gap-3">
                <h3 className="min-w-0 truncate text-base font-semibold text-slate-900">
                  {item.name}
                </h3>
                {!isProducts && <FaStore className="mt-1 text-sky-600" aria-hidden="true" />}
              </div>
              {item.shopName && (
                <p className="mt-1 text-sm text-slate-600">
                  Sklep: <span className="font-medium">{item.shopName}</span>
                </p>
              )}
              {isProducts && (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className="price-badge">{item.price} PLN</span>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 hover:text-sky-900 hover:underline"
                    >
                      Otwórz
                      <FaExternalLinkAlt aria-hidden="true" />
                    </a>
                  )}
                </div>
              )}
              {item.note && (
                <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                  {item.note}
                </p>
              )}
            </>
          );

          if (!isProducts) {
            return (
              <button
                key={item.id || index}
                type="button"
                onClick={() => onSelectShop?.(item)}
                className="w-full rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {content}
              </button>
            );
          }

          return (
            <article
              key={item.id || index}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              {content}
            </article>
          );
        })}
      </div>
    );
  };

  return (
    <Modal
      isOpen
      title={`Ulubione ${isProducts ? "produkty" : "sklepy"}`}
      onClose={onClose}
      maxWidth="max-w-xl"
      footer={
        <button type="button" onClick={onClose} className="btn-primary px-4 py-2">
          Zamknij
        </button>
      }
    >
      {renderContent()}
    </Modal>
  );
};

export default FavoriteProductsModal;
