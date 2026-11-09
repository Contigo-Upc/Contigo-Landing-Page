const GLOSSARY = [
  {
    term: "número de suministro",
    short: "Es el código que identifica tu casa en la empresa de luz o de agua.",
    more: "Aparece en la parte de arriba de tu recibo y tiene 7 u 8 números. Con él, la empresa sabe qué recibo estás pagando. Ejemplo: 1234567."
  },
  {
    term: "suministro",
    short: "Es el servicio de luz o agua que llega a tu casa, y el código que lo identifica.",
    more: "En el recibo verás «N.º de suministro»: es el número que usa la empresa para saber cuál es tu casa."
  },
  {
    term: "número de contrato",
    short: "Es el código de tu servicio de internet o cable.",
    more: "Aparece junto a tu nombre y tu dirección en el recibo o en el correo de tu empresa. Tiene entre 6 y 10 números."
  },
  {
    term: "monto",
    short: "Es la cantidad de dinero que debes pagar.",
    more: "En el recibo suele decir «Total a pagar». Cópialo con los decimales. Ejemplo: 85.50."
  },
  {
    term: "tasa",
    short: "Es el pago que cobra el Estado por hacer un trámite.",
    more: "Por ejemplo, para renovar el DNI se paga una tasa en el Banco de la Nación o en Págalo.pe antes de sacar la cita."
  },
  {
    term: "RENIEC",
    short: "Es la entidad del Estado que entrega el DNI.",
    more: "Significa Registro Nacional de Identificación y Estado Civil. Su página oficial está en gob.pe/reniec."
  },
  {
    term: "app de pagos",
    short: "Es una aplicación del celular para pagar sin efectivo.",
    more: "Por ejemplo, la app de tu banco o una billetera digital. Úsala solo si la descargaste de la tienda oficial de tu celular."
  },
  {
    term: "cuenta de ahorros",
    short: "Es tu cuenta en el banco, donde guardas tu dinero.",
    more: "Puedes pagar desde ella con la app o la página de tu banco."
  },
  {
    term: "duplicado",
    short: "Es una copia nueva de un documento que perdiste.",
    more: "Si perdiste tu DNI, pides un duplicado: es el mismo DNI, con tus mismos datos."
  },
  {
    term: "comprobante",
    short: "Es la prueba de que hiciste un pago o un trámite.",
    more: "Guárdalo siempre. Si hay un problema, te piden este documento para revisar tu caso."
  },
  {
    term: "vencimiento",
    short: "Es la última fecha para pagar sin multa.",
    more: "Aparece en el recibo como «Fecha de vencimiento». Si pagas después, te pueden cobrar un poco más."
  }
];

function findGlossaryEntry(term) {
  return GLOSSARY.find(function (entry) {
    return entry.term.toLowerCase() === term.toLowerCase();
  });
}

function escapeForRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildGlossaryRegex() {
  const terms = GLOSSARY
    .map(function (entry) {
      return entry.term;
    })
    .sort(function (a, b) {
      return b.length - a.length;
    })
    .map(escapeForRegex);
  return new RegExp("(" + terms.join("|") + ")", "gi");
}

function renderTextWithTerms(element, text, onTermClick) {
  element.innerHTML = "";
  const regex = buildGlossaryRegex();
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      element.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "term-button";
    button.textContent = match[0];
    button.setAttribute("aria-label", match[0] + ": ver qué significa");
    button.setAttribute("aria-expanded", "false");
    const word = match[0];
    button.addEventListener("click", function () {
      onTermClick(word, button);
    });
    element.appendChild(button);
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    element.appendChild(document.createTextNode(text.slice(lastIndex)));
  }
}

function setupTermPanel(panel) {
  const title = panel.querySelector(".term-title");
  const short = panel.querySelector(".term-short");
  const more = panel.querySelector(".term-more");
  const moreButton = panel.querySelector(".term-more-button");
  const closeButton = panel.querySelector(".term-close");
  let opener = null;

  function close() {
    panel.hidden = true;
    if (opener) {
      opener.setAttribute("aria-expanded", "false");
      opener.focus();
    }
  }

  moreButton.addEventListener("click", function () {
    more.hidden = false;
    moreButton.hidden = true;
  });

  closeButton.addEventListener("click", close);

  return {
    open: function (term, button) {
      const entry = findGlossaryEntry(term);
      if (!entry) {
        return;
      }
      if (opener && opener !== button) {
        opener.setAttribute("aria-expanded", "false");
      }
      opener = button;
      button.setAttribute("aria-expanded", "true");
      title.textContent = entry.term.charAt(0).toUpperCase() + entry.term.slice(1);
      short.textContent = entry.short;
      more.textContent = entry.more;
      more.hidden = true;
      moreButton.hidden = false;
      panel.hidden = false;
      closeButton.focus();
    },
    close: function () {
      panel.hidden = true;
    }
  };
}
