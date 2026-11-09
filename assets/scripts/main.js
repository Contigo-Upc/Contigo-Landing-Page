let toastTimer = null;

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) {
    return;
  }

  toast.textContent = message;
  toast.hidden = false;

  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.hidden = true;
  }, 4000);
}

function setupMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("main-menu");
  if (!toggle || !nav) {
    return;
  }

  function setMenuOpen(isOpen) {
    nav.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
  }

  toggle.addEventListener("click", function () {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    setMenuOpen(!isOpen);
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      setMenuOpen(false);
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      setMenuOpen(false);
      toggle.focus();
    }
  });
}

function setupComingSoon() {
  document.querySelectorAll("[data-soon]").forEach(function (element) {
    element.addEventListener("click", function (event) {
      event.preventDefault();
      showToast(element.dataset.soon);
    });
  });
}

function setupFooterYear() {
  const year = document.getElementById("current-year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function simplifyText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function setupLogout() {
  const button = document.getElementById("logout-button");
  if (!button) {
    return;
  }

  button.addEventListener("click", function () {
    endSession();
    window.location.href = "index.html";
  });
}

document.addEventListener("DOMContentLoaded", function () {
  setupMenu();
  setupLogout();
  setupComingSoon();
  setupFooterYear();
});
