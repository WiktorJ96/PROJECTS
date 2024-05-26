document.addEventListener('DOMContentLoaded', () => {

    const hexagons = document.querySelectorAll('.hexagon');

    hexagons.forEach(hexagon => {
        hexagon.addEventListener('mouseenter', () => {
            const desc = hexagon.querySelector('.desc');
            desc.style.visibility = 'visible';
            desc.style.opacity = '1';
        });

        hexagon.addEventListener('mouseleave', () => {
            const desc = hexagon.querySelector('.desc');
            desc.style.visibility = 'hidden';
            desc.style.opacity = '0';
        });
    });

    const elements = document.querySelectorAll('[data-lang-pl]');
    const langSwitchPl = document.getElementById('lang-pl');
    const langSwitchEn = document.getElementById('lang-en');

    langSwitchPl.addEventListener('click', () => switchLanguage('pl'));
    langSwitchEn.addEventListener('click', () => switchLanguage('en'));

    function switchLanguage(lang) {
        elements.forEach(el => {
            el.textContent = el.getAttribute(`data-lang-${lang}`);
        });
    }

    document.getElementById('js-projectsJS').addEventListener('click', function () {
        window.location.href = './INDEX/JSprojects.html';
    });
});

