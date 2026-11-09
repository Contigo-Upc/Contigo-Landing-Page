/* Sprint 2 · Escanear recibo:
   US-16 lectura simulada · US-17 corregir datos · US-18 foto borrosa u oscura
   US-24 monto inusual · US-32 campos con error · US-33 recibo ya pagado
   US-34 ayuda tras errores repetidos · US-36 fecha de vencimiento */

const NUMBER_RULES = {
  supply: { pattern: /^\d{7,8}$/, maxlength: 8, hint: "Tiene 7 u 8 números. Está arriba de tu recibo.", error: "Escribe 7 u 8 números, sin espacios ni letras." },
  contract: { pattern: /^\d{6,10}$/, maxlength: 10, hint: "Tiene entre 6 y 10 números. Está junto a tu nombre.", error: "Escribe entre 6 y 10 números, sin espacios ni letras." }
};

const scan = {
  user: null,
  imageUrl: null,
  demoData: null,
  extracted: null,
  failures: 0,
  confirmedAmount: null,
  savedBill: null,
  busy: false
};

document.addEventListener("DOMContentLoaded", function () {
  const user = requireSession();
  if (!user) {
    return;
  }
  scan.user = user;

  document.querySelectorAll(".s2-inline-icon[data-icon]").forEach(function (element) {
    element.innerHTML = getExtraIcon(element.dataset.icon);
  });

  setupServiceSelect();
  setupPhotoStep();
  setupReviewStep();
  setupDoneStep();
});

function el(id) {
  return document.getElementById(id);
}

function showSection(id) {
  ["scan-step-photo", "scan-loading", "scan-step-review", "scan-step-done"].forEach(function (sectionId) {
    el(sectionId).hidden = sectionId !== id;
  });
}

function getSelectedService() {
  return findBillService(el("scan-service").value);
}

/* ---------- Paso 1: foto ---------- */

function setupServiceSelect() {
  const select = el("scan-service");
  BILL_SERVICES.forEach(function (service) {
    const option = document.createElement("option");
    option.value = service.id;
    option.textContent = service.label;
    select.appendChild(option);
  });

  const requested = getQueryParam("service");
  if (findBillService(requested)) {
    select.value = requested;
  }

  select.addEventListener("change", function () {
    clearFieldError(select);
  });
}

function requireService() {
  const select = el("scan-service");
  if (select.value) {
    return true;
  }
  showFieldError(select, "Primero elige de qué servicio es tu recibo.");
  select.closest(".field").scrollIntoView({ behavior: "smooth", block: "center" });
  select.focus({ preventScroll: true });
  return false;
}

function setupPhotoStep() {
  const fileInput = el("scan-file");

  el("scan-file-label").addEventListener("click", function (event) {
    if (!requireService()) {
      event.preventDefault();
    }
  });

  fileInput.addEventListener("change", function () {
    const file = fileInput.files && fileInput.files[0];
    if (!file) {
      return;
    }
    if (!/^image\//.test(file.type)) {
      showToast("Ese archivo no es una foto. Elige una imagen de tu recibo.");
      fileInput.value = "";
      return;
    }
    releaseImage();
    scan.imageUrl = URL.createObjectURL(file);
    scan.demoData = null;
    showPreview("Foto lista. Toca «Leer mi recibo».");
  });

  el("scan-read").addEventListener("click", readReceipt);
  el("scan-retake").addEventListener("click", retakePhoto);
  el("scan-cancel").addEventListener("click", cancelScan);

  document.querySelectorAll("[data-demo]").forEach(function (button) {
    button.addEventListener("click", function () {
      if (!requireService()) {
        return;
      }
      const demo = drawDemoReceipt(el("scan-service").value, button.dataset.demo);
      releaseImage();
      scan.imageUrl = demo.dataUrl;
      scan.demoData = demo.data;
      showPreview("Foto de ejemplo. Toca «Leer mi recibo».");
    });
  });
}

function showPreview(caption) {
  el("scan-preview-image").src = scan.imageUrl;
  el("scan-preview-caption").textContent = caption;
  el("scan-preview").hidden = false;
  el("scan-quality-alert").hidden = true;
  el("scan-read").hidden = false;
  el("scan-retake").hidden = true;
  el("scan-cancel").hidden = false;
  el("scan-file-label").hidden = true;
  el("scan-read").focus();
}

function releaseImage() {
  if (scan.imageUrl && scan.imageUrl.indexOf("blob:") === 0) {
    URL.revokeObjectURL(scan.imageUrl);
  }
  scan.imageUrl = null;
}

/* US-16, escenario 3: cancelar descarta la imagen sin guardar datos */
function cancelScan() {
  releaseImage();
  scan.demoData = null;
  scan.extracted = null;
  scan.failures = 0;
  scan.confirmedAmount = null;
  el("scan-file").value = "";
  el("scan-form").reset();
  el("scan-preview").hidden = true;
  el("scan-preview-image").removeAttribute("src");
  el("scan-quality-alert").hidden = true;
  el("scan-read").hidden = true;
  el("scan-retake").hidden = true;
  el("scan-cancel").hidden = true;
  el("scan-file-label").hidden = false;
  showSection("scan-step-photo");
  showToast("Descartamos la foto. No guardamos ningún dato.");
}

function retakePhoto() {
  releaseImage();
  scan.demoData = null;
  el("scan-file").value = "";
  el("scan-preview").hidden = true;
  el("scan-quality-alert").hidden = true;
  el("scan-read").hidden = true;
  el("scan-retake").hidden = true;
  el("scan-cancel").hidden = true;
  el("scan-file-label").hidden = false;
  showSection("scan-step-photo");
  el("scan-file-label").focus();
}

function readReceipt() {
  if (!requireService() || !scan.imageUrl || scan.busy) {
    return;
  }
  scan.busy = true;
  showSection("scan-loading");
  el("scan-loading-text").textContent = "Revisando que la foto se vea bien…";

  loadImage(scan.imageUrl)
    .then(function (image) {
      const analysis = analyzeReceiptImage(image);
      return new Promise(function (resolve) {
        setTimeout(function () {
          el("scan-loading-text").textContent = "Leyendo los datos de tu recibo…";
          setTimeout(function () {
            resolve(analysis);
          }, 700);
        }, 600);
      });
    })
    .then(function (analysis) {
      scan.busy = false;
      const problem = getImageProblem(analysis);

      if (problem) {
        showImageProblem(problem);
        return;
      }

      scan.extracted = simulateReceiptReading(el("scan-service").value, analysis, scan.demoData);
      showReview();
    })
    .catch(function () {
      scan.busy = false;
      showSection("scan-step-photo");
      showImageProblem({ title: "No pudimos abrir la foto", text: "Intenta con otra foto de tu recibo." });
    });
}

/* US-18: aviso de foto borrosa o con poca luz */
function showImageProblem(problem) {
  showSection("scan-step-photo");
  const alert = el("scan-quality-alert");
  showAlert(alert, problem.title, "");
  alert.querySelector(".alert-text").textContent = problem.text;
  el("scan-read").hidden = true;
  el("scan-retake").hidden = false;
  el("scan-cancel").hidden = false;
  alert.scrollIntoView({ behavior: "smooth", block: "center" });
  el("scan-retake").focus({ preventScroll: true });
}

/* ---------- Paso 2: revisar y corregir ---------- */

function setReadTag(tagId, wasRead) {
  const tag = el(tagId);
  tag.textContent = wasRead ? "Leído de la foto" : "Falta: escríbelo";
  tag.className = "s2-read-tag " + (wasRead ? "is-read" : "is-missing");
}

function showReview() {
  const service = getSelectedService();
  const rule = NUMBER_RULES[service.numberField];
  const data = scan.extracted;
  const form = el("scan-form");

  form.querySelectorAll(".field-input").forEach(function (input) {
    clearFieldError(input);
  });
  getOrCreateErrorSummary(form, form.firstElementChild).hidden = true;

  el("scan-number-label").firstChild.textContent = service.numberLabel + " ";
  el("scan-number").maxLength = rule.maxlength;
  el("scan-number-hint").textContent = rule.hint;

  el("scan-number").value = data.number;
  el("scan-amount").value = data.amount;
  el("scan-due-date").value = data.dueDate;

  setReadTag("scan-number-tag", Boolean(data.number));
  setReadTag("scan-amount-tag", Boolean(data.amount));
  setReadTag("scan-due-date-tag", Boolean(data.dueDate));

  const missing = [];
  if (!data.number) {
    missing.push(service.numberLabel.toLowerCase());
  }
  if (!data.amount) {
    missing.push("el monto");
  }
  if (!data.dueDate) {
    missing.push("la fecha de vencimiento");
  }

  const partial = el("scan-partial-alert");
  if (missing.length) {
    partial.querySelector(".alert-title").textContent = "No pudimos leer todos los datos";
    partial.querySelector(".alert-text").textContent = "Escribe tú " + missing.join(" y ") + " mirando tu recibo. Los campos que faltan están marcados."
      + (!data.dueDate ? " Necesitamos la fecha de vencimiento para recordarte el pago." : "");
    partial.hidden = false;
  } else {
    partial.hidden = true;
  }

  scan.failures = 0;
  scan.confirmedAmount = null;
  showSection("scan-step-review");
  el("scan-review-title").focus();
}

function setupReviewStep() {
  const form = el("scan-form");
  const summary = getOrCreateErrorSummary(form, form.firstElementChild);
  watchErrorSummary(form, summary);

  [["scan-number", "scan-number-tag"], ["scan-amount", "scan-amount-tag"], ["scan-due-date", "scan-due-date-tag"]].forEach(function (pair) {
    const input = el(pair[0]);
    input.addEventListener("input", function () {
      clearFieldError(input);
      const tag = el(pair[1]);
      tag.textContent = input.value.trim() ? "Corregido por ti" : "Falta: escríbelo";
      tag.className = "s2-read-tag " + (input.value.trim() ? "is-edited" : "is-missing");
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    submitReview();
  });

  el("scan-review-retake").addEventListener("click", retakePhoto);
  el("scan-review-cancel").addEventListener("click", cancelScan);
}

/* US-17 y US-32: validar todos los campos a la vez */
function validateReview() {
  const service = getSelectedService();
  const rule = NUMBER_RULES[service.numberField];
  const number = el("scan-number");
  const amount = el("scan-amount");
  const dueDate = el("scan-due-date");
  let isValid = true;

  [number, amount, dueDate].forEach(clearFieldError);

  const numberValue = number.value.replace(/\s/g, "");
  if (numberValue === "") {
    showFieldError(number, "Escribe este dato para continuar.");
    isValid = false;
  } else if (!rule.pattern.test(numberValue)) {
    showFieldError(number, rule.error);
    isValid = false;
  }

  const amountValue = amount.value.trim().replace(",", ".");
  if (amountValue === "") {
    showFieldError(amount, "Escribe el monto para continuar.");
    isValid = false;
  } else if (!AMOUNT_FIELD.pattern.test(amountValue)) {
    showFieldError(amount, AMOUNT_FIELD.error);
    isValid = false;
  }

  const days = daysUntil(dueDate.value);
  if (!dueDate.value) {
    showFieldError(dueDate, "Escribe la fecha de vencimiento para que podamos recordarte el pago.");
    isValid = false;
  } else if (days === null || days < -60 || days > 365) {
    showFieldError(dueDate, "Revisa la fecha: debe ser la que aparece en tu recibo actual.");
    isValid = false;
  }

  const form = el("scan-form");
  const summary = getOrCreateErrorSummary(form, form.firstElementChild);
  if (!isValid) {
    showErrorSummary(summary, getInvalidInputs(form));
    scrollToFirstError(form);
    return null;
  }

  summary.hidden = true;
  return { number: numberValue, amount: Number(amountValue).toFixed(2), dueDate: dueDate.value };
}

/* US-34 */
function registerScanFailure() {
  scan.failures += 1;
  if (scan.failures < 3) {
    return;
  }
  scan.failures = 0;

  const service = getSelectedService();
  const explain = ["Te explico dónde está cada dato en tu recibo:"];
  getInvalidInputs(el("scan-form")).forEach(function (input) {
    if (input.id === "scan-number") {
      explain.push("«" + service.numberLabel + "»: " + FIELD_HELP[service.numberField]);
    } else if (input.id === "scan-amount") {
      explain.push("«Monto»: " + FIELD_HELP.amount);
    } else if (input.id === "scan-due-date") {
      explain.push("«Fecha de vencimiento»: " + FIELD_HELP.dueDate + " Toca el campo y elige el día en el calendario.");
    }
  });
  explain.push("Corrige el campo marcado en rojo y toca «Guardar mi recibo».");

  ContigoAssistant.offerHelp({ question: "¿Necesitas ayuda con este paso?", explain: explain });
}

function submitReview() {
  if (scan.busy) {
    return;
  }

  const values = validateReview();
  if (!values) {
    registerScanFailure();
    return;
  }
  scan.failures = 0;

  const service = getSelectedService();
  const duplicate = checkDuplicatePayment(scan.user.id, service.id, values.number, values.dueDate);
  scan.busy = true;

  let chain = Promise.resolve({ proceed: true, existing: null });

  /* US-33: recibo ya pagado o en proceso */
  if (duplicate && (duplicate.type === "paid" || duplicate.type === "processing")) {
    chain = showDuplicateWarning(duplicate).then(function (choice) {
      if (choice === "view") {
        window.location.href = "calendar.html?bill=" + duplicate.bill.id;
      }
      return { proceed: false };
    });
  } else if (duplicate && duplicate.type === "registered") {
    chain = openDialog({
      tone: "info",
      icon: "receipt",
      title: "Ya guardaste este recibo",
      text: "Este recibo ya está en tus pagos con vencimiento el " + formatShortDate(duplicate.bill.dueDate) + ". ¿Quieres actualizarlo con estos datos?",
      actions: [
        { label: "Sí, actualizar", value: "update", style: "primary" },
        { label: "No, dejarlo como está", value: "back", style: "secondary" }
      ]
    }).then(function (choice) {
      return { proceed: choice === "update", existing: duplicate.bill };
    });
  }

  chain
    .then(function (result) {
      if (!result.proceed) {
        return null;
      }

      /* US-24: monto inusual */
      const unusual = scan.confirmedAmount === values.amount
        ? null
        : checkUnusualAmount(scan.user.id, service.id, values.amount, result.existing ? result.existing.id : null);

      if (!unusual) {
        return result;
      }
      return confirmUnusualAmount(unusual, values.amount, service.label).then(function (confirmed) {
        if (!confirmed) {
          const amount = el("scan-amount");
          amount.closest(".field").scrollIntoView({ behavior: "smooth", block: "center" });
          amount.focus({ preventScroll: true });
          amount.select();
          return null;
        }
        scan.confirmedAmount = values.amount;
        return result;
      });
    })
    .then(function (result) {
      scan.busy = false;
      if (!result) {
        return;
      }

      /* US-36: guardar la fecha de vencimiento en el calendario */
      if (result.existing) {
        scan.savedBill = updateBill(result.existing.id, { amount: Number(values.amount), dueDate: values.dueDate, notified: {} });
      } else {
        scan.savedBill = createBill({
          userId: scan.user.id,
          serviceId: service.id,
          number: values.number,
          amount: values.amount,
          dueDate: values.dueDate,
          source: "scan"
        });
      }

      releaseImage();
      el("scan-file").value = "";
      document.dispatchEvent(new CustomEvent("contigo:bills-changed"));
      showDone(service, values);
    });
}

/* ---------- Paso 3: listo ---------- */

function showDone(service, values) {
  el("scan-done-text").textContent = "Lo agregamos a tu calendario de pagos. Te avisaremos 2 días antes de que venza y el mismo día del vencimiento.";

  const summary = el("scan-done-summary");
  summary.innerHTML = "";
  [
    ["Servicio", service.label],
    [service.numberLabel, values.number],
    ["Monto a pagar", formatMoney(values.amount)],
    ["Fecha de vencimiento", formatShortDate(values.dueDate) + " (" + describeDueDate(values.dueDate).toLowerCase() + ")"]
  ].forEach(function (row) {
    const wrapper = document.createElement("div");
    wrapper.className = "review-row";
    const term = document.createElement("dt");
    term.textContent = row[0];
    const detail = document.createElement("dd");
    detail.textContent = row[1];
    wrapper.appendChild(term);
    wrapper.appendChild(detail);
    summary.appendChild(wrapper);
  });

  const start = el("scan-start-guide");
  start.href = "guide.html?id=" + service.id + "&mode=real";
  start.onclick = function () {
    const values2 = {};
    values2[service.numberField] = values.number;
    values2.amount = values.amount;
    writeJson(sessionStorage, GUIDE_KEY, { id: service.id, mode: "real", index: 0, values: values2, receiptId: null });
  };

  el("scan-view-calendar").href = "calendar.html?bill=" + scan.savedBill.id;

  showSection("scan-step-done");
  el("scan-done-title").focus();
}

function setupDoneStep() {
  el("scan-again").addEventListener("click", function () {
    scan.savedBill = null;
    el("scan-form").reset();
    retakePhoto();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
