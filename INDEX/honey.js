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
});
document.addEventListener("DOMContentLoaded", function() {
    const header = document.getElementById("projects-heading");

    header.addEventListener("animationend", function() {
        header.style.display = "none";
    });
});
