function formatReceiptDate(isoDate) {
  return new Date(isoDate).toLocaleString("es-PE", { dateStyle: "long", timeStyle: "short" });
}

function buildReceiptText(receipt) {
  const lines = [
    "COMPROBANTE DE GUÍA - CONTIGO",
    "",
    "Código: " + receipt.id,
    "Fecha: " + formatReceiptDate(receipt.date),
    "Usuario: " + receipt.userName,
    "Trámite: " + receipt.procedureName,
    "Tipo: " + (receipt.practice ? "Práctica con datos de ejemplo" : "Guía real"),
    "",
    "Datos revisados:"
  ];

  receipt.data.forEach(function (item) {
    lines.push("- " + item.label + ": " + item.value);
  });

  lines.push("");
  lines.push("Importante: Contigo te orienta paso a paso, pero no realiza pagos por ti.");
  lines.push("Este comprobante solo registra que completaste la guía. No es un comprobante de pago.");

  return lines.join("\n");
}

function downloadReceipt(receipt) {
  const text = buildReceiptText(receipt);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "comprobante-" + receipt.id + ".txt";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(function () {
    URL.revokeObjectURL(url);
  }, 1000);

  showToast("Guardamos tu comprobante en tu dispositivo.");
}

function shareReceipt(receipt) {
  const text = buildReceiptText(receipt);

  if (navigator.share) {
    navigator.share({ title: "Comprobante de Contigo", text: text }).catch(function () {
    });
    return;
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () {
      showToast("Copiamos tu comprobante. Ya puedes pegarlo en un mensaje o en un correo.");
    }, function () {
      showToast("No pudimos copiar el comprobante. Usa «Guardar comprobante».");
    });
    return;
  }

  showToast("Tu navegador no permite compartir. Usa «Guardar comprobante».");
}