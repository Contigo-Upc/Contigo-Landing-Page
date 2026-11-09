const chat = {
  context: { user: null, procedure: null },
  messages: []
};

document.addEventListener("DOMContentLoaded", function () {
  const user = requireSession();
  if (!user) {
    return;
  }

  chat.context.user = user;
  chat.context.procedure = findProcedure(getQueryParam("topic")) || null;

  document.getElementById("send-button").innerHTML = getIcon("send");
  setupBackButton();
  setupTopic();

  const greeting = chat.context.procedure
    ? "¡Hola, " + getFirstName(user.name) + "! Soy tu asistente. Estoy viendo tu trámite de «" + chat.context.procedure.name + "». Pregúntame lo que necesites."
    : "¡Hola, " + getFirstName(user.name) + "! Soy tu asistente. Puedo ayudarte con tus trámites, tus recibos y tus fechas de pago. ¿En qué te ayudo?";

  addMessage("assistant", { text: greeting });
  renderSuggestions(DEFAULT_SUGGESTIONS);

  document.getElementById("chat-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const input = document.getElementById("question-input");
    const question = input.value.trim();
    if (question === "") {
      showToast("Escribe tu pregunta antes de enviarla.");
      input.focus();
      return;
    }
    input.value = "";
    ask(question);
  });
});

function setupBackButton() {
  const back = document.getElementById("back-button");
  if (!chat.context.procedure || window.history.length <= 1) {
    return;
  }
  back.hidden = false;
  back.innerHTML = getIcon("left");
  back.setAttribute("aria-label", "Volver a la guía");
  back.addEventListener("click", function () {
    window.history.back();
  });
}

function setupTopic() {
  const chip = document.getElementById("topic-chip");
  if (!chat.context.procedure) {
    return;
  }
  chip.hidden = false;
  chip.innerHTML = getIcon(chat.context.procedure.icon) + "<span></span>";
  chip.querySelector("span").textContent = "Sobre: " + chat.context.procedure.name;
}

function formatTime(date) {
  return date.toLocaleTimeString("es-PE", { hour: "numeric", minute: "2-digit" });
}

function addMessage(author, content) {
  const log = document.getElementById("chat-log");
  const message = { author: author, text: content.text, links: content.links || [], date: new Date() };
  chat.messages.push(message);

  const bubble = document.createElement("div");
  bubble.className = "message message-" + author;

  const who = document.createElement("span");
  who.className = "visually-hidden";
  who.textContent = author === "user" ? "Tú dijiste: " : "El asistente dice: ";

  const text = document.createElement("p");
  text.textContent = message.text;

  bubble.appendChild(who);
  bubble.appendChild(text);

  message.links.forEach(function (item) {
    const link = document.createElement("a");
    link.className = "message-link";
    link.href = item.href;
    link.textContent = item.label;
    if (item.href.startsWith("http")) {
      link.target = "_blank";
      link.rel = "noopener";
    }
    bubble.appendChild(link);
  });

  const time = document.createElement("span");
  time.className = "message-time";
  time.textContent = formatTime(message.date);
  bubble.appendChild(time);

  log.appendChild(bubble);
  log.scrollTop = log.scrollHeight;
}

function showTyping() {
  const typing = document.createElement("div");
  typing.className = "message message-assistant typing";
  typing.id = "typing";
  typing.textContent = "Escribiendo...";
  document.getElementById("chat-log").appendChild(typing);
}

function hideTyping() {
  const typing = document.getElementById("typing");
  if (typing) {
    typing.remove();
  }
}

function ask(question) {
  addMessage("user", { text: question });
  renderSuggestions([]);
  showTyping();

  setTimeout(function () {
    hideTyping();
    const answer = getAssistantAnswer(question, chat.context);
    addMessage("assistant", answer);
    renderSuggestions(answer.suggestions || DEFAULT_SUGGESTIONS.filter(function (item) {
      return simplifyText(item) !== simplifyText(question);
    }).slice(0, 3));
  }, 700);
}

function renderSuggestions(items) {
  const group = document.getElementById("suggestions");
  group.innerHTML = "";

  items.forEach(function (text) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "suggestion";
    button.textContent = text;
    button.addEventListener("click", function () {
      ask(text);
    });
    group.appendChild(button);
  });
}
