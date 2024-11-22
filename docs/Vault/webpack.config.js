const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const HtmlMinimizerPlugin = require("html-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: "production", // Tryb produkcyjny automatycznie włącza optymalizacje
  entry: "./src/index.js", // Główny plik wejściowy
  output: {
    filename: "bundle.js", // Wynikowy plik JS
    path: path.resolve(__dirname, "dist"), // Folder wyjściowy
    clean: true, // Usuwa stare pliki z folderu `dist` przed budową
  },
  module: {
    rules: [
      {
        test: /\.css$/, // Obsługa plików CSS
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/, // Obsługa obrazów
        type: "asset/resource", // Kopiuje pliki do folderu `dist`
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/Vault.html", // Szablon HTML
      minify: false, // Minimalizacja HTML zostanie wykonana przez HtmlMinimizerPlugin
    }),
    new MiniCssExtractPlugin({
      filename: "Vault.css", // Wynikowy plik CSS
    }),
  ],
  optimization: {
    minimize: true, // Włącza minimalizację
    minimizer: [
      new TerserPlugin(), // Minimalizacja JS
      new CssMinimizerPlugin(), // Minimalizacja CSS
      new HtmlMinimizerPlugin(), // Minimalizacja HTML
    ],
  },
};
