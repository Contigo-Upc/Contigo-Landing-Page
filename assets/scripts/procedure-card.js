function createProcedureCard(procedure) {
  const item = document.createElement("li");
  const link = document.createElement("a");
  link.className = "task-card";
  link.href = "procedure.html?id=" + procedure.id;

  const icon = document.createElement("span");
  icon.className = "task-icon " + procedure.background;
  icon.innerHTML = getIcon(procedure.icon);

  const title = document.createElement("span");
  title.className = "task-title";
  title.textContent = procedure.name;

  const text = document.createElement("span");
  text.className = "task-text";
  text.textContent = procedure.summary;

  const meta = document.createElement("span");
  meta.className = "task-meta";
  meta.textContent = "Unos " + procedure.minutes + " min · " + getCategoryLabel(procedure.category);

  link.appendChild(icon);
  link.appendChild(title);
  link.appendChild(text);
  link.appendChild(meta);
  item.appendChild(link);
  return item;
}