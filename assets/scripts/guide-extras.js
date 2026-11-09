/* Sprint 2 · Funciones nuevas de la guía paso a paso.
   Se cargan DESPUÉS de guide.js y envuelven sus funciones globales
   (renderStep, goNext, validateGuideForm, saveGuideState) sin cambiar su código:
   - US-12  Audio de la instrucción (guide-audio.js)
   - TSK-22 Ayuda contextual en cada paso
   - US-23  Significado de las palabras (glossary.js)
   - US-24  Alerta de monto inusual
   - US-29  Pasos pendientes y verificación en la plataforma oficial al cerrar
   - US-32  Resaltado de campos con error, resumen y desplazamiento
   - US-33  Aviso de recibo ya pagado o en proceso
   - US-34  El asistente ofrece ayuda tras 3 errores seguidos
   - US-48  Guardar el avance para continuar después */

(function () {
  if (typeof guide === "undefined" || typeof renderStep !== "function") {
    return;
  }

  const extras = {
    ready: false,
    failures: 0,
    failuresStep: null,
    checking: false,
    confirmedAmounts: {},
    elements: {}
  };

  function currentStep() {
    return guide.steps[guide.state.index];
  }

  function isServiceProcedure() {
    return Boolean(findBillService(guide.procedure.id));
  }

  /* ---------- Interfaz nueva dentro de la tarjeta del paso ---------- */

  function ensureUI() {
    if (extras.ready) {
      return;
    }

    const card = document.querySelector(".guide-card");
    const stepText = document.getElementById("step-text");
    const tip = document.getElementById("step-tip");
    const form = document.getElementById("step-form");
    const done = document.getElementById("step-done");

    /* US-12: controles de audio debajo de la instrucción */
    GuideAudio.mount(card, tip, getStepSpeech);

    /* US-29: marcar que el paso ya se hizo */
    const check = document.createElement("label");
    check.className = "checkbox s2-step-check";
    check.innerHTML = '<input type="checkbox" id="step-done-check"><span>Ya hice este paso</span>';
    card.insertBefore(check, form);
    check.querySelector("input").addEventListener("change", function (event) {
      toggleStepDone(guide.state.index, event.target.checked);
    });

    /* TSK-22: ayuda contextual */
    const helpToggle = document.createElement("button");
    helpToggle.type = "button";
    helpToggle.id = "step-help-toggle";
    helpToggle.className = "btn-link s2-help-toggle";
    helpToggle.setAttribute("aria-expanded", "false");
    helpToggle.setAttribute("aria-controls", "step-help");
    helpToggle.innerHTML = getExtraIcon("help") + "<span>¿Necesitas ayuda con este paso?</span>";

    const help = document.createElement("div");
    help.id = "step-help";
    help.className = "s2-help-panel";
    help.hidden = true;
    help.innerHTML =
      '<p class="s2-help-title">Ayuda para este paso</p>' +
      '<div class="s2-help-body"></div>' +
      '<div class="s2-help-actions">' +
        '<button type="button" class="btn btn-secondary s2-help-ask">' + getExtraIcon("chat") + "<span>Preguntar al asistente</span></button>" +
      "</div>" +
      '<form class="s2-word-lookup" novalidate>' +
        '<label class="field-label" for="word-lookup-input">¿Hay otra palabra que no entiendes?</label>' +
        '<div class="s2-word-lookup-row">' +
          '<input id="word-lookup-input" class="field-input" type="text" maxlength="40" autocomplete="off" placeholder="Escribe la palabra">' +
          '<button type="submit" class="btn btn-primary">Ver significado</button>' +
        "</div>" +
        '<p class="field-hint">También puedes tocar dos veces una palabra de la instrucción.</p>' +
      "</form>";

    card.insertBefore(helpToggle, form);
    card.insertBefore(help, form);

    helpToggle.addEventListener("click", function () {
      const isOpen = helpToggle.getAttribute("aria-expanded") === "true";
      setHelpOpen(!isOpen);
    });

    help.querySelector(".s2-help-ask").addEventListener("click", function () {
      ContigoAssistant.open();
    });

    help.querySelector(".s2-word-lookup").addEventListener("submit", function (event) {
      event.preventDefault();
      const input = document.getElementById("word-lookup-input");
      if (input.value.trim()) {
        openTermSheet(input.value.trim(), input);
        input.value = "";
      } else {
        input.focus();
      }
    });

    /* US-23: doble toque sobre cualquier palabra */
    enableWordLookup(stepText);
    enableWordLookup(document.getElementById("step-title"));

    /* US-32: resumen de errores sobre el formulario */
    const summary = getOrCreateErrorSummary(card, form);
    watchErrorSummary(form, summary);

    /* US-29: bloque de cierre al inicio de la pantalla final */
    const closing = document.createElement("div");
    closing.id = "step-closing";
    closing.className = "s2-closing";
    done.prepend(closing);

    extras.elements = {
      card: card,
      check: check,
      helpToggle: helpToggle,
      help: help,
      summary: summary,
      closing: closing
    };
    extras.ready = true;
  }

  function setHelpOpen(isOpen) {
    extras.elements.helpToggle.setAttribute("aria-expanded", String(isOpen));
    extras.elements.help.hidden = !isOpen;
  }

  /* ---------- US-12: texto que se lee en voz alta ---------- */

  function getStepSpeech() {
    const step = currentStep();
    const parts = ["Paso " + (guide.state.index + 1) + " de " + guide.steps.length + ".", step.title + ".", step.text];

    if (step.type === "form") {
      const labels = guide.procedure.fields.map(function (field) {
        return field.label.replace("(S/)", "en soles");
      });
      parts.push("Datos que debes escribir: " + labels.join(", y ") + ".");
    }
    if (step.type === "review") {
      guide.procedure.fields.forEach(function (field) {
        parts.push(field.label.replace("(S/)", "") + ": " + (guide.state.values[field.id] || "sin escribir") + ".");
      });
    }
    if (step.tip) {
      parts.push("Un consejo: " + step.tip);
    }
    return parts.join(" ");
  }

  /* ---------- TSK-22: contenido de la ayuda contextual ---------- */

  function getStepHelp(step) {
    const paragraphs = [];

    if (step.type === "form") {
      paragraphs.push(STEP_HELP_BY_ICON.pencil);
      guide.procedure.fields.forEach(function (field) {
        if (FIELD_HELP[field.id]) {
          paragraphs.push(field.label.replace(" (S/)", "") + ": " + FIELD_HELP[field.id]);
        }
      });
    } else if (step.type === "review") {
      paragraphs.push(STEP_HELP_BY_ICON.eye);
    } else if (step.type === "done") {
      paragraphs.push("Revisa abajo cómo comprobar en la página oficial que tu trámite quedó registrado.");
    } else {
      paragraphs.push(STEP_HELP_BY_ICON[step.icon] || "Lee la instrucción con calma. Puedes tocar «Escuchar» para oírla en voz alta.");
    }

    if (guide.mode === "practice") {
      paragraphs.push("Estás practicando: aquí no pasa nada si te equivocas.");
    }
    return paragraphs;
  }

  function renderHelp(step) {
    const body = extras.elements.help.querySelector(".s2-help-body");
    body.innerHTML = "";
    getStepHelp(step).forEach(function (text) {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      body.appendChild(paragraph);
      applyGlossary(paragraph);
    });
    setHelpOpen(false);
  }

  /* ---------- US-29: pasos hechos y cierre de la guía ---------- */

  function getDoneSteps() {
    if (!Array.isArray(guide.state.doneSteps)) {
      guide.state.doneSteps = [];
    }
    return guide.state.doneSteps;
  }

  function toggleStepDone(index, isDone) {
    const doneSteps = getDoneSteps().filter(function (item) {
      return item !== index;
    });
    if (isDone) {
      doneSteps.push(index);
    }
    guide.state.doneSteps = doneSteps;
    saveGuideState();
  }

  function renderClosing() {
    const closing = extras.elements.closing;
    closing.innerHTML = "";

    const doneSteps = getDoneSteps();
    const pending = [];
    guide.steps.forEach(function (step, index) {
      if (step.type === "info" && doneSteps.indexOf(index) === -1) {
        pending.push({ step: step, index: index });
      }
    });

    const status = document.createElement("div");

    if (pending.length === 0) {
      status.className = "alert alert-success s2-closing-status";
      status.innerHTML = '<span class="alert-icon" aria-hidden="true">✓</span><div><p class="alert-title">¡Completaste toda la orientación!</p><p class="alert-text">Marcaste todos los pasos como hechos. No te quedó nada pendiente.</p></div>';
    } else {
      status.className = "alert alert-warning s2-closing-status";
      status.innerHTML = '<span class="alert-icon" aria-hidden="true">!</span><div><p class="alert-title"></p><p class="alert-text">Estos pasos no los marcaste como hechos. Si todavía no los hiciste, vuelve a ellos:</p><ul class="s2-pending-steps"></ul></div>';
      status.querySelector(".alert-title").textContent = pending.length === 1
        ? "Te queda 1 paso pendiente"
        : "Te quedan " + pending.length + " pasos pendientes";

      const list = status.querySelector(".s2-pending-steps");
      pending.forEach(function (item) {
        const row = document.createElement("li");
        const label = document.createElement("span");
        label.textContent = "Paso " + (item.index + 1) + ": " + item.step.title;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn btn-secondary s2-small-button";
        button.textContent = "Ir a este paso";
        button.addEventListener("click", function () {
          guide.state.index = item.index;
          saveGuideState();
          renderStep(true);
        });

        row.appendChild(label);
        row.appendChild(button);
        list.appendChild(row);
      });
    }
    closing.appendChild(status);

    const official = document.createElement("section");
    official.className = "s2-official-check";
    official.setAttribute("aria-labelledby", "official-check-title");
    official.innerHTML = '<h2 id="official-check-title" class="s2-official-title">' + getIcon("globe") + "<span></span></h2><ol></ol>";
    official.querySelector("span").textContent = guide.mode === "practice"
      ? "Cuando lo hagas de verdad, así comprobarás que quedó registrado"
      : "Cómo comprobar en la página oficial que tu trámite quedó registrado";

    const steps = official.querySelector("ol");
    getOfficialChecks(guide.procedure).forEach(function (text) {
      const item = document.createElement("li");
      item.textContent = text;
      steps.appendChild(item);
      applyGlossary(item);
    });
    closing.appendChild(official);

    renderBillLink(closing);
  }

  /* TSK-26: unir la guía con el estado del recibo */
  function renderBillLink(container) {
    if (guide.mode !== "real" || !isServiceProcedure()) {
      return;
    }

    const service = findBillService(guide.procedure.id);
    const number = guide.state.values[service.numberField];
    const amount = guide.state.values.amount;
    const match = checkDuplicatePayment(guide.user.id, service.id, number);
    const box = document.createElement("div");
    box.className = "s2-bill-link";

    if (match && match.bill.status === "pending") {
      const text = document.createElement("p");
      text.textContent = "¿Ya pagaste en la página oficial? Marca tu recibo para no pagarlo dos veces.";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn btn-secondary btn-block";
      button.textContent = "Marcar mi recibo como «en proceso»";
      button.addEventListener("click", function () {
        setBillStatus(match.bill.id, "processing");
        text.textContent = "Listo. Tu recibo está «en proceso». Cuando la empresa te confirme el pago, márcalo como pagado en «Pagos».";
        button.remove();
      });
      box.appendChild(text);
      box.appendChild(button);
    } else if (!match) {
      const link = document.createElement("a");
      link.className = "btn btn-secondary btn-block";
      link.href = "calendar.html?add=" + service.id + "&number=" + encodeURIComponent(number || "") + "&amount=" + encodeURIComponent(amount || "");
      link.innerHTML = getIcon("calendar") + "<span>Guardar la fecha de vencimiento de este recibo</span>";
      box.appendChild(link);
    } else {
      return;
    }
    container.appendChild(box);
  }

  /* ---------- US-34: ayuda proactiva tras 3 errores seguidos ---------- */

  function registerFailure() {
    const stepKey = guide.state.index;
    if (extras.failuresStep !== stepKey) {
      extras.failuresStep = stepKey;
      extras.failures = 0;
    }
    extras.failures += 1;

    if (extras.failures < 3) {
      return;
    }
    extras.failures = 0;

    const invalidFields = guide.procedure.fields.filter(function (field) {
      const input = document.getElementById("guide-" + field.id);
      return input && input.getAttribute("aria-invalid") === "true";
    });
    const fields = invalidFields.length ? invalidFields : guide.procedure.fields;

    const explain = ["Te explico qué dato necesitamos y dónde encontrarlo:"];
    fields.forEach(function (field) {
      explain.push("«" + field.label.replace(" (S/)", "") + "»: " + (FIELD_HELP[field.id] || field.hint));
    });
    explain.push("Cuando lo tengas, escríbelo en el campo marcado en rojo y toca «Siguiente». Si quieres, pregúntame lo que necesites.");

    ContigoAssistant.offerHelp({
      question: "Veo que este paso se está complicando. ¿Necesitas ayuda con este paso?",
      explain: explain
    });
  }

  /* ---------- US-24 y US-33: revisar antes de avanzar ---------- */

  function runFormChecks() {
    const service = findBillService(guide.procedure.id);

    if (service && guide.mode === "real") {
      const number = guide.state.values[service.numberField];
      const duplicate = checkDuplicatePayment(guide.user.id, service.id, number);
      if (duplicate && (duplicate.type === "paid" || duplicate.type === "processing")) {
        return showDuplicateWarning(duplicate).then(function (choice) {
          if (choice === "view") {
            window.location.href = "calendar.html?bill=" + duplicate.bill.id;
          }
          return false;
        });
      }
    }

    const hasAmount = guide.procedure.fields.some(function (field) {
      return field.id === "amount";
    });
    if (!service || !hasAmount) {
      return Promise.resolve(true);
    }

    const amount = guide.state.values.amount;
    if (extras.confirmedAmounts[amount]) {
      return Promise.resolve(true);
    }

    const unusual = checkUnusualAmount(guide.user.id, service.id, amount);
    if (!unusual) {
      return Promise.resolve(true);
    }

    return confirmUnusualAmount(unusual, amount, service.label).then(function (confirmed) {
      if (confirmed) {
        extras.confirmedAmounts[amount] = true;
        return true;
      }
      const input = document.getElementById("guide-amount");
      if (input) {
        input.focus();
        input.select();
        input.closest(".field").scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return false;
    });
  }

  /* ---------- Envolturas de las funciones del Sprint 1 ---------- */

  const originalRenderStep = renderStep;
  const originalGoNext = goNext;
  const originalValidate = validateGuideForm;
  const originalSave = saveGuideState;

  window.renderStep = function (shouldFocus) {
    originalRenderStep(shouldFocus);
    ensureUI();

    const step = currentStep();
    GuideAudio.onStepChange(guide.procedure.id + ":" + guide.mode + ":" + guide.state.index);

    applyGlossary(document.getElementById("step-title"));
    applyGlossary(document.getElementById("step-text"));
    applyGlossary(document.querySelector("#step-tip .alert-text"));
    renderHelp(step);

    extras.elements.check.hidden = step.type !== "info";
    extras.elements.check.querySelector("input").checked = getDoneSteps().indexOf(guide.state.index) !== -1;
    extras.elements.summary.hidden = true;

    if (step.type === "done") {
      renderClosing();
    }

    ContigoAssistant.setContext({ procedure: guide.procedure, stepTitle: step.title });

    if (guide.mode === "real") {
      saveGuideState();
    }
  };

  window.validateGuideForm = function () {
    const isValid = originalValidate();
    const form = document.getElementById("step-form");

    if (!isValid) {
      showErrorSummary(extras.elements.summary, getInvalidInputs(form));
      scrollToFirstError(form);
    } else {
      extras.elements.summary.hidden = true;
    }
    return isValid;
  };

  window.goNext = function () {
    const step = currentStep();
    if (step.type !== "form") {
      originalGoNext();
      return;
    }

    if (extras.checking) {
      return;
    }

    if (!validateGuideForm()) {
      registerFailure();
      return;
    }
    extras.failures = 0;

    extras.checking = true;
    runFormChecks().then(function (canContinue) {
      extras.checking = false;
      if (canContinue) {
        originalGoNext();
      }
    });
  };

  window.saveGuideState = function () {
    const isNewAttempt = !guide.state.attemptId;
    if (isNewAttempt) {
      guide.state.attemptId = "ATT-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
    }
    getDoneSteps();
    originalSave();

    if (guide.mode !== "real") {
      return;
    }

    if (isNewAttempt) {
      getPendingAttempts(guide.user.id).forEach(function (attempt) {
        if (attempt.procedureId === guide.procedure.id) {
          discardGuideAttempt(attempt.attemptId);
        }
      });
    }

    const step = currentStep();
    upsertGuideAttempt({
      attemptId: guide.state.attemptId,
      userId: guide.user.id,
      procedureId: guide.procedure.id,
      procedureName: guide.procedure.name,
      index: guide.state.index,
      total: guide.steps.length,
      values: Object.assign({}, guide.state.values),
      doneSteps: getDoneSteps().slice(),
      receiptId: guide.state.receiptId,
      status: step.type === "done" ? "completed" : "pending",
      updatedAt: new Date().toISOString()
    });
  };
})();
