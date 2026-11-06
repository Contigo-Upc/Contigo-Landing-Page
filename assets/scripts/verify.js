const CODE_DURATION_SECONDS = 5 * 60;
const MAX_ATTEMPTS = 3;

let pending = null;
let timerId = null;

document.addEventListener("DOMContentLoaded", function () {
  pending = getPending();

  if (!pending) {
    window.location.replace("index.html");
    return;
  }

  setupPageForMode();

  if (!pending.code) {
    sendNewCode();
  } else {
    showSmsCode();
    startTimer();
  }

  setupCodeInputs();
  document.getElementById("verify-form").addEventListener("submit", checkCode);
  document.getElementById("resend-button").addEventListener("click", function () {
    sendNewCode();
    showToast("Te enviamos un código nuevo.");
  });
});

function setupPageForMode() {
  const backPage = pending.mode === "register" ? "register.html" : "phone-login.html";
  document.getElementById("back-link").href = backPage;
  document.getElementById("change-phone").href = backPage;
  document.getElementById("verify-phone").textContent = "+51 " + formatPhone(pending.phone);
}

function generateCode() {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
}

function sendNewCode() {
  pending.code = generateCode();
  pending.expiresAt = Date.now() + CODE_DURATION_SECONDS * 1000;
  pending.attemptsLeft = MAX_ATTEMPTS;
  savePending(pending);

  showSmsCode();
  hideAlert(document.getElementById("verify-alert"));
  setCodeEnabled(true);
  clearCodeInputs();
  startTimer();
}

function showSmsCode() {
  document.getElementById("sms-code").textContent = pending.code;
}

function startTimer() {
  clearInterval(timerId);
  updateTimer();
  timerId = setInterval(updateTimer, 1000);
}

function updateTimer() {
  const timer = document.getElementById("code-timer");
  const secondsLeft = Math.round((pending.expiresAt - Date.now()) / 1000);

  if (secondsLeft <= 0) {
    clearInterval(timerId);
    showExpired();
    return;
  }

  timer.classList.remove("is-expired");
  timer.innerHTML = "El código vence en <strong>" + formatTime(secondsLeft) + "</strong>";
}

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return minutes + ":" + seconds;
}

function showExpired() {
  const alert = document.getElementById("verify-alert");
  const timer = document.getElementById("code-timer");

  alert.className = "alert alert-warning";
  showAlert(
    alert,
    "Tu código ya venció",
    "Por seguridad, los códigos duran 5 minutos. Toca «Reenviar código» para recibir uno nuevo."
  );

  timer.classList.add("is-expired");
  timer.innerHTML = "El código venció. <strong>Pide uno nuevo.</strong>";
  setCodeEnabled(false);
}

function getDigitInputs() {
  return Array.from(document.querySelectorAll(".code-digit"));
}

function setupCodeInputs() {
  const inputs = getDigitInputs();

  inputs.forEach(function (input, index) {
    input.addEventListener("input", function () {
      document.getElementById("code-inputs").classList.remove("is-invalid");

      const digits = input.value.replace(/\D/g, "");

      if (digits.length > 1) {
        fillDigitsFrom(index, digits);
        return;
      }

      input.value = digits;
      if (digits && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });

    input.addEventListener("keydown", function (event) {
      if (event.key === "Backspace" && !input.value && index > 0) {
        inputs[index - 1].focus();
      }
    });

    input.addEventListener("paste", function (event) {
      const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
      if (!pasted) {
        return;
      }
      event.preventDefault();
      fillDigitsFrom(0, pasted);
    });
  });

  inputs[0].focus();
}

function fillDigitsFrom(startIndex, digits) {
  const inputs = getDigitInputs();
  let position = startIndex;

  digits.split("").forEach(function (digit) {
    if (position < inputs.length) {
      inputs[position].value = digit;
      position++;
    }
  });

  inputs[Math.min(position, inputs.length - 1)].focus();
}

function getTypedCode() {
  return getDigitInputs()
    .map(function (input) {
      return input.value;
    })
    .join("");
}

function clearCodeInputs() {
  getDigitInputs().forEach(function (input) {
    input.value = "";
  });
  document.getElementById("code-inputs").classList.remove("is-invalid");
  getDigitInputs()[0].focus();
}

function setCodeEnabled(isEnabled) {
  getDigitInputs().forEach(function (input) {
    input.disabled = !isEnabled;
  });
  document.getElementById("verify-submit").disabled = !isEnabled;
}

function checkCode(event) {
  event.preventDefault();

  const alert = document.getElementById("verify-alert");
  const typed = getTypedCode();
  alert.className = "alert alert-error";

  if (typed.length < 6) {
    showAlert(alert, "Faltan números", "Escribe los 6 números del código que te enviamos.");
    getDigitInputs()[typed.length].focus();
    return;
  }

  if (typed !== pending.code) {
    pending.attemptsLeft = pending.attemptsLeft - 1;
    savePending(pending);
    document.getElementById("code-inputs").classList.add("is-invalid");

    if (pending.attemptsLeft > 0) {
      const word = pending.attemptsLeft === 1 ? "intento" : "intentos";
      showAlert(
        alert,
        "Ese código no es correcto",
        "Revísalo y vuelve a intentarlo. Te quedan " + pending.attemptsLeft + " " + word + "."
      );
      getDigitInputs()[0].focus();
      getDigitInputs()[0].select();
    } else {
      showAlert(
        alert,
        "Usaste todos los intentos",
        "Por seguridad, toca «Reenviar código» para recibir uno nuevo."
      );
      setCodeEnabled(false);
      document.getElementById("resend-button").focus();
    }
    return;
  }

  clearInterval(timerId);
  if (pending.mode === "register") {
    finishRegistration();
  } else {
    finishLogin();
  }
}

function finishRegistration() {
  if (findUserByPhone(pending.user.phone) || findUserByEmail(pending.user.email)) {
    clearPending();
    showToast("Ese celular o correo ya tiene una cuenta. Inicia sesión.");
    setTimeout(function () {
      window.location.href = "index.html#login";
    }, 2000);
    return;
  }

  const user = createUser(pending.user);
  startSession(user.id, true);
  clearPending();
  window.location.href = "welcome.html";
}

function finishLogin() {
  const user = findUserByPhone(pending.phone);
  startSession(user.id, true);
  clearPending();

  document.getElementById("verify-panel").hidden = true;
  document.getElementById("opening-panel").hidden = false;
  document.getElementById("opening-title").textContent = "¡Hola, " + getFirstName(user.name) + "!";

  setTimeout(function () {
    window.location.href = "home.html";
  }, 1800);
}
