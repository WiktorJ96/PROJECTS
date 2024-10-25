import React from "react";
import { ReactComponent as MyIcon } from "./SmartPick-logo.svg";

const Header = () => {
  return (
    <header className="header shadow-md p-4 bg-gradient-to-r from-blue-500 to-purple-700">
      <div className="flex items-center justify-center">
        <MyIcon width="120" height="120" />

        <h1 className="text-center text-4xl font-semibold text-white">
          SmartPick
        </h1>
      </div>
    </header>
  );
};

export default Header;
