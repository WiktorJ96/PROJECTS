const startBtn = document.querySelector('.start');
const pauseBtn = document.querySelector('.pause');
const stopBtn = document.querySelector('.stop');
const resetBtn = document.querySelector('.reset');
const historyBtn = document.querySelector('.history');
const stopwatch = document.querySelector('.stopwatch');
const time = document.querySelector('.time');
const timeList = document.querySelector('.time-list');

const infoBtn = document.querySelector('.info');
const paletteBtn = document.querySelector('.palette');
const colorMenu = document.querySelector('.color-menu');
const modalShadow = document.querySelector('.modal-shadow');
const closeModalBtn = document.querySelector('.close');

let countTime;
let minutes = 0;
let seconds = 0;
let milliseconds = 0;

let timesArr = [];

const handleStart = () => {
    clearInterval(countTime);

    countTime = setInterval(() => {
        milliseconds++;

        if (milliseconds > 99) {
            milliseconds = 0;
            seconds++;
        }

        if (seconds > 59) {
            seconds = 0;
            minutes++;
        }

        stopwatch.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}:${milliseconds < 10 ? '0' : ''}${milliseconds}`;
    }, 10);
};

startBtn.addEventListener('click', handleStart);

const handlePause = () => {
    clearInterval(countTime);
};

pauseBtn.addEventListener('click', handlePause);

const handleStop = () => {
    time.innerHTML = `Ostatni czas: ${stopwatch.textContent}`;

    if (stopwatch.textContent !== '0:00:00') {
        time.style.visibility = 'visible';
        timesArr.push(stopwatch.textContent);
        console.log(timesArr);
    }

    clearStuff();
};

stopBtn.addEventListener('click', handleStop);

const handleReset = () => {
    timesArr = [];
    time.style.visibility = 'hidden';
    clearStuff();
};

resetBtn.addEventListener('click', handleReset);

const clearStuff = () => {
    stopwatch.textContent = `0:00:00`;
    clearInterval(countTime);
    timeList.textContent = '';
    seconds = 0;
    minutes = 0;
};

const showHistory = () => {
    timeList.textContent = '';
    let num = 1;
    timesArr.forEach(time => {
        const newTime = document.createElement('li');
        newTime.innerHTML = `Pomiar nr.${num}: <span>${time}</span>`;
        timeList.appendChild(newTime);
        num++
    });
};

historyBtn.addEventListener('click', showHistory);

const toggleColorMenu = (event) => {
    event.stopPropagation();
    colorMenu.classList.toggle('active');
};

paletteBtn.addEventListener('click', toggleColorMenu);

const changeColor = (event) => {
    if (event.target.name === 'color') {
        document.documentElement.style.setProperty('--first-color', event.target.value);
    }
};

colorMenu.addEventListener('change', changeColor);

document.addEventListener('click', (event) => {
    if (!colorMenu.contains(event.target) && !paletteBtn.contains(event.target)) {
        colorMenu.classList.remove('active');
    }
});

colorMenu.addEventListener('click', (event) => {
    event.stopPropagation();
});

const toggleModal = () => {
    modalShadow.classList.toggle('modal-active');

    if (modalShadow.classList.contains('modal-active')) {
        modalShadow.style.display = 'block';
        setTimeout(() => {
            modalShadow.style.opacity = '1';
        }, 10);
    } else {
        modalShadow.style.opacity = '0';
        setTimeout(() => {
            modalShadow.style.display = 'none';
        }, 300);
    }
};

infoBtn.addEventListener('click', toggleModal);
closeModalBtn.addEventListener('click', toggleModal);

modalShadow.addEventListener('click', (event) => {
    if (event.target === modalShadow) {
        toggleModal();
    }
});

const translations = {
                pl: {
                    title: "Stoper",
                    instructions: "Instrukcja:",
                    start: "<i class='fas fa-play' aria-hidden='true'></i> - start",
                    pause: "<i class='fas fa-pause' aria-hidden='true'></i> - pauza",
                    stop: "<i class='fas fa-stop' aria-hidden='true'></i> - stop",
                    reset: "<i class='fas fa-times' aria-hidden='true'></i> - skasuj wszystko (łącznie z archiwum)",
                    archive: "<strong>archiwum</strong> - zobacz wcześniejsze pomiary",
                    close: "Zamknij",
                    history: "Archiwum",
                    footer: "2024 W.J Project. Wszelkie prawa zastrzeżone.",
                },
                en: {
                    title: "Stopwatch",
                    instructions: "Instructions:",
                    start: "<i class='fas fa-play' aria-hidden='true'></i> - start",
                    pause: "<i class='fas fa-pause' aria-hidden='true'></i> - pause",
                    stop: "<i class='fas fa-stop' aria-hidden='true'></i> - stop",
                    reset: "<i class='fas fa-times' aria-hidden='true'></i> - reset all (including history)",
                    archive: "<strong>history</strong> - see previous records",
                    close: "Close",
                    history: "History",
                    footer: "2024 W.J Project. All rights reserved."
                }
            };

            function switchLanguage(language) {
                document.querySelectorAll('.lang').forEach(element => {
                    const key = element.getAttribute('key');
                    element.innerHTML = translations[language][key];
                });
                document.querySelectorAll('.buttons button').forEach(button => {
                    const key = button.innerText.trim();
                    if (translations[language][key]) {
                        button.innerText = translations[language][key];
                    }
                });
            }

            document.getElementById('switch-to-pl').addEventListener('click', () => switchLanguage('pl'));
            document.getElementById('switch-to-en').addEventListener('click', () => switchLanguage('en'));

            switchLanguage('pl');
