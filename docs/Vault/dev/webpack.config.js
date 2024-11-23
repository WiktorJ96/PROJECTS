import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import HtmlMinimizerPlugin from "html-minimizer-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import Dotenv from "dotenv-webpack"; // Obsługa pliku .env

export default {
  mode: "production", // Tryb produkcyjny
  entry: "./src/Main.js", // Główny plik JS
  output: {
    filename: "scripts/bundle.js", // Wynikowy plik JS
    path: path.resolve(process.cwd(), "../public"), // Folder wynikowy
    clean: true, // Usuwa stare pliki przed budową
  },
  module: {
    rules: [
      {
        test: /\.css$/, // Obsługa plików CSS
        use: [MiniCssExtractPlugin.loader, "css-loader"], // Wyodrębnianie i przetwarzanie CSS
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/, // Obsługa obrazów
        type: "asset/resource",
        generator: {
          filename: "assets/[name][ext]", // Przenosi obrazy do `assets/`
        },
      },
      {
        test: /\.js$/, // Obsługa plików JavaScript
        exclude: /node_modules/, // Wyklucza node_modules
        use: {
          loader: "babel-loader", // Transpilacja za pomocą Babel
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/Vault.html", // Oryginalny szablon HTML
      filename: "index.html", // Nazwa wynikowego pliku HTML
      inject: "body",
    }),
    new MiniCssExtractPlugin({
      filename: "styles/main.css", // Gdzie będą zapisane pliki CSS
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "./src/manifest.json", to: "manifest.json" }, // Kopiowanie manifest.json
        { from: "./src/service-worker.js", to: "service-worker.js" }, // Kopiowanie service-worker.js
        { from: "./server.js", to: "server.js" }, // Kopiowanie server.js
        { from: "./src/assets", to: "assets" }, // Kopiowanie folderu assets/
        { from: "./src/translates", to: "translates" }, // Kopiowanie folderu translates/
      ],
    }),
    new Dotenv({ path: "./src/.env" }), // Ładuje zmienne środowiskowe z .env
  ],
  optimization: {
    minimize: true, // Minimalizacja
    minimizer: [
      new TerserPlugin(), // Minimalizacja JS
      new CssMinimizerPlugin(), // Minimalizacja CSS
      new HtmlMinimizerPlugin(), // Minimalizacja HTML
    ],
  },
};
