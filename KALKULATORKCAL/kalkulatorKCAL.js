document.addEventListener('DOMContentLoaded', function () {

    function obliczWszystko() {
        const masaCiala = parseFloat(document.getElementById("masaCiala").value);
        const wzrost = parseFloat(document.getElementById("wzrost").value);
        const wiek = parseFloat(document.getElementById("wiek").value);
        const plec = document.getElementById("plec").value;
        const aktywnosc = parseFloat(document.getElementById("aktywnosc").value);
        const stylZywienia = document.getElementById("stylZywienia").value;
        const opcjeSpecjalne = document.getElementById("opcjeSpecjalne").value;

        let ppm, bialko, tluszcze, weglowodany, bialkoPct, tluszczePct, weglowodanyPct;

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

    document.getElementById('calculateButton').addEventListener('click', obliczWszystko);
});
