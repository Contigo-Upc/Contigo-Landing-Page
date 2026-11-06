document.addEventListener("DOMContentLoaded", function () {
  if (getSessionUser()) {
    window.location.replace("home.html");
    return;
  }

  setupRegisterForm();
  setupVoiceRegistration();
});

function setupRegisterForm() {
  const form = document.getElementById("register-form");
  const name = document.getElementById("register-name");
  const age = document.getElementById("register-age");
  const phone = document.getElementById("register-phone");
  const email = document.getElementById("register-email");
  const password = document.getElementById("register-password");
  const submit = document.getElementById("register-submit");
  const alert = document.getElementById("register-alert");

  clearErrorsWhileTyping(form);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    hideAlert(alert);

    const results = [
      validateName(name),
      validateAge(age),
      validatePhone(phone),
      validateEmail(email),
      validatePassword(password)
    ];

    if (results.includes(false)) {
      focusFirstError(form);
      return;
    }

    const phoneDigits = normalizePhone(phone.value);
    if (findUserByPhone(phoneDigits)) {
      showFieldError(phone, "Este número ya está registrado en Contigo.");
      showAlert(
        alert,
        "Este número ya tiene una cuenta",
        'Prueba <a href="phone-login.html">ingresar con tu celular</a> o usa un número de celular distinto.'
      );
      phone.focus();
      return;
    }

    if (findUserByEmail(email.value)) {
      showFieldError(email, "Este correo ya tiene una cuenta. Inicia sesión o usa otro correo.");
      email.focus();
      return;
    }

    savePending({
      mode: "register",
      phone: phoneDigits,
      user: {
        name: name.value.trim(),
        age: Number(age.value),
        phone: phoneDigits,
        email: email.value.trim(),
        password: password.value
      }
    });

    submit.disabled = true;
    submit.textContent = "Enviando código...";
    setTimeout(function () {
      window.location.href = "verify.html";
    }, 800);
  });
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

function validatePassword(input) {
  if (isEmpty(input.value)) {
    showFieldError(input, "Crea una contraseña para continuar.");
    return false;
  }
  if (input.value.length < 6) {
    showFieldError(input, "Usa al menos 6 letras o números en tu contraseña.");
    return false;
  }
  return true;
}

function setupVoiceRegistration() {
  const formPanel = document.getElementById("register-form-panel");
  const voicePanel = document.getElementById("voice-panel");
  const status = document.getElementById("voice-status");
  const alert = document.getElementById("voice-alert");
  const startButton = document.getElementById("voice-start");
  const stopButton = document.getElementById("voice-stop");
  const retryButton = document.getElementById("voice-retry");
  const writeButton = document.getElementById("voice-write");

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;

  function startListening() {
    if (!SpeechRecognition) {
      showToast("Tu navegador no permite el registro por voz. Usa Chrome o Edge, o escribe tus datos.");
      return;
    }

    formPanel.hidden = true;
    voicePanel.hidden = false;
    hideAlert(alert);
    retryButton.hidden = true;
    stopButton.hidden = false;
    status.textContent = "Te escucho...";
    voicePanel.classList.add("is-listening");

    recognition = new SpeechRecognition();
    recognition.lang = "es-PE";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = function (event) {
      const text = event.results[0][0].transcript;
      const data = parseSpokenData(text);

      if (!data.name && !data.age) {
        showVoiceError();
        return;
      }

      fillFormWithVoiceData(data);
    };

    recognition.onerror = function () {
      showVoiceError();
    };

    recognition.onend = function () {
      voicePanel.classList.remove("is-listening");
    };

    recognition.start();
  }

  function showVoiceError() {
    voicePanel.classList.remove("is-listening");
    status.textContent = "No logré escucharte";
    showAlert(
      alert,
      "Busca un lugar más silencioso",
      "Vuelve a intentarlo hablando con calma, o escribe tus datos con el teclado."
    );
    stopButton.hidden = true;
    retryButton.hidden = false;
    retryButton.focus();
  }

  function fillFormWithVoiceData(data) {
    const nameInput = document.getElementById("register-name");
    const ageInput = document.getElementById("register-age");

    if (data.name) {
      nameInput.value = data.name;
      clearFieldError(nameInput);
    }
    if (data.age) {
      ageInput.value = data.age;
      clearFieldError(ageInput);
    }

    showForm();
    showToast("Revisa tus datos. Si algo está mal escrito, puedes corregirlo.");
    document.getElementById("register-phone").focus();
  }

  function showForm() {
    if (recognition) {
      recognition.abort();
    }
    voicePanel.hidden = true;
    formPanel.hidden = false;
  }

  startButton.addEventListener("click", startListening);
  retryButton.addEventListener("click", startListening);

  stopButton.addEventListener("click", function () {
    showForm();
    startButton.focus();
  });

  writeButton.addEventListener("click", function () {
    showForm();
    document.getElementById("register-name").focus();
  });
}

function parseSpokenData(text) {
  const nameMatch = text.match(/(?:me llamo|mi nombre es|soy)\s+([a-záéíóúüñ ]+?)(?:,|\.|\s+y\s+|\s+tengo|$)/i);
  const ageMatch = text.match(/(\d{1,3})\s*años/i) || text.match(/tengo\s+(\d{1,3})/i);

  return {
    name: nameMatch ? capitalizeWords(nameMatch[1].trim()) : "",
    age: ageMatch ? ageMatch[1] : ""
  };
}

function capitalizeWords(text) {
  return text
    .split(" ")
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}
