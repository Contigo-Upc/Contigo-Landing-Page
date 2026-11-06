document.addEventListener("DOMContentLoaded", function () {
  const user = requireSession();
  if (!user) {
    return;
  }

  document.getElementById("greeting").textContent = "¡Hola, " + user.name + "!";

  setupSearch();
  setupLogout();
});

function simplifyText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function setupSearch() {
  const input = document.getElementById("search-input");
  const items = document.querySelectorAll("#task-list li");
  const empty = document.getElementById("search-empty");
  const status = document.getElementById("search-status");

  input.addEventListener("input", function () {
    const query = simplifyText(input.value.trim());
    let visibleCount = 0;

    items.forEach(function (item) {
      const matches = simplifyText(item.textContent).includes(query);
      item.hidden = !matches;
      if (matches) {
        visibleCount++;
      }
    });

    empty.hidden = visibleCount > 0;

    if (query === "") {
      status.textContent = "";
    } else if (visibleCount === 0) {
      status.textContent = "No encontramos trámites con esa palabra.";
    } else {
      status.textContent = visibleCount === 1 ? "Encontramos 1 trámite." : "Encontramos " + visibleCount + " trámites.";
    }
  });
}

function setupLogout() {
  document.getElementById("logout-button").addEventListener("click", function () {
    endSession();
    window.location.href = "index.html";
  });
}
