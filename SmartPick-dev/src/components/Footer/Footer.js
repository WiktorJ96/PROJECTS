import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white text-center overflow-hidden max-h-6 group transition-all duration-300 ease-in-out">
      <div className="opacity-80 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
        <p>&copy; {currentYear} SmartPick</p>
        <div className="hidden group-hover:flex flex-col items-center mt-2 space-y-2 text-sm">
          <a href="/privacy" className="text-gray-400 hover:text-white">
            Polityka Prywatności
          </a>
          <a href="/terms" className="text-gray-400 hover:text-white">
            Regulamin
          </a>
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white"
          >
            Facebook
          </a>
          <a
            href="https://www.twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white"
          >
            Twitter
          </a>
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white"
          >
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
