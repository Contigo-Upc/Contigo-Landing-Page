const REMINDER_DAYS = 2;

function getReminderAlerts(userId) {
  return getActiveBills(userId)
    .filter(function (bill) {
      return bill.reminders && bill.dueDate && daysUntil(bill.dueDate) <= REMINDER_DAYS;
    })
    .map(function (bill) {
      return buildReminder(bill);
    });
}

function buildReminder(bill) {
  const days = daysUntil(bill.dueDate);
  const name = getBillTitle(bill).replace("Recibo de ", "");
  const amount = formatAmount(bill.amount);

  if (days < 0) {
    return {
      bill: bill,
      urgent: true,
      title: "Tu recibo de " + name + " ya venció",
      text: "Aún tienes " + amount + " pendientes. Págalo lo antes posible para evitar recargos o cortes."
    };
  }
  if (days === 0) {
    return {
      bill: bill,
      urgent: true,
      title: "Última alerta: tu recibo de " + name + " vence hoy",
      text: "Aún tienes " + amount + " pendientes. Paga hoy."
    };
  }
  return {
    bill: bill,
    urgent: false,
    title: "Tu recibo de " + name + (days === 1 ? " vence mañana" : " vence en " + days + " días"),
    text: "Recuerda pagar " + amount + ". Vence el " + formatShortDate(bill.dueDate) + "."
  };
}

function renderReminders(container, userId) {
  const alerts = getReminderAlerts(userId);
  container.innerHTML = "";
  container.hidden = alerts.length === 0;

  alerts.forEach(function (alert) {
    const item = document.createElement("div");
    item.className = "reminder" + (alert.urgent ? " is-urgent" : "");
    item.setAttribute("role", "status");

    const icon = document.createElement("span");
    icon.className = "reminder-icon";
    icon.innerHTML = getIcon(alert.urgent ? "warning" : "bell");

    const body = document.createElement("div");
    body.className = "reminder-body";

    const title = document.createElement("p");
    title.className = "reminder-title";
    title.textContent = alert.title;

    const text = document.createElement("p");
    text.textContent = alert.text;

    const link = document.createElement("a");
    link.className = "btn-link";
    link.href = "bills.html#" + alert.bill.id;
    link.textContent = "Ver recibo";

    body.appendChild(title);
    body.appendChild(text);
    body.appendChild(link);
    item.appendChild(icon);
    item.appendChild(body);
    container.appendChild(item);
  });
}

function canUseDeviceNotifications() {
  return "Notification" in window;
}

function notifyDevice(userId) {
  if (!canUseDeviceNotifications() || Notification.permission !== "granted") {
    return;
  }

  const today = todayIso();
  getReminderAlerts(userId).forEach(function (alert) {
    if (alert.bill.notifiedOn === today) {
      return;
    }
    new Notification(alert.title, { body: alert.text, icon: "assets/images/logo-icon.png" });
    alert.bill.notifiedOn = today;
    saveBill(alert.bill);
  });
}
