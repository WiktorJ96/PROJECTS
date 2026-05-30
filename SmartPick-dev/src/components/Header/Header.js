import React from "react";
import { ReactComponent as MyIcon } from "./SmartPick-logo.svg";
import HamburgerMenu from "./HamburgerMenu";

const Header = ({ shops, openAddCardModal, handleSelectShop }) => {
  return (
    <header
      className="border-b border-slate-200 bg-white px-4 py-3 shadow-sm"
      aria-label="SmartPick header"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex-shrink-0">
          <HamburgerMenu
            shops={shops}
            openAddCardModal={openAddCardModal}
            handleSelectShop={handleSelectShop}
          />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <a href="/" className="flex items-center">
            <MyIcon
              width="170"
              height="72"
              className="block max-h-16"
              aria-label="SmartPick logo"
            />
          </a>
        </div>
        <div className="flex-shrink-0 w-10"></div>
      </div>
    </header>
  );
};

export default Header;
