import React from "react";
import { ReactComponent as MyIcon } from "./SmartPick-logo.svg";
import HamburgerMenu from "./HamburgerMenu";

const Header = ({ shops, openAddCardModal, handleSelectShop }) => {
  return (
    <header
      className="bg-gradient-to-r from-blue-500 to-purple-700 shadow-md p-4"
      aria-label="SmartPick header"
    >
      <div className="flex items-center justify-between">
        {/* Hamburger Menu – bez containera, przyklejone do lewej */}
        <div className="flex-shrink-0">
          <HamburgerMenu
            shops={shops}
            openAddCardModal={openAddCardModal}
            handleSelectShop={handleSelectShop}
          />
        </div>
        {/* Logo – wyśrodkowane */}
        <div className="flex-1 flex items-center justify-center">
          <a href="/" className="flex items-center">
            <MyIcon
              width="200"
              height="85"
              className="block"
              aria-label="SmartPick logo"
            />
          </a>
        </div>
        {/* Pusty element dla zachowania symetrii */}
        <div className="flex-shrink-0 w-10"></div>
      </div>
    </header>
  );
};

export default Header;
