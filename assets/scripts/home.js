document.addEventListener("DOMContentLoaded", function () {
  const user = requireSession();
  if (!user) {
    return;
  }

  document.getElementById("greeting").textContent = "¡Hola, " + user.name + "!";

  renderFrequentProcedures();
  setupSearch();
});

function renderFrequentProcedures() {
  const list = document.getElementById("frequent-list");

  PROCEDURES.filter(function (procedure) {
    return procedure.frequent;
  }).forEach(function (procedure) {
    list.appendChild(createProcedureCard(procedure));
  });
}

function setupSearch() {
  const input = document.getElementById("search-input");
  const items = document.querySelectorAll("#task-list li, #frequent-list li");
  const frequentSection = document.getElementById("frequent-section");
  const frequentItems = document.querySelectorAll("#frequent-list li");
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

    const visibleFrequent = Array.from(frequentItems).filter(function (item) {
      return !item.hidden;
    });
    frequentSection.hidden = visibleFrequent.length === 0;

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
