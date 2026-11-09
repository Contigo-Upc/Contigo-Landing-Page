/* Sprint 2 · Contenido del asistente y de la ayuda.
   US-21 (respuestas simuladas en memoria), US-23 (glosario),
   TSK-22 (ayuda contextual por paso), US-29 (verificar en la plataforma oficial)
   y US-34 (dónde encontrar cada dato en el documento físico). */

const GLOSSARY = [
  {
    term: "suministro",
    variants: ["número de suministro", "suministro"],
    short: "Es el número que identifica tu casa ante la empresa de luz o de agua.",
    more: "Es como el DNI de tu medidor. Ejemplo: si tu recibo dice «Suministro: 1234567», tu número de suministro es 1234567."
  },
  {
    term: "monto",
    variants: ["monto"],
    short: "Es la cantidad de dinero que tienes que pagar.",
    more: "Ejemplo: si tu recibo dice «Total a pagar S/ 85.50», el monto es 85.50. Escríbelo con punto para los céntimos."
  },
  {
    term: "contrato",
    variants: ["número de contrato", "contrato"],
    short: "Es el número que identifica tu servicio de internet o cable ante la empresa.",
    more: "Ejemplo: en tu recibo puede decir «Contrato: 45678901» o «Código de cliente». Ese número le dice a la empresa qué servicio vas a pagar."
  },
  {
    term: "tasa",
    variants: ["tasa"],
    short: "Es un pago fijo que cobra el Estado por hacer un trámite.",
    more: "Ejemplo: para renovar tu DNI primero pagas la tasa en el banco o en la página oficial, y con ese comprobante sacas tu cita."
  },
  {
    term: "RENIEC",
    variants: ["reniec"],
    short: "Es la entidad del Estado que entrega y renueva el DNI.",
    more: "Ejemplo: si tu DNI venció o lo perdiste, el trámite se hace en RENIEC, en su página oficial o en sus oficinas."
  },
  {
    term: "cuenta de ahorros",
    variants: ["cuenta de ahorros"],
    short: "Es el lugar del banco donde guardas tu dinero.",
    more: "Ejemplo: si cobras tu pensión en un banco, ese dinero está en una cuenta de ahorros y puedes pagar desde la app de ese banco."
  },
  {
    term: "app de pagos",
    variants: ["app de pagos"],
    short: "Es una aplicación del celular para pagar o enviar dinero.",
    more: "Ejemplo: las apps de los bancos o billeteras digitales como Yape o Plin. Solo descárgalas desde la tienda oficial de tu celular."
  },
  {
    term: "tarjeta",
    variants: ["tarjeta"],
    short: "Es la tarjeta de plástico de tu banco con la que puedes pagar.",
    more: "Ejemplo: con tu tarjeta de débito pagas con el dinero de tu cuenta. Nunca compartas la clave ni el código de atrás."
  },
  {
    term: "comprobante",
    variants: ["comprobante"],
    short: "Es un papel o archivo que demuestra que hiciste algo, como un pago.",
    more: "Ejemplo: después de pagar, la página te muestra un comprobante con un número. Guárdalo o tómale una captura de pantalla."
  },
  {
    term: "vencimiento",
    variants: ["fecha de vencimiento", "vencimiento", "vence"],
    short: "Es el último día para pagar sin que te cobren de más.",
    more: "Ejemplo: si tu recibo vence el 15 de noviembre y pagas el 16, la empresa puede cobrarte mora."
  },
  {
    term: "mora",
    variants: ["mora", "moras"],
    short: "Es un cobro extra por pagar después de la fecha de vencimiento.",
    more: "Ejemplo: si tu recibo era S/ 80 y pagas tarde, te pueden cobrar S/ 83. Esos S/ 3 son la mora."
  },
  {
    term: "duplicado",
    variants: ["duplicado"],
    short: "Es una copia nueva de un documento que perdiste o se dañó.",
    more: "Ejemplo: si perdiste tu DNI, pides un duplicado y te entregan uno nuevo con tus mismos datos."
  },
  {
    term: "cita",
    variants: ["cita"],
    short: "Es el día y la hora que reservas para que te atiendan.",
    more: "Ejemplo: eliges la oficina más cercana, el martes a las 10 a.m., y ese día vas con tus documentos."
  },
  {
    term: "huellas",
    variants: ["huellas"],
    short: "Son las marcas de las yemas de tus dedos que sirven para identificarte.",
    more: "Ejemplo: en RENIEC te piden poner el dedo en un lector para registrar tus huellas en tu nuevo DNI."
  },
  {
    term: "agencia autorizada",
    variants: ["agencia autorizada"],
    short: "Es un lugar permitido por la empresa o el Estado para recibir pagos.",
    more: "Ejemplo: un banco o un agente en una bodega que muestra el logo del banco."
  },
  {
    term: "página oficial",
    variants: ["página oficial", "sitio oficial"],
    short: "Es la página de internet de la propia empresa o entidad.",
    more: "Ejemplo: la dirección empieza con https:// y tiene el nombre de la empresa. Escríbela tú mismo, no entres desde mensajes."
  },
  {
    term: "deuda",
    variants: ["deudas", "deuda"],
    short: "Es dinero que todavía tienes que pagar.",
    more: "Ejemplo: si no pagaste el recibo de octubre, la empresa lo muestra como deuda pendiente."
  },
  {
    term: "cancelado",
    variants: ["cancelado", "cancelada"],
    short: "En un recibo, «cancelado» significa que ya está pagado.",
    more: "Ejemplo: si en la página de tu empresa tu recibo dice «Cancelado», no tienes que volver a pagarlo."
  }
];

/* US-34: dónde encontrar cada dato en el documento físico */
const FIELD_HELP = {
  supply: "El número de suministro está en la parte de arriba de tu recibo, cerca de tu nombre y tu dirección. Tiene 7 u 8 números. A veces dice «Suministro» o «N.° de cliente». Escríbelo sin espacios ni guiones.",
  contract: "El número de contrato está junto a tu nombre en el recibo o en el correo de tu empresa. Puede decir «Contrato» o «Código de cliente». Tiene entre 6 y 10 números, sin letras.",
  amount: "El monto está en un recuadro que dice «Total a pagar» o «Importe total». Escribe solo los números y usa punto para los céntimos. Ejemplo: 85.50.",
  idNumber: "El número de DNI está en la parte de adelante de tu DNI, arriba a la derecha. Son 8 números.",
  dueDate: "La fecha de vencimiento está cerca del total a pagar y suele decir «Vence» o «Fecha de vencimiento».",
  service: "Elige el tipo de servicio que dice tu recibo: luz, agua, internet o cable."
};

/* TSK-22: ayuda contextual según lo que pide cada paso */
const STEP_HELP_BY_ICON = {
  document: "Si no tienes el recibo en papel, revisa tu correo o la app de tu empresa: casi siempre envían una copia digital. Si no lo encuentras, puedes pedirlo llamando al número de atención de la empresa.",
  search: "Pon el recibo sobre la mesa, con buena luz. Busca con el dedo de arriba hacia abajo. El número que necesitas suele estar en un recuadro junto a tu nombre.",
  globe: "Para saber si una página es oficial: la dirección empieza con https:// y tiene el nombre de la empresa. Escríbela tú mismo. Nunca entres desde un enlace que te llegó por mensaje.",
  card: "Antes de confirmar, compara el monto de la pantalla con el de tu recibo. Nunca compartas tu clave ni el código que te llega por mensaje: la empresa jamás te lo pedirá.",
  calendar: "Elige la oficina más cercana a tu casa y un horario en el que puedas ir con calma. Anota la fecha o guárdala en tu calendario.",
  id: "Revisa que tu DNI no esté roto. Si lo perdiste, el trámite se llama «duplicado de DNI».",
  check: "Lleva tus documentos en una bolsa o carpeta para que no se mojen ni se doblen. Llega 10 minutos antes.",
  pencil: "Copia cada dato tal como aparece en tu documento. Si algo está mal, el campo se marca en rojo y te decimos cómo corregirlo.",
  eye: "Compara cada dato con tu documento, número por número. Si uno no coincide, toca «Corregir datos».",
  bulb: "Ten tu recibo de luz a la mano.",
  drop: "Ten tu recibo de agua a la mano.",
  wifi: "Ten tu recibo de internet a la mano.",
  tv: "Ten tu recibo de cable a la mano."
};

/* US-29: cómo comprobar en la plataforma oficial que el trámite quedó registrado */
const OFFICIAL_CHECKS = {
  services: [
    "Entra otra vez a la página oficial o a la app de tu empresa.",
    "Busca la opción «Mis recibos» o «Historial de pagos».",
    "Tu recibo debe aparecer como «Pagado» o «Cancelado».",
    "Guarda la constancia o toma una captura de pantalla.",
    "Si en 24 horas no aparece pagado, llama al número de atención de tu recibo."
  ],
  "id-card": [
    "Entra a la página oficial de RENIEC.",
    "Busca la opción para consultar el estado de tu trámite y escribe tu número de DNI.",
    "Revisa que tu cita aparezca con la fecha y la oficina que elegiste.",
    "Guarda el comprobante de pago de la tasa y la constancia de tu cita."
  ],
  debts: [
    "La lista que te muestra la página oficial es la información válida.",
    "Si un recibo aparece como «Cancelado», ya está pagado.",
    "Si ves una deuda que no reconoces, llama al número de atención de la empresa antes de pagar."
  ]
};

function getOfficialChecks(procedure) {
  return OFFICIAL_CHECKS[procedure.id] || OFFICIAL_CHECKS[procedure.category] || OFFICIAL_CHECKS.services;
}

const HUMAN_SUPPORT = {
  whatsapp: "+51 987 654 321",
  email: "hola@contigo.pe",
  hours: "lunes a sábado, de 8:00 a.m. a 8:00 p.m."
};

/* ---------- US-21: respuestas simuladas del asistente ---------- */

const VAGUE_MESSAGES = [
  "ayuda", "ayudame", "necesito ayuda", "no entiendo", "no se", "que hago", "duda", "tengo una duda",
  "una pregunta", "pregunta", "hola ayuda", "eso", "esto", "como", "que", "no", "si", "ok", "y ahora"
];

const STOP_WORDS = [
  "el", "la", "los", "las", "un", "una", "de", "del", "y", "o", "a", "en", "que", "como", "me", "mi", "se",
  "por", "para", "con", "es", "lo", "le", "no", "si", "yo", "tu", "hay", "puedo", "quiero", "necesito", "hola", "ayuda"
];

function getCurrentProcedureName(context) {
  return context && context.procedure ? context.procedure.name.toLowerCase() : "tu trámite";
}

const ASSISTANT_INTENTS = [
  {
    id: "greeting",
    keywords: ["hola", "buenos dias", "buenas tardes", "buenas noches"],
    exact: true,
    answer: function () {
      return "¡Hola! Estoy aquí para ayudarte. Puedes preguntarme, por ejemplo: «¿Dónde está mi número de suministro?» o «¿Cómo sé si una página es segura?».";
    }
  },
  {
    id: "thanks",
    keywords: ["gracias", "muchas gracias", "listo gracias"],
    answer: function () {
      return "¡De nada! Si tienes otra duda, escríbeme cuando quieras.";
    }
  },
  {
    id: "supply",
    keywords: ["suministro", "numero de cliente", "medidor"],
    answer: function () {
      return FIELD_HELP.supply;
    }
  },
  {
    id: "contract",
    keywords: ["contrato", "codigo de cliente"],
    answer: function () {
      return FIELD_HELP.contract;
    }
  },
  {
    id: "amount",
    keywords: ["monto", "cuanto pago", "cuanto tengo que pagar", "total a pagar", "importe", "cuanto debo"],
    answer: function () {
      return FIELD_HELP.amount + " Si el monto te parece muy alto, te avisaré para que lo revises antes de seguir.";
    }
  },
  {
    id: "due-date",
    keywords: ["vencimiento", "vence", "fecha", "recordatorio", "recordar", "olvidar", "calendario", "aviso"],
    answer: function () {
      return "Puedes guardar la fecha de vencimiento de tus recibos en «Pagos». Te avisaremos 2 días antes y el mismo día que vence. Si escaneas tu recibo, la fecha se guarda sola.";
    }
  },
  {
    id: "scan",
    keywords: ["escanear", "foto", "camara", "fotografia", "leer recibo", "subir recibo"],
    answer: function () {
      return "Entra a «Escanear recibo», elige el servicio y tómale una foto a tu recibo con buena luz y sin moverte. Leemos el número, el monto y la fecha, y tú puedes corregir cualquier dato antes de guardarlo.";
    }
  },
  {
    id: "safety",
    keywords: ["seguro", "segura", "estafa", "fraude", "robo", "clave", "contrasena", "confiable", "enlace", "mensaje raro", "link"],
    answer: function () {
      return "Para pagar seguro: escribe tú mismo la dirección de la página o usa la app oficial; revisa que empiece con https://; nunca compartas tu clave ni el código que te llega por mensaje. Ninguna empresa te lo pedirá por teléfono.";
    }
  },
  {
    id: "contigo-pays",
    keywords: ["pagan por mi", "contigo paga", "ustedes pagan", "pagar aqui", "pagar desde contigo", "cobran"],
    answer: function () {
      return "Contigo no realiza pagos ni cobra dinero. Te guiamos paso a paso para que tú pagues en la página oficial de tu empresa.";
    }
  },
  {
    id: "requirements",
    keywords: ["requisitos", "que necesito", "que debo tener", "documentos necesito"],
    answer: function (context) {
      if (context.procedure) {
        return "Para " + context.procedure.name.toLowerCase() + " necesitas: " + context.procedure.requirements.join("; ").toLowerCase() + ".";
      }
      return "Cada trámite tiene su lista de requisitos. Entra a «Mis trámites», elige uno y verás lo que necesitas antes de empezar.";
    }
  },
  {
    id: "time",
    keywords: ["cuanto demora", "cuanto tiempo", "tarda", "minutos", "demora"],
    answer: function (context) {
      if (context.procedure) {
        return "La guía de " + context.procedure.name.toLowerCase() + " toma unos " + context.procedure.minutes + " minutos. Puedes ir a tu ritmo.";
      }
      return "La mayoría de guías toman entre 4 y 8 minutos. Puedes ir a tu ritmo y continuar después si lo necesitas.";
    }
  },
  {
    id: "already-paid",
    keywords: ["ya pague", "pague dos veces", "doble pago", "pagado", "comprobante de pago", "en proceso"],
    answer: function () {
      return "En «Pagos» puedes marcar cada recibo como pendiente, en proceso o pagado. Si intentas pagar un recibo que ya marcaste como pagado, te avisaré para que no pagues dos veces.";
    }
  },
  {
    id: "how-to-pay",
    keywords: ["como pago", "como pagar", "pagar", "pago", "pasos"],
    answer: function (context) {
      if (context.procedure) {
        const titles = context.procedure.steps.map(function (step, index) {
          return (index + 1) + ") " + step.title.toLowerCase();
        });
        return "Para " + getCurrentProcedureName(context) + " los pasos son: " + titles.join("; ") + ". Te acompaño en cada uno.";
      }
      return "Elige tu trámite en «Mis trámites» (luz, agua, internet o cable) y te guiaré paso a paso. Primero revisa los requisitos.";
    }
  },
  {
    id: "id-card",
    keywords: ["dni", "renovar", "reniec", "documento de identidad", "perdi mi dni"],
    answer: function () {
      return "Para renovar tu DNI: reúne tu DNI actual y un correo, paga la tasa, saca tu cita en la página de RENIEC y ve a tu cita. En «Mis trámites» tienes la guía «Renovación de DNI».";
    }
  },
  {
    id: "debts",
    keywords: ["deuda", "deudas", "debo", "recibos pendientes", "consultar"],
    answer: function () {
      return "Para saber si tienes deudas, entra a la página oficial de la empresa con tu DNI y busca «Consulta de deudas» o «Mis recibos». En «Mis trámites» tienes la guía «Consulta de deudas».";
    }
  },
  {
    id: "receipt",
    keywords: ["comprobante", "guardar comprobante", "constancia"],
    answer: function () {
      return "Al terminar una guía puedes guardar o compartir tu comprobante. También lo encuentras en «Mis trámites», en «Trámites que ya hiciste». Recuerda: ese comprobante no es un comprobante de pago.";
    }
  },
  {
    id: "back",
    keywords: ["regresar", "volver", "atras", "anterior", "retroceder"],
    answer: function () {
      return "Toca el botón «Anterior» para volver al paso de antes. No pierdes lo que ya escribiste.";
    }
  },
  {
    id: "continue",
    keywords: ["continuar", "lo deje", "a medias", "seguir despues", "pendiente"],
    answer: function () {
      return "Si dejas una guía a medias, la guardamos. Entra a «Mis trámites» y en «Trámites pendientes» toca «Continuar» para seguir desde el paso donde te quedaste.";
    }
  },
  {
    id: "practice",
    keywords: ["practica", "practicar", "ejemplo", "probar"],
    answer: function () {
      return "En cada trámite puedes tocar «Practicar con datos de ejemplo». Así recorres la guía sin miedo: no se hace ningún pago real.";
    }
  },
  {
    id: "audio",
    keywords: ["escuchar", "audio", "voz alta", "no veo", "no puedo leer", "letra pequena", "leer en voz"],
    answer: function () {
      return "En cada paso de la guía toca el botón «Escuchar» y leeré la instrucción en voz alta. Puedes pausarla cuando quieras.";
    }
  },
  {
    id: "error",
    keywords: ["error", "rojo", "no me deja", "no avanza", "no puedo seguir", "no funciona", "me equivoque"],
    answer: function () {
      return "Si un dato está mal, el campo se marca en rojo y debajo te digo cómo corregirlo. Revisa que solo tenga números, sin espacios ni letras. Si sigues con problemas, dime qué dato estás escribiendo.";
    }
  }
];

function findGlossaryEntry(word) {
  const query = simplifyText(String(word || "").trim().replace(/[¿?¡!.,;:«»"()]/g, ""));
  if (!query) {
    return null;
  }
  return GLOSSARY.find(function (entry) {
    return entry.variants.some(function (variant) {
      return simplifyText(variant) === query;
    }) || simplifyText(entry.term) === query;
  }) || null;
}

function extractAskedTerm(simplified) {
  const match = simplified.match(/(?:que significa|que quiere decir|que es (?:un |una |el |la )?|significado de )\s*(.+)$/);
  return match ? match[1].replace(/[¿?¡!.,;:«»"]/g, "").trim() : null;
}

/* Devuelve { type: "answer" | "vague" | "unknown", text } */
function getAssistantReply(message, context) {
  const simplified = simplifyText(message).replace(/[¿?¡!.,;:«»"]/g, " ").replace(/\s+/g, " ").trim();

  if (!simplified) {
    return { type: "vague", text: "No llegué a leer tu pregunta. ¿Me la escribes otra vez?" };
  }

  const askedTerm = extractAskedTerm(simplified);
  if (askedTerm) {
    const entry = findGlossaryEntry(askedTerm);
    if (entry) {
      return { type: "answer", text: "«" + entry.term + "»: " + entry.short + " " + entry.more };
    }
  }

  const matched = ASSISTANT_INTENTS.find(function (intent) {
    return intent.keywords.some(function (keyword) {
      if (intent.exact) {
        return simplified === keyword;
      }
      return (" " + simplified + " ").includes(" " + keyword + " ") || simplified.includes(keyword);
    });
  });

  if (matched) {
    return { type: "answer", text: matched.answer(context || {}) };
  }

  if (askedTerm && askedTerm.split(" ").length <= 3) {
    return {
      type: "unknown",
      text: "Todavía no tengo una explicación para «" + askedTerm + "» y no quiero darte un dato equivocado. ¿Quieres que te comunique con una persona de nuestro equipo?"
    };
  }

  const meaningfulWords = simplified.split(" ").filter(function (word) {
    return word.length > 1 && STOP_WORDS.indexOf(word) === -1;
  });

  if (VAGUE_MESSAGES.indexOf(simplified) !== -1 || meaningfulWords.length < 2) {
    return {
      type: "vague",
      text: "No estoy seguro de entender tu pregunta. ¿Me das más detalles? Por ejemplo: «¿Dónde encuentro el monto en mi recibo de luz?»"
    };
  }

  return {
    type: "unknown",
    text: "Esa pregunta no la sé responder bien todavía y no quiero darte un dato equivocado. ¿Quieres que te comunique con una persona de nuestro equipo?"
  };
}
