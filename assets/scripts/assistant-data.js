const CONTACT_INFO = "Escríbenos por WhatsApp al +51 987 654 321 o al correo hola@contigo.pe. Te atendemos de lunes a sábado, de 8:00 a.m. a 8:00 p.m.";

const ASSISTANT_RULES = [
  {
    keywords: ["estafa", "fraude", "clave", "contrasena", "me pidieron", "me llamaron"],
    answer: function () {
      return { text: "Nunca compartas tu clave del banco ni tu contraseña por teléfono, WhatsApp o mensaje. Paga solo en la página oficial: escribe tú mismo la dirección o usa la app oficial. Contigo nunca te pedirá tu clave." };
    }
  },
  {
    keywords: ["persona", "humano", "asesor", "hablar con", "llamar", "contacto", "whatsapp"],
    answer: function () {
      return { text: "Claro, una persona de nuestro equipo te puede ayudar. " + CONTACT_INFO };
    }
  },
  {
    keywords: ["cuanto cuesta", "costo", "precio", "cuanto pago", "cuanto es", "tasa"],
    answer: function (context) {
      if (context.procedure && context.procedure.id === "id-card") {
        return {
          text: "Renovar el DNI tiene una tasa que se paga en el Banco de la Nación o en Págalo.pe. El monto exacto lo confirmas en la página oficial de RENIEC, porque puede cambiar.",
          links: [{ label: "Ir a RENIEC en gob.pe", href: "https://www.gob.pe/reniec" }]
        };
      }
      if (context.procedure && BILL_NAMES[context.procedure.id]) {
        return { text: "El monto que debes pagar es el que aparece en tu recibo como «Total a pagar». Contigo no cobra nada por acompañarte." };
      }
      return { text: "Usar Contigo es gratis. Lo que pagas es el monto de tu recibo o la tasa del trámite, siempre en la página oficial de cada empresa o entidad." };
    }
  },
  {
    keywords: ["documento", "requisito", "necesito", "que llevo", "que debo tener"],
    answer: function (context) {
      if (context.procedure) {
        const items = context.procedure.requirements.map(function (item) {
          return item.charAt(0).toLowerCase() + item.slice(1);
        });
        return { text: "Para «" + context.procedure.name + "» necesitas: " + items.join("; ") + "." };
      }
      return {
        text: "Depende del trámite. Elige uno en «Mis trámites» y te mostramos todo lo que necesitas antes de empezar.",
        links: [{ label: "Ver mis trámites", href: "procedures.html" }]
      };
    }
  },
  {
    keywords: ["demora", "tarda", "cuanto tiempo", "minutos", "rapido"],
    answer: function (context) {
      if (context.procedure) {
        return { text: "La guía de «" + context.procedure.name + "» toma unos " + context.procedure.minutes + " minutos. Puedes ir a tu ritmo: si sales, tu avance se queda guardado." };
      }
      return { text: "La mayoría de guías toma entre 4 y 8 minutos. Puedes pausar cuando quieras: tu avance se queda guardado." };
    }
  },
  {
    keywords: ["ya pague", "pague", "pagado", "confirmar pago", "estado"],
    answer: function () {
      return {
        text: "Si ya pagaste, ve a «Mis recibos» y toca «Ya pagué». Cuando veas el pago en tu banco o en la página de la empresa, márcalo como confirmado.",
        links: [{ label: "Ir a Mis recibos", href: "bills.html" }]
      };
    }
  },
  {
    keywords: ["escanear", "foto", "camara", "leer recibo", "subir recibo"],
    answer: function () {
      return {
        text: "Puedes tomarle una foto a tu recibo y leeremos el número, el monto y la fecha de vencimiento. Antes de guardarlos, podrás revisarlos y corregirlos.",
        links: [{ label: "Escanear mi recibo", href: "scan.html" }]
      };
    }
  },
  {
    keywords: ["vence", "vencimiento", "fecha", "recordatorio", "aviso", "calendario", "olvido"],
    answer: function () {
      return {
        text: "Te avisamos 2 días antes y el día que vence tu recibo, si sigue pendiente. En el calendario ves todas tus fechas.",
        links: [{ label: "Ver mi calendario", href: "calendar.html" }, { label: "Ver mis recibos", href: "bills.html" }]
      };
    }
  },
  {
    keywords: ["error", "no funciona", "problema", "falla", "no puedo", "no me deja"],
    answer: function () {
      return { text: "Lamento que algo no funcione. Revisa que los números estén completos y sin espacios. Si el problema sigue, cuéntame qué paso estabas haciendo o habla con una persona: " + CONTACT_INFO };
    }
  },
  {
    keywords: ["luz", "agua", "internet", "cable", "dni", "deuda"],
    answer: function (context, question) {
      const procedure = PROCEDURES.find(function (item) {
        return simplifyText(question).includes(simplifyText(item.name.split(" ").pop()));
      });
      if (!procedure) {
        return null;
      }
      return {
        text: "Te puedo guiar paso a paso con «" + procedure.name + "». Toma unos " + procedure.minutes + " minutos.",
        links: [{ label: "Empezar " + procedure.name.toLowerCase(), href: "procedure.html?id=" + procedure.id }]
      };
    }
  },
  {
    keywords: ["hola", "buenos dias", "buenas tardes", "buenas noches"],
    answer: function (context) {
      return { text: "¡Hola, " + getFirstName(context.user.name) + "! ¿En qué te puedo ayudar?" };
    }
  },
  {
    keywords: ["gracias"],
    answer: function () {
      return { text: "¡Con gusto! Aquí estoy si necesitas algo más." };
    }
  }
];

const DEFAULT_SUGGESTIONS = ["¿Cuánto cuesta?", "¿Qué documentos necesito?", "¿Cuándo vence mi recibo?", "Hablar con una persona"];

function findGlossaryAnswer(question) {
  const simple = simplifyText(question);
  const entry = GLOSSARY.find(function (item) {
    return simple.includes(simplifyText(item.term));
  });
  if (!entry || !/(que es|que significa|significa|que quiere decir)/.test(simple)) {
    return null;
  }
  return { text: entry.term.charAt(0).toUpperCase() + entry.term.slice(1) + ": " + entry.short + " " + entry.more };
}

function getAssistantAnswer(question, context) {
  const simple = simplifyText(question);
  const glossary = findGlossaryAnswer(question);
  if (glossary) {
    return glossary;
  }

  for (let i = 0; i < ASSISTANT_RULES.length; i++) {
    const rule = ASSISTANT_RULES[i];
    const matches = rule.keywords.some(function (keyword) {
      return simple.includes(keyword);
    });
    if (matches) {
      const answer = rule.answer(context, question);
      if (answer) {
        return answer;
      }
    }
  }

  return {
    text: "No logré entender tu pregunta. Puedes preguntarme cuánto cuesta un trámite, qué documentos necesitas, cuándo vence tu recibo o qué significa una palabra. También puedes hablar con una persona.",
    suggestions: DEFAULT_SUGGESTIONS
  };
}
