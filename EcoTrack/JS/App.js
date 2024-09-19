import { RegisterForm } from "./RegisterForm.js";
import { LoginForm } from "./LoginForm.js";

export class App {
  constructor() {
    this.registerForm = new RegisterForm();
    this.loginForm = new LoginForm();
    // this.socialMedia = new SocialMediaIntegration();
    this.popup = document.querySelector(".popup");
    this.closeBtn = document.querySelector(".close");
    this.switchToRegisterBtn = document.querySelector(".switch-to-register");
    this.switchToLoginBtn = document.querySelector(".switch-to-login");
    this.registerFormElement = document.querySelector("#register-form");
    this.loginFormElement = document.querySelector("#login-form");

    this.initEventListeners();
  }

  initEventListeners() {
    this.closeBtn.addEventListener("click", () => this.closePopup());
    this.switchToRegisterBtn.addEventListener("click", () => this.switchToRegister());
    this.switchToLoginBtn.addEventListener("click", () => this.switchToLogin());
  }

  closePopup() {
    this.popup.classList.remove("show-popup");
  }

  switchToRegister() {
    this.loginFormElement.style.display = "none";
    this.registerFormElement.style.display = "block";
    this.switchToRegisterBtn.classList.add("active");
    this.switchToLoginBtn.classList.remove("active");
  }

  switchToLogin() {
    this.registerFormElement.style.display = "none";
    this.loginFormElement.style.display = "block";
    this.switchToLoginBtn.classList.add("active");
    this.switchToRegisterBtn.classList.remove("active");
  }
}
