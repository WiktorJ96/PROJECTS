const $ = (selector) => document.querySelector(selector);
const scrollbar = $('#custom-scrollbar');
    let isScrolling;

    window.addEventListener('scroll', function () {
        scrollbar.style.opacity = '1';

        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;
        const scrollbarHeight = (windowHeight / documentHeight) * 100;

        scrollbar.style.height = scrollbarHeight + '%';
        scrollbar.style.top = scrollPercentage + '%';

        clearTimeout(isScrolling);
        isScrolling = setTimeout(() => {
            scrollbar.style.opacity = '0';
        }, 1000);
    });
