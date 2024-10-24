export class Form {
  constructor() {
    this.currentLang = localStorage.getItem("preferredLanguage");
  }

  showError(input, errorMessage) {
    const formBox = input.parentElement;
    const errorMsg = formBox.querySelector(".error-text");

    formBox.classList.add("error");
    errorMsg.textContent = errorMessage;
  }

  clearError(input) {
    const formBox = input.parentElement;
    formBox.classList.remove("error");
    const errorMsg = formBox.querySelector(".error-text");
    errorMsg.textContent = "";
  }

  checkForm(inputs) {
    this.currentLang = localStorage.getItem("preferredLanguage");
    let isValid = true;
    inputs.forEach((el) => {
      if (el.value === "") {
        const errorMessage =
          this.currentLang === "en" ? "Please provide a value." : "Proszę podać wartość.";
        this.showError(el, errorMessage);
        isValid = false;
      } else {
        this.clearError(el);
      }
    });
    return isValid;
  }

  checkLength(input, min) {
    this.currentLang = localStorage.getItem("preferredLanguage");
    if (input.value.length < min) {
      const errorMessage =
        this.currentLang === "en"
          ? `Field must contain at least ${min} characters.`
          : `Pole musi zawierać co najmniej ${min} znaków.`;
      this.showError(input, errorMessage);
      return false;
    } else {
      this.clearError(input);
      return true;
    }
  }

  checkEmail(input) {
    const emailValue = input.value;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(emailValue)) {
      const errorMessage =
        this.currentLang === "en"
          ? "Please enter a valid email address"
          : "Wpisz poprawny adres e-mail";
      this.showError(input, errorMessage);
      return false;
    } else {
      this.clearError(input);
      return true;
    }
  }

  checkPasswords(password, password2) {
    if (password.value !== password2.value) {
      const errorMessage =
        this.currentLang === "en" ? "Passwords do not match" : "Hasła do siebie nie pasują";
      this.showError(password2, errorMessage);
      return false;
    } else {
      this.clearError(password2);
      return true;
    }
  }
}
