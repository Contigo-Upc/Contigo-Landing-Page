/* Sprint 2 · Agrega las funciones nuevas a las páginas del Sprint 1 en tiempo de
   ejecución, sin editar su HTML ni su JavaScript:
   - Menú: enlace «Pagos» (US-38) y «Ayuda» abre el asistente (US-21).
   - Inicio: «Identificación de recibos» abre el escáner (US-16), trámites a medias
     (US-48) y próximos pagos (US-36/US-37).
   - Mis trámites: historial con pendientes y completados (US-48).
   - Detalle del trámite: continuar desde donde se dejó (US-48). */

const CALENDAR_NAV_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>';

document.addEventListener("DOMContentLoaded", function () {
  const user = getSessionUser();
  if (!user) {
    return;
  }

  addCalendarNavLink();
  connectHelpToAssistant();

  if (document.getElementById("frequent-list")) {
    enhanceHome(user);
  }
  if (document.getElementById("receipt-list")) {
    enhanceProcedures(user);
  }
  if (document.getElementById("requirements-list")) {
    enhanceProcedureDetail(user);
  }
});

/* Reemplaza un elemento por una copia sin los eventos del Sprint 1 ("disponible pronto"). */
function replaceWithoutListeners(element, tagName) {
  const replacement = document.createElement(tagName || element.tagName);
  Array.from(element.attributes).forEach(function (attribute) {
    if (attribute.name !== "data-soon" && attribute.name !== "type") {
      replacement.setAttribute(attribute.name, attribute.value);
    }
  });
  replacement.innerHTML = element.innerHTML;
  element.replaceWith(replacement);
  return replacement;
}

function addCalendarNavLink() {
  const nav = document.querySelector(".app-nav");
  if (!nav || nav.querySelector("[data-nav='calendar']")) {
    return;
  }

  const link = document.createElement("a");
  link.className = "app-nav-link";
  link.href = "calendar.html";
  link.dataset.nav = "calendar";
  link.innerHTML = CALENDAR_NAV_ICON + "<span>Pagos</span>";

  const proceduresLink = nav.querySelector("a[href='procedures.html']");
  if (proceduresLink) {
    proceduresLink.after(link);
  } else {
    nav.appendChild(link);
  }
  nav.classList.add("s2-nav-five");
}

function connectHelpToAssistant() {
  document.querySelectorAll(".app-nav [data-soon*='Ayuda'], [data-open-assistant]").forEach(function (element) {
    const link = element.hasAttribute("data-soon") ? replaceWithoutListeners(element) : element;
    link.setAttribute("data-open-assistant", "");
    link.addEventListener("click", function (event) {
      event.preventDefault();
      ContigoAssistant.open();
    });
  });
}

/* ---------- Inicio ---------- */

function enhanceHome(user) {
  const scanCard = document.querySelector("#task-list [data-soon*='recibos']");
  if (scanCard) {
    const link = replaceWithoutListeners(scanCard, "a");
    link.setAttribute("href", "scan.html");
  }

  const errorsCard = document.querySelector("#task-list [data-soon*='errores']");
  if (errorsCard) {
    const button = replaceWithoutListeners(errorsCard, "button");
    button.setAttribute("type", "button");
    button.addEventListener("click", function () {
      ContigoAssistant.ask("Me sale un error y no puedo seguir");
    });
  }

  const anchor = document.getElementById("search-status");
  const container = document.createElement("div");
  container.className = "s2-home-extras";
  anchor.after(container);

  const attempts = getPendingAttempts(user.id).slice(0, 3);
  if (attempts.length) {
    const section = document.createElement("section");
    section.className = "s2-home-section";
    section.setAttribute("aria-labelledby", "home-attempts-title");
    section.innerHTML = '<h2 id="home-attempts-title" class="section-title">Continúa donde lo dejaste</h2><ul class="receipt-list"></ul>';
    const list = section.querySelector("ul");
    attempts.forEach(function (attempt) {
      list.appendChild(createAttemptItem(attempt));
    });
    container.appendChild(section);
  }

  const upcoming = getBills(user.id).filter(function (bill) {
    return bill.status !== "paid";
  }).slice(0, 3);

  if (upcoming.length) {
    const section = document.createElement("section");
    section.className = "s2-home-section";
    section.setAttribute("aria-labelledby", "home-bills-title");
    section.innerHTML = '<div class="s2-section-head"><h2 id="home-bills-title" class="section-title">Tus próximos pagos</h2><a class="btn-link" href="calendar.html">Ver todos</a></div><ul class="receipt-list"></ul>';
    const list = section.querySelector("ul");

    upcoming.forEach(function (bill) {
      const service = findBillService(bill.serviceId);
      const item = document.createElement("li");
      item.className = "receipt-item";
      const days = daysUntil(bill.dueDate);
      item.innerHTML =
        '<div class="receipt-info"><p class="receipt-title"></p><p class="receipt-date"></p>' +
        '<span class="s2-status ' + BILL_STATUS[bill.status].className + '"></span></div>' +
        '<a class="btn btn-secondary receipt-button" href="calendar.html?bill=' + bill.id + '">Ver</a>';
      item.querySelector(".receipt-title").textContent = "Recibo de " + service.label.toLowerCase() + " · " + formatMoney(bill.amount);
      item.querySelector(".receipt-date").textContent = describeDueDate(bill.dueDate) + " (" + formatShortDate(bill.dueDate) + ")";
      item.querySelector(".s2-status").textContent = BILL_STATUS[bill.status].label;
      if (days !== null && days <= 2) {
        item.classList.add("s2-item-urgent");
      }
      list.appendChild(item);
    });
    container.appendChild(section);
  }
}

/* ---------- Mis trámites ---------- */

function enhanceProcedures(user) {
  const receiptSection = document.querySelector(".receipt-section");
  if (!receiptSection) {
    return;
  }

  const attempts = getGuideAttempts(user.id);
  const pending = attempts.filter(function (attempt) { return attempt.status === "pending"; });
  const completed = attempts.filter(function (attempt) { return attempt.status === "completed"; }).slice(0, 5);

  const section = document.createElement("section");
  section.className = "receipt-section s2-history-section";
  section.setAttribute("aria-labelledby", "history-title");
  section.innerHTML =
    '<h2 id="history-title" class="section-title">Trámites pendientes</h2>' +
    '<ul id="attempt-list" class="receipt-list"></ul>' +
    '<p id="attempt-empty" class="receipt-empty">No tienes trámites a medias. Si sales de una guía antes de terminarla, la guardaremos aquí para que la continúes.</p>' +
    '<h3 class="s2-history-subtitle">Guías que terminaste</h3>' +
    '<ul id="attempt-done-list" class="receipt-list"></ul>' +
    '<p id="attempt-done-empty" class="receipt-empty">Aquí verás las guías reales que completes.</p>';

  receiptSection.before(section);

  const list = section.querySelector("#attempt-list");
  pending.forEach(function (attempt) {
    list.appendChild(createAttemptItem(attempt));
  });
  section.querySelector("#attempt-empty").hidden = pending.length > 0;

  const doneList = section.querySelector("#attempt-done-list");
  completed.forEach(function (attempt) {
    doneList.appendChild(createAttemptItem(attempt));
  });
  section.querySelector("#attempt-done-empty").hidden = completed.length > 0;

  list.addEventListener("click", function () {
    setTimeout(function () {
      section.querySelector("#attempt-empty").hidden = list.children.length > 0;
    });
  });
}

/* ---------- Detalle del trámite ---------- */

function enhanceProcedureDetail(user) {
  const procedure = findProcedure(getQueryParam("id"));
  const actions = document.querySelector(".procedure-actions");
  if (!procedure || !actions) {
    return;
  }

  const attempt = findPendingAttempt(user.id, procedure.id);
  if (!attempt) {
    return;
  }

  const box = document.createElement("div");
  box.className = "alert alert-info s2-resume-alert";
  box.innerHTML =
    '<span class="alert-icon" aria-hidden="true">i</span>' +
    '<div><p class="alert-title">Tienes esta guía a medias</p>' +
    '<p class="alert-text"></p>' +
    '<div class="s2-resume-actions"><button type="button" class="btn btn-primary">Continuar donde lo dejé</button></div></div>';
  box.querySelector(".alert-text").textContent = "Te quedaste en el paso " + (attempt.index + 1) + " de " + attempt.total + ". Guardamos los datos que escribiste. Si eliges «Empezar la guía», empezarás desde el principio.";
  box.querySelector("button").addEventListener("click", function () {
    continueGuideAttempt(attempt);
  });
  actions.before(box);
}
