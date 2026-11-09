const CATEGORIES = [
  { id: "all", label: "Todos" },
  { id: "services", label: "Servicios" },
  { id: "documents", label: "Documentos" },
  { id: "queries", label: "Consultas" }
];

const AMOUNT_FIELD = {
  id: "amount",
  label: "Monto a pagar (S/)",
  hint: "Cópialo tal como aparece en tu recibo. Ejemplo: 85.50",
  sample: "85.50",
  inputmode: "decimal",
  maxlength: 7,
  pattern: /^(?!0+(\.0+)?$)\d{1,4}(\.\d{1,2})?$/,
  error: "Escribe el monto solo con números. Ejemplo: 85.50"
};

const PROCEDURES = [
  {
    id: "electricity",
    name: "Pago de luz",
    category: "services",
    icon: "bulb",
    background: "icon-bg-mint",
    frequent: true,
    minutes: 6,
    summary: "Paga tu recibo de luz desde el celular.",
    requirements: [
      "Tu recibo de luz, en papel o en el celular",
      "Tu número de suministro, que está en la parte de arriba del recibo",
      "Una tarjeta, una cuenta de ahorros o una app de pagos",
      "Tu celular con internet"
    ],
    fields: [
      {
        id: "supply",
        label: "Número de suministro",
        hint: "Tiene 7 u 8 números. Está arriba de tu recibo.",
        sample: "1234567",
        inputmode: "numeric",
        maxlength: 8,
        pattern: /^\d{7,8}$/,
        error: "Escribe 7 u 8 números, sin espacios ni letras."
      },
      AMOUNT_FIELD
    ],
    steps: [
      {
        title: "Ten tu recibo a la mano",
        text: "Busca tu último recibo de luz y ponlo frente a ti. Lo necesitarás para copiar un número.",
        icon: "document",
        image: "home-receipts.png"
      },
      {
        title: "Busca tu número de suministro",
        text: "Mira la parte de arriba del recibo. Es un número de 7 u 8 cifras. Puedes tomarle una foto para no perderlo.",
        icon: "search",
        tip: "Si no lo encuentras, pide ayuda a un familiar o llama al número que aparece en tu recibo."
      },
      {
        title: "Entra a la página de tu empresa de luz",
        text: "Abre la página oficial o la app de tu empresa de luz y busca la opción «Pagar recibo».",
        icon: "globe",
        tip: "Escribe tú mismo la dirección o usa la app oficial. No entres desde mensajes que no conoces."
      },
      {
        title: "Elige cómo vas a pagar",
        text: "Selecciona tarjeta, cuenta de ahorros o tu app de pagos. Revisa que el monto sea el mismo de tu recibo.",
        icon: "card",
        image: "home-payments.png"
      }
    ]
  },
  {
    id: "water",
    name: "Pago de agua",
    category: "services",
    icon: "drop",
    background: "icon-bg-sky",
    frequent: true,
    minutes: 6,
    summary: "Paga tu recibo de agua paso a paso.",
    requirements: [
      "Tu recibo de agua, en papel o en el celular",
      "Tu número de suministro, que está arriba del recibo",
      "Una tarjeta, una cuenta de ahorros o una app de pagos",
      "Tu celular con internet"
    ],
    fields: [
      {
        id: "supply",
        label: "Número de suministro",
        hint: "Tiene 7 u 8 números. Está arriba de tu recibo.",
        sample: "7654321",
        inputmode: "numeric",
        maxlength: 8,
        pattern: /^\d{7,8}$/,
        error: "Escribe 7 u 8 números, sin espacios ni letras."
      },
      AMOUNT_FIELD
    ],
    steps: [
      {
        title: "Ten tu recibo a la mano",
        text: "Busca tu último recibo de agua y ponlo frente a ti. Lo necesitarás para copiar un número.",
        icon: "document",
        image: "home-receipts.png"
      },
      {
        title: "Busca tu número de suministro",
        text: "Mira la parte de arriba del recibo. Es un número de 7 u 8 cifras. Anótalo o tómale una foto.",
        icon: "search",
        tip: "Si el recibo es antiguo, revisa que el monto sea el último que te llegó."
      },
      {
        title: "Entra a la página de tu empresa de agua",
        text: "Abre la página oficial o la app de tu empresa de agua y busca la opción «Pagar recibo».",
        icon: "globe",
        tip: "Escribe tú mismo la dirección o usa la app oficial. No entres desde mensajes que no conoces."
      },
      {
        title: "Elige cómo vas a pagar",
        text: "Selecciona tarjeta, cuenta de ahorros o tu app de pagos. Revisa que el monto sea el mismo de tu recibo.",
        icon: "card",
        image: "home-payments.png"
      }
    ]
  },
  {
    id: "internet",
    name: "Pago de internet",
    category: "services",
    icon: "wifi",
    background: "icon-bg-lilac",
    frequent: true,
    minutes: 5,
    summary: "Paga tu internet sin complicaciones.",
    requirements: [
      "Tu recibo o el correo de tu empresa de internet",
      "Tu número de contrato",
      "Una tarjeta, una cuenta de ahorros o una app de pagos",
      "Tu celular con internet"
    ],
    fields: [
      {
        id: "contract",
        label: "Número de contrato",
        hint: "Tiene entre 6 y 10 números. Está en tu recibo.",
        sample: "45678901",
        inputmode: "numeric",
        maxlength: 10,
        pattern: /^\d{6,10}$/,
        error: "Escribe entre 6 y 10 números, sin espacios ni letras."
      },
      AMOUNT_FIELD
    ],
    steps: [
      {
        title: "Busca tu recibo de internet",
        text: "Puede estar en papel o en el correo que te envía tu empresa. Ponlo frente a ti.",
        icon: "document",
        image: "home-receipts.png"
      },
      {
        title: "Encuentra tu número de contrato",
        text: "Es un número que aparece junto a tu nombre y tu dirección. Anótalo o tómale una foto.",
        icon: "search"
      },
      {
        title: "Entra a la página de tu empresa",
        text: "Abre la página oficial o la app de tu empresa de internet y busca la opción «Pagar».",
        icon: "globe",
        tip: "Escribe tú mismo la dirección o usa la app oficial. No entres desde mensajes que no conoces."
      },
      {
        title: "Elige cómo vas a pagar",
        text: "Selecciona tarjeta, cuenta de ahorros o tu app de pagos y revisa que el monto sea el correcto.",
        icon: "card",
        image: "home-payments.png"
      }
    ]
  },
  {
    id: "cable",
    name: "Pago de cable",
    category: "services",
    icon: "tv",
    background: "icon-bg-mint",
    frequent: true,
    minutes: 5,
    summary: "Paga tu servicio de cable con calma.",
    requirements: [
      "Tu recibo o el correo de tu empresa de cable",
      "Tu número de contrato",
      "Una tarjeta, una cuenta de ahorros o una app de pagos",
      "Tu celular con internet"
    ],
    fields: [
      {
        id: "contract",
        label: "Número de contrato",
        hint: "Tiene entre 6 y 10 números. Está en tu recibo.",
        sample: "23456789",
        inputmode: "numeric",
        maxlength: 10,
        pattern: /^\d{6,10}$/,
        error: "Escribe entre 6 y 10 números, sin espacios ni letras."
      },
      AMOUNT_FIELD
    ],
    steps: [
      {
        title: "Busca tu recibo de cable",
        text: "Puede estar en papel o en el correo que te envía tu empresa. Ponlo frente a ti.",
        icon: "document",
        image: "home-receipts.png"
      },
      {
        title: "Encuentra tu número de contrato",
        text: "Es un número que aparece junto a tu nombre y tu dirección. Anótalo o tómale una foto.",
        icon: "search"
      },
      {
        title: "Entra a la página de tu empresa",
        text: "Abre la página oficial o la app de tu empresa de cable y busca la opción «Pagar».",
        icon: "globe",
        tip: "Escribe tú mismo la dirección o usa la app oficial. No entres desde mensajes que no conoces."
      },
      {
        title: "Elige cómo vas a pagar",
        text: "Selecciona tarjeta, cuenta de ahorros o tu app de pagos y revisa que el monto sea el correcto.",
        icon: "card",
        image: "home-payments.png"
      }
    ]
  },
  {
    id: "id-card",
    name: "Renovación de DNI",
    category: "documents",
    icon: "id",
    background: "icon-bg-sky",
    frequent: true,
    minutes: 8,
    summary: "Conoce qué hacer para renovar tu DNI.",
    requirements: [
      "Tu DNI actual, si todavía lo tienes",
      "Un correo electrónico que uses",
      "Dinero o una tarjeta para pagar la tasa",
      "Tu celular con internet"
    ],
    fields: [
      {
        id: "idNumber",
        label: "Número de DNI",
        hint: "Son 8 números. Los encuentras en tu DNI.",
        sample: "12345678",
        inputmode: "numeric",
        maxlength: 8,
        pattern: /^\d{8}$/,
        error: "Escribe los 8 números de tu DNI, sin espacios."
      }
    ],
    steps: [
      {
        title: "Reúne tus documentos",
        text: "Ten a la mano tu DNI actual y tu correo electrónico. Si lo perdiste, avisa que necesitas un duplicado.",
        icon: "id",
        image: "service-dni.png",
        tip: "Los requisitos pueden cambiar. Confírmalos siempre en la página oficial de RENIEC."
      },
      {
        title: "Paga la tasa del trámite",
        text: "Entra a la página oficial de pagos del Estado o a una agencia autorizada y paga la tasa de tu trámite.",
        icon: "card",
        image: "home-payments.png"
      },
      {
        title: "Saca tu cita",
        text: "Entra a la página de RENIEC, elige la oficina más cercana y escoge el día y la hora de tu cita.",
        icon: "calendar"
      },
      {
        title: "Ve a tu cita",
        text: "Llega unos minutos antes con tu comprobante de pago y tu DNI actual. Allí te tomarán la foto y las huellas.",
        icon: "check"
      }
    ]
  },
  {
    id: "debts",
    name: "Consulta de deudas",
    category: "queries",
    icon: "search",
    background: "icon-bg-lilac",
    frequent: false,
    minutes: 4,
    summary: "Revisa si tienes recibos pendientes.",
    requirements: [
      "Tu DNI",
      "El nombre de la empresa o entidad donde quieres consultar",
      "Tu celular con internet"
    ],
    fields: [
      {
        id: "idNumber",
        label: "Número de DNI",
        hint: "Son 8 números. Los encuentras en tu DNI.",
        sample: "12345678",
        inputmode: "numeric",
        maxlength: 8,
        pattern: /^\d{8}$/,
        error: "Escribe los 8 números de tu DNI, sin espacios."
      }
    ],
    steps: [
      {
        title: "Ten tu DNI a la mano",
        text: "Lo necesitarás para que la empresa sepa que la consulta es tuya.",
        icon: "id",
        image: "service-debts.png"
      },
      {
        title: "Entra a la página oficial",
        text: "Abre la página de la empresa o entidad donde quieres consultar y busca la opción «Consulta de deudas» o «Mis recibos».",
        icon: "globe",
        tip: "Nunca des tu clave o tu contraseña por teléfono ni por mensaje."
      },
      {
        title: "Escribe tu número de DNI",
        text: "Escribe tu número con cuidado y presiona «Consultar». Aparecerá una lista con tus recibos pendientes.",
        icon: "pencil"
      }
    ]
  }
];

function findProcedure(id) {
  return PROCEDURES.find(function (procedure) {
    return procedure.id === id;
  });
}

function getCategoryLabel(categoryId) {
  const category = CATEGORIES.find(function (item) {
    return item.id === categoryId;
  });
  return category ? category.label : "";
}