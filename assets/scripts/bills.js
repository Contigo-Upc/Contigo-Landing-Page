const STATUS_FILTERS = [
  { id: "all", label: "Todos" },
  { id: "pending", label: "Pendientes" },
  { id: "processing", label: "En proceso" },
  { id: "paid", label: "Pagados" }
];

const billsPage = {
  user: null,
  filter: "all"
};

document.addEventListener("DOMContentLoaded", function () {
  const user = requireSession();
  if (!user) {
    return;
  }
  billsPage.user = user;

  document.getElementById("today-text").textContent = formatLongDate(todayIso());

  setupStatusChips();
  setupDeviceNotifications();
  refresh();
  notifyDevice(user.id);
  highlightLinkedBill();
});

function refresh() {
  renderReminders(document.getElementById("reminder-list"), billsPage.user.id);
  renderBills();
}

function setupStatusChips() {
  const group = document.getElementById("status-chips");

  STATUS_FILTERS.forEach(function (filter) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.dataset.filter = filter.id;
    chip.textContent = filter.label;
    chip.addEventListener("click", function () {
      billsPage.filter = filter.id;
      renderBills();
    });
    group.appendChild(chip);
  });
}

function setupDeviceNotifications() {
  const box = document.getElementById("device-box");
  const button = document.getElementById("device-button");

  if (!canUseDeviceNotifications() || Notification.permission !== "default") {
    return;
  }

  box.hidden = false;
  button.addEventListener("click", function () {
    Notification.requestPermission().then(function (permission) {
      box.hidden = true;
      if (permission === "granted") {
        showToast("Listo. Te avisaremos en este dispositivo cuando un recibo esté por vencer.");
        notifyDevice(billsPage.user.id);
      } else {
        showToast("No activamos los avisos. Igual verás los recordatorios aquí y en el inicio.");
      }
    });
  });
}

function getSortedBills() {
  const bills = getBills(billsPage.user.id);
  const active = bills.filter(function (bill) {
    return bill.status !== "paid";
  }).sort(compareByDueDate);
  const paid = bills.filter(function (bill) {
    return bill.status === "paid";
  }).sort(function (a, b) {
    return b.createdAt.localeCompare(a.createdAt);
  });
  return active.concat(paid);
}

function renderBills() {
  const list = document.getElementById("bill-list");
  const empty = document.getElementById("bills-empty");
  const status = document.getElementById("bills-status");
  const all = getSortedBills();
  const bills = all.filter(function (bill) {
    return billsPage.filter === "all" || bill.status === billsPage.filter;
  });

  document.querySelectorAll("#status-chips .chip").forEach(function (chip) {
    const isSelected = chip.dataset.filter === billsPage.filter;
    chip.classList.toggle("is-selected", isSelected);
    chip.setAttribute("aria-pressed", String(isSelected));
  });

  list.innerHTML = "";
  bills.forEach(function (bill) {
    list.appendChild(createBillCard(bill));
  });

  empty.hidden = bills.length > 0;
  document.getElementById("bills-empty-text").textContent = all.length === 0
    ? "Aún no tienes recibos. Escanea uno o agrégalo a mano para que te avisemos antes de que venza."
    : "No tienes recibos con este estado.";
  status.textContent = bills.length === 1 ? "Mostrando 1 recibo." : "Mostrando " + bills.length + " recibos.";
}

function createBillCard(bill) {
  const item = document.createElement("li");
  item.className = "bill-card";
  item.id = bill.id;

  const header = document.createElement("div");
  header.className = "bill-header";

  const title = document.createElement("h2");
  title.className = "bill-title";
  title.tabIndex = -1;
  title.textContent = getBillTitle(bill);

  const amount = document.createElement("p");
  amount.className = "bill-amount";
  amount.textContent = formatAmount(bill.amount);

  header.appendChild(title);
  header.appendChild(amount);

  const meta = document.createElement("p");
  meta.className = "bill-meta";
  meta.textContent = getBillNumberLabel(bill.procedureId) + ": " + bill.number + " · " +
    (bill.dueDate ? describeDueDate(bill.dueDate) : "Sin fecha de vencimiento");
  if (bill.dueDate && bill.status !== "paid" && daysUntil(bill.dueDate) <= 0) {
    meta.classList.add("is-late");
  }

  item.appendChild(header);
  item.appendChild(meta);
  item.appendChild(createStatusBadge(bill));

  if (bill.status === "processing") {
    const note = document.createElement("p");
    note.className = "bill-note";
    note.textContent = "Aún no confirmas este pago. Revisa en tu banco si el pago se hizo y márcalo cuando lo confirmes.";
    item.appendChild(note);
  }

  if (!bill.dueDate && bill.status !== "paid") {
    item.appendChild(createDateForm(bill));
  }

  if (bill.status !== "paid") {
    item.appendChild(createReminderSwitch(bill));
  }

  item.appendChild(createBillActions(bill));
  return item;
}

function createReminderSwitch(bill) {
  const row = document.createElement("div");
  row.className = "switch-row";

  const label = document.createElement("span");
  label.id = "switch-label-" + bill.id;
  label.textContent = bill.reminders ? "Recordatorios activados" : "Recordatorios desactivados";

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "switch";
  toggle.setAttribute("role", "switch");
  toggle.setAttribute("aria-checked", String(bill.reminders));
  toggle.setAttribute("aria-labelledby", label.id);
  toggle.addEventListener("click", function () {
    bill.reminders = !bill.reminders;
    saveBill(bill);
    showToast(bill.reminders
      ? "Te avisaremos 2 días antes y el día del vencimiento."
      : "Ya no recibirás avisos para tu " + getBillTitle(bill).toLowerCase() + ".");
    refresh();
    document.querySelector("#" + bill.id + " .switch").focus();
  });

  row.appendChild(label);
  row.appendChild(toggle);
  return row;
}

function createDateForm(bill) {
  const form = document.createElement("form");
  form.className = "date-form";
  form.noValidate = true;

  const field = document.createElement("div");
  field.className = "field";

  const label = document.createElement("label");
  label.className = "field-label";
  label.htmlFor = "date-" + bill.id;
  label.textContent = "Fecha de vencimiento";

  const input = document.createElement("input");
  input.className = "field-input";
  input.type = "date";
  input.id = "date-" + bill.id;
  input.setAttribute("aria-describedby", input.id + "-error");
  input.addEventListener("input", function () {
    clearFieldError(input);
  });

  const error = document.createElement("p");
  error.className = "field-error";
  error.id = input.id + "-error";

  const button = document.createElement("button");
  button.type = "submit";
  button.className = "btn btn-secondary";
  button.textContent = "Guardar en calendario";

  field.appendChild(label);
  field.appendChild(input);
  field.appendChild(error);
  form.appendChild(field);
  form.appendChild(button);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (input.value === "") {
      showFieldError(input, "Escribe la fecha de vencimiento. Está en tu recibo.");
      input.focus();
      return;
    }
    bill.dueDate = input.value;
    saveBill(bill);
    showToast("Guardamos el vencimiento para el " + formatLongDate(bill.dueDate) + ".");
    refresh();
  });

  return form;
}

function createActionButton(text, className, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = text;
  button.addEventListener("click", onClick);
  return button;
}

function changeStatus(bill, status, message) {
  bill.status = status;
  saveBill(bill);
  showToast(message);
  refresh();
  const title = document.querySelector("#" + bill.id + " .bill-title");
  if (title) {
    title.focus();
  }
}

function createBillActions(bill) {
  const actions = document.createElement("div");
  actions.className = "bill-actions";

  if (bill.status === "pending") {
    const pay = document.createElement("a");
    pay.className = "btn btn-primary";
    pay.href = "guide.html?id=" + bill.procedureId + "&mode=real&bill=" + bill.id;
    pay.textContent = "Pagar con la guía";
    pay.addEventListener("click", function () {
      clearProgress(billsPage.user.id, bill.procedureId);
    });
    actions.appendChild(pay);
    actions.appendChild(createActionButton("Ya pagué", "btn btn-secondary", function () {
      changeStatus(bill, "processing", "Marcamos tu recibo «En proceso». Confírmalo cuando veas el pago en tu banco.");
    }));
  }

  if (bill.status === "processing") {
    actions.appendChild(createActionButton("Ya lo confirmé", "btn btn-primary", function () {
      changeStatus(bill, "paid", "¡Listo! Tu " + getBillTitle(bill).toLowerCase() + " quedó como pagado.");
    }));
    actions.appendChild(createActionButton("Todavía no pagué", "btn btn-secondary", function () {
      changeStatus(bill, "pending", "Volvimos a marcar tu recibo como pendiente.");
    }));
  }

  if (bill.status === "paid") {
    actions.appendChild(createActionButton("Deshacer", "btn-link", function () {
      changeStatus(bill, "processing", "Tu recibo volvió a «En proceso».");
    }));
  }

  return actions;
}

function highlightLinkedBill() {
  const id = window.location.hash.slice(1);
  const card = id ? document.getElementById(id) : null;
  if (!card) {
    return;
  }
  card.classList.add("is-highlighted");
  card.scrollIntoView({ behavior: "smooth", block: "center" });
  card.querySelector(".bill-title").focus({ preventScroll: true });
}
