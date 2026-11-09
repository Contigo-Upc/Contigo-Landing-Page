function showFieldError(input, message) {
  const field = input.closest(".field");
  const error = document.getElementById(input.id + "-error");

  field.classList.add("is-invalid");
  input.setAttribute("aria-invalid", "true");
  if (error) {
    error.textContent = message;
  }
}

function clearFieldError(input) {
  const field = input.closest(".field");
  const error = document.getElementById(input.id + "-error");

  field.classList.remove("is-invalid");
  input.removeAttribute("aria-invalid");
  if (error) {
    error.textContent = "";
  }
}

function clearErrorsWhileTyping(form) {
  form.querySelectorAll(".field-input").forEach(function (input) {
    input.addEventListener("input", function () {
      clearFieldError(input);
    });
  });
}

function focusFirstError(form) {
  const firstInvalid = form.querySelector("[aria-invalid='true']");
  if (firstInvalid) {
    firstInvalid.focus();
  }
}

function showAlert(alertElement, title, text) {
  alertElement.querySelector(".alert-title").textContent = title;
  alertElement.querySelector(".alert-text").innerHTML = text;
  alertElement.hidden = false;
}

function hideAlert(alertElement) {
  alertElement.hidden = true;
}

function isEmpty(value) {
  return value.trim() === "";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function normalizePhone(phone) {
  return phone.replace(/\D/g, "");
}

function isValidPhone(phone) {
  return /^9\d{8}$/.test(normalizePhone(phone));
}

function formatPhone(phone) {
  const digits = normalizePhone(phone);
  return digits.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
}

function isValidName(name) {
  return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' ]{2,}$/.test(name.trim());
}

function getFirstName(fullName) {
  return fullName.trim().split(" ")[0];
}


function validateName(input) {
  if (isEmpty(input.value)) {
    showFieldError(input, "Escribe tu nombre para continuar.");
    return false;
  }
  if (!isValidName(input.value)) {
    showFieldError(input, "Escribe tu nombre solo con letras. Por ejemplo: María Elena.");
    return false;
  }
  return true;
}

function validateAge(input) {
  if (isEmpty(input.value)) {
    showFieldError(input, "Escribe tu edad para continuar.");
    return false;
  }
  const age = Number(input.value);
  if (!Number.isInteger(age) || age < 18 || age > 110) {
    showFieldError(input, "Escribe tu edad en números, entre 18 y 110. Por ejemplo: 65.");
    return false;
  }
  return true;
}

function validatePhone(input) {
  if (isEmpty(input.value)) {
    showFieldError(input, "Escribe tu número de celular para continuar.");
    return false;
  }
  if (!isValidPhone(input.value)) {
    showFieldError(input, "Escribe los 9 números de tu celular, empezando con 9. Por ejemplo: 987 654 321.");
    return false;
  }
  return true;
}

function validateEmail(input) {
  if (isEmpty(input.value)) {
    showFieldError(input, "Escribe tu correo electrónico para continuar.");
    return false;
  }
  if (!isValidEmail(input.value)) {
    showFieldError(input, "Revisa tu correo: debe tener @ y un punto. Por ejemplo: usuario@ejemplo.com");
    return false;
  }
  return true;
}


function setupPasswordToggles() {
  document.querySelectorAll("[data-toggle-password]").forEach(function (button) {
    const input = document.getElementById(button.dataset.togglePassword);

    button.addEventListener("click", function () {
      const isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      button.setAttribute("aria-pressed", String(isHidden));
      button.setAttribute("aria-label", isHidden ? "Ocultar contraseña" : "Mostrar contraseña");
    });
  });
}

document.addEventListener("DOMContentLoaded", setupPasswordToggles);
