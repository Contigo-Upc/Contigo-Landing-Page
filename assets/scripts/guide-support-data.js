const SERVICE_VERIFY = [
  "Entra a la app o la página oficial de tu empresa con tu número de recibo.",
  "Busca la opción «Mis recibos» o «Estado de cuenta».",
  "Revisa que el recibo diga «Pagado». Puede tardar hasta 24 horas en aparecer."
];

const SERVICE_PENDING = [
  "Realiza el pago en la app o página oficial de tu empresa.",
  "Guarda el comprobante de pago que te da tu banco o la empresa.",
  "Cuando veas el pago en tu cuenta, márcalo como pagado en «Mis recibos»."
];

const PROCEDURE_SUPPORT = {
  electricity: {
    usualAmount: 90,
    pending: SERVICE_PENDING,
    verify: SERVICE_VERIFY,
    help: [
      "Si no tienes el recibo en papel, revisa tu correo: muchas empresas de luz lo envían cada mes.",
      "El número de suministro está arriba, cerca de tu nombre. A veces dice «N.º de cliente» o «Suministro».",
      "Para no entrar a una página falsa, escribe tú mismo la dirección o descarga la app desde la tienda oficial de tu celular.",
      "Antes de pagar, compara el monto de la pantalla con el de tu recibo. Si es distinto, no pagues y revisa el número."
    ]
  },
  water: {
    usualAmount: 45,
    pending: SERVICE_PENDING,
    verify: SERVICE_VERIFY,
    help: [
      "Si no tienes el recibo en papel, revisa tu correo o la app de tu empresa de agua.",
      "El número de suministro está arriba del recibo. Tiene 7 u 8 números.",
      "Para no entrar a una página falsa, escribe tú mismo la dirección o usa la app oficial.",
      "Antes de pagar, compara el monto de la pantalla con el de tu recibo."
    ]
  },
  internet: {
    usualAmount: 80,
    pending: SERVICE_PENDING,
    verify: SERVICE_VERIFY,
    help: [
      "Si no encuentras el recibo, busca en tu correo un mensaje de tu empresa de internet con el asunto «Tu recibo».",
      "El número de contrato está junto a tu nombre y tu dirección.",
      "Escribe tú mismo la dirección de la página o usa la app oficial de tu empresa.",
      "Antes de pagar, revisa que el monto sea el mismo de tu recibo."
    ]
  },
  cable: {
    usualAmount: 60,
    pending: SERVICE_PENDING,
    verify: SERVICE_VERIFY,
    help: [
      "Si no encuentras el recibo, busca en tu correo un mensaje de tu empresa de cable.",
      "El número de contrato está junto a tu nombre y tu dirección.",
      "Escribe tú mismo la dirección de la página o usa la app oficial de tu empresa.",
      "Antes de pagar, revisa que el monto sea el mismo de tu recibo."
    ]
  },
  "id-card": {
    usualAmount: null,
    pending: [
      "Paga la tasa del trámite en el Banco de la Nación o en Págalo.pe.",
      "Saca tu cita en la página de RENIEC.",
      "Ve a tu cita con tu comprobante de pago y tu DNI actual."
    ],
    verify: [
      "Entra a la página oficial de RENIEC en gob.pe.",
      "Busca «Consulta el estado de tu trámite» y escribe tu número de DNI.",
      "Ahí verás si tu DNI ya está listo para recoger."
    ],
    officialLink: { label: "Ir a RENIEC en gob.pe", url: "https://www.gob.pe/reniec" },
    help: [
      "Si perdiste tu DNI, igual puedes hacer el trámite: pide un duplicado.",
      "La tasa se paga en el Banco de la Nación, en un agente o en la página Págalo.pe.",
      "Al sacar tu cita, elige la oficina que te quede más cerca y un horario en el que puedas ir con calma.",
      "Llega 15 minutos antes. Lleva tu comprobante de pago impreso o en el celular."
    ]
  },
  debts: {
    usualAmount: null,
    pending: [
      "Si encontraste recibos pendientes, anótalos con su fecha de vencimiento.",
      "Págalos en la página oficial de cada empresa."
    ],
    verify: [
      "Vuelve a consultar con tu DNI unos días después de pagar.",
      "El recibo ya no debería aparecer como pendiente."
    ],
    help: [
      "Tu DNI tiene 8 números. Están en la parte de adelante.",
      "Busca la página oficial escribiendo el nombre de la empresa en el buscador. Revisa que la dirección sea la correcta.",
      "Escribe tu número despacio y revísalo antes de presionar «Consultar»."
    ]
  }
};

const GENERIC_STEP_HELP = {
  form: "Copia los números tal como aparecen en tu documento, sin espacios ni letras. Si no encuentras un dato, vuelve al paso anterior.",
  review: "Compara cada dato con tu documento, número por número. Si algo no coincide, toca «Corregir datos».",
  done: "Ya terminaste la guía. Ahora solo te faltan los pasos que hagas en la página oficial."
};

function getStepHelp(procedureId, step, index) {
  const support = PROCEDURE_SUPPORT[procedureId];

  if (step.type !== "info") {
    return GENERIC_STEP_HELP[step.type];
  }
  if (support && support.help[index]) {
    return support.help[index];
  }
  return "Lee el paso con calma. Si algo no está claro, pregúntale al asistente de Contigo.";
}
