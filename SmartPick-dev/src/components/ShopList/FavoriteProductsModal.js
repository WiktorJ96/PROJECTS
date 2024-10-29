import React, { useEffect } from "react";

const FavoriteProductsModal = ({ onClose, favoriteProducts }) => {
  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
        <h2 className="text-2xl font-semibold mb-4">Ulubione produkty</h2>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          Zamknij
        </button>

        {/* Kontener wewnątrz modala z maksymalną wysokością i przewijaniem */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {favoriteProducts.map((product, index) => (
            <div
              key={index}
              className="border border-gray-300 p-4 rounded-lg shadow-sm"
            >
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-gray-700">Cena: {product.price} PLN</p>
              {product.link && (
                <a
                  href={product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Zobacz produkt
                </a>
              )}
              {/* Wyświetlamy notatkę, jeśli jest dostępna */}
              {product.note && (
                <p className="text-gray-600 mt-2">Notatka: {product.note}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FavoriteProductsModal;
