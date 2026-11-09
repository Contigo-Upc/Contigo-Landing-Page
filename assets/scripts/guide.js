const guide = {
  user: null,
  procedure: null,
  mode: "real",
  steps: [],
  state: null
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

  document.title = procedure.name + " | Contigo";
  document.getElementById("exit-link").href = "procedure.html?id=" + procedure.id;
  document.getElementById("practice-banner").hidden = guide.mode !== "practice";

  document.getElementById("next-button").addEventListener("click", goNext);
  document.getElementById("back-button").addEventListener("click", goBack);
  document.getElementById("step-form").addEventListener("submit", function (event) {
    event.preventDefault();
    goNext();
  });

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

function loadGuideState() {
  const saved = readJson(sessionStorage, GUIDE_KEY);
  const isSameGuide = saved && saved.id === guide.procedure.id && saved.mode === guide.mode;

  if (isSameGuide && saved.index >= 0 && saved.index < guide.steps.length) {
    return saved;
  }

  return { id: guide.procedure.id, mode: guide.mode, index: 0, values: {}, receiptId: null };
}

function saveGuideState() {
  writeJson(sessionStorage, GUIDE_KEY, guide.state);
}

function renderStep(shouldFocus) {
  const step = guide.steps[guide.state.index];
  const isLast = guide.state.index === guide.steps.length - 1;

  renderProgress();
  renderVisual(step);

  document.getElementById("step-title").textContent = step.title;
  document.getElementById("step-text").textContent = step.text;

  const tip = document.getElementById("step-tip");
  tip.hidden = !step.tip;
  tip.querySelector(".alert-text").textContent = step.tip || "";

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

function renderForm() {
  const form = document.getElementById("step-form");
  form.innerHTML = "";

  guide.procedure.fields.forEach(function (field) {
    if (guide.state.values[field.id] === undefined) {
      guide.state.values[field.id] = guide.mode === "practice" ? field.sample : "";
    }

    const wrapper = document.createElement("div");
    wrapper.className = "field";

    const label = document.createElement("label");
    label.className = "field-label";
    label.htmlFor = "guide-" + field.id;
    label.textContent = field.label;

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

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    wrapper.appendChild(hint);
    wrapper.appendChild(error);
    form.appendChild(wrapper);
  });

  saveGuideState();
}

function validateGuideForm() {
  const form = document.getElementById("step-form");
  let isValid = true;

  guide.procedure.fields.forEach(function (field) {
    const input = document.getElementById("guide-" + field.id);
    const value = input.value.trim().replace(",", ".");

    if (value === "") {
      showFieldError(input, "Escribe este dato para continuar.");
      isValid = false;
    } else if (!field.pattern.test(value)) {
      showFieldError(input, field.error);
      isValid = false;
    } else {
      guide.state.values[field.id] = value;
    }
  });

  if (!isValid) {
    focusFirstError(form);
  }
  return isValid;
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

function renderDone() {
  if (!guide.state.receiptId) {
    const receipt = createReceipt();
    saveReceipt(receipt);
    guide.state.receiptId = receipt.id;
    saveGuideState();
  }

  const receipt = findReceipt(guide.state.receiptId);
  document.getElementById("receipt-code").textContent = receipt.id;
  document.getElementById("save-receipt").onclick = function () {
    downloadReceipt(receipt);
  };
  document.getElementById("share-receipt").onclick = function () {
    shareReceipt(receipt);
  };
}

function goNext() {
  const step = guide.steps[guide.state.index];

  if (step.type === "form" && !validateGuideForm()) {
    return;
  }

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
