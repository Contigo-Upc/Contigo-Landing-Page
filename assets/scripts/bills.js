/* Sprint 2 · "Base de datos" simulada de recibos con fecha de vencimiento.
   US-24 (monto inusual), US-33 (estado del recibo y pago duplicado),
   US-36 (fecha de vencimiento) y US-37 (recordatorios por recibo). */

const BILLS_KEY = "contigo.bills";

const BILL_STATUS = {
  pending: { label: "Pendiente", className: "status-pending" },
  processing: { label: "En proceso", className: "status-processing" },
  paid: { label: "Pagado", className: "status-paid" }
};

const PROCESSING_WAIT_MINUTES = 30;

const BILL_SERVICES = [
  { id: "electricity", label: "Luz", numberField: "supply", numberLabel: "Número de suministro", reference: 150 },
  { id: "water", label: "Agua", numberField: "supply", numberLabel: "Número de suministro", reference: 100 },
  { id: "internet", label: "Internet", numberField: "contract", numberLabel: "Número de contrato", reference: 150 },
  { id: "cable", label: "Cable", numberField: "contract", numberLabel: "Número de contrato", reference: 120 }
];

function findBillService(serviceId) {
  return BILL_SERVICES.find(function (service) {
    return service.id === serviceId;
  });
}

function getAllBills() {
  return readJson(localStorage, BILLS_KEY) || [];
}

function saveAllBills(bills) {
  writeJson(localStorage, BILLS_KEY, bills);
}

function getBills(userId) {
  return getAllBills()
    .filter(function (bill) {
      return bill.userId === userId;
    })
    .sort(function (a, b) {
      return (a.dueDate || "9999").localeCompare(b.dueDate || "9999");
    });
}

function findBill(billId) {
  return getAllBills().find(function (bill) {
    return bill.id === billId;
  });
}

function createBill(data) {
  const bills = getAllBills();
  const bill = {
    id: "REC-" + Date.now().toString(36).toUpperCase(),
    userId: data.userId,
    serviceId: data.serviceId,
    number: data.number,
    amount: Number(data.amount),
    dueDate: data.dueDate,
    status: "pending",
    reminders: true,
    source: data.source || "manual",
    notified: {},
    createdAt: new Date().toISOString(),
    processingAt: null,
    paidAt: null,
    paymentCode: null
  };

  bills.push(bill);
  saveAllBills(bills);
  return bill;
}

function updateBill(billId, changes) {
  const bills = getAllBills();
  const bill = bills.find(function (item) {
    return item.id === billId;
  });

  if (!bill) {
    return null;
  }

  Object.assign(bill, changes);
  saveAllBills(bills);
  return bill;
}

function deleteBill(billId) {
  saveAllBills(getAllBills().filter(function (bill) {
    return bill.id !== billId;
  }));
}

/* US-33: cambiar el estado del recibo */
function setBillStatus(billId, status) {
  const changes = { status: status };

  if (status === "processing") {
    changes.processingAt = new Date().toISOString();
    changes.paidAt = null;
    changes.paymentCode = null;
  } else if (status === "paid") {
    changes.paidAt = new Date().toISOString();
    changes.paymentCode = "PAG-" + Date.now().toString(36).toUpperCase();
  } else {
    changes.processingAt = null;
    changes.paidAt = null;
    changes.paymentCode = null;
  }

  return updateBill(billId, changes);
}

function minutesSince(isoDate) {
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / 60000);
}

/* US-33: detectar si el recibo ya se pagó o el pago aún se procesa.
   Devuelve null si se puede continuar. */
function checkDuplicatePayment(userId, serviceId, number, dueDate) {
  const matches = getBills(userId).filter(function (bill) {
    return bill.serviceId === serviceId && bill.number === number && (!dueDate || bill.dueDate === dueDate);
  });

  if (matches.length === 0) {
    return null;
  }

  const latest = matches[matches.length - 1];

  if (latest.status === "paid") {
    return { type: "paid", bill: latest };
  }

  if (latest.status === "processing" && latest.processingAt && minutesSince(latest.processingAt) < PROCESSING_WAIT_MINUTES) {
    return { type: "processing", bill: latest, minutes: minutesSince(latest.processingAt) };
  }

  return { type: "registered", bill: latest };
}

/* US-24: calcular el monto habitual del usuario para un servicio */
function getAmountHistory(userId, serviceId, excludeBillId) {
  const fromBills = getBills(userId)
    .filter(function (bill) {
      return bill.serviceId === serviceId && bill.id !== excludeBillId;
    })
    .map(function (bill) {
      return bill.amount;
    });

  const fromReceipts = getReceipts(userId)
    .filter(function (receipt) {
      return receipt.procedureId === serviceId && !receipt.practice;
    })
    .map(function (receipt) {
      const amountRow = (receipt.data || []).find(function (row) {
        return /monto/i.test(row.label);
      });
      return amountRow ? parseFloat(String(amountRow.value).replace(/[^\d.]/g, "")) : NaN;
    });

  return fromBills.concat(fromReceipts).filter(function (value) {
    return Number.isFinite(value) && value > 0;
  });
}

function checkUnusualAmount(userId, serviceId, amount, excludeBillId) {
  const service = findBillService(serviceId);
  const value = Number(amount);

  if (!service || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  const history = getAmountHistory(userId, serviceId, excludeBillId);

  if (history.length > 0) {
    const average = history.reduce(function (sum, item) { return sum + item; }, 0) / history.length;
    if (value > average * 1.8) {
      return { direction: "high", habitual: average, basedOnHistory: true };
    }
    if (value < average * 0.4) {
      return { direction: "low", habitual: average, basedOnHistory: true };
    }
    return null;
  }

  if (value > service.reference * 2.5) {
    return { direction: "high", habitual: service.reference, basedOnHistory: false };
  }
  return null;
}

/* Pregunta al usuario si confirma un monto inusual. Resuelve true si confirma. */
function confirmUnusualAmount(alertInfo, amount, serviceLabel) {
  const habitual = formatMoney(alertInfo.habitual);
  const isHigh = alertInfo.direction === "high";
  const text = (isHigh ? "Escribiste " + formatMoney(amount) + ", que es mucho más de lo habitual" : "Escribiste " + formatMoney(amount) + ", que es mucho menos de lo habitual")
    + (alertInfo.basedOnHistory
      ? ". Normalmente pagas unos " + habitual + " de " + serviceLabel.toLowerCase() + "."
      : ". Un recibo de " + serviceLabel.toLowerCase() + " suele estar cerca de " + habitual + ".")
    + " Revisa tu recibo: ¿el monto es correcto?";

  return openDialog({
    tone: "warning",
    icon: "warning",
    title: isHigh ? "Este monto parece muy alto" : "Este monto parece muy bajo",
    text: text,
    actions: [
      { label: "Corregir el monto", value: "fix", style: "primary" },
      { label: "Sí, el monto es correcto", value: "confirm", style: "secondary" }
    ]
  }).then(function (choice) {
    return choice === "confirm";
  });
}

/* Muestra el aviso de pago duplicado. Resuelve "view" si quiere ver el comprobante. */
function showDuplicateWarning(duplicate) {
  if (duplicate.type === "paid") {
    return openDialog({
      tone: "error",
      icon: "warning",
      title: "Este recibo ya se encuentra pagado",
      text: "Registraste el pago de este recibo el " + formatDateTime(duplicate.bill.paidAt) + ". No lo pagues otra vez para no perder tu dinero.",
      actions: [
        { label: "Ver comprobante de pago", value: "view", style: "primary" },
        { label: "Volver", value: "back", style: "secondary" }
      ]
    });
  }

  return openDialog({
    tone: "warning",
    icon: "clock",
    title: "Tu pago todavía se está procesando",
    text: "Empezaste a pagar este recibo hace " + (duplicate.minutes < 1 ? "menos de un minuto" : duplicate.minutes + " minutos") + ". Espera la confirmación de tu empresa antes de volver a intentarlo, así evitas pagar dos veces.",
    actions: [
      { label: "Ver el estado del recibo", value: "view", style: "primary" },
      { label: "Entendido, esperaré", value: "back", style: "secondary" }
    ]
  });
}
