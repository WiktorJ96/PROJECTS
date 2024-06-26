document.addEventListener('DOMContentLoaded', function() {
    const username = document.querySelector('#username');
    const password = document.querySelector('#password');
    const password2 = document.querySelector('#password2');
    const email = document.querySelector('#email');
    const sendBtn = document.querySelector('.send');
    const clearBtns = document.querySelectorAll('.clear');
    const popup = document.querySelector('.popup');
    const closeBtn = document.querySelector('.close');
    const switchToRegisterBtn = document.querySelector('.switch-to-register');
    const switchToLoginBtn = document.querySelector('.switch-to-login');
    const registerForm = document.querySelector('#register-form');
    const loginForm = document.querySelector('#login-form');
    const loginUsername = document.querySelector('#login-username');
    const loginPassword = document.querySelector('#login-password');
    const loginSendBtn = document.querySelector('.login-send');

    const translations = {
        'pl': {
            'error_no_value': 'Proszę podać wartość.',
            'error_same_units': 'Jednostki są takie same, wybierz różne jednostki.',
            'error_no_conversion': 'Nie można przeliczyć pomiędzy tymi jednostkami.',
            'result_text': '{amount} {fromUnit} to {resultValue} {toUnit}',
            'minUsernameLength': 'Nazwa użytkownika musi mieć co najmniej 4 znaki.',
            'minPasswordLength': 'Hasło musi mieć co najmniej 8 znaków.',
            'invalidEmail': 'Wpisz poprawny adres e-mail',
            'passwordMismatch': 'Hasła do siebie nie pasują'
        },
        'en': {
            'error_no_value': 'Please provide a value.',
            'error_same_units': 'Units are the same, choose different units.',
            'error_no_conversion': 'Cannot convert between these units.',
            'result_text': '{amount} {fromUnit} is equal to {resultValue} {toUnit}',
            'minUsernameLength': 'Username must be at least 4 characters long.',
            'minPasswordLength': 'Password must be at least 8 characters long.',
            'invalidEmail': 'Enter a valid email address',
            'passwordMismatch': 'Passwords do not match'
        }
    };

    const showError = (input, msg) => {
        const formBox = input.parentElement;
        const errorMsg = formBox.querySelector('.error-text');
        
        formBox.classList.add('error');
        errorMsg.textContent = msg;
    }

    const clearError = input => {
        const formBox = input.parentElement;
        formBox.classList.remove('error');
        const errorMsg = formBox.querySelector('.error-text');
        errorMsg.textContent = '';
    }

    const checkForm = inputs => {
        let isValid = true;
        inputs.forEach(el => {
            if (el.value === '') {
                showError(el, el.placeholder);
                isValid = false;
            } else {
                clearError(el);
            }
        });
        return isValid;
    };

    const checkLength = (input, min) => {
        const lang = localStorage.getItem('preferredLanguage') || 'pl';
        if (input.value.length < min) {
            showError(input, translations[lang][`min${capitalizeFirstLetter(input.id)}Length`] || `Pole musi zawierać co najmniej ${min} znaków.`);
            return false;
        } else {
            clearError(input);
            return true;
        }
    }

    const checkEmail = input => {
        const emailValue = input.value;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const lang = localStorage.getItem('preferredLanguage') || 'pl';
        if (!emailPattern.test(emailValue)) {
            showError(input, translations[lang].invalidEmail || 'Wpisz poprawny adres e-mail');
            return false;
        } else {
            clearError(input);
            return true;
        }
    }

    const checkPasswords = (password, password2) => {
        const lang = localStorage.getItem('preferredLanguage') || 'pl';
        if (password.value !== password2.value) {
            showError(password2, translations[lang].passwordMismatch || 'Hasła do siebie nie pasują');
            return false;
        } else {
            clearError(password2);
            return true;
        }
    }

    const capitalizeFirstLetter = string => string.charAt(0).toUpperCase() + string.slice(1);

    sendBtn.addEventListener('click', e => {
        e.preventDefault();

        const isFormValid = checkForm([username, password, password2, email]);
        const isUsernameValid = checkLength(username, 4);
        const isPasswordValid = checkLength(password, 8);
        const isEmailValid = checkEmail(email);
        const arePasswordsValid = checkPasswords(password, password2);

        if (isFormValid && isUsernameValid && isPasswordValid && isEmailValid && arePasswordsValid) {
            popup.classList.add('show-popup');
        }
    });

    loginSendBtn.addEventListener('click', e => {
        e.preventDefault();

        const isFormValid = checkForm([loginUsername, loginPassword]);

        if (isFormValid) {
            window.location.href = 'user-panel.html';
        }
    });

    clearBtns.forEach(button => {
        button.addEventListener('click', e => {
            e.preventDefault();

            const form = e.target.closest('form');
            const inputs = form.querySelectorAll('input');
            inputs.forEach(element => {
                element.value = '';
                clearError(element);
            });
        });
    });

    closeBtn.addEventListener('click', () => {
        popup.classList.remove('show-popup');
    });

    switchToRegisterBtn.addEventListener('click', () => {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        switchToRegisterBtn.classList.add('active');
        switchToLoginBtn.classList.remove('active');
    });

    switchToLoginBtn.addEventListener('click', () => {
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
        switchToLoginBtn.classList.add('active');
        switchToRegisterBtn.classList.remove('active');
    });
    /*
    window.fbAsyncInit = function() {
        FB.init({
            appId      : 'YOUR_APP_ID',
            cookie     : true,
            xfbml      : true,
            version    : 'v12.0'
        });
        FB.AppEvents.logPageView();   
    };

    (function(d, s, id){
        let js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    document.querySelector('.facebook-login').addEventListener('click', function() {
        FB.login(function(response) {
            if (response.authResponse) {
                console.log('Welcome! Fetching your information....');
                FB.api('/me', function(response) {
                    console.log('Good to see you, ' + response.name + '.');
                });
            } else {
                console.log('User cancelled login or did not fully authorize.');
            }
        }, {scope: 'public_profile,email'});
    });

    /*
    // Google API Client
    function onLoad() {
        gapi.load('auth2', function() {
            gapi.auth2.init({
                client_id: 'YOUR_CLIENT_ID',
            });
        });
    }

    function onSignIn(googleUser) {
        const profile = googleUser.getBasicProfile();
        console.log('ID: ' + profile.getId());
        console.log('Name: ' + profile.getName());
        console.log('Image URL: ' + profile.getImageUrl());
        console.log('Email: ' + profile.getEmail());
    }

    window.onload = function() {
        onLoad();
    };
    */
});
