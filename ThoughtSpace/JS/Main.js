import { NoteApp } from "./NoteApp.js";

window.addEventListener("appinstalled", (evt) => {});

window.addEventListener("storage", function (e) {});

document.addEventListener("DOMContentLoaded", () => {
  window.noteApp = new NoteApp();
});

const preferredLanguage = localStorage.getItem("preferredLanguage") || "pl";
setLanguage(preferredLanguage);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then((registration) => {
        console.log("Service Worker zarejestrowany pomyślnie:", registration);
      })
      .catch((error) => {
        console.error("Błąd podczas rejestracji Service Worker:", error);
        console.error("Stack:", error.stack);
        console.error("Filename:", error.filename);
        console.error("Line number:", error.lineno);
      });
  });
}
