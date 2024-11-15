import React, { useEffect } from "react";

const FavoriteProductsModal = ({
  onClose,
  favoriteItems,
  type,
  onSelectShop,
}) => {
  useEffect(() => {
    console.log(`Dane ulubionych ${type} w modalu:`, favoriteItems);
    document.body.classList.add("overflow-hidden");
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [favoriteItems, type]);

  const renderContent = () => {
    if (favoriteItems.length > 0) {
      return favoriteItems.map((item, index) => (
        <div
          key={index}
          className={`border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-200 cursor-pointer ${
            type === "shops" ? "hover:bg-gray-100" : ""
          }`}
          onClick={type === "shops" ? () => onSelectShop(item) : undefined}
        >
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {item.name.length > 30
              ? `${item.name.substring(0, 30)}...`
              : item.name}
          </h3>
          {type === "products" && (
            <>
              <p className="text-sm text-gray-700 mt-2">
                Cena: <span className="font-medium">{item.price} PLN</span>
              </p>
              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-2 text-blue-500 hover:text-blue-700 hover:underline text-sm"
                >
                  Zobacz produkt
                </a>
              )}
              {item.note && (
                <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded mt-3">
                  <span className="font-semibold">Notatka:</span> {item.note}
                </p>
              )}
            </>
          )}
        </div>
      ));
    }
    return (
      <p className="text-center text-gray-500">
        Brak ulubionych {type === "products" ? "produktów" : "sklepów"}.
      </p>
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-60 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-xl w-full relative">
        {/* Header modala */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Ulubione {type === "products" ? "produkty" : "sklepy"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition-colors duration-150"
            aria-label="Zamknij modal"
          >
            ✕
          </button>
        </div>

        {/* Lista ulubionych */}
        <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {renderContent()}
        </div>

        {/* Stopka modala */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};

export default FavoriteProductsModal;
