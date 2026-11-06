document.addEventListener("DOMContentLoaded", function () {
  if (getSessionUser()) {
    window.location.replace("home.html");
    return;
  }

  setupLoginForm();
  setupContactForm();
  setupFocusLogin();
  setupActiveSection();
});

function setupLoginForm() {
  const form = document.getElementById("login-form");
  const email = document.getElementById("login-email");
  const password = document.getElementById("login-password");
  const remember = document.getElementById("login-remember");
  const alert = document.getElementById("login-alert");

  clearErrorsWhileTyping(form);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    hideAlert(alert);

    let isValid = true;

    if (isEmpty(email.value)) {
      showFieldError(email, "Escribe tu correo electrónico para continuar.");
      isValid = false;
    } else if (!isValidEmail(email.value)) {
      showFieldError(email, "Revisa tu correo: debe tener @ y un punto. Por ejemplo: usuario@ejemplo.com");
      isValid = false;
    }

    if (isEmpty(password.value)) {
      showFieldError(password, "Escribe tu contraseña para continuar.");
      isValid = false;
    }

    if (!isValid) {
      focusFirstError(form);
      return;
    }

    const user = findUserByEmail(email.value);
    if (!user || user.password !== password.value) {
      showAlert(
        alert,
        "Revisa tu correo y tu contraseña",
        'No encontramos una cuenta con esos datos. Vuelve a escribirlos, ' +
        '<a href="phone-login.html">ingresa con tu celular</a> o ' +
        '<a href="register.html">crea una cuenta</a>.'
      );
      password.value = "";
      password.focus();
      return;
    }

    startSession(user.id, remember.checked);
    window.location.href = "home.html";
  });
}

function setupContactForm() {
  const form = document.getElementById("contact-form");
  const name = document.getElementById("contact-name");
  const email = document.getElementById("contact-email");
  const message = document.getElementById("contact-message");
  const alert = document.getElementById("contact-alert");

  clearErrorsWhileTyping(form);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    hideAlert(alert);

    let isValid = true;

    if (isEmpty(name.value)) {
      showFieldError(name, "Escribe tu nombre para saber cómo llamarte.");
      isValid = false;
    }

    if (isEmpty(email.value)) {
      showFieldError(email, "Escribe tu correo para poder responderte.");
      isValid = false;
    } else if (!isValidEmail(email.value)) {
      showFieldError(email, "Revisa tu correo: debe tener @ y un punto. Por ejemplo: usuario@ejemplo.com");
      isValid = false;
    }

    if (isEmpty(message.value)) {
      showFieldError(message, "Cuéntanos en qué te podemos ayudar.");
      isValid = false;
    }

    if (!isValid) {
      focusFirstError(form);
      return;
    }

    showAlert(
      alert,
      "¡Gracias, " + getFirstName(name.value) + "! Recibimos tu mensaje",
      "Te responderemos a " + email.value.trim() + " lo antes posible."
    );
    form.reset();
  });
}

function setupFocusLogin() {
  document.querySelectorAll("[data-focus-login]").forEach(function (link) {
    link.addEventListener("click", function () {
      setTimeout(function () {
        document.getElementById("login-email").focus({ preventScroll: true });
      }, 400);
    });
  });
}

function setupActiveSection() {
  const links = document.querySelectorAll(".nav-links a");
  const sections = document.querySelectorAll("main section[id]");

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) {
        return;
      }
      links.forEach(function (link) {
        const isCurrent = link.getAttribute("href") === "#" + entry.target.id;
        link.classList.toggle("is-active", isCurrent);
        if (isCurrent) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });

  sections.forEach(function (section) {
    observer.observe(section);
  });
}
