const scan = {
  user: null,
  procedureId: "electricity",
  photo: null,
  sample: null,
  source: "photo",
  confirmedAmount: null
};

document.addEventListener("DOMContentLoaded", function () {
  const user = requireSession();
  if (!user) {
    return;
  }
  scan.user = user;

  if (BILL_NAMES[getQueryParam("service")]) {
    scan.procedureId = getQueryParam("service");
  }

  document.getElementById("camera-icon").innerHTML = getIcon("camera");
  document.querySelector("#view-saved .success-check").innerHTML = getIcon("check");

  renderServiceOptions();
  setupPhotoInput();
  setupSamples();
  setupResultForm();
  setupAmountDialog();

  document.querySelectorAll("[data-retake]").forEach(function (button) {
    button.addEventListener("click", restart);
  });
  document.getElementById("manual-button").addEventListener("click", showManualForm);
  document.getElementById("problem-manual").addEventListener("click", showManualForm);
  document.getElementById("use-photo").addEventListener("click", readPhoto);

  if (getQueryParam("manual") === "1") {
    showManualForm();
  }
});

function showView(name) {
  document.querySelectorAll(".scan-view").forEach(function (view) {
    view.hidden = view.id !== "view-" + name;
  });
  const title = document.querySelector("#view-" + name + " h1");
  title.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getServiceLabel(procedureId) {
  return BILL_NAMES[procedureId].replace("Recibo de ", "");
}

function renderServiceOptions() {
  const group = document.getElementById("service-options");

  getServiceProcedures().forEach(function (procedure) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.textContent = getServiceLabel(procedure.id).charAt(0).toUpperCase() + getServiceLabel(procedure.id).slice(1);
    chip.dataset.service = procedure.id;
    chip.addEventListener("click", function () {
      scan.procedureId = procedure.id;
      updateServiceOptions();
    });
    group.appendChild(chip);
  });

  updateServiceOptions();
}

function updateServiceOptions() {
  document.querySelectorAll("#service-options .chip").forEach(function (chip) {
    const isSelected = chip.dataset.service === scan.procedureId;
    chip.classList.toggle("is-selected", isSelected);
    chip.setAttribute("aria-pressed", String(isSelected));
  });
}

function setupPhotoInput() {
  const input = document.getElementById("photo-input");

  input.addEventListener("change", function () {
    const file = input.files[0];
    if (!file) {
      return;
    }
    if (!file.type.startsWith("image/")) {
      showToast("Elige una foto de tu recibo, no otro tipo de archivo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = function () {
      scan.sample = null;
      scan.source = "photo";
      showPreview(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function setupSamples() {
  document.querySelectorAll("[data-sample]").forEach(function (button) {
    button.addEventListener("click", function () {
      const dueDate = addDays(todayIso(), 5);
      scan.sample = { dueDate: dueDate, effect: button.dataset.sample };
      scan.source = "photo";
      showPreview(drawSampleReceipt(scan.procedureId, dueDate, button.dataset.sample));
    });
  });
}

function showPreview(photo) {
  scan.photo = photo;
  document.getElementById("preview-image").src = photo;
  showView("preview");
}

function restart() {
  document.getElementById("photo-input").value = "";
  scan.photo = null;
  scan.sample = null;
  showView("start");
}

function loadImage(source) {
  return new Promise(function (resolve, reject) {
    const image = new Image();
    image.onload = function () {
      resolve(image);
    };
    image.onerror = reject;
    image.src = source;
  });
}

function readPhoto() {
  showView("reading");

  setTimeout(function () {
    loadImage(scan.photo).then(function (image) {
      const quality = checkPhotoQuality(image);
      if (!quality.ok) {
        showProblem(quality.problem);
        return;
      }
      showResult(simulateReading(image));
    }, function () {
      showProblem("blurry");
    });
  }, 1200);
}

function showProblem(problem) {
  document.getElementById("problem-image").src = scan.photo;

  if (problem === "dark") {
    document.getElementById("problem-heading").textContent = "La foto tiene poca luz";
    document.getElementById("problem-text").textContent = "No pudimos leer tu recibo. Busca un lugar con más luz o prende la luz del cuarto, y vuelve a tomarla.";
  } else {
    document.getElementById("problem-heading").textContent = "La foto salió borrosa";
    document.getElementById("problem-text").textContent = "No pudimos leer tu recibo. Apoya el celular en la mesa, espera a que enfoque y vuelve a tomarla.";
  }
  showView("problem");
}

function simulateReading(image) {
  const procedure = findProcedure(scan.procedureId);

  if (scan.sample) {
    const sample = SAMPLE_VALUES[scan.procedureId];
    return { number: sample.number, amount: sample.amount, dueDate: scan.sample.dueDate };
  }

  const seed = getImageSeed(image);
  const digits = procedure.fields[0].id === "supply" ? 7 : 8;
  const number = String(1000000 + seed * 13).padEnd(digits, "7").slice(0, digits);
  const amount = (30 + (seed % 120) + (seed % 100) / 100).toFixed(2);
  const dueDate = seed % 4 === 0 ? null : addDays(todayIso(), 3 + (seed % 20));

  return { number: number, amount: amount, dueDate: dueDate };
}

function prepareResultForm(numberHint) {
  const procedure = findProcedure(scan.procedureId);
  const label = document.getElementById("number-label");

  label.firstChild.textContent = procedure.fields[0].label + " ";
  document.getElementById("bill-number").maxLength = procedure.fields[0].maxlength;
  document.getElementById("bill-number-hint").textContent = numberHint || procedure.fields[0].hint;
  hideErrorSummary(document.getElementById("result-summary"));

  document.querySelectorAll("#result-form .field-input").forEach(function (input) {
    clearFieldError(input);
  });
  scan.confirmedAmount = null;
}

function showResult(data) {
  prepareResultForm("Leído de tu foto. Corrígelo si no coincide con tu recibo.");

  document.getElementById("result-title").textContent = "¡Leímos tu recibo!";
  document.getElementById("result-intro").textContent = "Revisa que los datos sean los correctos. Si algo no coincide con tu recibo, corrígelo.";
  document.getElementById("bill-number").value = data.number;
  document.getElementById("bill-amount").value = data.amount;
  document.getElementById("bill-date").value = data.dueDate || "";
  document.getElementById("date-alert").hidden = Boolean(data.dueDate);

  showView("result");
}

function showManualForm() {
  scan.source = "manual";
  prepareResultForm();

  document.getElementById("result-title").textContent = "Escribe los datos de tu recibo";
  document.getElementById("result-intro").textContent = "Cópialos tal como aparecen en tu " + BILL_NAMES[scan.procedureId].toLowerCase() + ".";
  document.getElementById("bill-number").value = "";
  document.getElementById("bill-amount").value = "";
  document.getElementById("bill-date").value = "";
  document.getElementById("date-alert").hidden = true;

  showView("result");
}

function validateResultForm() {
  const procedure = findProcedure(scan.procedureId);
  const numberField = procedure.fields[0];
  const number = document.getElementById("bill-number");
  const amount = document.getElementById("bill-amount");
  const date = document.getElementById("bill-date");
  const errors = [];

  amount.value = amount.value.trim().replace(",", ".");

  if (isEmpty(number.value)) {
    errors.push({ input: number, label: numberField.label, message: "Escribe el número para continuar." });
  } else if (!numberField.pattern.test(number.value.trim())) {
    errors.push({ input: number, label: numberField.label, message: numberField.error });
  }

  if (isEmpty(amount.value)) {
    errors.push({ input: amount, label: "Monto a pagar", message: "Escribe el monto para continuar." });
  } else if (!AMOUNT_FIELD.pattern.test(amount.value)) {
    errors.push({ input: amount, label: "Monto a pagar", message: AMOUNT_FIELD.error });
  }

  if (date.value === "") {
    errors.push({ input: date, label: "Fecha de vencimiento", message: "Escribe la fecha para añadirla a tu calendario." });
  }

  document.querySelectorAll("#result-form .field-input").forEach(function (input) {
    clearFieldError(input);
  });

  if (errors.length > 0) {
    errors.forEach(function (error) {
      showFieldError(error.input, error.message);
    });
    showErrorSummary(document.getElementById("result-summary"), errors);
    errors[0].input.focus();
    return false;
  }

  hideErrorSummary(document.getElementById("result-summary"));
  return true;
}

function setupResultForm() {
  const form = document.getElementById("result-form");
  clearErrorsWhileTyping(form);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!validateResultForm()) {
      return;
    }

    const amount = document.getElementById("bill-amount").value;
    if (scan.confirmedAmount !== amount && isUnusualAmount(scan.user.id, scan.procedureId, amount)) {
      openAmountDialog(amount);
      return;
    }
    saveScannedBill();
  });
}

function setupAmountDialog() {
  const dialog = document.getElementById("amount-dialog");

  document.getElementById("amount-confirm").addEventListener("click", function () {
    scan.confirmedAmount = document.getElementById("bill-amount").value;
    dialog.close();
    saveScannedBill();
  });

  document.getElementById("amount-fix").addEventListener("click", function () {
    dialog.close();
    const input = document.getElementById("bill-amount");
    input.focus();
    input.select();
  });
}

function openAmountDialog(amount) {
  const usual = getUsualAmount(scan.user.id, scan.procedureId);
  document.getElementById("amount-dialog-text").textContent =
    formatAmount(amount) + " es más alto de lo habitual para este recibo (suele ser alrededor de " +
    formatAmount(usual) + "). Revisa que esté bien copiado.";
  document.getElementById("amount-dialog").showModal();
}

function saveScannedBill() {
  const bill = createBill({
    userId: scan.user.id,
    procedureId: scan.procedureId,
    number: document.getElementById("bill-number").value.trim(),
    amount: document.getElementById("bill-amount").value,
    dueDate: document.getElementById("bill-date").value,
    source: scan.source
  });
  saveBill(bill);

  document.getElementById("saved-text").textContent =
    "Guardamos el vencimiento de tu " + getBillTitle(bill).toLowerCase() + " para el " +
    formatLongDate(bill.dueDate) + ". Te avisaremos 2 días antes y el mismo día.";

  const pay = document.getElementById("pay-with-guide");
  pay.href = "guide.html?id=" + bill.procedureId + "&mode=real&bill=" + bill.id;
  pay.onclick = function () {
    clearProgress(scan.user.id, bill.procedureId);
  };

  showView("saved");
}
