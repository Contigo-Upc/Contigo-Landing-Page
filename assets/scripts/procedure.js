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

  document.title = procedure.name + " | Contigo";
  document.getElementById("procedure-name").textContent = procedure.name;
  document.getElementById("procedure-summary").textContent = procedure.summary;
  document.getElementById("procedure-category").textContent = getCategoryLabel(procedure.category);
  document.getElementById("procedure-time").textContent = "Unos " + procedure.minutes + " minutos";
  document.getElementById("procedure-steps").textContent = (procedure.steps.length + 3) + " pasos";

  const icon = document.getElementById("procedure-icon");
  icon.classList.add(procedure.background);
  icon.innerHTML = getIcon(procedure.icon);

  setupRequirements(procedure);
  setupStartButtons(procedure);
});

function setupRequirements(procedure) {
  const list = document.getElementById("requirements-list");
  const status = document.getElementById("requirements-status");

  function updateStatus() {
    const checked = list.querySelectorAll("input:checked").length;
    const total = procedure.requirements.length;

    if (checked === total) {
      status.textContent = "¡Perfecto! Ya tienes todo para empezar.";
    } else {
      status.textContent = "Ya tienes " + checked + " de " + total + " cosas.";
    }
  }

  procedure.requirements.forEach(function (requirement, index) {
    const item = document.createElement("li");
    const label = document.createElement("label");
    label.className = "checkbox";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = "requirement-" + index;
    input.addEventListener("change", updateStatus);

    const text = document.createElement("span");
    text.textContent = requirement;

    label.appendChild(input);
    label.appendChild(text);
    item.appendChild(label);
    list.appendChild(item);
  });

  updateStatus();
}

function setupStartButtons(procedure) {
  const start = document.getElementById("start-guide");
  const practice = document.getElementById("start-practice");

  start.href = "guide.html?id=" + procedure.id + "&mode=real";
  practice.href = "guide.html?id=" + procedure.id + "&mode=practice";

  [start, practice].forEach(function (button) {
    button.addEventListener("click", clearGuide);
  });
}
