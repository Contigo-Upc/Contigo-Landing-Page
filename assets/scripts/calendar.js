const calendar = {
  events: [],
  month: "all",
  viewYear: 0,
  viewMonth: 0,
  selectedDay: null
};

document.addEventListener("DOMContentLoaded", function () {
  const user = requireSession();
  if (!user) {
    return;
  }

  calendar.events = getActiveBills(user.id).filter(function (bill) {
    return bill.dueDate;
  });

  const start = calendar.events.length > 0 ? parseIsoDate(calendar.events[0].dueDate) : new Date();
  calendar.viewYear = start.getFullYear();
  calendar.viewMonth = start.getMonth();

  document.getElementById("calendar-empty").hidden = calendar.events.length > 0;
  document.getElementById("prev-month").innerHTML = getIcon("left");
  document.getElementById("next-month").innerHTML = getIcon("right");

  setupViewSwitch();
  setupMonthSelect();
  setupMonthNavigation();
  renderList();
  renderMonth();
});

function getMonthKey(isoDate) {
  return isoDate.slice(0, 7);
}

function createEventItem(bill) {
  const date = parseIsoDate(bill.dueDate);
  const item = document.createElement("li");

  const link = document.createElement("a");
  link.className = "event-card";
  link.href = "bills.html#" + bill.id;

  const badge = document.createElement("span");
  badge.className = "date-badge";
  badge.innerHTML = "<strong>" + String(date.getDate()).padStart(2, "0") + "</strong>" + MONTH_SHORT[date.getMonth()];

  const info = document.createElement("span");
  info.className = "event-info";

  const title = document.createElement("span");
  title.className = "event-title";
  title.textContent = getBillTitle(bill);

  const amount = document.createElement("span");
  amount.className = "event-amount";
  amount.textContent = "Por pagar: " + formatAmount(bill.amount);

  const due = document.createElement("span");
  due.className = "event-due";
  due.textContent = describeDueDate(bill.dueDate) + " · " + BILL_STATUS[bill.status].label;
  if (daysUntil(bill.dueDate) <= 0) {
    due.classList.add("is-late");
  }

  info.appendChild(title);
  info.appendChild(amount);
  info.appendChild(due);
  link.appendChild(badge);
  link.appendChild(info);
  item.appendChild(link);
  return item;
}

function setupViewSwitch() {
  const listButton = document.getElementById("list-view-button");
  const monthButton = document.getElementById("month-view-button");

  function show(view) {
    const isList = view === "list";
    document.getElementById("list-view").hidden = !isList;
    document.getElementById("month-view").hidden = isList;
    listButton.setAttribute("aria-pressed", String(isList));
    monthButton.setAttribute("aria-pressed", String(!isList));
    listButton.classList.toggle("is-selected", isList);
    monthButton.classList.toggle("is-selected", !isList);
  }

  listButton.addEventListener("click", function () {
    show("list");
  });
  monthButton.addEventListener("click", function () {
    show("month");
  });
  show("list");
}

function setupMonthSelect() {
  const select = document.getElementById("month-select");
  const months = [];

  calendar.events.forEach(function (bill) {
    const key = getMonthKey(bill.dueDate);
    if (!months.includes(key)) {
      months.push(key);
    }
  });

  const all = document.createElement("option");
  all.value = "all";
  all.textContent = "Todos los meses";
  select.appendChild(all);

  months.forEach(function (key) {
    const option = document.createElement("option");
    const parts = key.split("-").map(Number);
    option.value = key;
    option.textContent = formatMonthYear(parts[0], parts[1] - 1);
    select.appendChild(option);
  });

  select.addEventListener("change", function () {
    calendar.month = select.value;
    renderList();
  });
}

function renderList() {
  const list = document.getElementById("event-list");
  const events = calendar.events.filter(function (bill) {
    return calendar.month === "all" || getMonthKey(bill.dueDate) === calendar.month;
  });

  list.innerHTML = "";
  events.forEach(function (bill) {
    list.appendChild(createEventItem(bill));
  });

  document.getElementById("list-count").textContent = events.length === 1
    ? "1 recibo por pagar"
    : events.length + " recibos por pagar";
}

function setupMonthNavigation() {
  const weekdays = document.getElementById("weekday-row");
  WEEKDAY_SHORT.forEach(function (day, index) {
    const cell = document.createElement("th");
    cell.scope = "col";
    cell.textContent = day;
    cell.setAttribute("aria-label", ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"][index]);
    weekdays.appendChild(cell);
  });

  document.getElementById("prev-month").addEventListener("click", function () {
    moveMonth(-1);
  });
  document.getElementById("next-month").addEventListener("click", function () {
    moveMonth(1);
  });
  document.getElementById("show-month").addEventListener("click", function () {
    calendar.selectedDay = null;
    renderMonth();
  });
}

function moveMonth(step) {
  const date = new Date(calendar.viewYear, calendar.viewMonth + step, 1);
  calendar.viewYear = date.getFullYear();
  calendar.viewMonth = date.getMonth();
  calendar.selectedDay = null;
  renderMonth();
}

function getEventsOn(isoDate) {
  return calendar.events.filter(function (bill) {
    return bill.dueDate === isoDate;
  });
}

function createDayCell(date) {
  const cell = document.createElement("td");
  const iso = toIsoDate(date);
  const inMonth = date.getMonth() === calendar.viewMonth;
  const events = getEventsOn(iso);

  if (!inMonth) {
    cell.className = "other-month";
    cell.textContent = date.getDate();
    return cell;
  }

  if (events.length === 0) {
    const day = document.createElement("span");
    day.className = "day" + (iso === todayIso() ? " is-today" : "");
    day.textContent = date.getDate();
    cell.appendChild(day);
    return cell;
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = "day has-event" + (iso === todayIso() ? " is-today" : "") + (calendar.selectedDay === iso ? " is-selected" : "");
  button.textContent = date.getDate();
  button.setAttribute("aria-label", formatLongDate(iso) + ": " + events.length + (events.length === 1 ? " vencimiento" : " vencimientos"));
  button.setAttribute("aria-pressed", String(calendar.selectedDay === iso));
  button.addEventListener("click", function () {
    calendar.selectedDay = iso;
    renderMonth();
    document.getElementById("month-count").focus();
  });
  cell.appendChild(button);
  return cell;
}

function renderMonth() {
  const body = document.getElementById("month-body");
  const first = new Date(calendar.viewYear, calendar.viewMonth, 1);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(calendar.viewYear, calendar.viewMonth + 1, 0).getDate();
  const weeks = Math.ceil((offset + daysInMonth) / 7);
  const cursor = new Date(calendar.viewYear, calendar.viewMonth, 1 - offset);

  document.getElementById("month-title").textContent = formatMonthYear(calendar.viewYear, calendar.viewMonth);
  body.innerHTML = "";

  for (let week = 0; week < weeks; week++) {
    const row = document.createElement("tr");
    for (let day = 0; day < 7; day++) {
      row.appendChild(createDayCell(new Date(cursor)));
      cursor.setDate(cursor.getDate() + 1);
    }
    body.appendChild(row);
  }

  renderMonthList();
}

function renderMonthList() {
  const key = calendar.viewYear + "-" + String(calendar.viewMonth + 1).padStart(2, "0");
  const list = document.getElementById("month-list");
  const count = document.getElementById("month-count");
  const events = calendar.events.filter(function (bill) {
    return calendar.selectedDay ? bill.dueDate === calendar.selectedDay : getMonthKey(bill.dueDate) === key;
  });

  list.innerHTML = "";
  events.forEach(function (bill) {
    list.appendChild(createEventItem(bill));
  });

  const monthName = MONTH_NAMES[calendar.viewMonth];
  count.tabIndex = -1;
  if (calendar.selectedDay) {
    count.textContent = events.length + (events.length === 1 ? " vencimiento" : " vencimientos") + " el " + formatLongDate(calendar.selectedDay);
  } else {
    count.textContent = events.length === 0
      ? "No tienes vencimientos en " + monthName
      : events.length + (events.length === 1 ? " pendiente en " : " pendientes en ") + monthName;
  }
  document.getElementById("show-month").hidden = !calendar.selectedDay;
}
