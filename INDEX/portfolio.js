        document.addEventListener('DOMContentLoaded', () => {
                const observerOptions = { threshold: 0.1 };

                const animateOnScroll = (entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add(entry.target.dataset.animationClass);
                            observer.unobserve(entry.target);
                        }
                    });
                };

                const observer = new IntersectionObserver(animateOnScroll, observerOptions);

            
                const headerIcons = document.querySelectorAll('h2[data-lang-key="header"] .icon-container');
                headerIcons.forEach((icon, index) => {
                    icon.classList.add('hidden');
                    icon.dataset.animationClass = 'animate-slideInFromTop';
                    icon.style.animationDelay = `${index * 0.2}s`;
                    observer.observe(icon);
                });

                
                const portfolioJS_HTML_CSSCards = document.querySelectorAll('.portfolioJS_HTML_CSS__projects .flip-card');
                portfolioJS_HTML_CSSCards.forEach((card, index) => {
                    card.classList.add('hidden');
                    card.dataset.animationClass = 'animate-slideInFromRight';
                    card.style.animationDelay = `${index * 0.2}s`;
                    observer.observe(card);
                });
            });
