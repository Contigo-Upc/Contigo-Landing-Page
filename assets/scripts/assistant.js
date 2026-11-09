/* Sprint 2 · US-21: chat del asistente por texto con respuestas simuladas en memoria.
   También expone offerHelp() para la ayuda proactiva tras errores repetidos (US-34).
   La conversación solo vive en memoria: se borra al cambiar de página. */

const ContigoAssistant = (function () {
  const state = {
    ready: false,
    open: false,
    greeted: false,
    context: {},
    elements: {}
  };

  function build() {
    if (state.ready) {
      return;
    }

    const fab = document.createElement("button");
    fab.type = "button";
    fab.className = "s2-assistant-fab";
    fab.setAttribute("aria-controls", "assistant-panel");
    fab.setAttribute("aria-expanded", "false");
    fab.innerHTML = getExtraIcon("chat") + '<span class="s2-assistant-fab-label">Asistente</span>';

    const panel = document.createElement("section");
    panel.id = "assistant-panel";
    panel.className = "s2-assistant";
    panel.setAttribute("aria-labelledby", "assistant-title");
    panel.hidden = true;
    panel.innerHTML =
      '<header class="s2-assistant-header">' +
        '<span class="s2-assistant-avatar">' + getExtraIcon("chat") + "</span>" +
        '<div><h2 id="assistant-title" class="s2-assistant-title">Asistente Contigo</h2>' +
        '<p class="s2-assistant-subtitle">Te respondo con palabras sencillas</p></div>' +
        '<button type="button" class="s2-icon-button s2-assistant-minimize" aria-label="Minimizar asistente">' + getExtraIcon("close") + "</button>" +
      "</header>" +
      '<div class="s2-assistant-log" role="log" aria-live="polite" aria-label="Conversación con el asistente"></div>' +
      '<div class="s2-assistant-suggestions" aria-label="Preguntas sugeridas"></div>' +
      '<form class="s2-assistant-form" novalidate>' +
        '<label class="visually-hidden" for="assistant-input">Escribe tu pregunta</label>' +
        '<input id="assistant-input" class="field-input" type="text" maxlength="200" autocomplete="off" placeholder="Escribe tu pregunta...">' +
        '<button type="submit" class="btn btn-primary s2-assistant-send" aria-label="Enviar pregunta">' + getExtraIcon("send") + "</button>" +
      "</form>";

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    state.elements = {
      fab: fab,
      panel: panel,
      log: panel.querySelector(".s2-assistant-log"),
      suggestions: panel.querySelector(".s2-assistant-suggestions"),
      form: panel.querySelector(".s2-assistant-form"),
      input: panel.querySelector("#assistant-input")
    };

    fab.addEventListener("click", function () {
      if (state.open) {
        close();
      } else {
        open();
      }
    });

    panel.querySelector(".s2-assistant-minimize").addEventListener("click", function () {
      close();
      fab.focus();
    });

    panel.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        close();
        fab.focus();
      }
    });

    state.elements.form.addEventListener("submit", function (event) {
      event.preventDefault();
      const text = state.elements.input.value.trim();
      if (!text) {
        state.elements.input.focus();
        return;
      }
      state.elements.input.value = "";
      ask(text);
    });

    state.ready = true;
  }

  function scrollLog() {
    state.elements.log.scrollTop = state.elements.log.scrollHeight;
  }

  function addMessage(author, text, actions) {
    const bubble = document.createElement("div");
    bubble.className = "s2-message s2-message-" + author;

    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    bubble.appendChild(paragraph);

    if (actions && actions.length) {
      const group = document.createElement("div");
      group.className = "s2-message-actions";
      actions.forEach(function (action) {
        const element = document.createElement(action.href ? "a" : "button");
        element.className = "btn " + (action.style === "primary" ? "btn-primary" : "btn-secondary") + " s2-message-button";
        element.textContent = action.label;
        if (action.href) {
          element.href = action.href;
          if (/^https?:/.test(action.href)) {
            element.target = "_blank";
            element.rel = "noopener";
          }
        } else {
          element.type = "button";
          element.addEventListener("click", function () {
            group.querySelectorAll("button").forEach(function (button) {
              button.disabled = true;
            });
            action.onClick();
          });
        }
        group.appendChild(element);
      });
      bubble.appendChild(group);
    }

    state.elements.log.appendChild(bubble);
    scrollLog();
    return bubble;
  }

  function botSay(text, actions, delay) {
    const typing = document.createElement("div");
    typing.className = "s2-message s2-message-bot s2-typing";
    typing.innerHTML = '<span class="visually-hidden">El asistente está escribiendo</span><span></span><span></span><span></span>';
    state.elements.log.appendChild(typing);
    scrollLog();

    return new Promise(function (resolve) {
      setTimeout(function () {
        typing.remove();
        resolve(addMessage("bot", text, actions));
      }, delay === undefined ? 650 : delay);
    });
  }

  function getSuggestions() {
    const context = state.context;
    if (context.page === "scan") {
      return ["¿Cómo tomo una buena foto?", "¿Dónde está la fecha de vencimiento?", "¿Qué significa monto?"];
    }
    if (context.page === "calendar") {
      return ["¿Cuándo me avisan?", "¿Qué significa vencimiento?", "Ya pagué, ¿qué hago?"];
    }
    if (context.procedure) {
      return ["¿Qué necesito?", "¿Cómo sé si una página es segura?", "¿Qué significa " + (context.procedure.category === "documents" ? "tasa" : "suministro") + "?"];
    }
    return ["¿Cómo pago mi luz?", "¿Cómo escaneo mi recibo?", "¿Cómo sé si una página es segura?"];
  }

  function renderSuggestions() {
    const box = state.elements.suggestions;
    box.innerHTML = "";
    getSuggestions().forEach(function (text) {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip s2-suggestion";
      chip.textContent = text;
      chip.addEventListener("click", function () {
        ask(text);
      });
      box.appendChild(chip);
    });
  }

  function greet() {
    if (state.greeted) {
      return;
    }
    state.greeted = true;
    const user = getSessionUser();
    const name = user ? ", " + getFirstName(user.name) : "";
    const context = state.context;
    let text = "¡Hola" + name + "! Soy el asistente de Contigo. Escríbeme tu duda o toca una de las preguntas de abajo.";
    if (context.procedure) {
      text = "¡Hola" + name + "! Veo que estás en «" + context.procedure.name + "». ¿En qué te ayudo?";
    }
    addMessage("bot", text);
  }

  function open() {
    build();
    state.open = true;
    state.elements.panel.hidden = false;
    state.elements.fab.setAttribute("aria-expanded", "true");
    state.elements.fab.classList.add("is-open");
    greet();
    renderSuggestions();
    setTimeout(function () {
      state.elements.input.focus();
    }, 50);
  }

  function close() {
    if (!state.ready) {
      return;
    }
    state.open = false;
    state.elements.panel.hidden = true;
    state.elements.fab.setAttribute("aria-expanded", "false");
    state.elements.fab.classList.remove("is-open");
  }

  function offerHumanSupport() {
    botSay(
      "Puedes escribirle a nuestro equipo por WhatsApp al " + HUMAN_SUPPORT.whatsapp + " o al correo " + HUMAN_SUPPORT.email + ". Atendemos " + HUMAN_SUPPORT.hours + ".",
      [
        { label: "Abrir WhatsApp", href: "https://wa.me/" + HUMAN_SUPPORT.whatsapp.replace(/\D/g, ""), style: "primary" },
        { label: "Enviar un correo", href: "mailto:" + HUMAN_SUPPORT.email }
      ]
    );
  }

  function ask(text) {
    if (!state.open) {
      open();
    }
    addMessage("user", text);
    const reply = getAssistantReply(text, state.context);

    if (reply.type === "unknown") {
      botSay(reply.text, [
        { label: "Sí, con una persona", style: "primary", onClick: offerHumanSupport },
        {
          label: "No, gracias",
          onClick: function () {
            botSay("Está bien. Puedes preguntarme otra cosa cuando quieras.");
          }
        }
      ]);
      return;
    }

    botSay(reply.text);
  }

  /* US-34: el asistente ofrece ayuda por sí mismo */
  function offerHelp(options) {
    build();
    state.greeted = true;
    open();
    botSay(options.question || "¿Necesitas ayuda con este paso?", [
      {
        label: "Sí",
        style: "primary",
        onClick: function () {
          addMessage("user", "Sí");
          const messages = options.explain || [];
          messages.reduce(function (chain, message, index) {
            return chain.then(function () {
              return botSay(message, null, index === 0 ? 600 : 900);
            });
          }, Promise.resolve()).then(function () {
            if (options.onAccepted) {
              options.onAccepted();
            }
          });
        }
      },
      {
        label: "No, gracias",
        onClick: function () {
          addMessage("user", "No, gracias");
          close();
          if (options.onDeclined) {
            options.onDeclined();
          }
        }
      }
    ], 300);
  }

  function setContext(context) {
    state.context = Object.assign({}, state.context, context);
    if (state.open) {
      renderSuggestions();
    }
  }

  return {
    init: build,
    open: open,
    close: close,
    ask: ask,
    offerHelp: offerHelp,
    setContext: setContext
  };
})();

document.addEventListener("DOMContentLoaded", function () {
  if (!getSessionUser()) {
    return;
  }

  const procedure = typeof findProcedure === "function" ? findProcedure(getQueryParam("id")) : null;
  const page = document.body.dataset.page || "";
  ContigoAssistant.setContext({ procedure: procedure || null, page: page });
  ContigoAssistant.init();
});
