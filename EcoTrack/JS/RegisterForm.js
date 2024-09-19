import { Form } from "./Form.js";

export class RegisterForm extends Form {
  constructor() {
    super();
    this.username = document.querySelector("#username");
    this.password = document.querySelector("#password");
    this.password2 = document.querySelector("#password2");
    this.email = document.querySelector("#email");
    this.sendBtn = document.querySelector(".send");
    this.clearBtn = document.querySelector("#register-form .clear");
    this.popup = document.querySelector(".popup");

    this.initEventListeners();
  }

  initEventListeners() {
    this.sendBtn.addEventListener("click", (e) => this.handleSubmit(e));
    this.clearBtn.addEventListener("click", (e) => this.handleClear(e));
  }

  handleSubmit(e) {
    e.preventDefault();

    const isFormValid = this.checkForm([this.username, this.password, this.password2, this.email]);
    const isUsernameValid = this.checkLength(this.username, 4);
    const isPasswordValid = this.checkLength(this.password, 8);
    const isEmailValid = this.checkEmail(this.email);
    const arePasswordsValid = this.checkPasswords(this.password, this.password2);

    if (isFormValid && isUsernameValid && isPasswordValid && isEmailValid && arePasswordsValid) {
      this.popup.classList.add("show-popup");
    }
  }

  handleClear(e) {
    e.preventDefault();
    const inputs = e.target.closest("form").querySelectorAll("input");
    inputs.forEach((element) => {
      element.value = "";
      this.clearError(element);
    });
  }
}
