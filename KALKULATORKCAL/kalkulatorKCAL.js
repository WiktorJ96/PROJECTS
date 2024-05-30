document.addEventListener('DOMContentLoaded', function () {
    const translations = {
        "pl": {},
        "en": {}
    };

    function loadTranslations(lang) {
        const page = document.body.getAttribute('data-page');
        fetch(`../translations/${page}-${lang}.json`)
            .then(response => response.json())
            .then(data => {
                translations[lang] = data;
                translatePage(lang);
            })
            .catch(error => console.error(`Error loading translations for ${lang}:`, error));
    }

    function setLanguage(lang) {
        localStorage.setItem('preferredLanguage', lang);
        loadTranslations(lang);
    }

    function loadPreferredLanguage() {
        const lang = localStorage.getItem('preferredLanguage') || 'pl';
        loadTranslations(lang);
    }

    function translatePage(lang) {
        document.querySelectorAll('[data-lang-key]').forEach(element => {
            const key = element.getAttribute('data-lang-key');
            if (translations[lang][key]) {
                element.innerHTML = translations[lang][key];
            }
        });
       
        if (document.getElementById("wynik")) {
            const ppm = parseFloat(document.getElementById("wynik").dataset.ppm) || 0;
            const bialko = parseFloat(document.getElementById("makroBialko").dataset.grams) || 0;
            const tluszcze = parseFloat(document.getElementById("makroTluszcze").dataset.grams) || 0;
            const weglowodany = parseFloat(document.getElementById("makroWeglowodany").dataset.grams) || 0;
            const bialkoPct = parseFloat(document.getElementById("makroBialko").dataset.percent) || 0;
            const tluszczePct = parseFloat(document.getElementById("makroTluszcze").dataset.percent) || 0;
            const weglowodanyPct = parseFloat(document.getElementById("makroWeglowodany").dataset.percent) || 0;

            if (ppm > 0) {
                document.getElementById("wynik").textContent = translations[lang]["result_text"] + ppm.toFixed(0) + " kcal.";
                document.getElementById("makroBialko").textContent = translations[lang]["protein"] + bialko.toFixed(0) + " g - " + bialkoPct + "%";
                document.getElementById("makroTluszcze").textContent = translations[lang]["fats"] + tluszcze.toFixed(0) + " g - " + tluszczePct + "%";
                document.getElementById("makroWeglowodany").textContent = translations[lang]["carbs"] + weglowodany.toFixed(0) + " g - " + weglowodanyPct + "%";
            }
        }
    }

    document.getElementById('lang-pl').addEventListener('click', () => setLanguage('pl'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    loadPreferredLanguage();
});

function obliczWszystko() {
    var masaCiala = parseFloat(document.getElementById("masaCiala").value);
    var wzrost = parseFloat(document.getElementById("wzrost").value);
    var wiek = parseFloat(document.getElementById("wiek").value);
    var plec = document.getElementById("plec").value;
    var aktywnosc = parseFloat(document.getElementById("aktywnosc").value);
    var stylZywienia = document.getElementById("stylZywienia").value;
    var opcjeSpecjalne = document.getElementById("opcjeSpecjalne").value;

    var ppm, bialko, tluszcze, weglowodany, bialkoPct, tluszczePct, weglowodanyPct;

    if (plec === "kobieta") {
        ppm = (655.1 + (9.563 * masaCiala) + (1.85 * wzrost) - (4.676 * wiek)) * aktywnosc;
    } else {
        ppm = (66.473 + (13.752 * masaCiala) + (5.003 * wzrost) - (6.775 * wiek)) * aktywnosc;
    }

    if (stylZywienia === 'dietaZrownowazona') {
        if (opcjeSpecjalne === 'redukcja') {
            ppm -= 300;
            bialkoPct = 25;
            tluszczePct = 20;
            weglowodanyPct = 55;
        } else if (opcjeSpecjalne === 'masa') {
            ppm += 300;
            bialkoPct = 20;
            tluszczePct = 25;
            weglowodanyPct = 55;
        } else {
            bialkoPct = 20;
            tluszczePct = 25;
            weglowodanyPct = 55;
        }
    } else if (stylZywienia === 'dietaKeto') {
        if (opcjeSpecjalne === 'redukcja') {
            ppm -= 300;
            bialkoPct = 20;
            tluszczePct = 75;
            weglowodanyPct = 5;
        } else if (opcjeSpecjalne === 'masa') {
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

    bialko = ppm * bialkoPct / 100 / 4;
    tluszcze = ppm * tluszczePct / 100 / 9;
    weglowodany = ppm * weglowodanyPct / 100 / 4;

    document.getElementById("wynik").dataset.ppm = ppm;
    document.getElementById("makroBialko").dataset.grams = bialko;
    document.getElementById("makroBialko").dataset.percent = bialkoPct;
    document.getElementById("makroTluszcze").dataset.grams = tluszcze;
    document.getElementById("makroTluszcze").dataset.percent = tluszczePct;
    document.getElementById("makroWeglowodany").dataset.grams = weglowodany;
    document.getElementById("makroWeglowodany").dataset.percent = weglowodanyPct;

    const lang = document.documentElement.lang || 'pl';

    const translations = {
        "pl": {
            "result_text": "Twoje zapotrzebowanie kaloryczne wynosi: ",
            "protein": "Białko: ",
            "fats": "Tłuszcze: ",
            "carbs": "Węglowodany: "
        },
        "en": {
            "result_text": "Your calorie requirement is: ",
            "protein": "Protein: ",
            "fats": "Fats: ",
            "carbs": "Carbohydrates: "
        }
    };

    document.getElementById("wynik").textContent = translations[lang]["result_text"] + ppm.toFixed(0) + " kcal.";
    document.getElementById("makroBialko").textContent = translations[lang]["protein"] + bialko.toFixed(0) + " g - " + bialkoPct + "%";
    document.getElementById("makroTluszcze").textContent = translations[lang]["fats"] + tluszcze.toFixed(0) + " g - " + tluszczePct + "%";
    document.getElementById("makroWeglowodany").textContent = translations[lang]["carbs"] + weglowodany.toFixed(0) + " g - " + weglowodanyPct + "%";

    document.querySelector('.resultcontainer').style.display = 'block';
}
