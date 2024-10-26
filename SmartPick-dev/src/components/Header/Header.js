import React from "react";
import { ReactComponent as MyIcon } from "./SmartPick-logo.svg";

const Header = () => {
  return (
    <header
      className="header shadow-md p-4 bg-gradient-to-r from-blue-500 to-purple-700"
      aria-label="SmartPick header"
    >
      <div className="flex items-center justify-center">
        <a href="/" className="flex items-center space-x-4">
          <MyIcon
            width="120"
            height="120"
            className="header-icon"
            aria-label="SmartPick logo"
          />
          <h1 className="text-center text-4xl font-semibold text-white tracking-wide">
            SmartPick
          </h1>
        </a>
      </div>
    </header>
  );
};

export default Header;
