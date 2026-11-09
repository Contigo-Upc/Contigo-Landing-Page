/* Sprint 2 · US-23: tocar una palabra que no entiendo y ver su significado
   sin salir del trámite. Los términos técnicos aparecen subrayados. */

let glossaryPattern = null;

function getGlossaryPattern() {
  if (glossaryPattern) {
    return glossaryPattern;
  }

  const variants = [];
  GLOSSARY.forEach(function (entry) {
    entry.variants.forEach(function (variant) {
      variants.push(variant);
    });
  });
  variants.sort(function (a, b) {
    return b.length - a.length;
  });

  const escaped = variants.map(function (variant) {
    return variant.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  });

  glossaryPattern = new RegExp("(?<![\\p{L}\\d])(" + escaped.join("|") + ")(?![\\p{L}\\d])", "giu");
  return glossaryPattern;
}

/* Reemplaza el texto del elemento por texto + botones en los términos del glosario. */
function applyGlossary(element) {
  if (!element) {
    return;
  }

  const text = element.textContent;
  const pattern = getGlossaryPattern();
  const used = {};
  const fragment = document.createDocumentFragment();
  let lastIndex = 0;
  let match;

  pattern.lastIndex = 0;
  while ((match = pattern.exec(text)) !== null) {
    const word = match[1];
    const entry = findGlossaryEntry(word);
    if (!entry || used[entry.term]) {
      continue;
    }
    used[entry.term] = true;

    fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));

    const button = document.createElement("span");
    button.setAttribute("role", "button");
    button.tabIndex = 0;
    button.className = "s2-term";
    button.textContent = word;
    button.setAttribute("aria-label", word + ". Toca para ver qué significa");
    button.addEventListener("click", function () {
      openTermSheet(word, button);
    });
    button.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openTermSheet(word, button);
      }
    });
    fragment.appendChild(button);

    lastIndex = match.index + word.length;
  }

  if (lastIndex === 0) {
    return;
  }

  fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
  element.textContent = "";
  element.appendChild(fragment);
}

function buildTermSheet() {
  let sheet = document.getElementById("term-sheet");
  if (sheet) {
    return sheet;
  }

  sheet = document.createElement("section");
  sheet.id = "term-sheet";
  sheet.className = "s2-term-sheet";
  sheet.setAttribute("role", "dialog");
  sheet.setAttribute("aria-labelledby", "term-sheet-title");
  sheet.hidden = true;
  sheet.innerHTML =
    '<div class="s2-term-sheet-head">' +
      '<span class="s2-term-sheet-icon">' + getExtraIcon("help") + "</span>" +
      '<h2 id="term-sheet-title" class="s2-term-sheet-title"></h2>' +
      '<button type="button" class="s2-icon-button s2-term-close" aria-label="Cerrar explicación">' + getExtraIcon("close") + "</button>" +
    "</div>" +
    '<p class="s2-term-short"></p>' +
    '<div class="s2-term-more" hidden><p class="s2-term-more-label">Un ejemplo</p><p class="s2-term-more-text"></p></div>' +
    '<div class="s2-term-actions"></div>';

  document.body.appendChild(sheet);

  sheet.querySelector(".s2-term-close").addEventListener("click", closeTermSheet);
  sheet.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeTermSheet();
    }
  });
  return sheet;
}

let termSheetReturnFocus = null;

function openTermSheet(word, returnFocusElement) {
  const sheet = buildTermSheet();
  const entry = findGlossaryEntry(word);
  const cleanWord = String(word).trim().replace(/[¿?¡!.,;:«»"()]/g, "");
  const title = sheet.querySelector(".s2-term-sheet-title");
  const short = sheet.querySelector(".s2-term-short");
  const more = sheet.querySelector(".s2-term-more");
  const actions = sheet.querySelector(".s2-term-actions");

  termSheetReturnFocus = returnFocusElement || document.activeElement;
  actions.innerHTML = "";
  more.hidden = true;

  if (entry) {
    sheet.classList.remove("is-unknown");
    title.textContent = "¿Qué significa «" + cleanWord + "»?";
    short.textContent = entry.short;
    sheet.querySelector(".s2-term-more-text").textContent = entry.more;

    const moreButton = document.createElement("button");
    moreButton.type = "button";
    moreButton.className = "btn btn-secondary";
    moreButton.textContent = "Explicar más";
    moreButton.addEventListener("click", function () {
      more.hidden = false;
      moreButton.remove();
    });
    actions.appendChild(moreButton);
  } else {
    sheet.classList.add("is-unknown");
    title.textContent = "«" + cleanWord + "»";
    short.textContent = "Todavía no tenemos una explicación para esta palabra. Puedes preguntarle al asistente y te ayudará.";

    const askButton = document.createElement("button");
    askButton.type = "button";
    askButton.className = "btn btn-primary";
    askButton.textContent = "Preguntar al asistente";
    askButton.addEventListener("click", function () {
      closeTermSheet();
      ContigoAssistant.ask("¿Qué significa " + cleanWord + "?");
    });
    actions.appendChild(askButton);
  }

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "btn-link";
  closeButton.textContent = "Entendido, seguir con el trámite";
  closeButton.addEventListener("click", closeTermSheet);
  actions.appendChild(closeButton);

  sheet.hidden = false;
  sheet.querySelector(".s2-term-close").focus();
}

function closeTermSheet() {
  const sheet = document.getElementById("term-sheet");
  if (!sheet || sheet.hidden) {
    return;
  }
  sheet.hidden = true;
  if (termSheetReturnFocus && document.contains(termSheetReturnFocus)) {
    termSheetReturnFocus.focus();
  }
}

/* Doble toque o doble clic sobre cualquier palabra del texto */
function enableWordLookup(element) {
  element.addEventListener("dblclick", function () {
    const selection = window.getSelection();
    const word = selection ? selection.toString().trim() : "";
    if (word && word.length > 1 && word.split(/\s+/).length <= 3) {
      openTermSheet(word);
    }
  });
}
