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

    document.getElementById("wynik").textContent = "Twoja dzienne zapotrzebowanie kaloryczne wynosi: " + ppm.toFixed(0) + " kcal.";
    document.getElementById("makroBialko").textContent = "Białko: " + bialko.toFixed(0) + " g - " + bialkoPct + "%";
    document.getElementById("makroTluszcze").textContent = "Tłuszcze: " + tluszcze.toFixed(0) + " g - " + tluszczePct + "%";
    document.getElementById("makroWeglowodany").textContent = "Węglowodany: " + weglowodany.toFixed(0) + " g - " + weglowodanyPct + "%";

    document.querySelector('.resultcontainer').style.display = 'block';
  }


  
    function zmienRodzajKalkulatora() {
      var plec = document.getElementById("plec").value;
      var labelMasaCiala = document.querySelector('label[for="masaCiala"]');
      var labelWzrost = document.querySelector('label[for="wzrost"]');
      
      if (plec === "kobieta") {
        labelMasaCiala.innerHTML = "Masa ciała (kg):";
        labelWzrost.innerHTML = "Wzrost (cm):";
      } else {
        labelMasaCiala.innerHTML = "Masa ciała (kg):";
        labelWzrost.innerHTML = "Wzrost (cm):";
      }
}
  document.addEventListener('DOMContentLoaded', function () {
    const masaCialaInput = document.getElementById('masaCiala');
    const wzrostInput = document.getElementById('wzrost');
    const wiekInput = document.getElementById('wiek');
    const calculateButton = document.getElementById('calculateButton');

    function updateButtonState() {
      calculateButton.disabled = !(
        masaCialaInput.value && wzrostInput.value && wiekInput.value
      );
    }

    masaCialaInput.addEventListener('input', updateButtonState);
    wzrostInput.addEventListener('input', updateButtonState);
    wiekInput.addEventListener('input', updateButtonState);
  });

