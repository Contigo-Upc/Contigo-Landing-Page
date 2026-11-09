/* Sprint 2 · US-37: notificación previa al vencimiento.
   Sin servidor no hay "push" real: al abrir la app (y cada minuto mientras está abierta)
   revisamos los recibos y mostramos un aviso dentro de la página y, si la persona
   lo permitió, una notificación del sistema. */

const REMINDER_DAYS_BEFORE = 2;
const DISMISSED_REMINDERS_KEY = "contigo.dismissedReminders";

function getReminderKind(bill) {
  if (bill.status === "paid" || !bill.reminders) {
    return null;
  }
  const days = daysUntil(bill.dueDate);
  if (days === null || days < 0) {
    return null;
  }
  if (days === 0) {
    return "today";
  }
  if (days <= REMINDER_DAYS_BEFORE) {
    return "soon";
  }
  return null;
}

function getDueReminders(userId) {
  return getBills(userId)
    .map(function (bill) {
      return { bill: bill, kind: getReminderKind(bill) };
    })
    .filter(function (item) {
      return item.kind !== null;
    });
}

function getReminderText(bill, kind) {
  const service = findBillService(bill.serviceId);
  const name = "tu recibo de " + (service ? service.label.toLowerCase() : "servicio");
  if (kind === "today") {
    return {
      title: "¡Hoy vence " + name + "!",
      text: "Paga hoy " + formatMoney(bill.amount) + " para evitar la mora. Si ya pagaste, márcalo como pagado."
    };
  }
  const days = daysUntil(bill.dueDate);
  return {
    title: "Tu pago vence " + (days === 1 ? "mañana" : "en " + days + " días"),
    text: "Recuerda pagar " + name + " de " + formatMoney(bill.amount) + " antes del " + formatLongDate(bill.dueDate) + "."
  };
}

function canUseSystemNotifications() {
  return "Notification" in window && window.isSecureContext;
}

function sendSystemNotification(bill, kind) {
  if (!canUseSystemNotifications() || Notification.permission !== "granted") {
    return;
  }

  const todayKey = getTodayKey();
  const notified = bill.notified || {};
  if (notified[kind] === todayKey) {
    return;
  }

  const message = getReminderText(bill, kind);
  try {
    const notification = new Notification(message.title, {
      body: message.text,
      icon: "assets/images/logo-icon.png",
      tag: bill.id + "-" + kind,
      requireInteraction: kind === "today"
    });
    notification.onclick = function () {
      window.focus();
      window.location.href = "calendar.html?bill=" + bill.id;
    };
    notified[kind] = todayKey;
    updateBill(bill.id, { notified: notified });
  } catch (error) {
  }
}

function requestReminderPermission() {
  if (!canUseSystemNotifications()) {
    showToast("Este navegador no permite avisos. Te mostraremos los recordatorios dentro de Contigo.");
    return Promise.resolve("unsupported");
  }
  return Notification.requestPermission().then(function (permission) {
    if (permission === "granted") {
      showToast("¡Listo! Te avisaremos 2 días antes y el día del vencimiento.");
      checkReminders();
    } else {
      showToast("No activaste los avisos. Igual verás los recordatorios dentro de Contigo.");
    }
    return permission;
  });
}

function getDismissed() {
  return readJson(sessionStorage, DISMISSED_REMINDERS_KEY) || {};
}

function dismissReminder(bill, kind) {
  const dismissed = getDismissed();
  dismissed[bill.id + ":" + kind] = true;
  writeJson(sessionStorage, DISMISSED_REMINDERS_KEY, dismissed);
}

function renderReminderBanners(reminders) {
  const host = document.querySelector("main .container");
  if (!host) {
    return;
  }

  let stack = document.getElementById("reminder-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.id = "reminder-stack";
    stack.className = "s2-reminder-stack";
    stack.setAttribute("aria-live", "polite");
    host.prepend(stack);
  }
  stack.innerHTML = "";

  const dismissed = getDismissed();

  reminders.forEach(function (item) {
    if (dismissed[item.bill.id + ":" + item.kind]) {
      return;
    }

    const message = getReminderText(item.bill, item.kind);
    const banner = document.createElement("div");
    banner.className = "alert s2-reminder " + (item.kind === "today" ? "alert-error s2-reminder-urgent" : "alert-warning");
    banner.setAttribute("role", item.kind === "today" ? "alert" : "status");
    banner.innerHTML =
      '<span class="alert-icon s2-reminder-icon" aria-hidden="true">' + getExtraIcon("bell") + "</span>" +
      '<div class="s2-reminder-body"><p class="alert-title"></p><p class="alert-text"></p>' +
      '<div class="s2-reminder-actions">' +
        '<a class="btn btn-primary s2-small-button" href="calendar.html?bill=' + item.bill.id + '">Ver recibo</a>' +
        '<button type="button" class="btn btn-secondary s2-small-button" data-action="off">No avisarme de este pago</button>' +
        '<button type="button" class="btn-link" data-action="dismiss">Cerrar</button>' +
      "</div></div>";
    banner.querySelector(".alert-title").textContent = message.title;
    banner.querySelector(".alert-text").textContent = message.text;

    banner.querySelector("[data-action='off']").addEventListener("click", function () {
      updateBill(item.bill.id, { reminders: false });
      banner.remove();
      showToast("Listo. Ya no te avisaremos de este pago.");
      document.dispatchEvent(new CustomEvent("contigo:bills-changed"));
    });
    banner.querySelector("[data-action='dismiss']").addEventListener("click", function () {
      dismissReminder(item.bill, item.kind);
      banner.remove();
    });

    stack.appendChild(banner);
  });
}

function checkReminders() {
  const user = getSessionUser();
  if (!user) {
    return;
  }
  const reminders = getDueReminders(user.id);
  renderReminderBanners(reminders);
  reminders.forEach(function (item) {
    sendSystemNotification(item.bill, item.kind);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  if (!getSessionUser() || document.body.classList.contains("guide-page")) {
    return;
  }
  checkReminders();
  setInterval(checkReminders, 60000);
  document.addEventListener("contigo:bills-changed", checkReminders);
});
