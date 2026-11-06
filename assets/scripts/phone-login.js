document.addEventListener("DOMContentLoaded", function () {
  if (getSessionUser()) {
    window.location.replace("home.html");
    return;
  }

  const form = document.getElementById("phone-form");
  const phone = document.getElementById("phone-number");
  const submit = document.getElementById("phone-submit");
  const alert = document.getElementById("phone-alert");

  clearErrorsWhileTyping(form);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    hideAlert(alert);

    if (isEmpty(phone.value)) {
      showFieldError(phone, "Escribe tu número de celular para continuar.");
      phone.focus();
      return;
    }
    if (!isValidPhone(phone.value)) {
      showFieldError(phone, "Escribe los 9 números de tu celular, empezando con 9. Por ejemplo: 987 654 321.");
      phone.focus();
      return;
    }

    const phoneDigits = normalizePhone(phone.value);
    if (!findUserByPhone(phoneDigits)) {
      showFieldError(phone, "Este número aún no tiene una cuenta en Contigo.");
      showAlert(
        alert,
        "No encontramos una cuenta con este número",
        'Revisa que esté bien escrito o <a href="register.html">crea tu cuenta</a>.'
      );
      phone.focus();
      return;
    }

    savePending({ mode: "login", phone: phoneDigits });

    submit.disabled = true;
    submit.textContent = "Enviando código...";
    setTimeout(function () {
      window.location.href = "verify.html";
    }, 800);
  });
});
