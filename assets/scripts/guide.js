const guide = {
  user: null,
  procedure: null,
  mode: "real",
  steps: [],
  state: null,
  termPanel: null
};

document.addEventListener("DOMContentLoaded", function () {
  const user = requireSession();
  if (!user) {
    return;
  }

  const procedure = findProcedure(getQueryParam("id"));
  if (!procedure) {
    window.location.replace("procedures.html");
    return;
  }

  guide.user = user;
  guide.procedure = procedure;
  guide.mode = getQueryParam("mode") === "practice" ? "practice" : "real";
  guide.steps = buildSteps(procedure, guide.mode);
  guide.state = loadGuideState();
  guide.termPanel = setupTermPanel(document.getElementById("term-panel"));

  document.title = procedure.name + " | Contigo";
  document.getElementById("practice-banner").hidden = guide.mode !== "practice";
  document.getElementById("pending-exit").href = "procedure.html?id=" + procedure.id;

  setupExitLink();
  setupTools();
  setupAmountDialog();

  document.getElementById("next-button").addEventListener("click", goNext);
  document.getElementById("back-button").addEventListener("click", goBack);
  document.getElementById("step-form").addEventListener("submit", function (event) {
    event.preventDefault();
    goNext();
  });

  saveGuideState();
  renderStep(false);
});

function buildSteps(procedure, mode) {
  const steps = procedure.steps.map(function (step) {
    return Object.assign({ type: "info" }, step);
  });

  steps.push({
    type: "form",
    title: "Anota tus datos",
    text: mode === "practice"
      ? "Ya escribimos datos de ejemplo para que practiques. Puedes cambiarlos si quieres."
      : "Escribe los datos que ves en tu documento. Los revisaremos juntos en el siguiente paso.",
    icon: "pencil"
  });

  steps.push({
    type: "review",
    title: "Revisa tus datos",
    text: "Mira que todo esté bien antes de seguir. Si algo no coincide con tu documento, corrígelo.",
    icon: "eye"
  });

  steps.push({
    type: "done",
    title: "¡Listo, terminaste la guía!",
    text: mode === "practice"
      ? "Practicaste todo el recorrido. Cuando quieras hacer el trámite de verdad, empieza la guía real."
      : "Ahora puedes ir al sitio oficial con tus datos listos. Recuerda: Contigo no realiza pagos por ti.",
    icon: "check"
  });

  return steps;
}

function createFreshState() {
  const state = {
    userId: guide.user.id,
    id: guide.procedure.id,
    mode: guide.mode,
    index: 0,
    values: {},
    receiptId: null,
    billId: null,
    failedAttempts: 0,
    confirmedAmount: null,
    completed: false
  };

  const bill = findBill(getQueryParam("bill") || "");
  if (bill && bill.userId === guide.user.id && bill.procedureId === guide.procedure.id) {
    state.billId = bill.id;
    state.values[guide.procedure.fields[0].id] = bill.number;
    state.values.amount = bill.amount;
  }

  return state;
}

function loadGuideState() {
  const saved = getProgress(guide.user.id, guide.procedure.id);
  const isSameGuide = saved && saved.mode === guide.mode;

  if (isSameGuide && saved.index >= 0 && saved.index < guide.steps.length) {
    return Object.assign(createFreshState(), saved);
  }

  return createFreshState();
}

function saveGuideState() {
  guide.state.total = guide.steps.length;
  saveProgress(guide.state);
}

function renderStep(shouldFocus) {
  const step = guide.steps[guide.state.index];
  const isLast = guide.state.index === guide.steps.length - 1;

  stopListening();
  hideHelp();
  guide.termPanel.close();
  hideErrorSummary(document.getElementById("form-summary"));

  renderProgress();
  renderVisual(step);

  document.getElementById("step-title").textContent = step.title;
  renderTextWithTerms(document.getElementById("step-text"), step.text, guide.termPanel.open);

  const tip = document.getElementById("step-tip");
  tip.hidden = !step.tip;
  renderTextWithTerms(tip.querySelector(".alert-text"), step.tip || "", guide.termPanel.open);

  document.getElementById("step-form").hidden = step.type !== "form";
  document.getElementById("step-review").hidden = step.type !== "review";
  document.getElementById("step-done").hidden = step.type !== "done";

  if (step.type === "form") {
    renderForm();
  }
  if (step.type === "review") {
    renderReview();
  }
  if (step.type === "done") {
    renderDone();
  }

  const back = document.getElementById("back-button");
  const next = document.getElementById("next-button");
  const actions = document.getElementById("guide-actions");

  actions.hidden = isLast;
  back.disabled = guide.state.index === 0;
  back.textContent = step.type === "review" ? "Corregir datos" : "Anterior";
  next.textContent = step.type === "review" ? "Sí, todo está correcto" : "Siguiente";

  if (shouldFocus) {
    document.getElementById("step-title").focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function renderProgress() {
  const total = guide.steps.length;
  const current = guide.state.index + 1;
  const remaining = total - current;
  const percent = Math.round((current / total) * 100);

  document.getElementById("progress-text").textContent = "Paso " + current + " de " + total;
  document.getElementById("progress-bar").style.width = percent + "%";
  document.getElementById("progress-track").setAttribute("aria-valuenow", String(percent));

  const minutesLeft = Math.round(guide.procedure.minutes * remaining / total);
  const time = document.getElementById("time-text");

  if (remaining === 0) {
    time.textContent = "¡Terminaste!";
  } else if (minutesLeft <= 1) {
    time.textContent = "Falta menos de 1 minuto";
  } else {
    time.textContent = "Faltan unos " + minutesLeft + " minutos";
  }
}

function renderVisual(step) {
  const visual = document.getElementById("step-visual");
  visual.innerHTML = "";

  if (step.image) {
    const image = document.createElement("img");
    image.src = "assets/images/" + step.image;
    image.alt = "";
    visual.appendChild(image);
  } else {
    visual.innerHTML = getIcon(step.icon);
  }
}

function findTermInText(text) {
  const match = text.match(buildGlossaryRegex());
  return match ? match[0] : null;
}

function renderForm() {
  const form = document.getElementById("step-form");
  form.innerHTML = "";

  guide.procedure.fields.forEach(function (field) {
    if (guide.state.values[field.id] === undefined) {
      guide.state.values[field.id] = guide.mode === "practice" ? field.sample : "";
    }

    const wrapper = document.createElement("div");
    wrapper.className = "field";

    const labelRow = document.createElement("div");
    labelRow.className = "label-row";

    const label = document.createElement("label");
    label.className = "field-label";
    label.htmlFor = "guide-" + field.id;
    label.textContent = field.label;
    labelRow.appendChild(label);

    const term = findTermInText(field.label);
    if (term) {
      const termButton = document.createElement("button");
      termButton.type = "button";
      termButton.className = "term-button";
      termButton.textContent = "¿Qué es?";
      termButton.setAttribute("aria-label", "¿Qué es " + term.toLowerCase() + "?");
      termButton.setAttribute("aria-expanded", "false");
      termButton.addEventListener("click", function () {
        guide.termPanel.open(term, termButton);
      });
      labelRow.appendChild(termButton);
    }

    const input = document.createElement("input");
    input.className = "field-input";
    input.id = "guide-" + field.id;
    input.name = field.id;
    input.type = "text";
    input.inputMode = field.inputmode;
    input.maxLength = field.maxlength;
    input.autocomplete = "off";
    input.required = true;
    input.value = guide.state.values[field.id];
    input.setAttribute("aria-describedby", input.id + "-hint " + input.id + "-error");
    input.addEventListener("input", function () {
      clearFieldError(input);
      guide.state.values[field.id] = input.value;
      saveGuideState();
    });

    const hint = document.createElement("p");
    hint.className = "field-hint";
    hint.id = input.id + "-hint";
    hint.textContent = field.hint;

    const error = document.createElement("p");
    error.className = "field-error";
    error.id = input.id + "-error";

    wrapper.appendChild(labelRow);
    wrapper.appendChild(input);
    wrapper.appendChild(hint);
    wrapper.appendChild(error);
    form.appendChild(wrapper);
  });

  saveGuideState();
}

function validateGuideForm() {
  const form = document.getElementById("step-form");
  const summary = document.getElementById("form-summary");
  const errors = [];

  guide.procedure.fields.forEach(function (field) {
    const input = document.getElementById("guide-" + field.id);
    const value = input.value.trim().replace(",", ".");

    if (value === "") {
      showFieldError(input, "Escribe este dato para continuar.");
      errors.push({ input: input, label: field.label, message: "falta completarlo" });
    } else if (!field.pattern.test(value)) {
      showFieldError(input, field.error);
      errors.push({ input: input, label: field.label, message: field.error });
    } else {
      guide.state.values[field.id] = value;
    }
  });

  if (errors.length > 0) {
    showErrorSummary(summary, errors);
    focusFirstError(form);
    guide.state.failedAttempts += 1;
    saveGuideState();

    if (guide.state.failedAttempts >= 3) {
      showHelp(
        "¿Necesitas ayuda con este paso?",
        "Este fue el tercer intento. Te mostramos dónde encontrar el dato: " + getStepHelp(guide.procedure.id, { type: "info" }, 1)
      );
    }
    return false;
  }

  hideErrorSummary(summary);
  guide.state.failedAttempts = 0;
  saveGuideState();
  return true;
}

function getReviewData() {
  return guide.procedure.fields.map(function (field) {
    const value = guide.state.values[field.id];
    return {
      label: field.label,
      value: field.id === "amount" ? "S/ " + value : value
    };
  });
}

function renderReview() {
  const list = document.getElementById("step-review");
  list.innerHTML = "";

  getReviewData().forEach(function (item) {
    const row = document.createElement("div");
    row.className = "review-row";

    const term = document.createElement("dt");
    term.textContent = item.label;

    const detail = document.createElement("dd");
    detail.textContent = item.value;

    row.appendChild(term);
    row.appendChild(detail);
    list.appendChild(row);
  });
}

function createReceipt() {
  return {
    id: "CTG-" + Date.now().toString(36).toUpperCase(),
    userId: guide.user.id,
    userName: guide.user.name,
    procedureId: guide.procedure.id,
    procedureName: guide.procedure.name,
    practice: guide.mode === "practice",
    date: new Date().toISOString(),
    data: getReviewData()
  };
}

function registerBillAfterGuide() {
  if (guide.mode !== "real" || !BILL_NAMES[guide.procedure.id]) {
    return false;
  }

  const values = guide.state.values;
  let bill = guide.state.billId ? findBill(guide.state.billId) : null;

  if (!bill) {
    bill = createBill({
      userId: guide.user.id,
      procedureId: guide.procedure.id,
      number: values[guide.procedure.fields[0].id],
      amount: values.amount,
      dueDate: null,
      source: "guide"
    });
    guide.state.billId = bill.id;
  }

  if (bill.status === "pending") {
    bill.status = "processing";
  }
  saveBill(bill);
  return true;
}

function renderDone() {
  if (!guide.state.receiptId) {
    const receipt = createReceipt();
    saveReceipt(receipt);
    guide.state.receiptId = receipt.id;
    registerBillAfterGuide();
  }
  guide.state.completed = true;
  saveGuideState();

  const receipt = findReceipt(guide.state.receiptId);
  document.getElementById("receipt-code").textContent = receipt.id;
  document.getElementById("save-receipt").onclick = function () {
    downloadReceipt(receipt);
  };
  document.getElementById("share-receipt").onclick = function () {
    shareReceipt(receipt);
  };

  renderPendingAndVerify();
  document.getElementById("bills-link").hidden = !guide.state.billId;
}

function fillList(list, items) {
  list.innerHTML = "";
  items.forEach(function (text) {
    const item = document.createElement("li");
    item.textContent = text;
    list.appendChild(item);
  });
}

function renderPendingAndVerify() {
  const support = PROCEDURE_SUPPORT[guide.procedure.id];
  const isReal = guide.mode === "real";
  const pendingSection = document.getElementById("done-pending");
  const verifySection = document.getElementById("done-verify");
  const officialLink = document.getElementById("official-link");

  pendingSection.hidden = !isReal || !support;
  verifySection.hidden = !isReal || !support;
  if (!isReal || !support) {
    return;
  }

  fillList(document.getElementById("done-pending-list"), support.pending);
  fillList(document.getElementById("done-verify-list"), support.verify);

  officialLink.hidden = !support.officialLink;
  if (support.officialLink) {
    officialLink.href = support.officialLink.url;
    officialLink.textContent = support.officialLink.label;
  }
}

function goNext() {
  const step = guide.steps[guide.state.index];

  if (step.type === "form") {
    if (!validateGuideForm()) {
      return;
    }
    if (needsAmountConfirmation()) {
      openAmountDialog();
      return;
    }
  }

  advance();
}

function advance() {
  guide.state.index += 1;
  saveGuideState();
  renderStep(true);
}

function goBack() {
  if (guide.state.index === 0) {
    return;
  }

  guide.state.index -= 1;
  saveGuideState();
  renderStep(true);
}

function needsAmountConfirmation() {
  const amount = guide.state.values.amount;
  if (amount === undefined || guide.state.confirmedAmount === amount) {
    return false;
  }
  return isUnusualAmount(guide.user.id, guide.procedure.id, amount, guide.state.billId);
}

function setupAmountDialog() {
  const dialog = document.getElementById("amount-dialog");

  document.getElementById("amount-confirm").addEventListener("click", function () {
    guide.state.confirmedAmount = guide.state.values.amount;
    saveGuideState();
    dialog.close();
    advance();
  });

  document.getElementById("amount-fix").addEventListener("click", function () {
    dialog.close();
    const input = document.getElementById("guide-amount");
    input.focus();
    input.select();
  });
}

function openAmountDialog() {
  const amount = guide.state.values.amount;
  const usual = getUsualAmount(guide.user.id, guide.procedure.id, guide.state.billId);

  document.getElementById("amount-dialog-text").textContent =
    formatAmount(amount) + " es más alto de lo habitual para este trámite (suele ser alrededor de " +
    formatAmount(usual) + "). Revisa que esté bien copiado de tu recibo.";
  document.getElementById("amount-dialog").showModal();
}

function setupTools() {
  const listen = document.getElementById("listen-button");
  const help = document.getElementById("help-button");
  const assistant = document.getElementById("assistant-link");

  listen.innerHTML = getIcon("speaker") + "<span>Escuchar este paso</span>";
  help.innerHTML = getIcon("help") + "<span>Ayuda con este paso</span>";
  assistant.innerHTML = getIcon("chat") + "<span>Preguntar al asistente</span>";
  assistant.href = "assistant.html?topic=" + guide.procedure.id;

  listen.addEventListener("click", startListening);
  help.addEventListener("click", function () {
    if (document.getElementById("step-help").hidden) {
      const step = guide.steps[guide.state.index];
      showHelp("Ayuda con este paso", getStepHelp(guide.procedure.id, step, guide.state.index));
    } else {
      hideHelp();
    }
  });

  document.getElementById("audio-pause").addEventListener("click", function () {
    const paused = toggleSpeechPause();
    document.getElementById("audio-pause").textContent = paused ? "Continuar" : "Pausar";
    document.getElementById("audio-label").textContent = paused ? "En pausa" : "Escuchando...";
  });
  document.getElementById("audio-stop").addEventListener("click", stopListening);
}

function showHelp(title, text) {
  document.getElementById("help-title").textContent = title;
  renderTextWithTerms(document.getElementById("help-text"), text, guide.termPanel.open);
  document.getElementById("step-help").hidden = false;
  document.getElementById("help-button").setAttribute("aria-expanded", "true");
}

function hideHelp() {
  document.getElementById("step-help").hidden = true;
  document.getElementById("help-button").setAttribute("aria-expanded", "false");
}

function getStepSpeechText() {
  const step = guide.steps[guide.state.index];
  let text = "Paso " + (guide.state.index + 1) + ". " + step.title + ". " + step.text;

  if (step.tip) {
    text += " Un consejo: " + step.tip;
  }
  if (step.type === "form") {
    guide.procedure.fields.forEach(function (field) {
      text += " " + field.label + ". " + field.hint;
    });
  }
  return text;
}

function startListening() {
  if (!isSpeechSupported()) {
    showToast("Tu navegador no puede leer en voz alta. Prueba con Chrome o Edge.");
    return;
  }

  const panel = document.getElementById("audio-panel");
  const bar = document.getElementById("audio-bar");

  panel.hidden = false;
  bar.style.width = "0";
  document.getElementById("audio-icon").innerHTML = getIcon("speaker");
  document.getElementById("audio-label").textContent = "Escuchando...";
  document.getElementById("audio-pause").textContent = "Pausar";

  speakText(getStepSpeechText(), {
    onProgress: function (percent) {
      bar.style.width = percent + "%";
    },
    onEnd: function () {
      bar.style.width = "100%";
      panel.hidden = true;
    }
  });
}

function stopListening() {
  stopSpeech();
  document.getElementById("audio-panel").hidden = true;
}

function setupExitLink() {
  const exit = document.getElementById("exit-link");
  exit.href = "procedure.html?id=" + guide.procedure.id;

  exit.addEventListener("click", function (event) {
    const step = guide.steps[guide.state.index];
    if (guide.state.index === 0 || step.type === "done") {
      return;
    }
    event.preventDefault();
    showPendingPanel();
  });

  document.getElementById("pending-return").addEventListener("click", function () {
    document.getElementById("pending-panel").hidden = true;
    document.getElementById("guide-view").hidden = false;
    document.getElementById("step-title").focus();
  });
}

function showPendingPanel() {
  stopListening();
  const list = document.getElementById("pending-steps");
  list.innerHTML = "";

  guide.steps.forEach(function (step, index) {
    if (step.type === "done") {
      return;
    }
    const isDone = index < guide.state.index;
    const item = document.createElement("li");
    item.className = "step-status" + (isDone ? " is-done" : "");

    const dot = document.createElement("span");
    dot.className = "step-dot";
    dot.setAttribute("aria-hidden", "true");

    const title = document.createElement("span");
    title.className = "step-status-title";
    title.textContent = step.title;

    const label = document.createElement("span");
    label.className = "step-status-label";
    label.textContent = isDone ? "Listo" : "Pendiente";

    item.appendChild(dot);
    item.appendChild(title);
    item.appendChild(label);
    list.appendChild(item);
  });

  document.getElementById("guide-view").hidden = true;
  document.getElementById("pending-panel").hidden = false;
  document.getElementById("pending-title").focus();
}
