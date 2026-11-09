document.addEventListener("DOMContentLoaded", function () {
  const user = requireSession();
  if (!user) {
    return;
  }

  document.getElementById("greeting").textContent = "¡Hola, " + user.name + "!";

  renderReminders(document.getElementById("reminder-list"), user.id);
  renderResume(user);
  renderFrequentProcedures();
  setupSearch();
  notifyDevice(user.id);
});

function renderResume(user) {
  const section = document.getElementById("resume-section");
  const list = document.getElementById("resume-list");
  const pending = getProgressList(user.id).filter(function (progress) {
    return !progress.completed && progress.index > 0 && findProcedure(progress.id);
  });

  list.innerHTML = "";
  section.hidden = pending.length === 0;

  pending.forEach(function (progress) {
    list.appendChild(createResumeCard(user, progress));
  });
}

function createResumeCard(user, progress) {
  const procedure = findProcedure(progress.id);
  const card = document.createElement("div");
  card.className = "resume-card";

  const header = document.createElement("div");
  header.className = "resume-header";

  const title = document.createElement("p");
  title.className = "resume-title";
  title.textContent = procedure.name;

  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = progress.mode === "practice" ? "Práctica" : "Pendiente";

  header.appendChild(title);
  header.appendChild(badge);

  const step = document.createElement("p");
  step.textContent = "Paso " + (progress.index + 1) + " de " + progress.total +
    " · Última vez: " + new Date(progress.updatedAt).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" });

  const track = document.createElement("div");
  track.className = "resume-track";
  track.setAttribute("role", "progressbar");
  track.setAttribute("aria-label", "Avance de " + procedure.name);
  track.setAttribute("aria-valuemin", "0");
  track.setAttribute("aria-valuemax", String(progress.total));
  track.setAttribute("aria-valuenow", String(progress.index));

  const bar = document.createElement("div");
  bar.className = "resume-bar";
  bar.style.width = Math.round((progress.index / progress.total) * 100) + "%";
  track.appendChild(bar);

  const actions = document.createElement("div");
  actions.className = "resume-actions";

  const resume = document.createElement("a");
  resume.className = "btn btn-primary";
  resume.href = "guide.html?id=" + procedure.id + "&mode=" + progress.mode;
  resume.textContent = "Continuar con el paso " + (progress.index + 1);

  const discard = document.createElement("button");
  discard.type = "button";
  discard.className = "btn btn-secondary";
  discard.textContent = "Descartar este trámite";
  discard.addEventListener("click", function () {
    clearProgress(user.id, procedure.id);
    showToast("Descartamos tu avance en «" + procedure.name + "».");
    renderResume(user);
  });

  actions.appendChild(resume);
  actions.appendChild(discard);

  card.appendChild(header);
  card.appendChild(step);
  card.appendChild(track);
  card.appendChild(actions);
  return card;
}

function renderFrequentProcedures() {
  const list = document.getElementById("frequent-list");

  PROCEDURES.filter(function (procedure) {
    return procedure.frequent;
  }).forEach(function (procedure) {
    list.appendChild(createProcedureCard(procedure));
  });
}

function setupSearch() {
  const input = document.getElementById("search-input");
  const items = document.querySelectorAll("#task-list li, #frequent-list li");
  const frequentSection = document.getElementById("frequent-section");
  const frequentItems = document.querySelectorAll("#frequent-list li");
  const empty = document.getElementById("search-empty");
  const status = document.getElementById("search-status");

  input.addEventListener("input", function () {
    const query = simplifyText(input.value.trim());
    let visibleCount = 0;

    items.forEach(function (item) {
      const matches = simplifyText(item.textContent).includes(query);
      item.hidden = !matches;
      if (matches) {
        visibleCount++;
      }
    });

    const visibleFrequent = Array.from(frequentItems).filter(function (item) {
      return !item.hidden;
    });
    frequentSection.hidden = visibleFrequent.length === 0;

    empty.hidden = visibleCount > 0;

    if (query === "") {
      status.textContent = "";
    } else if (visibleCount === 0) {
      status.textContent = "No encontramos trámites con esa palabra.";
    } else {
      status.textContent = visibleCount === 1 ? "Encontramos 1 trámite." : "Encontramos " + visibleCount + " trámites.";
    }
  });
}