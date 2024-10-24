document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        stopwatch: document.querySelector('.stopwatch'),
        minutnikDisplay: document.querySelector('.minutnik-display'),
        timeList: document.querySelector('.time-list'),
        buttons: {
            start: document.getElementById('start'),
            stop: document.getElementById('stop'),
            reset: document.getElementById('reset'),
            startMinutnik: document.getElementById('start-minutnik'),
            resetMinutnik: document.getElementById('reset-minutnik'),
            history: document.querySelector('.history'),
            musicToggle: document.getElementById('music-toggle'),
            switchButton: document.getElementById('switch-button')
        },
        minutnikInput: document.getElementById('minutnik-input'),
        sectionSwitcher: document.querySelector('.section-switcher'),
        sections: document.querySelectorAll('.section'),
        subsections: document.querySelectorAll('.subsection'),
        logoShowcase: document.querySelector('.logo-showcase'),
        mainContent: document.getElementById('main-content'),
        watchFace: document.querySelector('.watch-face'),
        startButton: document.getElementById('start-music'),
        introOverlay: document.getElementById('intro-overlay')
    };

    let audio = new Audio('./assets/music/Orbiting Knowhere - The Whole Other.mp3');

    let state = {
    stopwatch: {
        startTime: 0,
        elapsedTime: 0,
        interval: null,
        isRunning: false,
        timesArr: []
    },
    timer: {
        startTime: 0,
        remainingTime: 0,
        interval: null,
        isRunning: false,
        timesArr: []
    },
    isClockVisible: true
};

    const formatTime = time => {
        const date = new Date(time);
        return date.toISOString().substr(11, 8);
    };
    
    const updateDisplay = (display, time) => {
        display.textContent = formatTime(time);
    };

    const startStopwatch = () => {
    if (!state.stopwatch.isRunning) {
        state.stopwatch.startTime = Date.now() - state.stopwatch.elapsedTime;
        state.stopwatch.interval = setInterval(() => {
            state.stopwatch.elapsedTime = Date.now() - state.stopwatch.startTime;
            updateDisplay(elements.stopwatch, state.stopwatch.elapsedTime);
        }, 10);
        state.stopwatch.isRunning = true;
        elements.buttons.start.textContent = 'Pause';
    } else {
        clearInterval(state.stopwatch.interval);
        state.stopwatch.isRunning = false;
        elements.buttons.start.textContent = 'Resume';
    }
};

const stopStopwatch = () => {
    if (state.stopwatch.isRunning) {
        clearInterval(state.stopwatch.interval);
        state.stopwatch.timesArr.push(formatTime(state.stopwatch.elapsedTime));
        updateTimeList('stopwatch');
        state.stopwatch.isRunning = false;
        elements.buttons.start.textContent = 'Start';
    }
};

const resetStopwatch = () => {
    clearInterval(state.stopwatch.interval);
    state.stopwatch.elapsedTime = 0;
    updateDisplay(elements.stopwatch, 0);
    state.stopwatch.isRunning = false;
    elements.buttons.start.textContent = 'Start';
    state.stopwatch.timesArr = [];
    updateTimeList('stopwatch');
};

    const updateTimeList = (type) => {
    const timesArr = type === 'stopwatch' ? state.stopwatch.timesArr : state.timer.timesArr;
    if (elements.timeList) {
        elements.timeList.innerHTML = timesArr.map((time, index) => 
            `<li>Wynik ${index + 1}: <span>${time}</span></li>`
        ).join('');
    }
};

    const startMinutnik = () => {
    if (!state.timer.isRunning) {
        const inputTime = parseInt(elements.minutnikInput.value) * 60 * 1000;
        if (isNaN(inputTime) || inputTime <= 0) {
            alert('Proszę wprowadzić poprawną liczbę minut.');
            return;
        }
        state.timer.remainingTime = state.timer.remainingTime || inputTime;
        state.timer.startTime = Date.now() + state.timer.remainingTime;
        state.timer.interval = setInterval(() => {
            state.timer.remainingTime = state.timer.startTime - Date.now();
            if (state.timer.remainingTime <= 0) {
                clearInterval(state.timer.interval);
                updateDisplay(elements.minutnikDisplay, 0);
                state.timer.isRunning = false;
                elements.buttons.startMinutnik.textContent = 'Start';
                alert('Czas minął!');
            } else {
                updateDisplay(elements.minutnikDisplay, state.timer.remainingTime);
            }
        }, 10);
        state.timer.isRunning = true;
        elements.buttons.startMinutnik.textContent = 'Pause';
    } else {
        clearInterval(state.timer.interval);
        state.timer.isRunning = false;
        elements.buttons.startMinutnik.textContent = 'Resume';
    }
};

const resetMinutnik = () => {
    clearInterval(state.timer.interval);
    state.timer.remainingTime = 0;
    updateDisplay(elements.minutnikDisplay, 0);
    state.timer.isRunning = false;
    elements.buttons.startMinutnik.textContent = 'Start';
    elements.minutnikInput.value = '';
    state.timer.timesArr = [];
    updateTimeList('timer');
};

    function showSection(sectionId) {
        elements.sections.forEach(section => section.classList.remove('active'));
        const activeSection = document.getElementById(sectionId);
        if (activeSection) {
            activeSection.classList.add('active');
        
            if (sectionId === 'clock-section') {
                elements.watchFace.classList.add('clock-active');
                elements.watchFace.classList.remove('hide-markers');
                updateClock();
            } else {
                elements.watchFace.classList.remove('clock-active');
                elements.watchFace.classList.add('hide-markers');
            }

            if (sectionId === 'options-section') {
                elements.sectionSwitcher.classList.add('active');
                showSubsection('stopwatch-section');
            } else {
                elements.sectionSwitcher.classList.remove('active');
            }

        }
    }
    

    function showSubsection(subsectionId) {
        elements.subsections.forEach(subsection => subsection.style.display = 'none');
        document.getElementById(subsectionId).style.display = 'block';
    }

    function switchSection(button) {
        elements.sectionSwitcher.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const targetSectionId = button.getAttribute('data-section');
        showSubsection(targetSectionId);
        if (targetSectionId === 'stopwatch-section') {
        updateTimeList('stopwatch');
    } else if (targetSectionId === 'timer-section') {
        updateTimeList('timer');
    }
    }

    function showLogoShowcase() {
        elements.logoShowcase.classList.add('active');
        setTimeout(() => {
            elements.logoShowcase.style.opacity = '0';
            elements.logoShowcase.style.transition = 'opacity 1s ease';
            setTimeout(() => {
                elements.logoShowcase.style.display = 'none';
                elements.mainContent.style.display = 'block';
                elements.mainContent.classList.add('visible');
                elements.watchFace.classList.add('animate');
            }, 1000);
        }, 4500);
    }

    function initAudio() {
        audio.preload = 'auto';
    
        audio.addEventListener('canplaythrough', function () {
            elements.startButton.disabled = false;
            elements.startButton.textContent = '▶';
        });

        audio.addEventListener('error', function (e) {
            console.error('Error loading audio:', e);
            elements.startButton.textContent = 'Error loading audio';
        });
    }

    function startAnimation() {
    elements.introOverlay.style.opacity = '0';

    setTimeout(() => {
        elements.introOverlay.style.display = 'none';
        elements.logoShowcase.classList.add('fade-in-out');
    }, 1000);

    setTimeout(() => {
        elements.logoShowcase.classList.remove('fade-in-out');
        elements.logoShowcase.style.display = 'none';
        
        elements.mainContent.style.display = 'block';
        elements.mainContent.style.opacity = '1';
        elements.buttons.switchButton.style.display = 'block';
        elements.buttons.switchButton.style.opacity = '1';
        
        elements.watchFace.classList.add('animate');
    }, 4000);
}

    function toggleMusic() {
        audio.paused ? audio.play() : audio.pause();
        elements.buttons.musicToggle.textContent = audio.paused ? '🔇' : '🔊';
    }

    elements.buttons.start.addEventListener('click', startStopwatch);
    elements.buttons.stop.addEventListener('click', stopStopwatch);
    elements.buttons.reset.addEventListener('click', resetStopwatch);
    elements.buttons.startMinutnik.addEventListener('click', startMinutnik);
    elements.buttons.resetMinutnik.addEventListener('click', resetMinutnik);    
    elements.buttons.musicToggle.addEventListener('click', toggleMusic);
    elements.sectionSwitcher.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => switchSection(button));
    });

    elements.buttons.switchButton.addEventListener('click', function () {
        state.isClockVisible = !state.isClockVisible;
        showSection(state.isClockVisible ? 'clock-section' : 'options-section');
    });

    elements.startButton.addEventListener('click', function () {
        elements.startButton.disabled = true;
        audio.play().then(startAnimation).catch(error => {
            console.error('Playback failed:', error);
            elements.startButton.textContent = 'Try again';
            elements.startButton.disabled = false;
        });
    });

    initAudio();
    updateDisplay(elements.stopwatch, 0);
    updateDisplay(elements.minutnikDisplay, 0);
    showLogoShowcase();
    showSection('clock-section');
});