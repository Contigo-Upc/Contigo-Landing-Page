/* Sprint 2 · US-48: guardar el avance de las guías reales para continuar
   un trámite pendiente desde donde se dejó. El modo práctica no se guarda (US-15). */

const GUIDE_HISTORY_KEY = "contigo.guideHistory";

function getAllGuideAttempts() {
  return readJson(localStorage, GUIDE_HISTORY_KEY) || [];
}

function getGuideAttempts(userId) {
  return getAllGuideAttempts()
    .filter(function (attempt) {
      return attempt.userId === userId;
    })
    .sort(function (a, b) {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
}

function getPendingAttempts(userId) {
  return getGuideAttempts(userId).filter(function (attempt) {
    return attempt.status === "pending";
  });
}

function findPendingAttempt(userId, procedureId) {
  return getPendingAttempts(userId).find(function (attempt) {
    return attempt.procedureId === procedureId;
  });
}

function upsertGuideAttempt(data) {
  const attempts = getAllGuideAttempts();
  const existing = attempts.find(function (attempt) {
    return attempt.attemptId === data.attemptId;
  });

  if (existing) {
    if (existing.status === "completed") {
      data.status = "completed";
    }
    Object.assign(existing, data);
  } else {
    attempts.push(data);
  }

  const userAttempts = attempts.filter(function (attempt) {
    return attempt.userId === data.userId;
  });
  if (userAttempts.length > 30) {
    const oldest = userAttempts.sort(function (a, b) {
      return new Date(a.updatedAt) - new Date(b.updatedAt);
    })[0];
    attempts.splice(attempts.indexOf(oldest), 1);
  }

  writeJson(localStorage, GUIDE_HISTORY_KEY, attempts);
}

function discardGuideAttempt(attemptId) {
  writeJson(localStorage, GUIDE_HISTORY_KEY, getAllGuideAttempts().filter(function (attempt) {
    return attempt.attemptId !== attemptId;
  }));
}

/* Copia el avance guardado a la sesión que usa guide.js y abre la guía. */
function continueGuideAttempt(attempt) {
  writeJson(sessionStorage, GUIDE_KEY, {
    id: attempt.procedureId,
    mode: "real",
    index: attempt.index,
    values: attempt.values || {},
    receiptId: attempt.receiptId || null,
    attemptId: attempt.attemptId,
    doneSteps: attempt.doneSteps || []
  });
  window.location.href = "guide.html?id=" + attempt.procedureId + "&mode=real";
}

function createAttemptItem(attempt) {
  const item = document.createElement("li");
  item.className = "receipt-item s2-attempt-item";

  const info = document.createElement("div");
  info.className = "receipt-info";

  const title = document.createElement("p");
  title.className = "receipt-title";
  title.textContent = attempt.procedureName;

  const detail = document.createElement("p");
  detail.className = "receipt-date";

  info.appendChild(title);
  info.appendChild(detail);
  item.appendChild(info);

  if (attempt.status === "completed") {
    detail.textContent = "Terminado el " + formatDateTime(attempt.updatedAt);
    const badge = document.createElement("span");
    badge.className = "s2-status status-paid";
    badge.textContent = "Completado";
    info.appendChild(badge);
    return item;
  }

  detail.textContent = "Te quedaste en el paso " + (attempt.index + 1) + " de " + attempt.total + " · " + formatDateTime(attempt.updatedAt);

  const progress = document.createElement("div");
  progress.className = "progress-track s2-mini-progress";
  progress.setAttribute("aria-hidden", "true");
  const bar = document.createElement("div");
  bar.className = "progress-bar";
  bar.style.width = Math.round(((attempt.index + 1) / attempt.total) * 100) + "%";
  progress.appendChild(bar);
  info.appendChild(progress);

  const actions = document.createElement("div");
  actions.className = "s2-attempt-actions";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn btn-primary receipt-button";
  button.textContent = "Continuar";
  button.setAttribute("aria-label", "Continuar " + attempt.procedureName + " desde el paso " + (attempt.index + 1));
  button.addEventListener("click", function () {
    continueGuideAttempt(attempt);
  });

  const discard = document.createElement("button");
  discard.type = "button";
  discard.className = "btn-link";
  discard.textContent = "Quitar";
  discard.setAttribute("aria-label", "Quitar " + attempt.procedureName + " de pendientes");
  discard.addEventListener("click", function () {
    discardGuideAttempt(attempt.attemptId);
    item.remove();
    showToast("Quitamos el trámite de tus pendientes.");
  });

  actions.appendChild(button);
  actions.appendChild(discard);
  item.appendChild(actions);
  return item;
}
