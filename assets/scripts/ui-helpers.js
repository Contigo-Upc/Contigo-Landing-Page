/* Sprint 2 · Utilidades compartidas: íconos extra, fechas, diálogo de confirmación
   y validación visual de campos (US-32). No modifica nada del Sprint 1. */

const EXTRA_ICON_PATHS = {
  speaker: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
  pause: '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>',
  play: '<path d="M7 4l13 8-13 8z"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.01"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  send: '<path d="M4 12l16-8-6 16-2-6z"/>',
  warning: '<path d="M12 3l10 18H2z"/><path d="M12 10v4M12 17.5v.01"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12M4 6v.01M4 12v.01M4 18v.01"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  arrowLeft: '<path d="M15 5l-7 7 7 7"/>',
  arrowRight: '<path d="M9 5l7 7-7 7"/>'
};

function getExtraIcon(name) {
  if (!EXTRA_ICON_PATHS[name]) {
    return getIcon(name);
  }
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + EXTRA_ICON_PATHS[name] + "</svg>";
}

/* ---------- Fechas ---------- */

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function parseDateKey(dateKey) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey || "")) {
    return null;
  }
  const parts = dateKey.split("-").map(Number);
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return date.getMonth() === parts[1] - 1 ? date : null;
}

function getTodayKey() {
  return toDateKey(new Date());
}

function daysUntil(dateKey) {
  const target = parseDateKey(dateKey);
  if (!target) {
    return null;
  }
  const today = parseDateKey(getTodayKey());
  return Math.round((target - today) / 86400000);
}

function formatLongDate(dateKey) {
  const date = parseDateKey(dateKey);
  if (!date) {
    return "Sin fecha";
  }
  return date.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" });
}

function formatShortDate(dateKey) {
  const date = parseDateKey(dateKey);
  if (!date) {
    return "Sin fecha";
  }
  return date.toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" });
}

function describeDueDate(dateKey) {
  const days = daysUntil(dateKey);
  if (days === null) {
    return "Sin fecha de vencimiento";
  }
  if (days < 0) {
    return days === -1 ? "Venció ayer" : "Venció hace " + Math.abs(days) + " días";
  }
  if (days === 0) {
    return "Vence hoy";
  }
  if (days === 1) {
    return "Vence mañana";
  }
  return "Vence en " + days + " días";
}

function formatMoney(amount) {
  return "S/ " + Number(amount).toFixed(2);
}

/* ---------- Diálogo de confirmación accesible ---------- */

function openDialog(options) {
  return new Promise(function (resolve) {
    const dialog = document.createElement("dialog");
    dialog.className = "s2-dialog s2-dialog-" + (options.tone || "info");
    dialog.setAttribute("aria-labelledby", "s2-dialog-title");
    dialog.setAttribute("aria-describedby", "s2-dialog-text");

    const icon = document.createElement("span");
    icon.className = "s2-dialog-icon";
    icon.innerHTML = getExtraIcon(options.icon || "warning");

    const title = document.createElement("h2");
    title.id = "s2-dialog-title";
    title.className = "s2-dialog-title";
    title.textContent = options.title;

    const text = document.createElement("p");
    text.id = "s2-dialog-text";
    text.className = "s2-dialog-text";
    text.textContent = options.text;

    const actions = document.createElement("div");
    actions.className = "s2-dialog-actions";

    let result = "cancel";

    (options.actions || [{ label: "Entendido", value: "ok", style: "primary" }]).forEach(function (action) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn btn-block " + (action.style === "secondary" ? "btn-secondary" : "btn-primary");
      button.textContent = action.label;
      button.addEventListener("click", function () {
        result = action.value;
        dialog.close();
      });
      actions.appendChild(button);
    });

    dialog.appendChild(icon);
    dialog.appendChild(title);
    dialog.appendChild(text);
    dialog.appendChild(actions);
    document.body.appendChild(dialog);

    dialog.addEventListener("close", function () {
      dialog.remove();
      resolve(result);
    });

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
      const first = actions.querySelector("button");
      if (first) {
        first.focus();
      }
    } else {
      const accepted = window.confirm(options.title + "\n\n" + options.text);
      dialog.remove();
      resolve(accepted ? options.actions[0].value : "cancel");
    }
  });
}

/* ---------- US-32: resaltar los campos con error ---------- */

function getOrCreateErrorSummary(container, beforeElement) {
  let summary = container.querySelector(".s2-error-summary");
  if (summary) {
    return summary;
  }

  summary = document.createElement("div");
  summary.className = "alert alert-error s2-error-summary";
  summary.setAttribute("role", "alert");
  summary.hidden = true;
  summary.innerHTML = '<span class="alert-icon" aria-hidden="true">!</span><div><p class="alert-title"></p><p class="alert-text"></p></div>';

  if (beforeElement) {
    container.insertBefore(summary, beforeElement);
  } else {
    container.prepend(summary);
  }
  return summary;
}

function showErrorSummary(summary, invalidInputs) {
  const count = invalidInputs.length;
  if (count === 0) {
    summary.hidden = true;
    return;
  }

  const labels = invalidInputs.map(function (input) {
    const label = document.querySelector("label[for='" + input.id + "']");
    return label ? label.textContent.replace("*", "").trim() : input.name;
  });

  summary.querySelector(".alert-title").textContent = count === 1
    ? "Revisa el dato marcado en rojo"
    : "Revisa los " + count + " datos marcados en rojo";
  summary.querySelector(".alert-text").textContent = "Falta corregir: " + labels.join(", ") + ".";
  summary.hidden = false;
}

function scrollToFirstError(form) {
  const firstInvalid = form.querySelector("[aria-invalid='true']");
  if (!firstInvalid) {
    return;
  }

  const field = firstInvalid.closest(".field") || firstInvalid;
  field.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(function () {
    firstInvalid.focus({ preventScroll: true });
  }, 350);
}

function getInvalidInputs(form) {
  return Array.from(form.querySelectorAll("[aria-invalid='true']"));
}

function watchErrorSummary(form, summary) {
  form.addEventListener("input", function () {
    const invalid = getInvalidInputs(form);
    if (invalid.length === 0) {
      summary.hidden = true;
    } else if (!summary.hidden) {
      showErrorSummary(summary, invalid);
    }
  });
}

function formatDateTime(isoDate) {
  return new Date(isoDate).toLocaleString("es-PE", { dateStyle: "long", timeStyle: "short" });
}
