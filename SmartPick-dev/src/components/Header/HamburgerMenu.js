import React, { useState } from "react";
import {
  FaBars,
  FaTimes,
  FaCreditCard,
  FaHome,
  FaUserAlt,
} from "react-icons/fa";

const HamburgerMenu = ({ openAddCardModal }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Przycisk otwierający menu */}
      <button
        onClick={toggleMenu}
        className="text-white border border-white rounded-full p-2"
        aria-label="Toggle menu"
      >
        {isOpen ? <FaTimes size={25} /> : <FaBars size={25} />}
      </button>

      {/* Menu boczne */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-lg p-6 z-50 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-500 ease-in-out rounded-r-lg`}
      >
        <nav>
          <ul className="flex flex-col space-y-6 text-gray-800">
            {/* Elementy menu */}
            <li
              className="flex items-center space-x-4 text-lg font-medium hover:text-blue-500 cursor-pointer transition-transform duration-200 hover:scale-105"
              onClick={() => {
                openAddCardModal();
                toggleMenu();
              }}
            >
              <FaCreditCard className="text-blue-500 hover:rotate-6 transition-transform duration-300" />
              <span>Dodaj kartę płatniczą</span>
            </li>
          </ul>
        </nav>
      </div>

      {/* Zaciemnienie tła */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMenu}
          aria-label="Close menu by clicking outside"
        ></div>
      )}
    </>
  );
};

export default HamburgerMenu;
