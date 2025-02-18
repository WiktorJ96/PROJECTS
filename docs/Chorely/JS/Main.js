import { TodoList } from "./ToDoList.js";
import { TodoListUI } from "./TodoListUI.js";
import { PDFGenerator } from "./PDFGenerator.js";
import { PWAHandler } from "./PWAHandler.js";
import { updateTranslations } from "../../translations/translates2.js";

document.addEventListener("DOMContentLoaded", () => {
  // Ustaw MutationObserver, który nasłuchuje zmian w DOM
  const observer = new MutationObserver((mutationsList, observerInstance) => {
    updateTranslations();
  });
  observer.observe(document.body, {
     childList: true,
     subtree: true,
     attributes: true,
   });

  const todoList = new TodoList();
  const todoListUI = new TodoListUI(todoList);
  const pdfGenerator = new PDFGenerator(todoList);
  const pwaHandler = new PWAHandler();

  window.pdfGenerator = pdfGenerator;

  const saveBtn = document.querySelector(".save-btn");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => pdfGenerator.saveTasksToPDF());
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch((error) => {
        console.error("Błąd podczas rejestracji Service Worker:", error);
      });
    });
  }

  window.addEventListener("appinstalled", (evt) => {
    console.log("Aplikacja została zainstalowana");
  });

  window.addEventListener("storage", function (e) {
    console.log("Zmiana w localStorage:", e);
  });
});
