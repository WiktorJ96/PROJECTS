import { Form } from "./Form.js";

export class LoginForm extends Form {
  constructor() {
    super();
    this.username = document.querySelector("#login-username");
    this.password = document.querySelector("#login-password");
    this.sendBtn = document.querySelector(".login-send");
    this.clearBtn = document.querySelector("#login-form .clear");
    this.initEventListeners();
  }

  initEventListeners() {
    this.sendBtn.addEventListener("click", (e) => this.handleSubmit(e));
    this.clearBtn.addEventListener("click", (e) => this.handleClear(e));
  }

  handleSubmit(e) {
    e.preventDefault();

    const isFormValid = this.checkForm([this.username, this.password]);

    if (isFormValid) {
      window.location.href = "user-panel.html";
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
