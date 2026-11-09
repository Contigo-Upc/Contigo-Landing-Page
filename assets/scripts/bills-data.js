const BILL_STATUS = {
  pending: { label: "Pendiente", className: "status-pending" },
  processing: { label: "En proceso", className: "status-processing" },
  paid: { label: "Pagado", className: "status-paid" }
};

const BILL_NAMES = {
  electricity: "Recibo de luz",
  water: "Recibo de agua",
  internet: "Recibo de internet",
  cable: "Recibo de cable"
};

function getServiceProcedures() {
  return PROCEDURES.filter(function (procedure) {
    return BILL_NAMES[procedure.id];
  });
}

function getBillTitle(bill) {
  return BILL_NAMES[bill.procedureId] || "Recibo";
}

function getBillNumberLabel(procedureId) {
  const procedure = findProcedure(procedureId);
  return procedure ? procedure.fields[0].label : "Número";
}

function formatAmount(amount) {
  return "S/ " + Number(amount).toFixed(2);
}

function createBill(data) {
  return {
    id: "REC-" + Date.now().toString(36).toUpperCase(),
    userId: data.userId,
    procedureId: data.procedureId,
    number: data.number,
    amount: data.amount,
    dueDate: data.dueDate || null,
    status: data.status || "pending",
    reminders: true,
    source: data.source,
    createdAt: new Date().toISOString()
  };
}

function getActiveBills(userId) {
  return getBills(userId)
    .filter(function (bill) {
      return bill.status !== "paid";
    })
    .sort(compareByDueDate);
}

function compareByDueDate(a, b) {
  if (!a.dueDate) {
    return 1;
  }
  if (!b.dueDate) {
    return -1;
  }
  return a.dueDate.localeCompare(b.dueDate);
}

function getUsualAmount(userId, procedureId, excludeBillId) {
  const history = getBills(userId).filter(function (bill) {
    return bill.procedureId === procedureId && bill.id !== excludeBillId && Number(bill.amount) > 0;
  });

  if (history.length === 0) {
    const support = PROCEDURE_SUPPORT[procedureId];
    return support ? support.usualAmount : null;
  }

  const total = history.reduce(function (sum, bill) {
    return sum + Number(bill.amount);
  }, 0);
  return total / history.length;
}

function isUnusualAmount(userId, procedureId, amount, excludeBillId) {
  const usual = getUsualAmount(userId, procedureId, excludeBillId);
  return usual !== null && Number(amount) > usual * 2;
}

function createStatusBadge(bill) {
  const badge = document.createElement("span");
  badge.className = "status-badge " + BILL_STATUS[bill.status].className;
  badge.textContent = BILL_STATUS[bill.status].label;
  return badge;
}
