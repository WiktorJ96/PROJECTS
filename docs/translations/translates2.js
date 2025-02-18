const translations = {
  pl: {},
  en: {},
};

function fetchTranslations(lang) {
  const page = document.body.getAttribute("data-page") || "default";
  const paths = [
    `../translations/${page}-${lang}.json`,
    `./translations/${page}-${lang}.json`,
    `/translations/${page}-${lang}.json`,
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

export function loadTranslations(lang) {
  return fetchTranslations(lang).then((data) => {
    translations[lang] = data;
    updateTranslations();
  });
}

export function setLanguage(lang) {
  localStorage.setItem("preferredLanguage", lang);
  loadTranslations(lang);
  updateLanguageButtons(lang);
  document.dispatchEvent(
    new CustomEvent("languageChanged", { detail: { language: lang } })
  );
}

export function loadPreferredLanguage() {
  const lang = localStorage.getItem("preferredLanguage") || "pl";
  loadTranslations(lang);
  updateLanguageButtons(lang);
}

export function translate(key) {
  const lang = localStorage.getItem("preferredLanguage") || "pl";
  return translations[lang][key] || key;
}

export function updateTranslations() {
  const lang = localStorage.getItem("preferredLanguage") || "pl";

  document.querySelectorAll("[data-lang-key]").forEach((element) => {
    const key = element.getAttribute("data-lang-key");
    const translated = translate(key);
    if (element.innerHTML !== translated) {
      element.innerHTML = translated;
    }
  });

  document.querySelectorAll("[data-placeholder-key]").forEach((element) => {
    const key = element.getAttribute("data-placeholder-key");
    const translated = translate(key);
    if (element.getAttribute("placeholder") !== translated) {
      element.setAttribute("placeholder", translated);
    }
  });

  document.querySelectorAll("select option").forEach((option) => {
    const key = option.getAttribute("data-lang-key");
    if (key) {
      const translated = translate(key);
      if (option.textContent !== translated) {
        option.textContent = translated;
      }
    }
  });

  document.documentElement.lang = lang;
}

function updateLanguageButtons(lang) {
  const langPl = document.getElementById("lang-pl");
  const langEn = document.getElementById("lang-en");

  if (langPl) langPl.classList.remove("active");
  if (langEn) langEn.classList.remove("active");

  if (lang === "pl" && langPl) {
    langPl.classList.add("active");
  } else if (lang === "en" && langEn) {
    langEn.classList.add("active");
  }
}

export function addLanguageListeners() {
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

document.addEventListener("DOMContentLoaded", () => {
  loadPreferredLanguage();
  addLanguageListeners();
});
