document.addEventListener("DOMContentLoaded", function () {
  const user = requireSession();
  if (!user) {
    return;
  }

  document.getElementById("welcome-title").textContent =
    "¡Te damos la bienvenida, " + getFirstName(user.name) + "!";

  document.getElementById("summary-name").textContent = user.name;
  document.getElementById("summary-age").textContent = user.age + " años";
  document.getElementById("summary-phone").textContent = formatPhone(user.phone);
  document.getElementById("summary-email").textContent = user.email;

  document.getElementById("start-button").focus();
});
