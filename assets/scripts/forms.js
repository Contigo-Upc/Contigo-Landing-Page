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
