export class Form {

  showError(input, msg) {
    const formBox = input.parentElement;
    const errorMsg = formBox.querySelector(".error-text");

    formBox.classList.add("error");
    errorMsg.textContent = msg;
  }

  clearError(input) {
    const formBox = input.parentElement;
    formBox.classList.remove("error");
    const errorMsg = formBox.querySelector(".error-text");
    errorMsg.textContent = "";
  }

  checkForm(inputs) {
    let isValid = true;
    inputs.forEach((el) => {
      if (el.value === "") {
        this.showError(el, "Proszę podać wartość.");
        isValid = false;
      } else {
        this.clearError(el);
      }
    });
    return isValid;
  }

  checkLength(input, min) {
    if (input.value.length < min) {
      this.showError(input, `Pole musi zawierać co najmniej ${min} znaków.`);
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
      this.showError(input, "Wpisz poprawny adres e-mail");
      return false;
    } else {
      this.clearError(input);
      return true;
    }
  }

  checkPasswords(password, password2) {
    if (password.value !== password2.value) {
      this.showError(password2, "Hasła do siebie nie pasują");
      return false;
    } else {
      this.clearError(password2);
      return true;
    }
  }

}
