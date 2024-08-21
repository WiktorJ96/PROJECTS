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

    let audio = new Audio('../music/Orbiting Knowhere - The Whole Other.mp3');

    let state = {
        startTime: 0,
        elapsedTime: 0,
        timerInterval: null,
        isRunning: false,
        minutnikTime: 0,
        timesArr: [],
        isHistoryVisible: false,
        currentSectionIndex: 0,
        isClockVisible: true
    };

    const formatTime = time => {
        const date = new Date(time);
        return date.toISOString().substr(11, 8);
    };
    
    const updateDisplay = (display, time) => {
        display.textContent = formatTime(time);
    };

    const startTimer = () => {
        if (!state.isRunning) {
            state.startTime = Date.now() - state.elapsedTime;
            state.timerInterval = setInterval(() => {
                state.elapsedTime = Date.now() - state.startTime;
                updateDisplay(elements.stopwatch, state.elapsedTime);
            }, 10);
            state.isRunning = true;
            elements.buttons.start.textContent = 'Pause';
        } else {
            clearInterval(state.timerInterval);
            state.isRunning = false;
            elements.buttons.start.textContent = 'Resume';
        }
    };

    const stopTimer = () => {
        if (state.isRunning) {
            clearInterval(state.timerInterval);
            state.timesArr.push(formatTime(state.elapsedTime));
            updateTimeList();
            state.isRunning = false;
            elements.buttons.start.textContent = 'Start';
        }
    };

    const resetTimer = () => {
        clearInterval(state.timerInterval);
        state.elapsedTime = 0;
        updateDisplay(elements.stopwatch, 0);
        state.isRunning = false;
        elements.buttons.start.textContent = 'Start';
        state.timesArr = [];
        updateTimeList();
    };

    const updateTimeList = () => {
        if (elements.timeList) {
            elements.timeList.innerHTML = state.timesArr.map((time, index) => 
                `<li>Wynik ${index + 1}: <span>${time}</span></li>`
            ).join('');
        }
    };

    const startMinutnik = () => {
        if (!state.isRunning) {
            state.minutnikTime = parseInt(elements.minutnikInput.value) * 60 * 1000;
            if (isNaN(state.minutnikTime) || state.minutnikTime <= 0) {
                alert('Proszę wprowadzić poprawną liczbę minut.');
                return;
            }
            state.startTime = Date.now() + state.minutnikTime;
            state.timerInterval = setInterval(() => {
                const remaining = state.startTime - Date.now();
                if (remaining <= 0) {
                    clearInterval(state.timerInterval);
                    updateDisplay(elements.minutnikDisplay, 0);
                    state.isRunning = false;
                    elements.buttons.startMinutnik.textContent = 'Start';
                    alert('Czas minął!');
                } else {
                    updateDisplay(elements.minutnikDisplay, remaining);
                }
            }, 10);
            state.isRunning = true;
            elements.buttons.startMinutnik.textContent = 'Pause';
        } else {
            clearInterval(state.timerInterval);
            state.isRunning = false;
            elements.buttons.startMinutnik.textContent = 'Resume';
        }
    };

    const resetMinutnik = () => {
        clearInterval(state.timerInterval);
        state.minutnikTime = 0;
        updateDisplay(elements.minutnikDisplay, 0);
        state.isRunning = false;
        elements.buttons.startMinutnik.textContent = 'Start';
        elements.minutnikInput.value = '';
    };

    function showSection(sectionId) {
        elements.sections.forEach(section => section.classList.remove('active'));
        const activeSection = document.getElementById(sectionId);
        if (activeSection) {
            activeSection.classList.add('active');
        
            const watchFace = document.querySelector('.watch-face');
            if (sectionId === 'clock-section') {
                watchFace.classList.add('clock-active');
            } else {
                watchFace.classList.remove('clock-active');
            }

            if (sectionId === 'options-section') {
                elements.sectionSwitcher.classList.add('active');
                showSubsection('stopwatch-section');
            } else {
                elements.sectionSwitcher.classList.remove('active');
            }
        }
        if (sectionId === 'clock-section') {
            updateClock();
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
            resetTimer();
        } else if (targetSectionId === 'timer-section') {
            resetMinutnik();
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
            elements.mainContent.style.opacity = '1';
        }, 4000);
    }

    function toggleMusic() {
        audio.paused ? audio.play() : audio.pause();
        elements.buttons.musicToggle.textContent = audio.paused ? '🔊' : '🔇';
    }

    elements.buttons.start.addEventListener('click', startTimer);
    elements.buttons.stop.addEventListener('click', stopTimer);
    elements.buttons.reset.addEventListener('click', resetTimer);
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