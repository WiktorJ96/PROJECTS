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

let timesArr = [];

const handleStart = () => {
    clearInterval(countTime);

    countTime = setInterval(() => {
        if (seconds < 9) {
            seconds++;
            stopwatch.textContent = `${minutes}:0${seconds}`;
        } else if (seconds >= 9 && seconds < 59) {
            seconds++;
            stopwatch.textContent = `${minutes}:${seconds}`;
        } else {
            minutes++;
            seconds = 0;
            stopwatch.textContent = `${minutes}:00`;
        }
    }, 1000);
};

startBtn.addEventListener('click', handleStart);

const handlePause = () => {
    clearInterval(countTime);
};

pauseBtn.addEventListener('click', handlePause);

const handleStop = () => {
    time.innerHTML = `Ostatni czas: ${stopwatch.textContent}`;

    if (stopwatch.textContent !== '0:00') {
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
    stopwatch.textContent = `0:00`;
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


