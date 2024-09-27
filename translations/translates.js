document.addEventListener("DOMContentLoaded", function () {
  const translations = {
    pl: {},
    en: {},
  };

  function fetchTranslations(lang) {
    const page = document.body.getAttribute("data-page");
    const paths = [
      `../translations/${page}-${lang}.json`,
      `./translations/${page}-${lang}.json`,
    ];

    const fetchPromises = paths.map((path) =>
      fetch(path).then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
    );

    return Promise.any(fetchPromises).catch((error) => {
      console.error(`Error loading translations for ${lang}:`, error);
      return {};
    });
  }

  function loadTranslations(lang) {
    return fetchTranslations(lang).then((data) => {
      translations[lang] = data;
      translatePage(lang);
    });
  }

  function setLanguage(lang) {
    localStorage.setItem("preferredLanguage", lang);
    loadTranslations(lang);
    updateLanguageButtons(lang); // Dodajemy wywołanie tej funkcji, aby ustawić aktywny przycisk
  }

  function loadPreferredLanguage() {
    const lang = localStorage.getItem("preferredLanguage") || "pl";
    loadTranslations(lang);
    updateLanguageButtons(lang); // Dodajemy wywołanie tej funkcji, aby ustawić aktywny przycisk przy ładowaniu strony
  }

  function translatePage(lang) {
    document.querySelectorAll("[data-lang-key]").forEach((element) => {
      const key = element.getAttribute("data-lang-key");
      if (translations[lang][key]) {
        element.innerHTML = translations[lang][key];
      } else {
        console.warn(`Missing translation for key: ${key}`);
        element.innerHTML = `[${key}]`;
      }
    });
    document.querySelectorAll("[data-placeholder-key]").forEach((element) => {
      const key = element.getAttribute("data-placeholder-key");
      if (translations[lang][key]) {
        element.placeholder = translations[lang][key];
      } else {
        console.warn(`Missing placeholder translation for key: ${key}`);
      }
    });
    document.querySelectorAll("select option").forEach((option) => {
      const key = option.getAttribute("data-lang-key");
      if (translations[lang][key]) {
        option.textContent = translations[lang][key];
      } else if (key) {
        console.warn(`Missing option translation for key: ${key}`);
        option.textContent = `[${key}]`;
      }
    });
    document.documentElement.lang = lang;
  }

  function addLanguageListeners() {
    const langPl = document.getElementById("lang-pl");
    const langEn = document.getElementById("lang-en");

    if (langPl) {
      langPl.addEventListener("click", () => setLanguage("pl"));
    } else {
      console.warn("Polish language button not found");
    }

    if (langEn) {
      langEn.addEventListener("click", () => setLanguage("en"));
    } else {
      console.warn("English language button not found");
    }
  }

  function updateLanguageButtons(lang) {
    // Pobieramy przyciski
    const langPl = document.getElementById("lang-pl");
    const langEn = document.getElementById("lang-en");

    // Najpierw usuwamy klasę 'active' z obu przycisków
    if (langPl) langPl.classList.remove("active");
    if (langEn) langEn.classList.remove("active");

    // Następnie dodajemy klasę 'active' do przycisku w zależności od wybranego języka
    if (lang === "pl" && langPl) {
      langPl.classList.add("active");
    } else if (lang === "en" && langEn) {
      langEn.classList.add("active");
    }
  }

  addLanguageListeners();
  loadPreferredLanguage();
});
