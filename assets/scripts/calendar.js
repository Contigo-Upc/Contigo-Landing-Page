/* Sprint 2 · Mis pagos y vencimientos
   US-38 calendario en vista de lista y mensual · US-33 estado del recibo
   US-36 registro manual de la fecha · US-37 activar/desactivar avisos */

const WEEK_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const calendar = {
  user: null,
  view: "list",
  filter: "open",
  month: null,
  selectedDay: null,
  highlightId: null
};

document.addEventListener("DOMContentLoaded", function () {
  const user = requireSession();
  if (!user) {
    return;
  }
  calendar.user = user;

  const today = new Date();
  calendar.month = new Date(today.getFullYear(), today.getMonth(), 1);

  document.querySelectorAll("[data-icon]").forEach(function (element) {
    element.innerHTML = getExtraIcon(element.dataset.icon);
  });
  document.getElementById("month-prev").innerHTML = getExtraIcon("arrowLeft");
  document.getElementById("month-next").innerHTML = getExtraIcon("arrowRight");

  setupNotifyCard();
  setupAddForm();
  setupTabs();
  setupListFilter();
  setupMonthNav();
  readUrlParams();
  renderAll();

  document.addEventListener("contigo:bills-changed", renderAll);
});

function readUrlParams() {
  const billId = getQueryParam("bill");
  const bill = billId ? findBill(billId) : null;
  if (bill && bill.userId === calendar.user.id) {
    calendar.highlightId = bill.id;
    calendar.filter = "all";
  }

  if (getQueryParam("view") === "month") {
    calendar.view = "month";
  }

  const addService = getQueryParam("add");
  if (findBillService(addService)) {
    openAddForm({
      serviceId: addService,
      number: getQueryParam("number") || "",
      amount: getQueryParam("amount") || ""
    });
  }
}

function renderAll() {
  renderTabs();
  renderList();
  renderMonth();
  renderAttempts();
}

/* ---------- US-37: permiso de notificaciones ---------- */

function setupNotifyCard() {
  const button = document.getElementById("notify-button");
  button.addEventListener("click", function () {
    requestReminderPermission().then(renderNotifyCard);
  });
  renderNotifyCard();
}

function renderNotifyCard() {
  const button = document.getElementById("notify-button");
  const text = document.getElementById("notify-text");

  if (!canUseSystemNotifications()) {
    button.hidden = true;
    text.textContent = "Te mostraremos los avisos dentro de Contigo 2 días antes y el mismo día en que vence cada pago.";
    return;
  }

  if (Notification.permission === "granted") {
    button.hidden = true;
    text.textContent = "Avisos activados. Te avisaremos 2 días antes y el mismo día en que vence cada pago.";
  } else if (Notification.permission === "denied") {
    button.hidden = true;
    text.textContent = "Los avisos están bloqueados en este navegador. Igual verás los recordatorios dentro de Contigo.";
  } else {
    button.hidden = false;
  }
}

/* ---------- US-36: agregar un pago a mano ---------- */

function setupAddForm() {
  const select = document.getElementById("add-service");
  BILL_SERVICES.forEach(function (service) {
    const option = document.createElement("option");
    option.value = service.id;
    option.textContent = service.label;
    select.appendChild(option);
  });

  select.addEventListener("change", function () {
    clearFieldError(select);
    updateAddNumberLabel();
  });

  const form = document.getElementById("add-bill-form");
  clearErrorsWhileTyping(form);
  const summary = getOrCreateErrorSummary(form, form.firstElementChild);
  watchErrorSummary(form, summary);

  document.getElementById("add-bill-toggle").addEventListener("click", function () {
    const section = document.getElementById("add-bill-section");
    if (section.hidden) {
      openAddForm({});
    } else {
      closeAddForm();
    }
  });

  document.getElementById("add-bill-cancel").addEventListener("click", closeAddForm);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    submitAddForm();
  });
}

function updateAddNumberLabel() {
  const service = findBillService(document.getElementById("add-service").value);
  const label = document.getElementById("add-number-label");
  const hint = document.getElementById("add-number-hint");
  if (!service) {
    label.firstChild.textContent = "Número de suministro o contrato ";
    hint.textContent = "Está en la parte de arriba de tu recibo.";
    return;
  }
  const rule = NUMBER_RULES_CAL[service.numberField];
  label.firstChild.textContent = service.numberLabel + " ";
  hint.textContent = rule.hint;
}

const NUMBER_RULES_CAL = {
  supply: { pattern: /^\d{7,8}$/, hint: "Tiene 7 u 8 números. Está arriba de tu recibo.", error: "Escribe 7 u 8 números, sin espacios ni letras." },
  contract: { pattern: /^\d{6,10}$/, hint: "Tiene entre 6 y 10 números. Está junto a tu nombre.", error: "Escribe entre 6 y 10 números, sin espacios ni letras." }
};

function openAddForm(prefill) {
  const section = document.getElementById("add-bill-section");
  const form = document.getElementById("add-bill-form");
  form.reset();
  form.querySelectorAll(".field-input").forEach(clearFieldError);

  document.getElementById("add-service").value = prefill.serviceId || "";
  document.getElementById("add-number").value = prefill.number || "";
  document.getElementById("add-amount").value = prefill.amount || "";
  updateAddNumberLabel();

  section.hidden = false;
  document.getElementById("add-bill-toggle").setAttribute("aria-expanded", "true");
  setTimeout(function () {
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    const target = prefill.serviceId ? document.getElementById("add-due-date") : document.getElementById("add-service");
    target.focus({ preventScroll: true });
  }, 50);
}

function closeAddForm() {
  document.getElementById("add-bill-section").hidden = true;
  document.getElementById("add-bill-toggle").setAttribute("aria-expanded", "false");
}

function submitAddForm() {
  const form = document.getElementById("add-bill-form");
  const select = document.getElementById("add-service");
  const number = document.getElementById("add-number");
  const amount = document.getElementById("add-amount");
  const dueDate = document.getElementById("add-due-date");
  const service = findBillService(select.value);
  let isValid = true;

  [select, number, amount, dueDate].forEach(clearFieldError);

  if (!service) {
    showFieldError(select, "Elige el servicio de tu recibo.");
    isValid = false;
  }

  const numberValue = number.value.replace(/\s/g, "");
  if (!numberValue) {
    showFieldError(number, "Escribe este dato para continuar.");
    isValid = false;
  } else if (service && !NUMBER_RULES_CAL[service.numberField].pattern.test(numberValue)) {
    showFieldError(number, NUMBER_RULES_CAL[service.numberField].error);
    isValid = false;
  }

  const amountValue = amount.value.trim().replace(",", ".");
  if (!amountValue) {
    showFieldError(amount, "Escribe el monto para continuar.");
    isValid = false;
  } else if (!AMOUNT_FIELD.pattern.test(amountValue)) {
    showFieldError(amount, AMOUNT_FIELD.error);
    isValid = false;
  }

  const days = daysUntil(dueDate.value);
  if (!dueDate.value) {
    showFieldError(dueDate, "Elige la fecha de vencimiento de tu recibo.");
    isValid = false;
  } else if (days === null || days < -60 || days > 365) {
    showFieldError(dueDate, "Revisa la fecha: debe ser la que aparece en tu recibo actual.");
    isValid = false;
  }

  const summary = getOrCreateErrorSummary(form, form.firstElementChild);
  if (!isValid) {
    showErrorSummary(summary, getInvalidInputs(form));
    scrollToFirstError(form);
    return;
  }
  summary.hidden = true;

  const values = { number: numberValue, amount: Number(amountValue).toFixed(2), dueDate: dueDate.value };
  const duplicate = checkDuplicatePayment(calendar.user.id, service.id, values.number, values.dueDate);

  if (duplicate && duplicate.type !== "registered") {
    showDuplicateWarning(duplicate).then(function (choice) {
      if (choice === "view") {
        closeAddForm();
        focusBill(duplicate.bill.id);
      }
    });
    return;
  }
  if (duplicate) {
    showToast("Ese recibo ya está en tu lista. Puedes cambiar su fecha desde la tarjeta.");
    closeAddForm();
    focusBill(duplicate.bill.id);
    return;
  }

  const unusual = checkUnusualAmount(calendar.user.id, service.id, values.amount);
  const confirmation = unusual ? confirmUnusualAmount(unusual, values.amount, service.label) : Promise.resolve(true);

  confirmation.then(function (confirmed) {
    if (!confirmed) {
      amount.focus();
      amount.select();
      return;
    }
    const bill = createBill({
      userId: calendar.user.id,
      serviceId: service.id,
      number: values.number,
      amount: values.amount,
      dueDate: values.dueDate,
      source: "manual"
    });
    closeAddForm();
    showToast("Guardamos tu pago. Te avisaremos antes de que venza.");
    document.dispatchEvent(new CustomEvent("contigo:bills-changed"));
    focusBill(bill.id);
  });
}

/* ---------- Pestañas ---------- */

function setupTabs() {
  const tabs = [document.getElementById("tab-list"), document.getElementById("tab-month")];
  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () {
      calendar.view = index === 0 ? "list" : "month";
      renderTabs();
    });
    tab.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        const next = tabs[(index + 1) % 2];
        next.click();
        next.focus();
      }
    });
  });
}

function renderTabs() {
  const isList = calendar.view === "list";
  const listTab = document.getElementById("tab-list");
  const monthTab = document.getElementById("tab-month");
  listTab.setAttribute("aria-selected", String(isList));
  monthTab.setAttribute("aria-selected", String(!isList));
  listTab.tabIndex = isList ? 0 : -1;
  monthTab.tabIndex = isList ? -1 : 0;
  document.getElementById("panel-list").hidden = !isList;
  document.getElementById("panel-month").hidden = isList;
}

/* ---------- Tarjeta de recibo ---------- */

function getServiceProcedure(serviceId) {
  return findProcedure(serviceId);
}

function createBillCard(bill) {
  const service = findBillService(bill.serviceId);
  const procedure = getServiceProcedure(bill.serviceId);
  const status = BILL_STATUS[bill.status];
  const days = daysUntil(bill.dueDate);

  const item = document.createElement("li");
  item.className = "s2-bill-card is-" + bill.status;
  item.id = "bill-" + bill.id;
  item.tabIndex = -1;
  if (bill.status !== "paid" && days !== null && days <= 2) {
    item.classList.add("is-urgent");
  }

  const head = document.createElement("div");
  head.className = "s2-bill-head";
  head.innerHTML =
    '<span class="task-icon ' + (procedure ? procedure.background : "icon-bg-mint") + ' s2-bill-icon">' + getIcon(procedure ? procedure.icon : "receipt") + "</span>" +
    '<div class="s2-bill-title-box"><h3 class="s2-bill-title"></h3><p class="s2-bill-number"></p></div>' +
    '<span class="s2-status ' + status.className + '"></span>';
  head.querySelector(".s2-bill-title").textContent = "Recibo de " + service.label.toLowerCase();
  head.querySelector(".s2-bill-number").textContent = service.numberLabel + ": " + bill.number;
  head.querySelector(".s2-status").textContent = status.label;

  const info = document.createElement("div");
  info.className = "s2-bill-info";
  info.innerHTML =
    '<p class="s2-bill-amount"></p>' +
    '<p class="s2-bill-due">' + getIcon("calendar") + "<span></span></p>";
  info.querySelector(".s2-bill-amount").textContent = formatMoney(bill.amount);
  info.querySelector(".s2-bill-due span").textContent = bill.status === "paid"
    ? "Vencía el " + formatLongDate(bill.dueDate)
    : "Vence el " + formatLongDate(bill.dueDate) + " · " + describeDueDate(bill.dueDate);

  item.appendChild(head);
  item.appendChild(info);

  if (bill.status === "processing" && bill.processingAt) {
    const note = document.createElement("p");
    note.className = "s2-bill-note";
    note.textContent = "Empezaste a pagar el " + formatDateTime(bill.processingAt) + ". Espera la confirmación de tu empresa antes de volver a intentarlo.";
    item.appendChild(note);
  }

  /* US-37, escenario 2: desactivar avisos de este pago */
  if (bill.status !== "paid") {
    const reminder = document.createElement("label");
    reminder.className = "checkbox s2-bill-reminder";
    reminder.innerHTML = '<input type="checkbox"><span>Avisarme antes de que venza</span>';
    const checkbox = reminder.querySelector("input");
    checkbox.checked = Boolean(bill.reminders);
    checkbox.addEventListener("change", function () {
      updateBill(bill.id, { reminders: checkbox.checked, notified: {} });
      showToast(checkbox.checked ? "Te avisaremos antes de que venza este pago." : "Listo. Ya no te avisaremos de este pago.");
      document.dispatchEvent(new CustomEvent("contigo:bills-changed"));
    });
    item.appendChild(reminder);
  }

  item.appendChild(createStatusActions(bill));

  if (bill.status === "paid") {
    item.appendChild(createPaymentProof(bill));
  }

  item.appendChild(createEditRow(bill));
  return item;
}

/* US-33 / TSK-26: estado pendiente, en proceso o pagado */
function createStatusActions(bill) {
  const actions = document.createElement("div");
  actions.className = "s2-bill-actions";

  function addButton(label, style, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn " + (style === "primary" ? "btn-primary" : "btn-secondary") + " s2-small-button";
    button.textContent = label;
    button.addEventListener("click", onClick);
    actions.appendChild(button);
  }

  function changeStatus(status, message) {
    setBillStatus(bill.id, status);
    showToast(message);
    calendar.highlightId = bill.id;
    document.dispatchEvent(new CustomEvent("contigo:bills-changed"));
    focusBill(bill.id);
  }

  if (bill.status === "pending") {
    const guideLink = document.createElement("a");
    guideLink.className = "btn btn-primary s2-small-button";
    guideLink.href = "guide.html?id=" + bill.serviceId + "&mode=real";
    guideLink.textContent = "Ver cómo pagar";
    guideLink.addEventListener("click", function () {
      const service = findBillService(bill.serviceId);
      const values = { amount: Number(bill.amount).toFixed(2) };
      values[service.numberField] = bill.number;
      writeJson(sessionStorage, GUIDE_KEY, { id: bill.serviceId, mode: "real", index: 0, values: values, receiptId: null });
    });
    actions.appendChild(guideLink);
    addButton("Ya empecé a pagar", "secondary", function () {
      changeStatus("processing", "Tu recibo está «en proceso». Márcalo como pagado cuando te confirmen.");
    });
    addButton("Ya está pagado", "secondary", function () {
      changeStatus("paid", "¡Bien! Marcamos tu recibo como pagado.");
    });
  } else if (bill.status === "processing") {
    addButton("Ya me confirmaron el pago", "primary", function () {
      changeStatus("paid", "¡Bien! Marcamos tu recibo como pagado.");
    });
    addButton("Todavía no pagué", "secondary", function () {
      changeStatus("pending", "Volvimos a marcar tu recibo como pendiente.");
    });
  } else {
    addButton("Ver comprobante de pago", "primary", function (event) {
      const proof = event.target.closest(".s2-bill-card").querySelector(".s2-payment-proof");
      proof.hidden = !proof.hidden;
      event.target.textContent = proof.hidden ? "Ver comprobante de pago" : "Ocultar comprobante";
    });
    addButton("Marcar como pendiente", "secondary", function () {
      changeStatus("pending", "Volvimos a marcar tu recibo como pendiente.");
    });
  }

  return actions;
}

function buildPaymentText(bill) {
  const service = findBillService(bill.serviceId);
  return [
    "REGISTRO DE PAGO - CONTIGO",
    "",
    "Código: " + bill.paymentCode,
    "Servicio: " + service.label,
    service.numberLabel + ": " + bill.number,
    "Monto: " + formatMoney(bill.amount),
    "Fecha de vencimiento: " + formatShortDate(bill.dueDate),
    "Marcado como pagado: " + formatDateTime(bill.paidAt),
    "",
    "Importante: este es tu registro personal en Contigo.",
    "El comprobante oficial de pago te lo entrega tu empresa o tu banco."
  ].join("\n");
}

function createPaymentProof(bill) {
  const proof = document.createElement("div");
  proof.className = "s2-payment-proof";
  proof.hidden = calendar.highlightId !== bill.id;

  const list = document.createElement("dl");
  list.className = "s2-proof-list";
  [
    ["Código", bill.paymentCode],
    ["Pagado el", formatDateTime(bill.paidAt)],
    ["Monto", formatMoney(bill.amount)]
  ].forEach(function (row) {
    const term = document.createElement("dt");
    term.textContent = row[0];
    const detail = document.createElement("dd");
    detail.textContent = row[1];
    list.appendChild(term);
    list.appendChild(detail);
  });

  const note = document.createElement("p");
  note.className = "field-hint";
  note.textContent = "Es tu registro en Contigo. El comprobante oficial te lo da tu empresa o tu banco.";

  const save = document.createElement("button");
  save.type = "button";
  save.className = "btn btn-secondary s2-small-button";
  save.textContent = "Guardar registro";
  save.addEventListener("click", function () {
    const blob = new Blob([buildPaymentText(bill)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pago-" + bill.paymentCode + ".txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
    showToast("Guardamos el registro en tu dispositivo.");
  });

  proof.appendChild(list);
  proof.appendChild(note);
  proof.appendChild(save);

  if (calendar.highlightId === bill.id) {
    setTimeout(function () {
      const button = proof.parentElement && proof.parentElement.querySelector(".s2-bill-actions .btn-primary");
      if (button && button.textContent === "Ver comprobante de pago") {
        button.textContent = "Ocultar comprobante";
      }
    });
  }
  return proof;
}

/* US-36, escenario 2: cambiar la fecha a mano, y eliminar */
function createEditRow(bill) {
  const row = document.createElement("div");
  row.className = "s2-bill-edit";

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "btn-link";
  editButton.textContent = "Cambiar fecha";

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "btn-link s2-danger-link";
  removeButton.textContent = "Eliminar";

  const form = document.createElement("form");
  form.className = "s2-date-form";
  form.noValidate = true;
  form.hidden = true;
  const inputId = "date-" + bill.id;
  form.innerHTML =
    '<div class="field"><label class="field-label" for="' + inputId + '">Nueva fecha de vencimiento</label>' +
    '<input class="field-input" id="' + inputId + '" type="date" aria-describedby="' + inputId + '-error">' +
    '<p class="field-error" id="' + inputId + '-error"></p></div>' +
    '<div class="s2-date-actions"><button type="submit" class="btn btn-primary s2-small-button">Guardar fecha</button>' +
    '<button type="button" class="btn btn-secondary s2-small-button" data-cancel>Cancelar</button></div>';

  const input = form.querySelector("input");
  input.value = bill.dueDate || "";

  editButton.addEventListener("click", function () {
    form.hidden = !form.hidden;
    if (!form.hidden) {
      input.focus();
    }
  });
  form.querySelector("[data-cancel]").addEventListener("click", function () {
    form.hidden = true;
    clearFieldError(input);
    editButton.focus();
  });
  input.addEventListener("input", function () {
    clearFieldError(input);
  });
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const days = daysUntil(input.value);
    if (!input.value) {
      showFieldError(input, "Elige la fecha de vencimiento para continuar.");
      input.focus();
      return;
    }
    if (days === null || days < -60 || days > 365) {
      showFieldError(input, "Revisa la fecha: debe ser la que aparece en tu recibo actual.");
      input.focus();
      return;
    }
    updateBill(bill.id, { dueDate: input.value, notified: {} });
    showToast("Guardamos la nueva fecha en tu calendario.");
    calendar.highlightId = bill.id;
    document.dispatchEvent(new CustomEvent("contigo:bills-changed"));
    focusBill(bill.id);
  });

  removeButton.addEventListener("click", function () {
    openDialog({
      tone: "warning",
      icon: "trash",
      title: "¿Eliminar este pago?",
      text: "Dejarás de ver este recibo en tu calendario y no te avisaremos de él.",
      actions: [
        { label: "Sí, eliminar", value: "delete", style: "primary" },
        { label: "No, dejarlo", value: "keep", style: "secondary" }
      ]
    }).then(function (choice) {
      if (choice === "delete") {
        deleteBill(bill.id);
        showToast("Eliminamos el pago de tu calendario.");
        document.dispatchEvent(new CustomEvent("contigo:bills-changed"));
      }
    });
  });

  row.appendChild(editButton);
  row.appendChild(removeButton);
  row.appendChild(form);
  return row;
}

function focusBill(billId) {
  calendar.highlightId = billId;
  calendar.view = "list";
  calendar.filter = "all";
  renderAll();
  const card = document.getElementById("bill-" + billId);
  if (card) {
    card.classList.add("is-highlighted");
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    card.focus({ preventScroll: true });
  }
}

/* ---------- US-38: vista de lista ---------- */

function setupListFilter() {
  document.querySelectorAll("#list-filter .chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      calendar.filter = chip.dataset.filter;
      renderList();
    });
  });
}

function renderList() {
  document.querySelectorAll("#list-filter .chip").forEach(function (chip) {
    const selected = chip.dataset.filter === calendar.filter;
    chip.classList.toggle("is-selected", selected);
    chip.setAttribute("aria-pressed", String(selected));
  });

  const all = getBills(calendar.user.id);
  const bills = calendar.filter === "open"
    ? all.filter(function (bill) { return bill.status !== "paid"; })
    : all;

  const list = document.getElementById("bill-list");
  list.innerHTML = "";
  bills.forEach(function (bill) {
    const card = createBillCard(bill);
    if (bill.id === calendar.highlightId) {
      card.classList.add("is-highlighted");
    }
    list.appendChild(card);
  });

  const empty = document.getElementById("bill-empty");
  empty.hidden = bills.length > 0;
  empty.querySelector(".s2-empty-title").textContent = calendar.filter === "open" || all.length === 0
    ? "No tienes pagos pendientes"
    : "No tienes pagos guardados";

  document.getElementById("list-status").textContent = bills.length === 1 ? "Mostrando 1 pago." : "Mostrando " + bills.length + " pagos.";

  if (calendar.highlightId && calendar.view === "list") {
    const card = document.getElementById("bill-" + calendar.highlightId);
    if (card && !calendar.scrolledOnce) {
      calendar.scrolledOnce = true;
      setTimeout(function () {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }
}

/* ---------- US-38: vista mensual ---------- */

function monthKey(date) {
  return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0");
}

function monthLabel(date) {
  const text = date.toLocaleDateString("es-PE", { month: "long", year: "numeric" });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function setupMonthNav() {
  document.getElementById("month-prev").addEventListener("click", function () {
    changeMonth(-1);
  });
  document.getElementById("month-next").addEventListener("click", function () {
    changeMonth(1);
  });
  document.getElementById("month-select").addEventListener("change", function (event) {
    const parts = event.target.value.split("-").map(Number);
    calendar.month = new Date(parts[0], parts[1] - 1, 1);
    calendar.selectedDay = null;
    renderMonth();
  });
  document.getElementById("month-show-all").addEventListener("click", function () {
    calendar.selectedDay = null;
    renderMonth();
  });
}

function changeMonth(step) {
  calendar.month = new Date(calendar.month.getFullYear(), calendar.month.getMonth() + step, 1);
  calendar.selectedDay = null;
  renderMonth();
}

function renderMonthSelect(bills) {
  const select = document.getElementById("month-select");
  const today = new Date();
  const keys = {};

  for (let offset = -3; offset <= 9; offset++) {
    keys[monthKey(new Date(today.getFullYear(), today.getMonth() + offset, 1))] = true;
  }
  bills.forEach(function (bill) {
    if (bill.dueDate) {
      keys[bill.dueDate.slice(0, 7)] = true;
    }
  });
  keys[monthKey(calendar.month)] = true;

  select.innerHTML = "";
  Object.keys(keys).sort().forEach(function (key) {
    const parts = key.split("-").map(Number);
    const option = document.createElement("option");
    option.value = key;
    option.textContent = monthLabel(new Date(parts[0], parts[1] - 1, 1));
    select.appendChild(option);
  });
  select.value = monthKey(calendar.month);
}

function renderMonth() {
  const bills = getBills(calendar.user.id);
  renderMonthSelect(bills);

  const currentKey = monthKey(calendar.month);
  const monthBills = bills.filter(function (bill) {
    return bill.dueDate && bill.dueDate.slice(0, 7) === currentKey;
  });

  const grid = document.getElementById("month-grid");
  grid.innerHTML = "";

  const headRow = document.createElement("div");
  headRow.className = "s2-month-row s2-month-head";
  headRow.setAttribute("role", "row");
  WEEK_DAYS.forEach(function (day) {
    const cell = document.createElement("span");
    cell.className = "s2-month-weekday";
    cell.setAttribute("role", "columnheader");
    cell.textContent = day;
    headRow.appendChild(cell);
  });
  grid.appendChild(headRow);

  const year = calendar.month.getFullYear();
  const month = calendar.month.getMonth();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = getTodayKey();

  let row = null;
  for (let cellIndex = 0; cellIndex < firstWeekday + daysInMonth; cellIndex++) {
    if (cellIndex % 7 === 0) {
      row = document.createElement("div");
      row.className = "s2-month-row";
      row.setAttribute("role", "row");
      grid.appendChild(row);
    }

    if (cellIndex < firstWeekday) {
      const blank = document.createElement("span");
      blank.className = "s2-month-day is-blank";
      blank.setAttribute("role", "gridcell");
      row.appendChild(blank);
      continue;
    }

    const day = cellIndex - firstWeekday + 1;
    const dateKey = toDateKey(new Date(year, month, day));
    const dayBills = monthBills.filter(function (bill) {
      return bill.dueDate === dateKey;
    });

    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "s2-month-day";
    cell.setAttribute("role", "gridcell");
    if (dateKey === todayKey) {
      cell.classList.add("is-today");
    }
    if (dayBills.length) {
      cell.classList.add("has-bills");
      if (dayBills.some(function (bill) { return bill.status !== "paid"; })) {
        cell.classList.add("has-open");
      }
    }
    if (calendar.selectedDay === dateKey) {
      cell.classList.add("is-selected");
      cell.setAttribute("aria-pressed", "true");
    }

    cell.innerHTML = '<span class="s2-day-number">' + day + "</span>" + (dayBills.length ? '<span class="s2-day-dot" aria-hidden="true">' + dayBills.length + "</span>" : "");
    cell.setAttribute("aria-label", formatLongDate(dateKey) + (dateKey === todayKey ? ", hoy" : "") + (dayBills.length ? ", " + dayBills.length + (dayBills.length === 1 ? " pago" : " pagos") : ", sin pagos"));

    cell.addEventListener("click", function () {
      calendar.selectedDay = calendar.selectedDay === dateKey ? null : dateKey;
      renderMonth();
    });
    row.appendChild(cell);
  }

  const visible = calendar.selectedDay
    ? monthBills.filter(function (bill) { return bill.dueDate === calendar.selectedDay; })
    : monthBills;

  document.getElementById("month-list-title").textContent = calendar.selectedDay
    ? "Pagos del " + formatLongDate(calendar.selectedDay)
    : "Pagos de " + monthLabel(calendar.month).toLowerCase();
  document.getElementById("month-show-all").hidden = !calendar.selectedDay;

  const list = document.getElementById("month-bill-list");
  list.innerHTML = "";
  visible.forEach(function (bill) {
    list.appendChild(createBillCard(bill));
  });

  const empty = document.getElementById("month-empty");
  empty.hidden = visible.length > 0;
  document.getElementById("month-empty-text").textContent = calendar.selectedDay
    ? "No tienes pagos este día"
    : "No tienes pagos en " + monthLabel(calendar.month).toLowerCase();
}

/* ---------- US-48: trámites a medias ---------- */

function renderAttempts() {
  const attempts = getPendingAttempts(calendar.user.id);
  const section = document.getElementById("calendar-attempts");
  const list = document.getElementById("calendar-attempt-list");
  list.innerHTML = "";
  attempts.forEach(function (attempt) {
    list.appendChild(createAttemptItem(attempt));
  });
  section.hidden = attempts.length === 0;
}
