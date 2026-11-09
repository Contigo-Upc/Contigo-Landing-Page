const filters = { query: "", category: "all" };

document.addEventListener("DOMContentLoaded", function () {
  const user = requireSession();
  if (!user) {
    return;
  }

  const requestedCategory = getQueryParam("category");
  if (CATEGORIES.some(function (category) { return category.id === requestedCategory; })) {
    filters.category = requestedCategory;
  }

  setupChips();
  setupProcedureSearch();
  renderProcedures();
  renderReceipts(user);
});

function setupChips() {
  const group = document.getElementById("category-chips");

  CATEGORIES.forEach(function (category) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.dataset.category = category.id;
    chip.textContent = category.label;
    group.appendChild(chip);

    chip.addEventListener("click", function () {
      filters.category = category.id;
      renderProcedures();
    });
  });
}

function setupProcedureSearch() {
  const input = document.getElementById("search-input");

  input.addEventListener("input", function () {
    filters.query = simplifyText(input.value.trim());
    renderProcedures();
  });
}

function renderProcedures() {
  const list = document.getElementById("procedure-list");
  const empty = document.getElementById("search-empty");
  const status = document.getElementById("search-status");

  document.querySelectorAll("#category-chips .chip").forEach(function (chip) {
    const isSelected = chip.dataset.category === filters.category;
    chip.classList.toggle("is-selected", isSelected);
    chip.setAttribute("aria-pressed", String(isSelected));
  });

  const matches = PROCEDURES.filter(function (procedure) {
    const matchesCategory = filters.category === "all" || procedure.category === filters.category;
    const searchable = simplifyText(procedure.name + " " + procedure.summary + " " + getCategoryLabel(procedure.category));
    return matchesCategory && searchable.includes(filters.query);
  });

  list.innerHTML = "";
  matches.forEach(function (procedure) {
    list.appendChild(createProcedureCard(procedure));
  });

  empty.hidden = matches.length > 0;

  if (matches.length === 0) {
    status.textContent = "No encontramos trámites con esa búsqueda.";
  } else {
    status.textContent = matches.length === 1 ? "Mostrando 1 trámite." : "Mostrando " + matches.length + " trámites.";
  }
}

function renderReceipts(user) {
  const list = document.getElementById("receipt-list");
  const empty = document.getElementById("receipt-empty");
  const receipts = getReceipts(user.id);

  list.innerHTML = "";
  empty.hidden = receipts.length > 0;

  receipts.forEach(function (receipt) {
    const item = document.createElement("li");
    item.className = "receipt-item";

    const info = document.createElement("div");
    info.className = "receipt-info";

    const title = document.createElement("p");
    title.className = "receipt-title";
    title.textContent = receipt.procedureName;

    const date = document.createElement("p");
    date.className = "receipt-date";
    date.textContent = formatReceiptDate(receipt.date);

    info.appendChild(title);
    info.appendChild(date);

    if (receipt.practice) {
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = "Práctica";
      info.appendChild(badge);
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-secondary receipt-button";
    button.textContent = "Guardar";
    button.setAttribute("aria-label", "Guardar comprobante de " + receipt.procedureName);
    button.addEventListener("click", function () {
      downloadReceipt(receipt);
    });

    item.appendChild(info);
    item.appendChild(button);
    list.appendChild(item);
  });
}
