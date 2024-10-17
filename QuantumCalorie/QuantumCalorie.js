document.addEventListener("DOMContentLoaded", function () {
  const calculateButton = document.getElementById("calculateButton");
  const form = document.getElementById("kalkulatorForm");
  const inputs = form.querySelectorAll("input, select");

  window.addEventListener("load", function () {
    setTimeout(function () {
      const loadingScreen = document.getElementById("loading-screen");
      loadingScreen.classList.add("fade-out");
      setTimeout(function () {
        loadingScreen.style.display = "none";
      }, 500);
    }, 3000);
  });

  document.getElementById("resetButton").addEventListener("click", function () {
    document.querySelector(".resultcontainer").style.display = "none";
    checkFormValidity();
  });

  function scrollToBottom() {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  }

  function checkFormValidity() {
    let isValid = true;
    inputs.forEach((input) => {
      if (!input.value) {
        isValid = false;
      }
    });
    calculateButton.disabled = !isValid;
  }

  inputs.forEach((input) => {
    input.addEventListener("input", checkFormValidity);
  });

  function getTranslations() {
    const lang = localStorage.getItem("preferredLanguage") || "pl";
    const translations = {
      pl: {
        result_text: "Twoje zapotrzebowanie kaloryczne wynosi: ",
        protein: "Białko: ",
        fats: "Tłuszcze: ",
        carbs: "Węglowodany: ",
      },
      en: {
        result_text: "Your calorie requirement is: ",
        protein: "Protein: ",
        fats: "Fats: ",
        carbs: "Carbohydrates: ",
      },
    };
    return translations[lang] || translations.pl;
  }

  function obliczWszystko() {
    const masaCiala = parseFloat(document.getElementById("masaCiala").value);
    const wzrost = parseFloat(document.getElementById("wzrost").value);
    const wiek = parseFloat(document.getElementById("wiek").value);
    const plec = document.getElementById("plec").value;
    const aktywnosc = parseFloat(document.getElementById("aktywnosc").value);
    const stylZywienia = document.getElementById("stylZywienia").value;
    const opcjeSpecjalne = document.getElementById("opcjeSpecjalne").value;

    let ppm,
      bialko,
      tluszcze,
      weglowodany,
      bialkoPct,
      tluszczePct,
      weglowodanyPct;

    if (plec === "kobieta") {
      ppm =
        (655.1 + 9.563 * masaCiala + 1.85 * wzrost - 4.676 * wiek) * aktywnosc;
    } else {
      ppm =
        (66.473 + 13.752 * masaCiala + 5.003 * wzrost - 6.775 * wiek) *
        aktywnosc;
    }

    if (stylZywienia === "dietaZrownowazona") {
      if (opcjeSpecjalne === "redukcja") {
        ppm -= 300;
        bialkoPct = 25;
        tluszczePct = 20;
        weglowodanyPct = 55;
      } else if (opcjeSpecjalne === "masa") {
        ppm += 300;
        bialkoPct = 20;
        tluszczePct = 25;
        weglowodanyPct = 55;
      } else {
        bialkoPct = 20;
        tluszczePct = 25;
        weglowodanyPct = 55;
      }
    } else if (stylZywienia === "dietaKeto") {
      if (opcjeSpecjalne === "redukcja") {
        ppm -= 300;
        bialkoPct = 20;
        tluszczePct = 75;
        weglowodanyPct = 5;
      } else if (opcjeSpecjalne === "masa") {
        ppm += 300;
        bialkoPct = 20;
        tluszczePct = 75;
        weglowodanyPct = 5;
      } else {
        bialkoPct = 20;
        tluszczePct = 75;
        weglowodanyPct = 5;
      }
    }

    bialko = (ppm * bialkoPct) / 100 / 4;
    tluszcze = (ppm * tluszczePct) / 100 / 9;
    weglowodany = (ppm * weglowodanyPct) / 100 / 4;

    document.getElementById("wynik").dataset.ppm = ppm;
    document.getElementById("makroBialko").dataset.grams = bialko;
    document.getElementById("makroBialko").dataset.percent = bialkoPct;
    document.getElementById("makroTluszcze").dataset.grams = tluszcze;
    document.getElementById("makroTluszcze").dataset.percent = tluszczePct;
    document.getElementById("makroWeglowodany").dataset.grams = weglowodany;
    document.getElementById("makroWeglowodany").dataset.percent =
      weglowodanyPct;

    const translations = getTranslations();

    document.getElementById("wynik").textContent =
      translations.result_text + ppm.toFixed(0) + " kcal.";
    document.getElementById("makroBialko").textContent =
      translations.protein + bialko.toFixed(0) + " g - " + bialkoPct + "%";
    document.getElementById("makroTluszcze").textContent =
      translations.fats + tluszcze.toFixed(0) + " g - " + tluszczePct + "%";
    document.getElementById("makroWeglowodany").textContent =
      translations.carbs +
      weglowodany.toFixed(0) +
      " g - " +
      weglowodanyPct +
      "%";

    document.querySelector(".resultcontainer").style.display = "block";

    setTimeout(scrollToBottom, 100);
  }

  calculateButton.addEventListener("click", obliczWszystko);
  checkFormValidity();

  
  document.getElementById("lang-pl").addEventListener("click", function () {
    localStorage.setItem("preferredLanguage", "pl");
    setActiveLanguageButton();
    if (document.querySelector(".resultcontainer").style.display === "block") {
      obliczWszystko(); 
    }
  });

  document.getElementById("lang-en").addEventListener("click", function () {
    localStorage.setItem("preferredLanguage", "en");
    setActiveLanguageButton();
    if (document.querySelector(".resultcontainer").style.display === "block") {
      obliczWszystko(); 
    }
  });

  function setActiveLanguageButton() {
    const currentLang = localStorage.getItem("preferredLanguage") || "pl";
    document
      .getElementById("lang-pl")
      .classList.toggle("active", currentLang === "pl");
    document
      .getElementById("lang-en")
      .classList.toggle("active", currentLang === "en");
  }

  setActiveLanguageButton(); 
});
