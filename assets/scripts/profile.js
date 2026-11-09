document.addEventListener("DOMContentLoaded", function () {
  const user = requireSession();
  if (!user) {
    return;
  }

  setupProfileForm(user);
});

function setupProfileForm(user) {
  const form = document.getElementById("profile-form");
  const name = document.getElementById("profile-name");
  const age = document.getElementById("profile-age");
  const phone = document.getElementById("profile-phone");
  const email = document.getElementById("profile-email");
  const alert = document.getElementById("profile-alert");
  const cancel = document.getElementById("profile-cancel");

  function fillForm() {
    name.value = user.name;
    age.value = user.age;
    phone.value = formatPhone(user.phone);
    email.value = user.email;
  }

  fillForm();
  clearErrorsWhileTyping(form);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    hideAlert(alert);

    const results = [
      validateName(name),
      validateAge(age),
      validatePhone(phone),
      validateEmail(email)
    ];

    if (results.includes(false)) {
      focusFirstError(form);
      return;
    }

    const phoneDigits = normalizePhone(phone.value);
    const phoneOwner = findUserByPhone(phoneDigits);
    if (phoneOwner && phoneOwner.id !== user.id) {
      showFieldError(phone, "Este número ya está registrado en otra cuenta.");
      phone.focus();
      return;
    }

    const emailOwner = findUserByEmail(email.value);
    if (emailOwner && emailOwner.id !== user.id) {
      showFieldError(email, "Este correo ya está registrado en otra cuenta.");
      email.focus();
      return;
    }

    const updated = updateUser(user.id, {
      name: name.value.trim(),
      age: Number(age.value),
      phone: phoneDigits,
      email: email.value.trim()
    });

    user.name = updated.name;
    user.age = updated.age;
    user.phone = updated.phone;
    user.email = updated.email;
    fillForm();

    showAlert(alert, "Guardamos tus cambios", "Tus datos ya están actualizados, " + getFirstName(updated.name) + ".");
    alert.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  cancel.addEventListener("click", function () {
    fillForm();
    form.querySelectorAll(".field-input").forEach(clearFieldError);
    hideAlert(alert);
    showToast("No guardamos ningún cambio.");
    setTimeout(function () {
      window.location.href = "home.html";
    }, 1200);
  });
}