import React from "react";
import { ReactComponent as MyIcon } from "./SmartPick-logo.svg";
import HamburgerMenu from "./HamburgerMenu";

const Header = ({ shops, openAddCardModal, handleSelectShop }) => {
  return (
    <header
      className="header shadow-md p-4 bg-gradient-to-r from-blue-500 to-purple-700"
      aria-label="SmartPick header"
    >
      <div className="flex items-center justify-between">
        {/* Hamburger Menu Button and Sidebar */}
        <HamburgerMenu
          shops={shops}
          openAddCardModal={openAddCardModal} // Poprawne przekazanie funkcji
          handleSelectShop={handleSelectShop} // Przekazanie funkcji do obsługi wyboru sklepu
        />

        {/* Logo and App Name */}
        <a href="/" className="flex items-center space-x-4 ml-4">
          <MyIcon
            width="80"
            height="80"
            className="header-icon"
            aria-label="SmartPick logo"
          />
          <h1 className="text-center text-4xl font-semibold text-white tracking-wide">
            SmartPick
          </h1>
        </a>

        {/* Placeholder div to center the logo */}
        <div className="w-10"></div>
      </div>
    </header>
  );
};

export default Header;
